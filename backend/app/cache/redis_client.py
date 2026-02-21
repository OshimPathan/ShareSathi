import logging
import redis.asyncio as redis
from app.config import settings

logger = logging.getLogger(__name__)

redis_client: redis.Redis = None
_use_fakeredis: bool = False

async def setup_redis():
    global redis_client, _use_fakeredis
    try:
        redis_client = redis.from_url(
            settings.REDIS_URL, 
            encoding="utf8", 
            decode_responses=True
        )
        # Test connectivity
        await redis_client.ping()
        logger.info(f"Connected to Redis at {settings.REDIS_URL}")
    except Exception as e:
        logger.warning(f"Redis unavailable ({e}), falling back to fakeredis for development")
        import fakeredis.aioredis as fake
        redis_client = fake.FakeRedis(decode_responses=True)
        _use_fakeredis = True
    return redis_client

async def get_redis() -> redis.Redis:
    if redis_client is None:
        await setup_redis()
    return redis_client

async def close_redis():
    global redis_client
    if redis_client and not _use_fakeredis:
        await redis_client.close()
        redis_client = None
