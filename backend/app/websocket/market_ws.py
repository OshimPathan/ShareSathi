from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from app.websocket.connection_manager import manager
from app.core.jwt_handler import decode_access_token
from app.utils.logger import logger

router = APIRouter()

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, token: str = Query(default=None)):
    """WebSocket endpoint with optional token authentication.
    Pass token as query param: /ws?token=<access_token>"""
    
    # Optional auth - if token provided, validate it
    user_id = None
    if token:
        try:
            payload = decode_access_token(token)
            user_id = payload.get("sub")
        except Exception:
            # Allow connection but mark as unauthenticated
            logger.warning("WebSocket connection with invalid token")
    
    connected = await manager.connect(websocket)
    if not connected:
        return  # Connection was rejected (capacity full)

    try:
        while True:
            data = await websocket.receive_text()
            # Handle ping/pong for keepalive
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        manager.disconnect(websocket)
