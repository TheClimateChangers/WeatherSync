import requests
import logging
import os
from datetime import datetime

# Get logger for this module
logger = logging.getLogger('api')

# API configuration
API_KEY = os.getenv('OPENWEATHER_API_KEY') or "2ef5457d3740b15926588d09a68c24da"
API_URL = "https://api.openweathermap.org/data/3.0/onecall/day_summary"

def get_weather(latitude, longitude, date):
    """
    input: latitude, longitude, date (YYYY-MM-DD)
    output: weather info dict
    
    Returns default values if API call fails.
    """
    
    # Validate inputs
    if not all([latitude, longitude, date]):
        logger.error(f"Invalid weather parameters: lat={latitude}, lon={longitude}, date={date}")
        return get_default_weather(date, latitude, longitude)
    
    try:
        # Validate date format
        datetime.strptime(date, "%Y-%m-%d")
    except ValueError:
        logger.error(f"Invalid date format: {date}")
        return get_default_weather(date, latitude, longitude)

    params = {
        "appid": API_KEY,
        "lat": latitude,
        "lon": longitude,
        "date": date,
        "units": "imperial"    
    }

    weather_data = get_default_weather(date, latitude, longitude)
    
    try:
        logger.info(f"Fetching weather data for: lat={latitude}, lon={longitude}, date={date}")
        response = requests.get(API_URL, params=params, timeout=10)
        response.raise_for_status()
        r = response.json()
        
        # Safely extract data with fallbacks
        weather_data['temperature'] = r.get('temperature', {}).get('afternoon', 75)
        weather_data['cloud_cover'] = r.get('cloud_cover', {}).get('afternoon', 0)
        weather_data['wind'] = r.get('wind', {}).get('max', {}).get('speed', 10)
        weather_data['humidity'] = r.get('humidity', {}).get('afternoon', 50)
        weather_data['precipitation'] = r.get('precipitation', {}).get('total', 0)
        
        logger.info(f"Successfully retrieved weather data for {date}")
    except requests.exceptions.RequestException as e:
        logger.error(f"Weather API request failed: {str(e)}")
    except KeyError as e:
        logger.error(f"Missing expected data in weather API response: {str(e)}")
    except Exception as e:
        logger.error(f"Unexpected error in weather service: {str(e)}")
    
    return weather_data

def get_default_weather(date, latitude=0, longitude=0):
    """Returns default weather data when API fails"""
    return {
        "date": date,
        "latitude": latitude,
        "longitude": longitude,
        "temperature": 75,
        "cloud_cover": 0,
        "wind": 10,
        "humidity": 50,
        "precipitation": 0
    }