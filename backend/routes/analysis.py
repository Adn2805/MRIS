"""
MRIS API Routes
Analysis endpoints for network graph generation.
Supports both preset periods and custom date ranges.
"""

import time
import hashlib
import json
import logging
from datetime import datetime
from collections import OrderedDict
from fastapi import APIRouter, HTTPException

from models import (
    AnalysisRequest, GraphResponse, NodeData, EdgeData,
    CentralityMetrics, ClusterInfo, NetworkStats,
    IndexInfo, IndicesResponse, SectorHeatmapData,
)
from config import INDICES, VALID_PERIODS, CACHE_TTL_SECONDS, CACHE_MAX_SIZE, SECTOR_MAP
from services.insights_generator import generate_insights
from services.sector_analyzer import compute_sector_heatmap
from services.data_fetcher import fetch_prices, fetch_prices_by_dates
from services.preprocessor import compute_log_returns, clean_data
from services.correlation_engine import compute_correlation_matrix, apply_threshold
from services.graph_builder import build_graph, compute_centrality, compute_influence_scores
from services.clustering import detect_communities

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["analysis"])

# ── In-Memory Cache ─────────────────────────────────────────────────

_cache: OrderedDict[str, tuple[float, GraphResponse]] = OrderedDict()


def _cache_key(req: AnalysisRequest) -> str:
    raw = json.dumps({
        "index": req.index,
        "period": req.period,
        "start_date": req.start_date,
        "end_date": req.end_date,
        "threshold": req.threshold,
    }, sort_keys=True)
    return hashlib.md5(raw.encode()).hexdigest()


def _get_cached(key: str) -> GraphResponse | None:
    if key in _cache:
        ts, data = _cache[key]
        if time.time() - ts < CACHE_TTL_SECONDS:
            _cache.move_to_end(key)
            logger.info(f"Cache hit: {key}")
            return data
        else:
            del _cache[key]
    return None


def _set_cached(key: str, data: GraphResponse):
    _cache[key] = (time.time(), data)
    while len(_cache) > CACHE_MAX_SIZE:
        _cache.popitem(last=False)


# ── Pipeline Helper ─────────────────────────────────────────────────

def run_analysis_pipeline(request: AnalysisRequest) -> GraphResponse:
    """
    Execute the full analysis pipeline and return a GraphResponse.
    Shared between the /analyze endpoint and the SSE live stream.
    """
    # Validate index
    if request.index not in INDICES:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown index '{request.index}'. Available: {list(INDICES.keys())}",
        )

    # Determine date mode
    use_custom_dates = bool(request.start_date and request.end_date)

    if not use_custom_dates:
        period = request.period or "3mo"
        if period not in VALID_PERIODS:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid period '{period}'. Valid: {VALID_PERIODS}",
            )

    tickers = INDICES[request.index]

    try:
        # 1. Fetch prices
        if use_custom_dates:
            prices = fetch_prices_by_dates(tickers, request.start_date, request.end_date)
        else:
            prices = fetch_prices(tickers, request.period or "3mo")

        # 2. Preprocessing
        returns = compute_log_returns(prices)
        returns = clean_data(returns)

        if returns.shape[1] < 3:
            raise HTTPException(
                status_code=422,
                detail="Too few stocks with valid data. Try a different index or period.",
            )

        # 3. Correlation
        corr_matrix = compute_correlation_matrix(returns)
        adj_matrix = apply_threshold(corr_matrix, request.threshold)

        # 4. Build graph
        G = build_graph(adj_matrix)

        # 5. Centrality
        centralities = compute_centrality(G)
        influence_scores = compute_influence_scores(centralities)

        # 6. Community detection
        partition, modularity = detect_communities(G)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Analysis pipeline error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

    # ── Build response ──────────────────────────────────────────────

    nodes = []
    for node in G.nodes():
        cent = centralities.get(node, {"degree": 0, "betweenness": 0, "closeness": 0})
        nodes.append(
            NodeData(
                id=node,
                symbol=node,
                influence_score=influence_scores.get(node, 0),
                cluster_id=partition.get(node, 0),
                centrality=CentralityMetrics(**cent),
                connections=G.degree(node),
            )
        )

    nodes.sort(key=lambda n: n.influence_score, reverse=True)

    edges = [
        EdgeData(source=u, target=v, weight=round(d["weight"], 4))
        for u, v, d in G.edges(data=True)
    ]

    cluster_map: dict[int, list[str]] = {}
    for node, cid in partition.items():
        cluster_map.setdefault(cid, []).append(node)

    clusters = [
        ClusterInfo(cluster_id=cid, size=len(members), members=sorted(members))
        for cid, members in sorted(cluster_map.items())
    ]

    n = G.number_of_nodes()
    stats = NetworkStats(
        total_nodes=n,
        total_edges=G.number_of_edges(),
        density=round(float(G.number_of_edges()) / max(1, n * (n - 1) / 2), 4) if n > 1 else 0,
        avg_degree=round(sum(dict(G.degree()).values()) / max(1, n), 2),
        modularity=modularity,
        num_clusters=len(clusters),
    )

    # ── Generate insights ────────────────────────────────────────────
    try:
        node_dicts = [n.model_dump() for n in nodes]
        edge_dicts = [e.model_dump() for e in edges]
        cluster_dicts = [c.model_dump() for c in clusters]
        stats_dict = stats.model_dump()
        insights = generate_insights(node_dicts, edge_dicts, cluster_dicts, stats_dict, request.index)
    except Exception as e:
        logger.warning(f"Insights generation failed: {e}")
        insights = []

    # ── Generate sector heatmap ─────────────────────────────────────
    try:
        heatmap_raw = compute_sector_heatmap(returns, SECTOR_MAP)
        sector_heatmap = SectorHeatmapData(**heatmap_raw)
    except Exception as e:
        logger.warning(f"Sector heatmap generation failed: {e}")
        sector_heatmap = None

    return GraphResponse(
        nodes=nodes,
        edges=edges,
        clusters=clusters,
        stats=stats,
        index=request.index,
        period=request.period if not use_custom_dates else None,
        start_date=request.start_date if use_custom_dates else None,
        end_date=request.end_date if use_custom_dates else None,
        threshold=request.threshold,
        timestamp=datetime.utcnow().isoformat() + "Z",
        insights=insights,
        sector_heatmap=sector_heatmap,
    )


# ── Endpoints ───────────────────────────────────────────────────────

@router.get("/indices", response_model=IndicesResponse)
async def get_indices():
    """Return available stock indices."""
    return IndicesResponse(
        indices=[
            IndexInfo(name=name, stock_count=len(tickers))
            for name, tickers in INDICES.items()
        ]
    )


@router.post("/analyze", response_model=GraphResponse)
async def analyze(request: AnalysisRequest):
    """
    Run the full analysis pipeline:
    1. Fetch prices → 2. Log returns → 3. Correlation → 4. Graph → 5. Centrality → 6. Clustering

    Supports preset periods (period field) or custom date ranges (start_date + end_date).
    """
    # Check cache
    key = _cache_key(request)
    cached = _get_cached(key)
    if cached:
        return cached

    response = run_analysis_pipeline(request)

    _set_cached(key, response)
    return response
