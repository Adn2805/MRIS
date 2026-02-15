<p align="center">
  <img src="https://img.shields.io/badge/MRIS-Market%20Relationship%20Intelligence-0ea5e9?style=for-the-badge&labelColor=0f172a" alt="MRIS Banner" />
</p>

<h1 align="center">MRIS — Market Relationship Intelligence System</h1>

<p align="center">
  <em>See how stocks are connected. Build smarter portfolios.</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18-61dafb?logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/FastAPI-0.100+-009688?logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/D3.js-v7-f9a03c?logo=d3dotjs&logoColor=white" alt="D3.js" />
  <img src="https://img.shields.io/badge/Python-3.11-3776ab?logo=python&logoColor=white" alt="Python" />
  <img src="https://img.shields.io/badge/Deploy-Vercel%20%2B%20Render-000?logo=vercel&logoColor=white" alt="Deploy" />
</p>

---

## What Is MRIS?

MRIS is a full-stack web application that visualizes **how stocks in a market index are related to each other** — like a social network, but for stocks.

It uses **real stock data** from Yahoo Finance, computes correlations between every pair of stocks, and shows the result as an interactive network graph. Users select an index, choose a time period, and click Analyze to see the relationships.

---

## 3 Core Features

### 1. 📊 Stock Map (Interactive Network Graph)
The main feature. An interactive force-directed graph powered by D3.js that shows stock correlations.

- **Bigger circle** = more influential stock
- **Same color** = stocks that move together (same cluster)
- **Lines** = stocks are correlated above your chosen threshold
- **Click any stock** to see its connections, centrality metrics, and influence score
- **User controls:** Select any supported index, choose time range (1M / 3M / 6M / 1Y / custom dates), adjust connection strength

### 2. 💡 Key Findings (Smart Insights)
Auto-generated plain-English analysis of the network, with priority-based labels:

- **CRITICAL** — Most influential stock in the network
- **HIGH** — Top 3 power players, strongest connections
- **MEDIUM** — Cluster analysis, market density
- **LOW** — Independent stocks (diversification candidates)
- **INFO** — Network summary

### 3. 💼 Portfolio Checker
Input your stock tickers to check if your portfolio is truly diversified.

- Get a **diversification score (0-100)**
- See **risk level** (Low / Moderate / High)
- View **correlation between your stocks**
- Receive **actionable suggestions** to improve your mix

---

## Supported Indices

| Index | Country | Stocks |
|---|---|---|
| NIFTY 50 | 🇮🇳 India | 50 |
| S&P 500 | 🇺🇸 USA | 30 |
| FTSE 100 | 🇬🇧 UK | 30 |
| DAX 40 | 🇩🇪 Germany | 30 |
| Hang Seng | 🇭🇰 Hong Kong | 30 |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, D3.js, Lucide Icons |
| Backend | Python 3.11, FastAPI, Uvicorn |
| Data Source | Yahoo Finance (yfinance) — real market data |
| Math | NumPy, Pandas, NetworkX, python-louvain, SciPy |
| Deploy | Vercel (frontend) + Render (backend) |

---

## How It Works

```
User selects index + time range + connection strength
                    │
                    ▼
    ┌─── FastAPI Backend ──────────────────┐
    │                                      │
    │  1. Fetch stock prices (Yahoo)       │
    │  2. Compute daily log returns        │
    │  3. Build correlation matrix         │
    │  4. Filter by threshold              │
    │  5. Build network graph (NetworkX)   │
    │  6. Detect clusters (Louvain)        │
    │  7. Compute centrality & influence   │
    │  8. Generate insights                │
    │                                      │
    └──────────────┬───────────────────────┘
                   │ JSON response
                   ▼
    ┌─── React Frontend ──────────────────┐
    │                                      │
    │  D3.js renders interactive graph     │
    │  Sidebar shows stats & top stocks    │
    │  Key Findings panel shows insights   │
    │                                      │
    └──────────────────────────────────────┘
```

---

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Python 3.11+

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux
pip install -r requirements.txt
python main.py               # Starts at http://localhost:8000
```

### Frontend

```bash
cd frontend
npm install
echo VITE_API_URL=http://localhost:8000 > .env
npm run dev                  # Starts at http://localhost:5173
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/indices` | List available stock indices |
| `POST` | `/api/analyze` | Run full network analysis |
| `POST` | `/api/portfolio/check` | Check portfolio diversification |
| `GET` | `/health` | Health check |

---

## Project Structure

```
mris/
├── backend/
│   ├── main.py                  # FastAPI entry point
│   ├── config.py                # Index definitions, settings
│   ├── models.py                # Pydantic response models
│   ├── routes/
│   │   ├── analysis.py          # Network analysis pipeline
│   │   └── portfolio.py         # Portfolio risk checker
│   └── services/
│       ├── data_fetcher.py      # Yahoo Finance download
│       ├── preprocessor.py      # Log returns, cleaning
│       ├── correlation_engine.py # Correlation matrix
│       ├── graph_builder.py     # NetworkX graph + centrality
│       ├── clustering.py        # Louvain community detection
│       └── insights_generator.py # Rule-based insights
│
└── frontend/
    └── src/
        ├── App.jsx              # Main app (2 tabs)
        ├── index.css            # Complete styling
        ├── components/
        │   ├── NetworkGraph.jsx # D3.js force graph
        │   ├── PortfolioChecker.jsx
        │   ├── InsightsPanel.jsx
        │   ├── AnalyticsSidebar.jsx
        │   ├── ControlPanel.jsx
        │   ├── NodeInspector.jsx
        │   ├── Header.jsx
        │   ├── GuidedTour.jsx
        │   └── LoadingOverlay.jsx
        ├── hooks/useAnalysis.js
        └── utils/colors.js
```

---

## Methodology

Uses established techniques from computational finance:

1. **Log Returns** — Standard normalization of daily price changes
2. **Pearson Correlation** — Measures linear relationship between stock returns
3. **Threshold Filtering** — Keeps only significant correlations (user-adjustable)
4. **Louvain Community Detection** — Groups stocks that move together
5. **Centrality Metrics** — Degree, betweenness, closeness to identify influential stocks

---

## License

MIT License

---

<p align="center">
  Built with 🧠 for understanding markets better.
</p>
