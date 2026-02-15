"""
Pydantic response models for the MRIS API.
"""

from pydantic import BaseModel, Field
from typing import Optional


class AnalysisRequest(BaseModel):
    index: str = Field(..., description="Stock index name, e.g. 'NIFTY 50'")
    period: Optional[str] = Field(None, description="Preset time range: 1mo, 3mo, 6mo, 1y")
    start_date: Optional[str] = Field(None, description="Custom start date (YYYY-MM-DD)")
    end_date: Optional[str] = Field(None, description="Custom end date (YYYY-MM-DD)")
    threshold: float = Field(0.6, ge=0.1, le=0.95, description="Correlation threshold")


class CentralityMetrics(BaseModel):
    degree: float
    betweenness: float
    closeness: float


class NodeData(BaseModel):
    id: str
    symbol: str
    influence_score: float
    cluster_id: int
    centrality: CentralityMetrics
    connections: int


class EdgeData(BaseModel):
    source: str
    target: str
    weight: float


class ClusterInfo(BaseModel):
    cluster_id: int
    size: int
    members: list[str]


class NetworkStats(BaseModel):
    total_nodes: int
    total_edges: int
    density: float
    avg_degree: float
    modularity: float
    num_clusters: int


class GraphResponse(BaseModel):
    nodes: list[NodeData]
    edges: list[EdgeData]
    clusters: list[ClusterInfo]
    stats: NetworkStats
    index: str
    period: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    threshold: float
    timestamp: str = Field(..., description="ISO timestamp of when the analysis was computed")


class IndexInfo(BaseModel):
    name: str
    stock_count: int


class IndicesResponse(BaseModel):
    indices: list[IndexInfo]
