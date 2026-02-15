"""
Portfolio Risk Checker Route
Analyzes correlation between user-selected stocks and provides
diversification scores and suggestions.
"""

import numpy as np
import pandas as pd
import logging
from datetime import datetime
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
from services.data_fetcher import fetch_prices, fetch_prices_by_dates
from services.preprocessor import compute_log_returns, clean_data

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/portfolio", tags=["portfolio"])


class PortfolioRequest(BaseModel):
    tickers: list[str] = Field(..., min_length=2, max_length=20, description="List of ticker symbols")
    period: Optional[str] = Field("3mo", description="Time period")
    start_date: Optional[str] = None
    end_date: Optional[str] = None


class StockCorrelation(BaseModel):
    ticker1: str
    ticker2: str
    correlation: float


class PortfolioResponse(BaseModel):
    tickers_found: list[str]
    tickers_missing: list[str]
    diversification_score: float = Field(..., description="0-100, higher = more diversified")
    risk_level: str
    risk_description: str
    avg_correlation: float
    correlations: list[StockCorrelation]
    correlation_matrix: list[list[float]]
    matrix_labels: list[str]
    suggestions: list[str]
    timestamp: str


@router.post("/check", response_model=PortfolioResponse)
async def check_portfolio(request: PortfolioRequest):
    """Analyze portfolio diversification and risk."""
    logger.info(f"Portfolio check: {len(request.tickers)} tickers")

    try:
        # Normalize tickers (add .NS suffix if no suffix present, for Indian stocks)
        tickers = []
        for t in request.tickers:
            t = t.strip().upper()
            if t:
                tickers.append(t)

        if len(tickers) < 2:
            raise HTTPException(status_code=400, detail="At least 2 tickers required")

        # Fetch prices
        if request.start_date and request.end_date:
            prices = fetch_prices_by_dates(tickers, request.start_date, request.end_date)
        else:
            prices = fetch_prices(tickers, request.period or "3mo")

        # Track which tickers were found
        found = [c for c in prices.columns]
        missing = [t for t in tickers if t not in found]

        if len(found) < 2:
            raise HTTPException(
                status_code=400,
                detail=f"Only {len(found)} ticker(s) found. Need at least 2."
            )

        # Compute returns and correlations
        returns = compute_log_returns(prices)
        returns = clean_data(returns)
        corr_matrix = returns.corr()

        # Extract pairwise correlations
        correlations = []
        corr_values = []
        labels = [_clean(c) for c in corr_matrix.columns]

        for i in range(len(corr_matrix)):
            for j in range(i + 1, len(corr_matrix)):
                val = float(corr_matrix.iloc[i, j])
                corr_values.append(val)
                correlations.append(StockCorrelation(
                    ticker1=labels[i],
                    ticker2=labels[j],
                    correlation=round(val, 3),
                ))

        # Sort correlations by absolute value (strongest first)
        correlations.sort(key=lambda c: abs(c.correlation), reverse=True)

        # Compute diversification score
        avg_corr = float(np.mean(corr_values)) if corr_values else 0.0
        div_score = max(0.0, min(100.0, (1.0 - avg_corr) * 100))

        # Risk level
        if div_score >= 70:
            risk_level = "Low Risk"
            risk_desc = (
                "Your portfolio is well-diversified! These stocks move independently, "
                "so a drop in one is unlikely to drag down the others."
            )
        elif div_score >= 40:
            risk_level = "Moderate Risk"
            risk_desc = (
                "Your portfolio has moderate diversification. Some stocks move together, "
                "which means partial correlation risk. Consider adding stocks from different sectors."
            )
        else:
            risk_level = "High Risk"
            risk_desc = (
                "Your portfolio is highly concentrated! Most of these stocks move together, "
                "meaning if one falls, they all likely fall. You need stocks from different sectors."
            )

        # Generate suggestions
        suggestions = _generate_suggestions(correlations, labels, avg_corr, div_score)

        # Build matrix for frontend
        matrix_data = corr_matrix.round(3).values.tolist()

        return PortfolioResponse(
            tickers_found=[_clean(t) for t in found],
            tickers_missing=missing,
            diversification_score=round(div_score, 1),
            risk_level=risk_level,
            risk_description=risk_desc,
            avg_correlation=round(avg_corr, 3),
            correlations=correlations,
            correlation_matrix=matrix_data,
            matrix_labels=labels,
            suggestions=suggestions,
            timestamp=datetime.utcnow().isoformat(),
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Portfolio check error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Portfolio analysis failed: {e}")


def _generate_suggestions(correlations, labels, avg_corr, div_score):
    """Generate actionable portfolio suggestions."""
    suggestions = []

    # Find most correlated pair
    if correlations:
        top = correlations[0]
        if top.correlation > 0.7:
            suggestions.append(
                f"⚠️ **{top.ticker1}** and **{top.ticker2}** are highly correlated "
                f"({top.correlation:.2f}). Consider replacing one with a stock from a different sector."
            )

    if div_score < 40:
        suggestions.append(
            "📉 Your portfolio has high concentration risk. Try adding stocks from "
            "sectors like IT, Pharma, or FMCG to balance out Banking/Finance exposure."
        )

    if div_score >= 70:
        suggestions.append(
            "✅ Great diversification! Your stocks come from different market segments. "
            "This portfolio can better withstand sector-specific downturns."
        )

    if len(labels) <= 3:
        suggestions.append(
            "📊 Consider holding at least 5-8 stocks for proper diversification. "
            "Too few stocks means higher risk from individual company events."
        )

    if avg_corr < 0.3:
        suggestions.append(
            "🎯 Very low average correlation — these stocks are largely independent. "
            "This is an excellent foundation for a diversified portfolio."
        )

    if not suggestions:
        suggestions.append(
            "📈 Your portfolio shows a balanced mix. Keep monitoring correlations "
            "over time as market conditions change."
        )

    return suggestions


def _clean(symbol):
    for suffix in [".NS", ".L", ".DE", ".HK", ".BO"]:
        symbol = symbol.replace(suffix, "")
    return symbol
