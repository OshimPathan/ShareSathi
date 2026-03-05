import secrets

from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


def _generate_dev_key() -> str:
    """Generate a random key for local dev so nothing is ever hardcoded."""
    return secrets.token_urlsafe(64)


class Settings(BaseSettings):
    PROJECT_NAME: str = "ShareSathi MVP API"
    VERSION: str = "0.2.0"
    API_V1_STR: str = "/api/v1"

    # Security — no hardcoded fallback; random per-process in dev,
    # MUST be set via env var / .env in production for stable sessions.
    SECRET_KEY: str = _generate_dev_key()
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # CORS - comma separated origins, or ["*"] for dev
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://localhost:3000"

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./sharesathi_dev.db"

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # Nepse API
    NEPSE_API_TIMEOUT: int = 10

    # Apify
    APIFY_API_KEY: str | None = None

    # Rate limiting
    RATE_LIMIT_PER_MINUTE: int = 60

    @property
    def cors_origins(self) -> List[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]

    model_config = SettingsConfigDict(
        env_file=".env", 
        env_file_encoding="utf-8",
        extra="ignore"
    )

    def validate_production(self) -> None:
        """Call at startup to ensure production-unsafe defaults are overridden."""
        import os
        env = os.getenv("ENVIRONMENT", "development")
        if env in ("production", "staging"):
            # In production the key MUST come from an env var, not auto-generated
            if len(self.SECRET_KEY) < 32 or not os.getenv("SECRET_KEY"):
                raise RuntimeError(
                    "FATAL: SECRET_KEY must be explicitly set via environment variable "
                    "in production/staging. Generate one with: "
                    "python -c \"import secrets; print(secrets.token_urlsafe(64))\""
                )
            if "sqlite" in self.DATABASE_URL:
                import logging
                logging.getLogger(__name__).warning(
                    "WARNING: Using SQLite in %s. Set DATABASE_URL to PostgreSQL.", env
                )

settings = Settings()
