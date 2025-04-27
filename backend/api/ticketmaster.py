import requests
import os
import logging
from datetime import datetime, timedelta

# Get logger for this module
logger = logging.getLogger('api')

TICKETMASTER_API_KEY = os.getenv("TICKETMASTER_API_KEY")
TICKETMASTER_URL = "https://app.ticketmaster.com/discovery/v2/events.json"

def get_ticketmaster_events(location, date, categories, size=1): #GETS TICKETMASTER API RESULTS
    """
    Query Ticketmaster API for events given a location and categories.
    """
    if not TICKETMASTER_API_KEY:
        logger.error("TICKETMASTER_API_KEY environment variable is not set")
        return {"_embedded": {"events": [get_default_event(location)]}}
        
    if not location:
        logger.error("Location not provided for Ticketmaster search")
        return {"_embedded": {"events": [get_default_event(location)]}}
        
    if not categories:
        logger.warning("No categories provided for Ticketmaster search, using default")
        categories = ["Music"]
        
    try:
        #daterange: convert 'date' to range
        # ex. 2025-04-25 to 2025-04-25T10:00:00,2025-04-25T22:00:00
        daterange = date
        params = {
            "apikey": TICKETMASTER_API_KEY,
            "city": location,
            "radius": 10,
            "unit": "miles",
            "size": size,
            "segmentName": ",".join(categories),
            "localStartDateTime": daterange,
        }
        
        logger.info(f"Querying Ticketmaster API for {location} with categories {categories}")
        response = requests.get(TICKETMASTER_URL, params=params, timeout=10)
        
        if response.status_code == 200:
            result = response.json()
            # Check if the response contains events
            if '_embedded' not in result or 'events' not in result.get('_embedded', {}):
                logger.warning(f"No events found for {location} with categories {categories}")
                return {"_embedded": {"events": [get_default_event(location)]}}
                
            logger.info(f"Found {len(result.get('_embedded', {}).get('events', []))} events from Ticketmaster")
            return result
        else:
            logger.error(f"Ticketmaster API error ({response.status_code}): {response.text}")
            return {"_embedded": {"events": [get_default_event(location)]}}
            
    except requests.exceptions.Timeout:
        logger.error("Ticketmaster API request timed out")
        return {"_embedded": {"events": [get_default_event(location)]}}
    except requests.exceptions.RequestException as e:
        logger.error(f"Ticketmaster API request failed: {str(e)}")
        return {"_embedded": {"events": [get_default_event(location)]}}
    except Exception as e:
        logger.error(f"Unexpected error querying Ticketmaster API: {str(e)}")
        return {"_embedded": {"events": [get_default_event(location)]}}

def get_default_event(location):
    """Return a default event when API fails"""
    current_time = datetime.now()
    start_time = current_time.replace(hour=19, minute=0, second=0).strftime("%H:%M:%S")
    end_time = current_time.replace(hour=22, minute=0, second=0).strftime("%H:%M:%S")
    
    return {
        "name": "Local Event",
        "id": "default-event",
        "url": "https://www.ticketmaster.com",
        "images": [{"url": "https://www.ticketmaster.com/assets/images/logos/social/tm_social.png"}],
        "_embedded": {
            "venues": [{
                "address": {"line1": "Main Street"},
                "city": {"name": location},
                "state": {"name": ""},
                "postalCode": "",
                "location": {"latitude": 0, "longitude": 0}
            }]
        },
        "dates": {"start": {"localTime": start_time}},
        "classifications": [{"segment": {"name": "Entertainment"}}]
    }

def parse_ticketmaster_results(event): #STRUCTURES EVENT
    """
    Parse a single event from Ticketmaster API results.
    Returns structured activity data.
    """
    if not event:
        logger.warning("Empty event object provided to parse_ticketmaster_results")
        return None
        
    try:
        # Safely extract venue information
        venue = event.get("_embedded", {}).get("venues", [{}])[0]
        
        # Safely extract and calculate times
        try:
            start_time = event.get("dates", {}).get("start", {}).get("localTime")
            if start_time:
                time_obj = datetime.strptime(start_time, "%H:%M:%S")
                new_time = time_obj + timedelta(hours=3)
                end_time = new_time.strftime("%H:%M:%S")
            else:
                logger.warning(f"No start time found for event {event.get('name')}")
                start_time = "19:00:00"  # Default start time
                end_time = "22:00:00"    # Default end time
        except (ValueError, TypeError) as e:
            logger.warning(f"Could not parse event time for {event.get('name')}: {str(e)}")
            start_time = "19:00:00"  # Default start time
            end_time = "22:00:00"    # Default end time
        
        # Safely extract image URL
        images = event.get("images", [])
        image_url = images[0].get("url") if images else None
        
        # Safely extract category
        classifications = event.get("classifications", [{}])
        category = classifications[0].get("segment", {}).get("name") if classifications else "Entertainment"
        
        activity = {
            "name": event.get("name", "Local Event"),
            "id": event.get("id", ""),
            "rating": None,
            "url": event.get("url"),
            "image_url": image_url,
            "location": {
                "address": venue.get("address", {}).get("line1"),
                "city": venue.get("city", {}).get("name"),
                "state": venue.get("state", {}).get("name"),
                "zip_code": venue.get("postalCode"),
                "latitude": venue.get("location", {}).get("latitude"),
                "longitude": venue.get("location", {}).get("longitude"),
            },
            "open_hours": {
                "open": start_time,
                "close": None,
            },
            "category": category,
            "start_time": start_time,
            "end_time": end_time,
        }
        return activity
        
    except Exception as e:
        logger.error(f"Error parsing Ticketmaster event: {str(e)}")
        # Return minimal valid activity data
        return {
            "name": event.get("name", "Local Event"),
            "id": event.get("id", "default-event"),
            "rating": None,
            "category": "Entertainment",
            "start_time": "19:00:00",
            "end_time": "22:00:00",
            "location": {}
        }

def parse_all_ticketmaster(result):
    """
    Parse all events from Ticketmaster API results.
    Returns list of structured activity data.
    """
    try:
        events = result.get('_embedded', {}).get('events', [])
        if not events:
            logger.warning("No events found in Ticketmaster response")
            return []
            
        parsed = []
        
        for event in events:
            parsed_event = parse_ticketmaster_results(event)
            if parsed_event:
                parsed.append(parsed_event)
                
        return parsed
    except Exception as e:
        logger.error(f"Error parsing multiple Ticketmaster results: {str(e)}")
        return []