import requests
import os
from datetime import datetime, timedelta

TICKETMASTER_API_KEY = os.getenv("TICKETMASTER_API_KEY")
TICKETMASTER_URL = "https://app.ticketmaster.com/discovery/v2/events.json"

def get_ticketmaster_events(location, date, categories, size=1): #GETS TICKETMASTER API RESULTS
        """
        Query Ticketmaster API for events given a location and categories.
        """
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
        
        response = requests.get(TICKETMASTER_URL, params=params)
        if response.status_code == 200:
            return response.json()
        else:
            print(f"Ticketmaster API error ({response.status_code}): {response.text}")
            return []

def parse_ticketmaster_results(event): #STRUCTURES EVENT
    """
    Return json object
    """
    venue = event.get("_embedded", {}).get("venues", [{}])[0]
    start_time = event.get("dates", {}).get("start", {}).get("localTime")
    time_obj = datetime.strptime(start_time, "%H:%M:%S")
    new_time = time_obj + timedelta(hours=3)
    end_time = new_time.strftime("%H:%M:%S")
    
    activity = {
        "name": event.get("name"),
        "id": event.get("id"),
        "rating": None,
        "url": event.get("url"),
        "image_url": event.get("images")[0].get("url") if event.get("images") else None,
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
        "category": event.get("classifications", [{}])[0].get("segment", {}).get("name"),
        "start_time": start_time,
        "end_time": end_time,
    }
    return activity

def parse_all_ticketmaster(result):
    events = result.get('_embedded').get('events')
    parsed = []
    
    for event in events:
        parsed.append(parse_ticketmaster_results(event))
        
    return parsed