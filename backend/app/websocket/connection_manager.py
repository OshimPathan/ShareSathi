import asyncio
from typing import List, Dict, Any
from fastapi import WebSocket

from app.services.market_service import MarketService
from app.utils.logger import logger

MAX_CONNECTIONS = 500  # Prevent DoS via WebSocket flood


class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self._broadcast_task: asyncio.Task = None

    async def connect(self, websocket: WebSocket) -> bool:
        if len(self.active_connections) >= MAX_CONNECTIONS:
            logger.warning(f"WebSocket connection rejected: max {MAX_CONNECTIONS} reached")
            await websocket.close(code=1013, reason="Server capacity reached")
            return False
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"Client connected. Active: {len(self.active_connections)}")
        return True

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info(f"Client disconnected. Active: {len(self.active_connections)}")

    async def broadcast(self, message: Dict[str, Any]):
        disconnected = []
        for connection in list(self.active_connections):
            try:
                await connection.send_json(message)
            except Exception as e:
                logger.warning(f"Failed to broadcast message: {e}")
                disconnected.append(connection)
        # Clean up dead connections
        for conn in disconnected:
            self.disconnect(conn)

    async def _broadcast_loop(self):
        """Broadcast loop that fetches data (with caching) and pushes to clients."""
        while True:
            if self.active_connections:
                try:
                    # These now use cache internally (5s TTL) so we won't flood NEPSE API
                    live_data = await MarketService.get_live()
                    summary_data = await MarketService.get_summary()
                    payload = {
                        "live": live_data,
                        "summary": summary_data
                    }
                    await self.broadcast(payload)
                except Exception as e:
                    logger.error(f"Error in broadcast loop: {e}")
            await asyncio.sleep(5)

    def start_broadcasting(self):
        if not self._broadcast_task or self._broadcast_task.done():
            self._broadcast_task = asyncio.create_task(self._broadcast_loop())
            logger.info("Started WebSocket broadcast background task")

    def stop_broadcasting(self):
        if self._broadcast_task and not self._broadcast_task.done():
            self._broadcast_task.cancel()
            logger.info("Stopped WebSocket broadcast background task")

manager = ConnectionManager()
