from typing import Dict, Any, List
from datetime import datetime
import logging
import httpx
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)


class NewsService:
    _cache: List[Dict[str, Any]] = []
    _cache_time: datetime | None = None
    _CACHE_TTL_SECONDS = 300  # 5 minutes

    @classmethod
    async def _scrape_news(cls) -> List[Dict[str, Any]]:
        """Scrape real financial news from ShareSansar and MeroLagani."""
        news_items: List[Dict[str, Any]] = []
        headers = {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }

        async with httpx.AsyncClient(follow_redirects=True, timeout=15) as client:
            # Source 1: ShareSansar
            urls = [
                ("https://www.sharesansar.com/news-page", "Market"),
                ("https://www.sharesansar.com/category/company-analysis", "Analysis"),
                ("https://www.sharesansar.com/category/mutual-fund", "Mutual Fund"),
            ]
            for url, category in urls:
                try:
                    resp = await client.get(url, headers=headers)
                    if resp.status_code != 200:
                        continue
                    soup = BeautifulSoup(resp.text, "html.parser")
                    articles = soup.select(".featured-news-list a, .media-heading a, h4 a, h3 a, h2 a")
                    seen_titles = set()
                    for a in articles:
                        title = a.get_text(strip=True)
                        href = a.get("href", "")
                        if not title or len(title) < 15 or title in seen_titles:
                            continue
                        seen_titles.add(title)
                        if href and not href.startswith("http"):
                            href = f"https://www.sharesansar.com{href}"
                        news_items.append({
                            "id": len(news_items) + 1,
                            "title": title[:500],
                            "category": category,
                            "source": "ShareSansar",
                            "published_at": datetime.now().strftime("%Y-%m-%d %H:%M"),
                            "url": href or None,
                            "content": title,
                        })
                except Exception as e:
                    logger.warning(f"ShareSansar {category} scrape error: {e}")

            # Source 2: MeroLagani
            try:
                resp = await client.get("https://merolagani.com/NewsList.aspx", headers=headers)
                if resp.status_code == 200:
                    soup = BeautifulSoup(resp.text, "html.parser")
                    existing_titles = {n["title"] for n in news_items}
                    for a in soup.select("h4 a, .media-news a, .news-heading a"):
                        title = a.get_text(strip=True)
                        href = a.get("href", "")
                        if title and len(title) > 10 and title not in existing_titles:
                            if href and not href.startswith("http"):
                                href = f"https://merolagani.com/{href.lstrip('/')}"
                            news_items.append({
                                "id": len(news_items) + 1,
                                "title": title[:500],
                                "category": "Market",
                                "source": "MeroLagani",
                                "published_at": datetime.now().strftime("%Y-%m-%d %H:%M"),
                                "url": href or None,
                                "content": title,
                            })
                            existing_titles.add(title)
            except Exception as e:
                logger.warning(f"MeroLagani news scrape error: {e}")

        return news_items

    @classmethod
    async def _get_cached_news(cls) -> List[Dict[str, Any]]:
        """Return cached news, refreshing if stale."""
        now = datetime.now()
        if cls._cache and cls._cache_time and (now - cls._cache_time).total_seconds() < cls._CACHE_TTL_SECONDS:
            return cls._cache

        try:
            fresh = await cls._scrape_news()
            if fresh:
                cls._cache = fresh
                cls._cache_time = now
                return fresh
        except Exception as e:
            logger.error(f"Failed to scrape news: {e}")

        # Return stale cache if scrape failed
        if cls._cache:
            return cls._cache

        # Final fallback: return empty with explanation
        return [{
            "id": 0,
            "title": "News temporarily unavailable. Please try again later.",
            "category": "System",
            "source": "ShareSathi",
            "published_at": now.strftime("%Y-%m-%d %H:%M"),
            "url": None,
            "content": "Unable to fetch live news at this time."
        }]

    @classmethod
    async def get_latest_news(cls, category: str = "All") -> Dict[str, Any]:
        """Fetch real financial news with caching."""
        news = await cls._get_cached_news()
        if category != "All":
            news = [item for item in news if item["category"] == category]
        return {
            "news": news,
            "category": category,
            "source": "Live scraped from ShareSansar & MeroLagani",
            "cached": cls._cache_time.isoformat() if cls._cache_time else None,
        }

    @classmethod
    async def get_categories(cls) -> List[str]:
        """Return unique categories from cached news."""
        news = await cls._get_cached_news()
        cats = sorted({item["category"] for item in news if item.get("category")})
        return ["All"] + cats
