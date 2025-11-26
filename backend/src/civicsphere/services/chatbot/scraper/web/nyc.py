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
            if response.status != 200:
                text = await response.text()
                raise Exception(f"API request failed with status {response.status}: {text}")
            return await response.json()


def format_section(title, data_dict):
    """Return a formatted section, skipping null/empty values."""
    lines = [f"\n## {title}\n"]
    for key, value in data_dict.items():
        if value not in [None, "", "null", "Null"]:  # skip null/empty
            pretty_key = key.replace("_", " ").title()
            lines.append(f"**{pretty_key}:** {value}")
    return "\n".join(lines)


def summarize_pollsite(data):
    # Election-Day site details
    ed_site = {
        "Site Name": data.get("site_name"),
        "Site Address": data.get("site_address"),
        "Site Number": data.get("site_number"),
        "Voter Entrance": data.get("voter_entrance"),
        "Handicap Entrance": data.get("handicap_entrance"),
        "Primary Polling Room": data.get("primary_polling_room"),
        "General Polling Room": data.get("general_polling_room"),
        "Polling Room": data.get("polling_room"),
        "Marker": data.get("marker"),
        "Destination": data.get("destination"),
        "Map URL": data.get("mapURI"),
        "Latitude": data.get("latitude"),
        "Longitude": data.get("longitude"),
    }

    # Early-voting site details
    ev_site = {
        "EV Site Name": data.get("ev_site_name"),
        "EV Site Address": data.get("ev_site_address"),
        "EV Site Number": data.get("ev_site_number"),
        "EV Voter Entrance": data.get("ev_voter_entrance"),
        "EV Handicap Entrance": data.get("ev_handicap_entrance"),
        "EV Primary Polling Room": data.get("ev_primary_polling_room"),
        "EV General Polling Room": data.get("ev_general_polling_room"),
        "EV Polling Room": data.get("ev_polling_room"),
        "EV Marker": data.get("ev_marker"),
        "EV Destination": data.get("ev_destination"),
        "EV Map URL": data.get("ev_mapURI"),
        "EV Latitude": data.get("ev_latitude"),
        "EV Longitude": data.get("ev_longitude"),
    }

    # District info
    districts = {
        "Election District": data.get("election_district"),
        "Assembly District": data.get("assembly_district"),
        "Municipal Court District": data.get("municipal_court_district"),
        "Council District": data.get("council_district"),
        "Senate District": data.get("senate_district"),
        "Congress District": data.get("congress_district"),
        "Judicial District": data.get("judicial_district"),
        "District Key": data.get("districtKey"),
        "School District Key": data.get("schoolDistrictKey"),
        "Alt Controlling District ID": data.get("altControllingDistrictId"),
    }

    # Metadata
    meta = {
        "Elections": data.get("elections"),
        "ED Site Effective Date": data.get("ED_Site_Effective_DTTM"),
        "Site Created": data.get("Site_Created_DTTM"),
        "Site Modified": data.get("Site_Last_Modified_DTTM"),
    }

    summary = f"""
# Poll Site Summary

{format_section("Election-Day Polling Site", ed_site)}

{format_section("Early-Voting Site", ev_site)}

{format_section("District Information", districts)}

{format_section("Metadata", meta)}
"""
    return summary


def summarize_accessibility(data):
    sections = []

    # Election Day
    ed_voter = data.get("voter_entrance")
    ed_access = data.get("handicap_entrance")

    if ed_access or ed_voter:
        if ed_access and ed_voter and ed_access == ed_voter:
            text = (
                f"Election-Day Poll Site:\n"
                f"The polling place provides an accessible entrance at **{ed_access}**. "
                f"This is also the main voter entrance, so all voters use the same accessible doorway."
            )
        else:
            text = "Election-Day Poll Site:\n"
            if ed_access:
                text += f"The accessible entrance is located at **{ed_access}**. "
            if ed_voter:
                text += f"The main voter entrance is at **{ed_voter}**. "
        sections.append(text)

    # Early Voting
    ev_voter = data.get("ev_voter_entrance")
    ev_access = data.get("ev_handicap_entrance")

    if ev_access or ev_voter:
        if ev_access and ev_voter and ev_access == ev_voter:
            text = (
                f"Early Voting Site:\n"
                f"The early-voting location offers an accessible entrance at **{ev_access}**. "
                f"This doorway is also used as the main voter entrance."
            )
        else:
            text = "Early Voting Site:\n"
            if ev_access:
                text += f"The accessible entrance is at **{ev_access}**. "
            if ev_voter:
                text += f"The main voter entrance is at **{ev_voter}**. "
        sections.append(text)

    # If nothing available
    if not sections:
        return "No accessibility information was provided for this location."

    # Join with a blank line between sections
    return "\n\n".join(sections)
