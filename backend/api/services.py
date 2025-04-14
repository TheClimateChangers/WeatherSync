import requests
from django.conf import settings
from .models import WeatherData
from datetime import datetime

class WeatherService:
    """Service for interacting with the OpenWeatherMap API"""
    
    @staticmethod
    def fetch_weather(location):
        """
        Fetch current weather data from OpenWeatherMap API
        
        Args:
            location (str): City name
            
        Returns:
            dict: Weather data dictionary
        """
        url = "https://api.openweathermap.org/data/2.5/weather"
        
        api_key = settings.OPENWEATHER_API_KEY
        print(f"Debug - API Key: {api_key}")  # Debug line to show the actual key
        
        params = {
            "q": location,
            "appid": api_key,
            "units": "metric"  # For Celsius
        }
        
        try:
            response = requests.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            
            # Extract relevant weather information
            weather_info = {
                "location": location,
                "temperature": data.get("main", {}).get("temp"),
                "rain_chance": data.get("clouds", {}).get("all") / 100,  # Convert percentage to decimal
                "weather_conditions": {
                    "main": data.get("weather", [{}])[0].get("main", ""),
                    "description": data.get("weather", [{}])[0].get("description", ""),
                    "humidity": data.get("main", {}).get("humidity"),
                    "wind_speed": data.get("wind", {}).get("speed"),
                    "clouds": data.get("clouds", {}).get("all")
                }
            }
            
            return weather_info
        except requests.exceptions.RequestException as e:
            print(f"Error fetching weather data: {e}")
            return None

    @staticmethod
    def fetch_forecast(location, days=5):
        """
        Fetch weather forecast data from OpenWeatherMap API
        
        Args:
            location (str): City name
            days (int): Number of days to forecast (max 16)
            
        Returns:
            list: List of forecast data dictionaries
        """
        url = "https://api.openweathermap.org/data/2.5/forecast/daily"
        
        params = {
            "q": location,
            "appid": settings.OPENWEATHER_API_KEY,
            "units": "metric",  # For Celsius
            "cnt": min(days, 16)  # Maximum 16 days
        }
        
        try:
            response = requests.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            
            forecasts = []
            for day in data.get("list", []):
                forecast = {
                    "date": datetime.fromtimestamp(day["dt"]).strftime("%Y-%m-%d"),
                    "temperature": {
                        "day": day["temp"]["day"],
                        "min": day["temp"]["min"],
                        "max": day["temp"]["max"],
                        "night": day["temp"]["night"],
                        "eve": day["temp"]["eve"],
                        "morn": day["temp"]["morn"]
                    },
                    "rain_chance": day.get("pop", 0),  # Probability of precipitation
                    "weather_conditions": {
                        "main": day["weather"][0]["main"],
                        "description": day["weather"][0]["description"],
                        "humidity": day["humidity"],
                        "wind_speed": day["speed"],
                        "clouds": day["clouds"]
                    }
                }
                forecasts.append(forecast)
            
            return {
                "location": location,
                "forecasts": forecasts
            }
        except requests.exceptions.RequestException as e:
            print(f"Error fetching forecast data: {e}")
            return None

    @staticmethod
    def save_weather_data(weather_data):
        """
        Save weather data to the database
        
        Args:
            weather_data (dict): Weather data dictionary
            
        Returns:
            WeatherData: Saved weather data instance or None if failed
        """
        if not weather_data:
            return None
        
        try:
            weather = WeatherData.objects.create(
                location=weather_data["location"],
                temperature=weather_data["temperature"],
                rain_chance=weather_data["rain_chance"],
                weather_conditions=weather_data["weather_conditions"]
            )
            return weather
        except Exception as e:
            print(f"Error saving weather data: {e}")
            return None
        
    @staticmethod
    def get_weather_summary(location):
        data = WeatherService.fetch_weather(location)
        temp = data.get('temperature')
        condition = data.get('weather_conditions', {}).get('main', 'Unknown')
        return f"{location}: {condition}, {temp}°C" 