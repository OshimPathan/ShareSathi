from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

from app.utils.logger import logger
from app.background.market_sync import sync_eod_market_data
from app.background.historical_sync import sync_historical_data

scheduler = AsyncIOScheduler()

def start_scheduler():
    scheduler.add_job(
        sync_eod_market_data,
        CronTrigger(hour=15, minute=15, day_of_week='0-4'),
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
