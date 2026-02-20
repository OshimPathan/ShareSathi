import json
from typing import Any, Dict, Optional
import fakeredis.aioredis as redis

# Mock redis for local testing
redis_client = redis.FakeRedis()

async def get_redis():
    return redis_client

CACHE_TTL = 5  # 5 seconds cache for live data

async def get_cached_market_summary() -> Optional[Dict[str, Any]]:
    redis = await get_redis()
    cache_key = "nepse:market_summary"
    data = await redis.get(cache_key)
    return json.loads(data) if data else None

async def set_cached_market_summary(data: Dict[str, Any]):
    redis = await get_redis()
    cache_key = "nepse:market_summary"
    await redis.setex(cache_key, CACHE_TTL, json.dumps(data))

async def get_cached_live_market() -> Optional[str]:
    redis = await get_redis()
    return await redis.get("nepse:live_market")

async def set_cached_live_market(data: Dict[str, Any]):
    redis = await get_redis()
    await redis.setex("nepse:live_market", CACHE_TTL, json.dumps(data))
    await redis.setex("nepse:live_market:backup", 86400, json.dumps(data))
    
async def get_backup_live_market() -> Optional[str]:
    redis = await get_redis()
    return await redis.get("nepse:live_market:backup")
