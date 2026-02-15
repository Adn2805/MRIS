"""
MRIS Backend Configuration
Stock index definitions, default parameters, and cache settings.
"""

# ── Index Definitions ───────────────────────────────────────────────
# Each index maps to a list of Yahoo Finance tickers

INDICES = {
    "NIFTY 50": [
        "RELIANCE.NS", "TCS.NS", "HDFCBANK.NS", "INFY.NS", "ICICIBANK.NS",
        "HINDUNILVR.NS", "ITC.NS", "SBIN.NS", "BHARTIARTL.NS", "KOTAKBANK.NS",
        "LT.NS", "AXISBANK.NS", "ASIANPAINT.NS", "MARUTI.NS", "HCLTECH.NS",
        "SUNPHARMA.NS", "TITAN.NS", "BAJFINANCE.NS", "WIPRO.NS", "ULTRACEMCO.NS",
        "NESTLEIND.NS", "NTPC.NS", "POWERGRID.NS", "M&M.NS", "TATAMOTORS.NS",
        "ADANIENT.NS", "ADANIPORTS.NS", "ONGC.NS", "JSWSTEEL.NS", "TATASTEEL.NS",
        "TECHM.NS", "INDUSINDBK.NS", "HINDALCO.NS", "DRREDDY.NS", "DIVISLAB.NS",
        "CIPLA.NS", "BAJAJFINSV.NS", "BRITANNIA.NS", "EICHERMOT.NS", "APOLLOHOSP.NS",
        "COALINDIA.NS", "BPCL.NS", "GRASIM.NS", "TATACONSUM.NS", "HEROMOTOCO.NS",
        "SBILIFE.NS", "HDFCLIFE.NS", "UPL.NS", "BAJAJ-AUTO.NS", "LTIM.NS",
    ],
    "S&P 500 (Top 50)": [
        "AAPL", "MSFT", "AMZN", "NVDA", "GOOGL", "META", "TSLA", "BRK-B",
        "UNH", "JNJ", "XOM", "JPM", "V", "PG", "MA", "HD", "CVX", "MRK",
        "ABBV", "LLY", "PEP", "KO", "AVGO", "COST", "WMT", "TMO", "MCD",
        "CSCO", "ACN", "ABT", "CRM", "DHR", "LIN", "NEE", "TXN", "AMD",
        "PM", "UPS", "MS", "ORCL", "LOW", "INTC", "HON", "UNP", "QCOM",
        "BA", "AMGN", "SBUX", "IBM", "GE",
    ],
    "FTSE 100 (Top 30)": [
        "SHEL.L", "AZN.L", "HSBA.L", "ULVR.L", "BP.L", "GSK.L", "RIO.L",
        "BATS.L", "DGE.L", "REL.L", "LSEG.L", "AAL.L", "NG.L", "VOD.L",
        "GLEN.L", "CPG.L", "PRU.L", "ABF.L", "RKT.L", "CRH.L",
        "EXPN.L", "SSE.L", "AHT.L", "SGE.L", "BKG.L", "MNDI.L",
        "BNZL.L", "SVT.L", "HLMA.L", "INF.L",
    ],
    "DAX 40 (Top 30)": [
        "SAP.DE", "SIE.DE", "ALV.DE", "DTE.DE", "AIR.DE", "BAS.DE",
        "MBG.DE", "BMW.DE", "MUV2.DE", "IFX.DE", "ADS.DE", "DHL.DE",
        "BAYN.DE", "VOW3.DE", "HEN3.DE", "DB1.DE", "RWE.DE", "FRE.DE",
        "BEI.DE", "HEI.DE", "MTX.DE", "MRK.DE", "SHL.DE", "PAH3.DE",
        "ENR.DE", "CON.DE", "SRT3.DE", "QIA.DE", "ZAL.DE", "PUM.DE",
    ],
    "Hang Seng (Top 30)": [
        "0005.HK", "0700.HK", "9988.HK", "0941.HK", "1299.HK",
        "0388.HK", "0002.HK", "0003.HK", "0011.HK", "0016.HK",
        "0001.HK", "0066.HK", "0006.HK", "0012.HK", "0017.HK",
        "0027.HK", "0883.HK", "1038.HK", "1044.HK", "1093.HK",
        "1109.HK", "1177.HK", "1398.HK", "1928.HK", "2007.HK",
        "2018.HK", "2269.HK", "2313.HK", "2318.HK", "2388.HK",
    ],
}

# ── Default Parameters ──────────────────────────────────────────────

DEFAULT_THRESHOLD = 0.6
DEFAULT_PERIOD = "3mo"
VALID_PERIODS = ["1mo", "3mo", "6mo", "1y"]

# ── Influence Score Weights ─────────────────────────────────────────

INFLUENCE_WEIGHTS = {
    "degree": 0.4,
    "betweenness": 0.3,
    "closeness": 0.3,
}

# ── Cache Settings ──────────────────────────────────────────────────

CACHE_TTL_SECONDS = 600  # 10 minutes
CACHE_MAX_SIZE = 50

# ── Live Data Settings ──────────────────────────────────────────────

LIVE_REFRESH_INTERVAL = 120  # seconds between live data refreshes
LIVE_HEARTBEAT_INTERVAL = 30  # seconds between SSE heartbeat pings
