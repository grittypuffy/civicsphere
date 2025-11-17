import aiohttp
import requests
import usaddress
from src.civicsphere.constants.scraper import NYC_POLLSITE_INFO_HEADERS as headers
from src.civicsphere.constants.scraper import NYC_POLLSITE_INFO_URL as url

def parse_address(street_address: str):
    parsed, address_type = usaddress.tag(street_address)
    number = parsed.get("AddressNumber", "")
    name = parsed.get("StreetName", "")
    post_type = parsed.get("StreetNamePostType", "")
    post_dir = parsed.get("StreetNamePostDirectional", "")
    postal_code = parsed.get("ZipCode", "")

    full_street = " ".join(part for part in [name, post_type, post_dir] if part).strip()
    if not (number and full_street and postal_code):
        raise Exception("Improperly formatted US address")

    return {
        "streetnumber": number,
        "streetname": full_street,
        "postalcode": postal_code
    }


async def get_pollsite_info(*, streetnumber: str, streetname: str, postalcode: str):
    params = {
        "streetnumber": streetnumber,
        "streetname": streetname,
        "postalcode": postalcode,
    }
    async with aiohttp.ClientSession() as session:
        async with session.get(url, params=params, headers=headers) as response:
            return await response.json()
