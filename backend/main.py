"""
MRIS Backend — FastAPI Application Entry Point
Market Relationship Intelligence System
"""

import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.analysis import router as analysis_router
from routes.live import router as live_router

# ── Logging ─────────────────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-7s | %(name)s | %(message)s",
    datefmt="%H:%M:%S",
)

# ── App ─────────────────────────────────────────────────────────────

app = FastAPI(
    title="MRIS — Market Relationship Intelligence System",
    description="Network analysis and visualization of structural stock market relationships.",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analysis_router)
app.include_router(live_router)


@app.get("/")
async def root():
    return {"name": "MRIS API", "version": "2.0.0", "status": "operational"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
