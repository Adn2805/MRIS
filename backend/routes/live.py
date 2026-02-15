"""
MRIS Live Data Routes
Server-Sent Events (SSE) endpoint for real-time network analysis updates.
"""

import asyncio
import json
import logging
from typing import Optional
from datetime import datetime
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse

from models import AnalysisRequest
from config import INDICES, LIVE_REFRESH_INTERVAL, LIVE_HEARTBEAT_INTERVAL
from routes.analysis import run_analysis_pipeline

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/live", tags=["live"])


@router.get("/stream")
async def live_stream(
    request: Request,
    index: str,
    threshold: float = 0.6,
    period: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    interval: Optional[int] = None,
):
    """
    Server-Sent Events endpoint for live analysis updates.

    Opens a persistent connection, runs the analysis pipeline immediately,
    then re-runs it at the configured interval, streaming updated GraphResponse
    events to the client.
    """
    if index not in INDICES:
        raise HTTPException(status_code=400, detail=f"Unknown index: {index}")

    refresh_interval = interval if interval and 30 <= interval <= 600 else LIVE_REFRESH_INTERVAL

    analysis_request = AnalysisRequest(
        index=index,
        period=period,
        start_date=start_date,
        end_date=end_date,
        threshold=threshold,
    )

    async def event_generator():
        """Generate SSE events with analysis updates."""
        heartbeat_counter = 0

        while True:
            # Check if client disconnected
            if await request.is_disconnected():
                logger.info(f"Live stream client disconnected: {index}")
                break

            try:
                # Run analysis pipeline (blocking call wrapped for async)
                loop = asyncio.get_event_loop()
                response = await loop.run_in_executor(
                    None, run_analysis_pipeline, analysis_request
                )

                # Send data event
                data = response.model_dump_json()
                yield f"event: update\ndata: {data}\n\n"
                logger.info(
                    f"Live update sent: {index} | "
                    f"{response.stats.total_nodes} nodes, "
                    f"{response.stats.total_edges} edges"
                )

            except Exception as e:
                error_data = json.dumps({"error": str(e)})
                yield f"event: error\ndata: {error_data}\n\n"
                logger.error(f"Live stream error: {e}")

            # Wait for refresh interval, sending heartbeats
            elapsed = 0
            while elapsed < refresh_interval:
                if await request.is_disconnected():
                    return

                await asyncio.sleep(min(LIVE_HEARTBEAT_INTERVAL, refresh_interval - elapsed))
                elapsed += LIVE_HEARTBEAT_INTERVAL
                heartbeat_counter += 1

                # Send heartbeat ping
                ts = datetime.utcnow().isoformat() + "Z"
                yield f"event: ping\ndata: {{\"ts\":\"{ts}\",\"next_in\":{max(0, refresh_interval - elapsed)}}}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
