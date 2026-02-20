from datetime import datetime
from app.utils.logger import logger

async def sync_historical_data():
    logger.info(f"Running historical data sync at {datetime.now()}")
    # Use services/repositories here in the future
    pass
