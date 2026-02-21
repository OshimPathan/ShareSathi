from datetime import datetime
from app.utils.logger import logger


async def sync_eod_market_data():
    """
    Sync end-of-day market data from NEPSE.
    Runs Mon-Fri at 15:15 (after market close at 15:00 NPT).
    Refreshes the Redis cache with latest market summary and live data.
    """
    logger.info(f"[EOD Sync] Starting at {datetime.now()}")
    try:
        from app.services.nepse_service import NepseService
        from app.cache.cache_service import set_cached_market_summary, set_cached_live_market

        summary = await NepseService.get_market_summary()
        if summary:
            await set_cached_market_summary(summary)
            logger.info("[EOD Sync] Market summary cached successfully")

        live = await NepseService.get_live_market()
        if live:
            await set_cached_live_market(live)
            logger.info(f"[EOD Sync] Live market data cached")
    except Exception as e:
        logger.error(f"[EOD Sync] Failed: {e}")
