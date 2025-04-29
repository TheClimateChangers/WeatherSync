import requests
import os
import logging
from datetime import datetime
import aiohttp
import asyncio

# Get logger for this module
logger = logging.getLogger('api')

yelp_url = "https://api.yelp.com/v3/businesses/search"
API_KEY = os.getenv("YELP_API_KEY")
yelp_headers = {
    "accept": "application/json",
    "authorization": f"Bearer {API_KEY}"
}
        
async def get_yelp_results(location, categories, limit=3, offset=0):  # Async now!
    """
    Asynchronously query Yelp API for businesses given a category list.
    """
    if not API_KEY:
        logger.error("YELP_API_KEY environment variable is not set")
        return {"businesses": []}
    
    if not location:
        logger.error("Location not provided for Yelp search")
        return {"businesses": []}
    
    if not categories:
        logger.warning("No categories provided for Yelp search, using default")
        categories = ["restaurants"]
    
    params = {
        "location": location,
        "categories": categories,
        "limit": limit,
        "offset": offset,
        "sort_by": "best_match",
    }
    logger.info(f"Querying Yelp API for {location} with categories {categories}")
    try:
        async with aiohttp.ClientSession(headers=yelp_headers) as session:
            async with session.get(yelp_url, params=params, timeout=10) as response:
                if response.status == 200:
                    result = await response.json()
                    logger.info(f"Found {len(result.get('businesses', []))} businesses from Yelp")
                    return result
                else:
                    error_text = await response.text()
                    logger.error(f"Yelp API error ({response.status}): {error_text}")
                    return {"businesses": []}
    
    except asyncio.TimeoutError:
        logger.error("Yelp API request timed out")
        return {"businesses": []}
    except aiohttp.ClientError as e:
        logger.error(f"Yelp API client error: {str(e)}")
        return {"businesses": []}
    except Exception as e:
        logger.error(f"Unexpected error querying Yelp API: {str(e)}")
        return {"businesses": []}
    
def parse_yelp_results(business): #STRUCTURES ACTIVITY
    """
    Parse a single business from Yelp API results.
    Returns structured activity data.
    """
    if not business:
        logger.warning("Empty business object provided to parse_yelp_results")
        return None
        
    try:
        # Safely get business hours
        business_hours = business.get("business_hours", [{}])
        open_data = business_hours[0].get("open", [{}]) if business_hours else [{}]
        
        try:
            open_time = open_data[0].get("start") if open_data else None
            close_time = open_data[0].get("end") if open_data else None
            
            open_formatted = datetime.strptime(open_time, "%H%M").strftime("%H:%M:%S") if open_time else None
            close_formatted = datetime.strptime(close_time, "%H%M").strftime("%H:%M:%S") if close_time else None
        except (ValueError, TypeError, IndexError):
            logger.warning(f"Could not parse business hours for {business.get('name')}")
            open_formatted = None
            close_formatted = None
    
        # Safely extract categories
        categories = business.get("categories", [])
        category_title = categories[0].get("title") if categories else "Uncategorized"
        
        activity = {
            "name": business.get("name", "Unknown Business"),
            "id": business.get("id", ""),
            "rating": business.get("rating"),
            "url": business.get("url"),
            "image_url": business.get("image_url"),
            "location": {
                "address": business.get("location", {}).get("address1"),
                "city": business.get("location", {}).get("city"),
                "state": business.get("location", {}).get("state"),
                "zip_code": business.get("location", {}).get("zip_code"),
                "latitude": business.get("coordinates", {}).get("latitude"),
                "longitude": business.get("coordinates", {}).get("longitude"),
            },
            "open_hours": {
                "open": open_formatted,
                "close": close_formatted,
            },
            "category": category_title,
            "start_time": open_formatted,
            "end_time": close_formatted,
        }
        return activity
        
    except Exception as e:
        logger.error(f"Error parsing Yelp business: {str(e)}")
        # Return minimal valid activity data
        return {
            "name": business.get("name", "Unknown Business"),
            "id": business.get("id", ""),
            "rating": business.get("rating"),
            "category": "Uncategorized",
            "location": {}
        }

def parse_all_yelp(result):
    """
    Parse all businesses from Yelp API results.
    Returns list of structured activity data.
    """
    try:
        businesses = result.get("businesses", [])
        parsed = []
        
        for biz in businesses:
            parsed_biz = parse_yelp_results(biz)
            if parsed_biz:
                parsed.append(parsed_biz)
            
        return parsed
    except Exception as e:
        logger.error(f"Error parsing multiple Yelp results: {str(e)}")
        return []
    