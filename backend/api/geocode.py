import os
import logging
import httpx

# Get logger for this module
logger = logging.getLogger('api')

# Use the Google Maps API key from frontend .env or fallback to environment variable
API_KEY = os.getenv('VITE_GOOGLE_MAPS_API_KEY') or os.getenv('REACT_APP_GOOGLE_MAPS_API_KEY')
API_URL = "https://maps.googleapis.com/maps/api/geocode/json"

async def get_coordinates(address):
    try:
        if not address:
            logger.error("Empty address provided to geocoding service")
            return 0, 0

        if not API_KEY:
            logger.error("Google Maps API key is not set")
            return 0, 0

        params = {
            "address": address,
            "key": API_KEY
        }

        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.get(API_URL, params=params)

        if response.status_code != 200:
            logger.error(f"Geocoding API request failed with status code {response.status_code}")
            return 0, 0

        data = response.json()

        if data.get('status') == 'REQUEST_DENIED':
            logger.error(f"Geocoding API request denied: {data.get('error_message', 'Unknown error')}")
            return 0, 0

        if not data.get('results'):
            logger.warning(f"No geocoding results found for address: {address}")
            return 0, 0

        location = data['results'][0]['geometry']['location']
        return location['lat'], location['lng']

    except httpx.RequestError as e:
        logger.error(f"Request exception during geocoding: {str(e)}")
        return 0, 0
    except (KeyError, IndexError, ValueError) as e:
        logger.error(f"Error parsing geocoding response: {str(e)}")
        return 0, 0
    except Exception as e:
        logger.error(f"Unexpected error during geocoding: {str(e)}")
        return 0, 0
