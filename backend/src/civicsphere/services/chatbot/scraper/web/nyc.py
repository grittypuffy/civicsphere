import aiohttp
import requests
from src.civicsphere.constants.scraper import NYC_POLLSITE_INFO_HEADERS as headers
from src.civicsphere.constants.scraper import NYC_POLLSITE_INFO_URL as url


async def get_pollsite_info(*, county: str, streetnumber: str, streetname: str, postalcode: str):
    params = {
        "county": county,
        "streetnumber": streetnumber,
        "streetname": streetname,
        "postalcode": postalcode,
    }
    async with aiohttp.ClientSession() as session:
        async with session.get(url, params=params, headers=headers) as response:
            return await response.json()
