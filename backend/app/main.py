from contextlib import asynccontextmanager
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.api.router import api_router
from app.websocket.market_ws import router as ws_router
from app.database.connection import engine
from app.database.base import Base
from app.websocket.connection_manager import manager
from app.background.scheduler import start_scheduler, stop_scheduler

logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting up...")
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
    manager.start_broadcasting()
    start_scheduler()
    
    yield
    
    logger.info("Shutting down...")
    stop_scheduler()
    manager.stop_broadcasting()
    await engine.dispose()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)
app.include_router(ws_router)

@app.get("/", tags=["Health"])
async def root():
    return {"message": "Welcome to ShareSathi API MVP - Repository Pattern Architecture"}
