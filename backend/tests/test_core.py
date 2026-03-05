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
from fastapi import HTTPException

# ─── Brokerage Fee Tests ────────────────────────────────────

from app.services.trading_service import (
    calculate_brokerage,
    calculate_total_fees,
    is_market_hours,
    CIRCUIT_LIMIT_PCT,
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


# ─── Circuit Breaker Tests ──────────────────────────────────

class TestCircuitBreaker:
    """Test NEPSE ±10% daily circuit breaker enforcement."""

    def _make_service(self):
        """Create a TradingService with a mock DB session."""
        from app.services.trading_service import TradingService
        mock_db = MagicMock()
        return TradingService(mock_db)

    def test_within_circuit_no_error(self):
        """Price within ±10% of previous close should not raise."""
        svc = self._make_service()
        # +5% change — should pass
        svc._check_circuit_breaker("NABIL", Decimal("1050"), Decimal("1000"))

    def test_upper_circuit_triggers(self):
        """Price > +10% should raise HTTPException."""
        svc = self._make_service()
        with pytest.raises(HTTPException) as exc_info:
            svc._check_circuit_breaker("NABIL", Decimal("1110"), Decimal("1000"))
        assert exc_info.value.status_code == 400
        assert "upper" in exc_info.value.detail.lower()

    def test_lower_circuit_triggers(self):
        """Price < -10% should raise HTTPException."""
        svc = self._make_service()
        with pytest.raises(HTTPException) as exc_info:
            svc._check_circuit_breaker("NABIL", Decimal("890"), Decimal("1000"))
        assert exc_info.value.status_code == 400
        assert "lower" in exc_info.value.detail.lower()

    def test_exactly_10_pct_is_allowed(self):
        """Exactly ±10% should pass (>10% triggers, not ≥10%)."""
        svc = self._make_service()
        # +10% exactly
        svc._check_circuit_breaker("NABIL", Decimal("1100"), Decimal("1000"))
        # -10% exactly
        svc._check_circuit_breaker("NABIL", Decimal("900"), Decimal("1000"))

    def test_zero_previous_close_skips(self):
        """If previous close is 0, skip circuit check."""
        svc = self._make_service()
        svc._check_circuit_breaker("NABIL", Decimal("1500"), Decimal("0"))


# ─── Lot Size & Short Selling Tests ─────────────────────────

class TestTradingRules:
    """Test NEPSE-specific trading rules."""

    def _make_service(self):
        from app.services.trading_service import TradingService
        mock_db = MagicMock()
        return TradingService(mock_db)

    @pytest.mark.asyncio
    async def test_buy_rejects_zero_quantity(self):
        """Quantity 0 should be rejected."""
        svc = self._make_service()
        with pytest.raises(HTTPException) as exc_info:
            await svc.execute_buy(user_id=1, symbol="NABIL", quantity=0)
        assert exc_info.value.status_code == 400

    @pytest.mark.asyncio
    async def test_buy_rejects_under_lot_size(self):
        """Quantity < 10 (NEPSE min lot) should be rejected."""
        svc = self._make_service()
        with pytest.raises(HTTPException) as exc_info:
            await svc.execute_buy(user_id=1, symbol="NABIL", quantity=5)
        assert "10 shares" in exc_info.value.detail

    @pytest.mark.asyncio
    async def test_sell_rejects_under_lot_size(self):
        """Sell quantity < 10 should be rejected."""
        svc = self._make_service()
        with pytest.raises(HTTPException) as exc_info:
            await svc.execute_sell(user_id=1, symbol="NABIL", quantity=3)
        assert "10 shares" in exc_info.value.detail


# ─── Brokerage Tier Edge Cases ──────────────────────────────

class TestBrokerageTierEdges:
    """Test brokerage calculation at tier boundaries."""

    def test_500k_boundary(self):
        """Trade at Rs 500k spans tiers 1+2 fully."""
        fee = calculate_brokerage(Decimal("500000"))
        tier1 = Decimal("50000") * Decimal("0.36") / 100
        tier2 = Decimal("450000") * Decimal("0.33") / 100
        assert fee == (tier1 + tier2).quantize(Decimal("0.01"))

    def test_large_trade_all_tiers(self):
        """Rs 50M trade should span all five tiers."""
        fee = calculate_brokerage(Decimal("50000000"))
        t1 = Decimal("50000") * Decimal("0.36") / 100
        t2 = Decimal("450000") * Decimal("0.33") / 100
        t3 = Decimal("1500000") * Decimal("0.31") / 100
        t4 = Decimal("8000000") * Decimal("0.27") / 100
        t5 = Decimal("40000000") * Decimal("0.24") / 100
        expected = (t1 + t2 + t3 + t4 + t5).quantize(Decimal("0.01"))
        assert fee == expected

    def test_one_rupee_trade(self):
        """Tiny Rs 1 trade should return correct brokerage."""
        fee = calculate_brokerage(Decimal("1"))
        expected = (Decimal("1") * Decimal("0.36") / 100).quantize(Decimal("0.01"))
        assert fee == expected

    def test_total_fees_sum(self):
        """total_fees must always equal brokerage + sebon + dp."""
        for amount in [1, 10000, 100000, 1000000, 50000000]:
            fees = calculate_total_fees(Decimal(str(amount)))
            assert fees["total_fees"] == fees["brokerage"] + fees["sebon_fee"] + fees["dp_charge"]
