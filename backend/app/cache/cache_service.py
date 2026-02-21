import json
from typing import Any, Dict, Optional
from app.cache.redis_client import get_redis

CACHE_TTL = 5  # 5 seconds cache for live data
CACHE_TTL_MEDIUM = 60  # 1 minute for semi-static data
CACHE_TTL_LONG = 300  # 5 minutes for static data

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
    data = await redis.get("nepse:live_market")
    return data

async def set_cached_live_market(data: Dict[str, Any]):
    redis = await get_redis()
    await redis.setex("nepse:live_market", CACHE_TTL, json.dumps(data))
    await redis.setex("nepse:live_market:backup", 86400, json.dumps(data))
    
async def get_backup_live_market() -> Optional[str]:
    redis = await get_redis()
    return await redis.get("nepse:live_market:backup")

async def get_cached_companies() -> Optional[Dict[str, Any]]:
    redis = await get_redis()
    data = await redis.get("nepse:companies")
    return json.loads(data) if data else None

async def set_cached_companies(data: Dict[str, Any]):
    redis = await get_redis()
    await redis.setex("nepse:companies", CACHE_TTL_LONG, json.dumps(data))

async def get_cached_fundamentals(symbol: str) -> Optional[Dict[str, Any]]:
    redis = await get_redis()
    data = await redis.get(f"nepse:fundamentals:{symbol}")
    return json.loads(data) if data else None

async def set_cached_fundamentals(symbol: str, data: Dict[str, Any]):
    redis = await get_redis()
    await redis.setex(f"nepse:fundamentals:{symbol}", CACHE_TTL_MEDIUM, json.dumps(data))
