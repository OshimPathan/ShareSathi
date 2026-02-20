from datetime import datetime
from app.utils.logger import logger

async def sync_eod_market_data():
    logger.info(f"Running EOD market data sync at {datetime.now()}")
    # Use services/repositories here in the future
    pass
