# services.py
import requests
import json
from datetime import datetime
from django.conf import settings
from .models import Event, WeatherData


class EventbriteService:
    """Service for interacting with the Eventbrite API"""
    
    @staticmethod
    def fetch_events(location, start_date, end_date, categories=None):
        """
        Fetch events from Eventbrite API
        
        Args:
            location (str): City name or location
            start_date (str): Start date in ISO format (YYYY-MM-DD)
            end_date (str): End date in ISO format (YYYY-MM-DD)
            categories (list): Optional list of category IDs
            
        Returns:
            list: List of event dictionaries
        """
        url = "https://www.eventbriteapi.com/v3/events/search/"
        headers = {
            "Authorization": f"Bearer {settings.EVENTBRITE_API_KEY}"
        }
        
        params = {
            "location.address": location,
            "start_date.range_start": f"{start_date}T00:00:00Z",
            "start_date.range_end": f"{end_date}T23:59:59Z",
            "expand": "venue"
        }
        
        if categories:
            params["categories"] = ",".join(categories)
        
        try:
            response = requests.get(url, headers=headers, params=params)
            response.raise_for_status()
            data = response.json()
            
            events = []
            for event in data.get("events", []):
                # Extract the relevant event information
                event_info = {
                    "eventbrite_id": event.get("id"),
                    "name": event.get("name", {}).get("text", "No Title"),
                    "description": event.get("description", {}).get("text", ""),
                    "start_time": event.get("start", {}).get("utc"),
                    "end_time": event.get("end", {}).get("utc"),
                    "location": event.get("venue", {}).get("address", {}).get("localized_address_display", ""),
                    "category": event.get("category", {}).get("name", "Uncategorized"),
                    # For eco_score, you might want to implement your own logic
                    "eco_score": 5  # Default middle score
                }
                events.append(event_info)
            
            return events
        except requests.exceptions.RequestException as e:
            print(f"Error fetching Eventbrite data: {e}")
            return []

    @staticmethod
    def save_events(events):
        """
        Save events to the database
        
        Args:
            events (list): List of event dictionaries
            
        Returns:
            int: Number of events saved
        """
        count = 0
        for event_data in events:
            try:
                # Get or create the event
                event, created = Event.objects.update_or_create(
                    eventbrite_id=event_data["eventbrite_id"],
                    defaults={
                        "name": event_data["name"],
                        "description": event_data["description"],
                        "start_time": event_data["start_time"],
                        "end_time": event_data["end_time"],
                        "location": event_data["location"],
                        "category": event_data["category"],
                        "eco_score": event_data["eco_score"]
                    }
                )
                
                if created:
                    count += 1
            except Exception as e:
                print(f"Error saving event {event_data.get('eventbrite_id')}: {e}")
                
        return count


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
        
        params = {
            "q": location,
            "appid": settings.OPENWEATHER_API_KEY,
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
