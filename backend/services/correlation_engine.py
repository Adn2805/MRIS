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
    # Create a fully writable numpy copy to avoid read-only array issues
    values = corr_matrix.to_numpy(copy=True).astype(float)

    # Zero out correlations below threshold
    abs_values = np.abs(values)
    values[abs_values < threshold] = 0.0

    # Remove self-loops (diagonal)
    np.fill_diagonal(values, 0.0)

    # Reconstruct DataFrame
    adj_matrix = pd.DataFrame(values, index=corr_matrix.index, columns=corr_matrix.columns)

    edge_count = int((adj_matrix != 0).sum().sum()) // 2
    logger.info(
        f"Threshold {threshold} applied: {edge_count} edges retained"
    )
    return adj_matrix
