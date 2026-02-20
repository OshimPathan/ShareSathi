import redis.asyncio as redis
from app.config import settings

redis_client: redis.Redis = None

async def setup_redis():
    global redis_client
    redis_client = redis.from_url(
        settings.REDIS_URL, 
        encoding="utf8", 
        decode_responses=True
    )
    return redis_client

async def get_redis() -> redis.Redis:
    if redis_client is None:
        await setup_redis()
    return redis_client

async def close_redis():
    if redis_client:
        await redis_client.close()
