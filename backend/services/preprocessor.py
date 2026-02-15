"""
Preprocessor Module
Computes log returns and cleans data for correlation analysis.
"""

import numpy as np
import pandas as pd
import logging

logger = logging.getLogger(__name__)


def compute_log_returns(prices: pd.DataFrame) -> pd.DataFrame:
    """
    Compute daily log returns from price data.

    Args:
        prices: DataFrame of adjusted closing prices

    Returns:
        DataFrame of log returns (first row dropped)
    """
    log_returns = np.log(prices / prices.shift(1))
    log_returns = log_returns.iloc[1:]  # Drop first NaN row
    logger.info(f"Computed log returns: {log_returns.shape}")
    return log_returns


def clean_data(returns: pd.DataFrame, max_nan_ratio: float = 0.3) -> pd.DataFrame:
    """
    Clean return data by removing columns with excessive NaN values
    and forward-filling remaining gaps.

    Args:
        returns: DataFrame of log returns
        max_nan_ratio: Maximum ratio of NaN values allowed per column

    Returns:
        Cleaned DataFrame
    """
    total_rows = len(returns)
    nan_ratios = returns.isna().sum() / total_rows

    # Drop columns with too many NaN values
    cols_to_drop = nan_ratios[nan_ratios > max_nan_ratio].index.tolist()
    if cols_to_drop:
        logger.warning(f"Dropping {len(cols_to_drop)} tickers with >{max_nan_ratio*100}% NaN: {cols_to_drop}")
        returns = returns.drop(columns=cols_to_drop)

    # Forward-fill, then backward-fill remaining NaN
    returns = returns.ffill().bfill()

    # Drop any remaining rows with NaN (edge case)
    returns = returns.dropna()

    logger.info(f"Cleaned data: {returns.shape[1]} tickers, {returns.shape[0]} observations")
    return returns
