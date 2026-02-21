from contextlib import asynccontextmanager
import logging
import time
from collections import defaultdict
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware

from app.config import settings
from app.api.router import api_router
from app.websocket.market_ws import router as ws_router
from app.database.connection import engine
from app.database.base import Base
from app.websocket.connection_manager import manager
from app.background.scheduler import start_scheduler, stop_scheduler
from app.cache.redis_client import setup_redis, close_redis

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


# ─── Rate Limiting Middleware ───────────────────────────────
class RateLimitMiddleware(BaseHTTPMiddleware):
    """Simple in-memory sliding window rate limiter per IP."""

    def __init__(self, app, requests_per_minute: int = 60):
        super().__init__(app)
        self.requests_per_minute = requests_per_minute
        self.window = 60  # seconds
        self._hits: dict[str, list[float]] = defaultdict(list)

    async def dispatch(self, request: Request, call_next):
        # Skip rate limiting for health checks and WebSocket upgrades
        if request.url.path in ("/", "/health") or request.url.path.startswith("/ws"):
            return await call_next(request)

        client_ip = request.client.host if request.client else "unknown"
        now = time.time()
        cutoff = now - self.window

        # Remove expired timestamps
        hits = self._hits[client_ip]
        self._hits[client_ip] = [t for t in hits if t > cutoff]

        if len(self._hits[client_ip]) >= self.requests_per_minute:
            return Response(
                content='{"detail":"Rate limit exceeded. Please try again later."}',
                status_code=429,
                media_type="application/json",
                headers={"Retry-After": str(self.window)},
            )

        self._hits[client_ip].append(now)
        response = await call_next(request)
        return response

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting up...")
    
    # Initialize database tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    # Initialize Redis
    await setup_redis()
    
    manager.start_broadcasting()
    start_scheduler()
    
    yield
    
    logger.info("Shutting down...")
    stop_scheduler()
    manager.stop_broadcasting()
    await close_redis()
    await engine.dispose()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    lifespan=lifespan
)

# Rate limiting (must be added before CORS middleware)
app.add_middleware(RateLimitMiddleware, requests_per_minute=settings.RATE_LIMIT_PER_MINUTE)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)
app.include_router(ws_router)

@app.get("/", tags=["Health"])
async def root():
    return {"message": "Welcome to ShareSathi API", "version": settings.VERSION}

@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint for deployment monitoring."""
    from app.cache.redis_client import get_redis
    health = {"status": "ok", "version": settings.VERSION}
    try:
        redis = await get_redis()
        await redis.ping()
        health["redis"] = "connected"
    except Exception:
        health["redis"] = "unavailable"
    return health
