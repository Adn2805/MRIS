"""
Sector Analyzer Module
Computes sector-level correlations from individual stock returns.
"""

import numpy as np
import pandas as pd
import logging

logger = logging.getLogger(__name__)


def compute_sector_heatmap(returns: pd.DataFrame, sector_map: dict) -> dict:
    """
    Compute average pairwise correlation between sectors.

    Args:
        returns: DataFrame of cleaned log returns (columns = tickers)
        sector_map: dict mapping ticker -> sector name

    Returns:
        dict with keys: sectors (list), matrix (2D list), sector_stocks (dict)
    """
    # Map each column to its sector
    ticker_sectors = {}
    for col in returns.columns:
        sector = sector_map.get(col, "Other")
        ticker_sectors[col] = sector

    # Group columns by sector
    sector_groups = {}
    for ticker, sector in ticker_sectors.items():
        sector_groups.setdefault(sector, []).append(ticker)

    sectors = sorted(sector_groups.keys())
    n = len(sectors)

    if n < 2:
        return {"sectors": sectors, "matrix": [[1.0]], "sector_stocks": sector_groups}

    # Compute full correlation matrix
    corr = returns.corr()

    # Compute average cross-sector correlations
    matrix = np.zeros((n, n))
    for i, s1 in enumerate(sectors):
        for j, s2 in enumerate(sectors):
            tickers_1 = sector_groups[s1]
            tickers_2 = sector_groups[s2]

            if i == j:
                # Intra-sector correlation
                if len(tickers_1) > 1:
                    pairs = []
                    for a in range(len(tickers_1)):
                        for b in range(a + 1, len(tickers_1)):
                            t1, t2 = tickers_1[a], tickers_1[b]
                            if t1 in corr.index and t2 in corr.index:
                                pairs.append(corr.loc[t1, t2])
                    matrix[i][j] = float(np.mean(pairs)) if pairs else 1.0
                else:
                    matrix[i][j] = 1.0
            else:
                # Inter-sector correlation
                pairs = []
                for t1 in tickers_1:
                    for t2 in tickers_2:
                        if t1 in corr.index and t2 in corr.index:
                            pairs.append(corr.loc[t1, t2])
                matrix[i][j] = float(np.mean(pairs)) if pairs else 0.0

    logger.info(f"Computed sector heatmap: {n} sectors")

    return {
        "sectors": sectors,
        "matrix": matrix.round(3).tolist(),
        "sector_stocks": {s: [_clean(t) for t in ts] for s, ts in sector_groups.items()},
    }


def _clean(symbol):
    for suffix in [".NS", ".L", ".DE", ".HK", ".BO"]:
        symbol = symbol.replace(suffix, "")
    return symbol
