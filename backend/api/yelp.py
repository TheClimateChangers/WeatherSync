import requests
import os
from datetime import datetime

yelp_url = "https://api.yelp.com/v3/businesses/search"
API_KEY = os.getenv("YELP_API_KEY")
yelp_headers = {
    "accept": "application/json",
    "authorization": f"Bearer {API_KEY}"
}
        
def get_yelp_results(location, categories, limit=3, offset=0): #GETS YELP API RESULTS
    """
    Query Yelp API for businesses given a category list.
    """
    params = {
        "location": location,
        "categories": categories,
        "limit": limit,
        "offset": offset,
        "sort_by": "best_match",
    }
    
    response = requests.get(yelp_url, headers=yelp_headers, params=params)
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Yelp API error ({response.status_code}): {response.text}")
        return []
    
def parse_yelp_results(business): #STRUCTURES ACTIVITY
    """
    Return json object
    """
    try:
        open_time = business.get("business_hours", [{}])[0].get("open", [])[0].get("start")
        close_time = business.get("business_hours", [{}])[0].get("open", [])[0].get("end")
        open = datetime.strptime(open_time, "%H%M").strftime("%H:%M:%S")
        close = datetime.strptime(close_time, "%H%M").strftime("%H:%M:%S")
    except:
        open = None
        close = None
    
    activity = {
        "name": business.get("name"),
        "id": business.get("id"),
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
            "open": open,
            "close": close,
        },
        "category": business.get("categories", [{}])[0].get("title"),
        "start_time": open,
        "end_time": close,
    }
    return activity

def parse_all_yelp(result):
    businesses = result.get("businesses", [])
    parsed = []
    
    for biz in businesses:
        parsed.append(parse_yelp_results(biz))
        
    return parsed
    