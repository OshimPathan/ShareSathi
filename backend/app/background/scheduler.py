from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

from app.utils.logger import logger
from app.background.market_sync import sync_eod_market_data
from app.background.historical_sync import sync_historical_data

scheduler = AsyncIOScheduler()

def start_scheduler():
    # NEPSE trades Sun-Thu. In APScheduler: sun=6, mon=0, tue=1, wed=2, thu=3
    scheduler.add_job(
        sync_eod_market_data,
        CronTrigger(hour=15, minute=15, day_of_week='sun-thu'),
        id="sync_eod",
        replace_existing=True
    )
    scheduler.add_job(
        sync_historical_data,
        CronTrigger(hour=0, minute=0, day_of_week='0-6'),
        id="sync_historical",
        replace_existing=True
    )
    scheduler.start()
    logger.info("Background scheduler started")

def stop_scheduler():
    scheduler.shutdown()
    logger.info("Background scheduler stopped")
