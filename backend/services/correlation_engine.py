"""
Correlation Engine Module
Computes correlation matrix and applies threshold filtering.
"""

import numpy as np
import pandas as pd
import logging

logger = logging.getLogger(__name__)


def compute_correlation_matrix(returns: pd.DataFrame) -> pd.DataFrame:
    """
    Compute Pearson correlation matrix from log returns.

    Args:
        returns: DataFrame of cleaned log returns

    Returns:
        Correlation matrix as DataFrame
    """
    corr_matrix = returns.corr(method="pearson")
    logger.info(f"Computed correlation matrix: {corr_matrix.shape}")
    return corr_matrix


def apply_threshold(
    corr_matrix: pd.DataFrame, threshold: float = 0.6
) -> pd.DataFrame:
    """
    Apply correlation threshold to create adjacency matrix.
    Only keeps absolute correlations above the threshold.
    Diagonal is set to 0 (no self-loops).

    Args:
        corr_matrix: Full correlation matrix
        threshold: Minimum absolute correlation to keep

    Returns:
        Filtered adjacency matrix (symmetric, 0-diagonal)
    """
    adj_matrix = corr_matrix.copy()

    # Use absolute correlation for threshold, but keep sign info via weight
    mask = adj_matrix.abs() < threshold
    adj_matrix[mask] = 0.0

    # Remove self-loops
    np.fill_diagonal(adj_matrix.values, 0.0)

    edge_count = (adj_matrix != 0).sum().sum() // 2  # Symmetric, so divide by 2
    logger.info(
        f"Threshold {threshold} applied: {edge_count} edges retained"
    )
    return adj_matrix
