import aiohttp
import logging
from ....config import AppConfig

async def search_bing(query: str, count: int = 3):
    """
    Perform a Bing Search and return the results asynchronously.
    """
    config = AppConfig()
    headers = {"Ocp-Apim-Subscription-Key": config.bing_search_api_key}
    params = {"q": query, "count": count, "mkt": "en-US"}
    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(config.bing_search_endpoint, headers=headers, params=params) as response:
                response.raise_for_status()
                search_results = await response.json()
        
        results = []
        if "webPages" in search_results and "value" in search_results["webPages"]:
            for result in search_results["webPages"]["value"]:
                results.append(f"Title: {result['name']}\nSnippet: {result['snippet']}\nURL: {result['url']}")
        
        return results
    except Exception as e:
        logging.error(f"Error performing Bing Search: {e}")
        return []
