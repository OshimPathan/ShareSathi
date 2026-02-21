from sqlalchemy.ext.asyncio import create_async_engine
from app.config import settings

# Use the DATABASE_URL from environment / .env via Settings
DATABASE_URL = settings.DATABASE_URL

# Detect driver type for connection pool config
_is_sqlite = DATABASE_URL.startswith("sqlite")

_engine_kwargs = {
    "echo": False,
    "future": True,
}

# PostgreSQL-specific pooling settings
if not _is_sqlite:
    _engine_kwargs.update({
        "pool_size": 10,
        "max_overflow": 20,
        "pool_recycle": 3600,
        "pool_pre_ping": True,
    })

engine = create_async_engine(DATABASE_URL, **_engine_kwargs)
