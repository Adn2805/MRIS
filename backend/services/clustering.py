"""
Clustering Module
Community detection using the Louvain algorithm.
"""

import networkx as nx
import community as community_louvain
import logging

logger = logging.getLogger(__name__)


def detect_communities(G: nx.Graph) -> tuple[dict, float]:
    """
    Detect communities in the graph using the Louvain method.

    Args:
        G: NetworkX graph

    Returns:
        Tuple of (partition dict {node: cluster_id}, modularity score)
    """
    if G.number_of_nodes() == 0:
        return {}, 0.0

    if G.number_of_edges() == 0:
        # No edges — each node is its own cluster
        partition = {node: i for i, node in enumerate(G.nodes())}
        return partition, 0.0

    partition = community_louvain.best_partition(G, weight="weight", random_state=42)
    modularity = community_louvain.modularity(partition, G, weight="weight")

    num_clusters = len(set(partition.values()))
    logger.info(f"Louvain detected {num_clusters} communities, modularity={modularity:.4f}")

    return partition, round(modularity, 4)
