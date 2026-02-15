"""
Graph Builder Module
Constructs a NetworkX graph from adjacency matrix and computes centrality metrics.
"""

import networkx as nx
import numpy as np
import pandas as pd
import logging
from config import INFLUENCE_WEIGHTS

logger = logging.getLogger(__name__)


def build_graph(adj_matrix: pd.DataFrame) -> nx.Graph:
    """
    Build a weighted undirected graph from the adjacency matrix.

    Args:
        adj_matrix: Filtered correlation adjacency matrix

    Returns:
        NetworkX Graph with weighted edges
    """
    G = nx.Graph()

    tickers = adj_matrix.columns.tolist()
    G.add_nodes_from(tickers)

    # Add edges where adjacency is non-zero
    for i in range(len(tickers)):
        for j in range(i + 1, len(tickers)):
            weight = adj_matrix.iloc[i, j]
            if weight != 0:
                G.add_edge(tickers[i], tickers[j], weight=abs(weight))

    logger.info(f"Built graph: {G.number_of_nodes()} nodes, {G.number_of_edges()} edges")
    return G


def compute_centrality(G: nx.Graph) -> dict:
    """
    Compute degree, betweenness, and closeness centrality for all nodes.

    Args:
        G: NetworkX graph

    Returns:
        Dictionary of {node: {degree, betweenness, closeness}}
    """
    if G.number_of_nodes() == 0:
        return {}

    degree_c = nx.degree_centrality(G)
    betweenness_c = nx.betweenness_centrality(G, weight="weight")
    closeness_c = nx.closeness_centrality(G)

    centralities = {}
    for node in G.nodes():
        centralities[node] = {
            "degree": round(degree_c.get(node, 0), 6),
            "betweenness": round(betweenness_c.get(node, 0), 6),
            "closeness": round(closeness_c.get(node, 0), 6),
        }

    return centralities


def compute_influence_scores(centralities: dict) -> dict:
    """
    Compute a composite influence score for each node.
    Score = weighted sum of normalized centrality metrics.

    Args:
        centralities: Dict of {node: {degree, betweenness, closeness}}

    Returns:
        Dict of {node: influence_score}
    """
    if not centralities:
        return {}

    nodes = list(centralities.keys())
    metrics = ["degree", "betweenness", "closeness"]

    # Extract raw values
    raw = {m: np.array([centralities[n][m] for n in nodes]) for m in metrics}

    # Normalize each metric to [0, 1]
    normalized = {}
    for m in metrics:
        vals = raw[m]
        vmin, vmax = vals.min(), vals.max()
        if vmax > vmin:
            normalized[m] = (vals - vmin) / (vmax - vmin)
        else:
            normalized[m] = np.zeros_like(vals)

    # Weighted sum
    scores = (
        INFLUENCE_WEIGHTS["degree"] * normalized["degree"]
        + INFLUENCE_WEIGHTS["betweenness"] * normalized["betweenness"]
        + INFLUENCE_WEIGHTS["closeness"] * normalized["closeness"]
    )

    return {node: round(float(score), 4) for node, score in zip(nodes, scores)}
