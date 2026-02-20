from typing import Dict, Any, List
from datetime import datetime
import random

class NewsService:
    @staticmethod
    async def get_latest_news(category: str = "All") -> Dict[str, Any]:
        """Generate highly realistic mock financial news tailored to NEPSE"""
        
        # Base realistic mock data
        base_news = [
            {
                "id": 1,
                "title": "Nabil Bank announces 11% cash dividend. Book closure date set for Falgun 15.",
                "category": "Corporate",
                "source": "MeroLagani",
                "published_at": "Today, 10:15 AM",
                "url": "#"
            },
            {
                "id": 2,
                "title": "NEPSE Index gains 25 points following positive economic indicators from Nepal Rastra Bank.",
                "category": "Market",
                "source": "ShareSansar",
                "published_at": "Today, 11:30 AM",
                "url": "#"
            },
            {
                "id": 3,
                "title": "Upper Tamakoshi Hydropower (UPPER) reports slight decrease in net profit in Q2 report.",
                "category": "Hydropower",
                "source": "Abhiyan",
                "published_at": "Today, 09:05 AM",
                "url": "#"
            },
            {
                "id": 4,
                "title": "IPO Alert: Reliance Spinning Mills IPO fully subscribed on day 2. High retail participation observed.",
                "category": "IPO",
                "source": "InvestoNepal",
                "published_at": "Yesterday, 04:30 PM",
                "url": "#"
            },
            {
                "id": 5,
                "title": "Banking sector sees massive turnover; NICA and GBIME lead the active trade volume.",
                "category": "Sector Analysis",
                "source": "MeroLagani",
                "published_at": "Yesterday, 02:20 PM",
                "url": "#"
            },
            {
                "id": 6,
                "title": "Government aims to enforce strict regulations on digital payment integrators.",
                "category": "Economy",
                "source": "OnlineKhabar",
                "published_at": "Yesterday, 06:00 PM",
                "url": "#"
            }
        ]

        if category != "All":
            filtered_news = [item for item in base_news if item["category"] == category]
            return {"news": filtered_news, "category": category}

        return {"news": base_news, "category": category}
