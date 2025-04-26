import requests
import os

API_KEY = os.getenv('REACT_APP_GOOGLE_MAPS_API_KEY')
API_URL = "https://maps.googleapis.com/maps/api/geocode/json"

def get_coordinates(address):
    params = {
        "address": address,
        "key": API_KEY
    }

    response = requests.get(API_URL, params=params)
    if response.status_code != 200:
        raise Exception("Error with Geocoding API request")

    data = response.json()
    if not data['results']:
        raise Exception("No results found for the given address")

    location = data['results'][0]['geometry']['location']
    return location['lat'], location['lng']