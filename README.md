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

Instead of looking at stocks one at a time, MRIS shows you the big picture:
- Which stocks **move together**
- Which stocks are **independent**
- How **sectors** relate to each other
- Whether your **portfolio** is truly diversified

> **Core idea:** If stock A goes up, does stock B also go up? MRIS answers that for every pair of stocks in an index and shows it visually.

---

## Features

### 📊 Stock Map (Network Graph)
Interactive force-directed graph powered by D3.js. Each stock is a node — **bigger = more influential**. Same color = they move together. Lines = correlated above your chosen threshold. Click any stock for details.

### 🔍 Key Findings (Smart Insights)
Auto-generated plain-English analysis with priority levels (Critical / High / Medium / Low / Info). Identifies the most influential stock, top power players, market density, strongest connections, and independent stocks.

### 🏢 Sector Comparison (Heatmap)
Color-coded grid showing how different industry sectors (Banking, IT, Pharma, etc.) correlate with each other. Red = move together, Blue = move apart, Gray = independent.

### 💼 Portfolio Checker
Input your stock tickers, get a **diversification score (0-100)**, risk level, correlation breakdown, and actionable suggestions to improve your portfolio mix.

### ⚡ Live Mode
Continuously refreshes analysis every 2 minutes with the latest market data using Server-Sent Events (SSE).

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
| Data | Yahoo Finance (yfinance) |
| Math | NumPy, Pandas, NetworkX, python-louvain |
| Streaming | SSE (sse-starlette) |
| Deploy | Vercel (frontend) + Render (backend) |

---

## Architecture

```
User (Browser)
    │
    ▼
┌─── React + D3.js Frontend (Vercel) ───┐
│  Stock Map │ Sectors │ My Portfolio    │
└────────────────┬───────────────────────┘
                 │ REST API
                 ▼
┌─── FastAPI Backend (Render) ───────────┐
│                                        │
│  Yahoo Finance → Log Returns           │
│       → Correlation Matrix             │
│       → Threshold Filter               │
│       → NetworkX Graph                 │
│       → Louvain Clustering             │
│       → Insights + Sector Analysis     │
│                                        │
└────────────────────────────────────────┘
```

---

## Getting Started

### Prerequisites
- **Node.js** 18+ and npm
- **Python** 3.11+

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Start the server
python main.py
```

The API will be running at `http://localhost:8000`.

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
echo VITE_API_URL=http://localhost:8000 > .env

# Start dev server
npm run dev
```

The app will be running at `http://localhost:5173`.

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/indices` | List available stock indices |
| `POST` | `/api/analyze` | Run full network analysis |
| `POST` | `/api/live` | Start live SSE streaming |
| `POST` | `/api/portfolio/check` | Check portfolio diversification |
| `GET` | `/health` | Health check |

### Example: Run Analysis

```bash
curl -X POST http://localhost:8000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"index": "NIFTY 50", "period": "3mo", "threshold": 0.6}'
```

---

## Project Structure

```
mris/
├── backend/
│   ├── main.py                  # FastAPI entry point + CORS
│   ├── config.py                # Index definitions, sector mappings
│   ├── models.py                # Pydantic response models
│   ├── routes/
│   │   ├── analysis.py          # Main analysis pipeline
│   │   ├── live.py              # SSE live streaming
│   │   └── portfolio.py         # Portfolio risk checker
│   └── services/
│       ├── data_fetcher.py      # Yahoo Finance download
│       ├── preprocessor.py      # Log returns, cleaning
│       ├── correlation_engine.py # Correlation matrix
│       ├── graph_builder.py     # NetworkX graph + centrality
│       ├── clustering.py        # Louvain community detection
│       ├── insights_generator.py # Rule-based insights
│       └── sector_analyzer.py   # Cross-sector correlations
│
└── frontend/
    └── src/
        ├── App.jsx              # Main app with tab navigation
        ├── index.css            # Complete styling
        ├── components/
        │   ├── NetworkGraph.jsx # D3.js force graph
        │   ├── SectorHeatmap.jsx
        │   ├── PortfolioChecker.jsx
        │   ├── InsightsPanel.jsx
        │   ├── AnalyticsSidebar.jsx
        │   ├── ControlPanel.jsx
        │   ├── NodeInspector.jsx
        │   ├── GuidedTour.jsx
        │   ├── Header.jsx
        │   └── LoadingOverlay.jsx
        ├── hooks/
        │   └── useAnalysis.js   # API integration
        └── utils/
            └── colors.js        # Cluster color palette
```

---

## Methodology

The analysis pipeline uses established techniques from **computational finance** and **network science**:

1. **Log Returns** — Standard method in quantitative finance to normalize daily price changes
2. **Pearson Correlation** — Measures linear relationship between stock return series
3. **Threshold Filtering** — Removes noise by keeping only correlations above a user-defined strength
4. **Graph Construction** — Stocks become nodes, significant correlations become edges with weights
5. **Centrality Metrics** — Degree, betweenness, and closeness centrality identify influential stocks
6. **Louvain Community Detection** — Groups stocks into clusters that move together
7. **Sector Analysis** — Aggregates individual stock correlations into sector-level relationships

This methodology is used in published research by institutions including the European Central Bank, Bank of England, and in academic journals on financial network analysis.

---

## Deployment

### Frontend → Vercel
The frontend auto-deploys from the `frontend/` directory. Set the environment variable:
```
VITE_API_URL=https://your-backend.onrender.com
```

### Backend → Render
The backend auto-deploys with:
- **Build command:** `pip install -r requirements.txt`
- **Start command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
- **Runtime:** Python 3.11.0 (specified in `runtime.txt`)

---

## License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">
  Built with 🧠 for understanding markets better.
</p>
