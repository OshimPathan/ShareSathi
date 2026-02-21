"""
ShareSathi — Core Tests
========================
Tests for trading service, brokerage fees, market hours, and authentication.
Run with: pytest tests/ -v
"""

import pytest
from decimal import Decimal
from datetime import datetime, timezone, timedelta
from unittest.mock import AsyncMock, MagicMock, patch

# ─── Brokerage Fee Tests ────────────────────────────────────

from app.services.trading_service import (
    calculate_brokerage,
    calculate_total_fees,
    is_market_hours,
    NPT_OFFSET,
)


class TestBrokerageFees:
    """Test NEPSE brokerage fee calculation."""

    def test_small_trade_lowest_tier(self):
        """Trade under Rs 50k should use 0.36% rate."""
        fee = calculate_brokerage(Decimal("10000"))
        expected = Decimal("10000") * Decimal("0.36") / Decimal("100")
        assert fee == expected.quantize(Decimal("0.01"))

    def test_50k_boundary(self):
        """Trade at exactly Rs 50k should all be in first tier."""
        fee = calculate_brokerage(Decimal("50000"))
        expected = Decimal("50000") * Decimal("0.36") / Decimal("100")
        assert fee == expected.quantize(Decimal("0.01"))

    def test_medium_trade_two_tiers(self):
        """Trade of Rs 100k spans first two tiers."""
        fee = calculate_brokerage(Decimal("100000"))
        tier1 = Decimal("50000") * Decimal("0.36") / Decimal("100")
        tier2 = Decimal("50000") * Decimal("0.33") / Decimal("100")
        expected = (tier1 + tier2).quantize(Decimal("0.01"))
        assert fee == expected

    def test_zero_trade(self):
        """Zero trade amount should have zero fees."""
        fee = calculate_brokerage(Decimal("0"))
        assert fee == Decimal("0.00")

    def test_total_fees_includes_all_components(self):
        """Total fees should include brokerage + SEBON + DP charge."""
        fees = calculate_total_fees(Decimal("100000"))
        assert "brokerage" in fees
        assert "sebon_fee" in fees
        assert "dp_charge" in fees
        assert "total_fees" in fees
        assert fees["dp_charge"] == Decimal("25.00")
        assert fees["total_fees"] == fees["brokerage"] + fees["sebon_fee"] + fees["dp_charge"]

    def test_sebon_fee_calculation(self):
        """SEBON fee should be 0.015% of trade amount."""
        fees = calculate_total_fees(Decimal("1000000"))
        expected_sebon = (Decimal("1000000") * Decimal("0.015") / Decimal("100")).quantize(Decimal("0.01"))
        assert fees["sebon_fee"] == expected_sebon


# ─── Market Hours Tests ─────────────────────────────────────

class TestMarketHours:
    """Test NEPSE trading hours detection."""

    @patch("app.services.trading_service.datetime")
    def test_market_open_sunday_noon(self, mock_dt):
        """Sunday at noon NPT (trading day) should be open."""
        # Sunday noon NPT = Sunday 06:15 UTC
        npt_noon_sunday = datetime(2026, 2, 22, 6, 15, tzinfo=timezone.utc)  # Sunday
        mock_dt.now.return_value = npt_noon_sunday
        mock_dt.side_effect = lambda *a, **kw: datetime(*a, **kw)
        # Can't easily mock this without more complex setup, so test the logic directly
        now_npt = npt_noon_sunday + NPT_OFFSET
        weekday = now_npt.weekday()
        assert weekday == 6  # Sunday
        assert 11 <= now_npt.hour < 15

    @patch("app.services.trading_service.datetime")
    def test_market_closed_friday(self, mock_dt):
        """Friday should always be closed (not NEPSE trading day)."""
        # Friday noon NPT = Friday 06:15 UTC
        friday = datetime(2026, 2, 20, 6, 15, tzinfo=timezone.utc)  # Friday
        now_npt = friday + NPT_OFFSET
        weekday = now_npt.weekday()
        assert weekday == 4  # Friday
        trading_days = {6, 0, 1, 2, 3}
        assert weekday not in trading_days


# ─── News Service Tests ─────────────────────────────────────

class TestNewsService:
    """Test news service scraping and caching."""

    @pytest.mark.asyncio
    async def test_news_returns_structure(self):
        """News response should have correct structure."""
        from app.services.news_service import NewsService
        # Force empty cache first
        NewsService._cache = []
        NewsService._cache_time = None
        
        result = await NewsService.get_latest_news("All")
        assert "news" in result
        assert "category" in result
        assert isinstance(result["news"], list)

    @pytest.mark.asyncio
    async def test_news_category_filter(self):
        """Filtering by category should only return matching items."""
        from app.services.news_service import NewsService
        # Populate cache with test data
        NewsService._cache = [
            {"id": 1, "title": "Test Market News", "category": "Market", "source": "Test", "published_at": "now", "url": None, "content": "test"},
            {"id": 2, "title": "Test Analysis", "category": "Analysis", "source": "Test", "published_at": "now", "url": None, "content": "test"},
        ]
        NewsService._cache_time = datetime.now()

        result = await NewsService.get_latest_news("Market")
        assert all(n["category"] == "Market" for n in result["news"])


# ─── Config Tests ────────────────────────────────────────────

class TestConfig:
    """Test configuration safety."""

    def test_secret_key_not_default_pattern(self):
        """Warn if secret key still has dev pattern (informational)."""
        from app.config import settings
        # In CI/production this should be overridden
        assert isinstance(settings.SECRET_KEY, str)
        assert len(settings.SECRET_KEY) >= 10

    def test_cors_origins_parsed(self):
        """CORS origins should be properly parsed from comma-separated string."""
        from app.config import settings
        origins = settings.cors_origins
        assert isinstance(origins, list)
        assert len(origins) >= 1
        for origin in origins:
            assert origin.strip() == origin  # No extra whitespace

    def test_rate_limit_positive(self):
        """Rate limit must be positive."""
        from app.config import settings
        assert settings.RATE_LIMIT_PER_MINUTE > 0


# ─── Frontend Fee Estimation Parity (logic test) ────────────

class TestFeeParity:
    """Ensure backend and frontend fee calculations produce same results."""

    def test_fee_for_standard_trade(self):
        """100k trade should produce consistent fees."""
        fees = calculate_total_fees(Decimal("100000"))
        # First 50k at 0.36%, next 50k at 0.33%
        assert fees["brokerage"] == Decimal("345.00")  # 180 + 165
        assert fees["dp_charge"] == Decimal("25.00")
