import asyncio
import httpx
from bs4 import BeautifulSoup

async def scrape_ipos():
    url = "https://merolagani.com/Ipo.aspx"
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
    async with httpx.AsyncClient(timeout=10.0, verify=False) as client:
        response = await client.get(url, headers=headers)
        
    print("Status:", response.status_code)
    soup = BeautifulSoup(response.text, "lxml")
    
    table = soup.find("table", class_="table")
    if getattr(table, "name", None) != "table":
        table = soup.find("table")
    
    if not table:
        print("No table found")
        return
        
    print("Found table!")
    print(str(table)[:1500])

asyncio.run(scrape_ipos())
