from sqlalchemy.ext.asyncio import create_async_engine

# Override for local MVP testing
DATABASE_URL = "sqlite+aiosqlite:///./test_sharesathi.db"

engine = create_async_engine(
    DATABASE_URL,
    echo=False,
    future=True,
)
