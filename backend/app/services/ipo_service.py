import random
from datetime import datetime, timedelta
from typing import List, Dict, Any
from app.services.nepse_service import NepseService

class IpoService:
    @staticmethod
    async def get_all_ipos() -> List[Dict[str, Any]]:
        companies_resp = await NepseService.get_company_list()
        companies = companies_resp.get("companies", [])
        
        if not companies:
            return []
            
        # Pick 5 random companies to act as "recent/upcoming" IPOs
        random.seed(datetime.now().day) # Changes daily
        selected = random.sample(companies, min(5, len(companies)))
        
        ipos = []
        statuses = ["OPEN", "UPCOMING", "CLOSED"]
        for i, c in enumerate(selected):
            base_date = datetime.now() + timedelta(days=random.randint(-10, 10))
            status = random.choice(statuses)
            if base_date < datetime.now() - timedelta(days=3):
                status = "CLOSED"
            elif base_date > datetime.now() + timedelta(days=3):
                status = "UPCOMING"
            else:
                status = "OPEN"
                
            ipos.append({
                "id": i + 1,
                "company_name": c.get("name", "Unknown"),
                "sector": c.get("sector", "Others"),
                "units": f"{random.randint(10, 100)},00,000",
                "status": status,
                "opening_date": base_date.date(),
                "closing_date": (base_date + timedelta(days=4)).date()
            })
            
        # Sort so OPEN is first
        ipos.sort(key=lambda x: (x["status"] != "OPEN", x["status"] != "UPCOMING", x["closing_date"]))
        return ipos
