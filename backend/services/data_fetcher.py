"""
Data Fetcher Module
Downloads historical adjusted closing prices using yfinance.
Supports both preset period strings and custom date ranges.
"""

import yfinance as yf
import pandas as pd
import logging

logger = logging.getLogger(__name__)


def _extract_prices(data, tickers: list[str]) -> pd.DataFrame:
    """Extract Close prices from yfinance download result."""
    if isinstance(data.columns, pd.MultiIndex):
        prices = data["Close"]
    else:
        prices = data[["Close"]]
        prices.columns = tickers[:1]

    prices = prices.dropna(axis=1, how="all")

    if prices.empty:
        raise ValueError("No price data returned for the given tickers and period.")

    successful = len(prices.columns)
    failed = len(tickers) - successful
    if failed > 0:
        logger.warning(f"{failed}/{len(tickers)} tickers returned no data")

    logger.info(f"Fetched prices: {successful} tickers, {len(prices)} trading days")
    return prices


def fetch_prices(tickers: list[str], period: str = "3mo") -> pd.DataFrame:
    """
    Fetch adjusted closing prices using a preset period string.

    Args:
        tickers: List of Yahoo Finance ticker symbols
        period: Time period string (1mo, 3mo, 6mo, 1y)

    Returns:
        DataFrame with dates as index and tickers as columns
    """
    logger.info(f"Fetching prices for {len(tickers)} tickers, period={period}")

    try:
        data = yf.download(
            tickers=tickers,
            period=period,
            auto_adjust=True,
            progress=False,
            threads=True,
        )
    except Exception as e:
        logger.error(f"yfinance download failed: {e}")
        raise RuntimeError(f"Failed to fetch price data: {e}")

    return _extract_prices(data, tickers)


def fetch_prices_by_dates(
    tickers: list[str], start_date: str, end_date: str
) -> pd.DataFrame:
    """
    Fetch adjusted closing prices for a custom date range.

    Args:
        tickers: List of Yahoo Finance ticker symbols
        start_date: Start date string (YYYY-MM-DD)
        end_date: End date string (YYYY-MM-DD)

    Returns:
        DataFrame with dates as index and tickers as columns
    """
    logger.info(
        f"Fetching prices for {len(tickers)} tickers, "
        f"start={start_date}, end={end_date}"
    )

    try:
        data = yf.download(
            tickers=tickers,
            start=start_date,
            end=end_date,
            auto_adjust=True,
            progress=False,
            threads=True,
        )
    except Exception as e:
        logger.error(f"yfinance download failed: {e}")
        raise RuntimeError(f"Failed to fetch price data: {e}")

    return _extract_prices(data, tickers)
