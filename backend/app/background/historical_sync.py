from datetime import datetime
from app.utils.logger import logger


async def sync_historical_data():
    """
    Sync historical price data for tracked stocks.
    Runs daily at midnight. Fetches from NEPSE service and
    caches the company list for quick lookups.
    """
    logger.info(f"[Historical Sync] Starting at {datetime.now()}")
    try:
        from app.services.nepse_service import NepseService
        from app.cache.cache_service import set_cached_companies

        service = NepseService()
        companies = await service.get_company_list()
        if companies:
            await set_cached_companies(companies)
            logger.info(f"[Historical Sync] Cached {len(companies)} companies")
        else:
            logger.warning("[Historical Sync] No companies returned from NEPSE")
    except Exception as e:
        logger.error(f"[Historical Sync] Failed: {e}")
