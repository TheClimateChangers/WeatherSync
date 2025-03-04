from django.http import JsonResponse
from .db_utils import fetch_events_from_db
import numpy as np
import pandas as pd
import polyline
from geopy.geocoders import Nominatim

def hello_world(request):
    return JsonResponse({"message": "Hello, World!"})

def marks_message(request):
    return JsonResponse({"message": "Mark's Message: Hey everyone!"})

def julians_message(request):
    return JsonResponse({"message": "Julian's Message: best swe"})

def michaels_message(request):
    return JsonResponse({"message": "Michael's Message: Merry Christmas"})

def giselles_message(request):
    return JsonResponse({"message": "Giselle's Message: yo"})

def nates_message(request):
    return JsonResponse({"message": "Nate's Message: what's up guys!"})

def get_events_psycopg2(request):
    """Fetch events using psycopg2 and return as JSON."""
    events = fetch_events_from_db()
    event_list = [{
        "name": event[0],
        "location": event[1],
        "start_time": event[2]
    } for event in events]
    return JsonResponse(event_list, safe=False)

def calc_trip_costs(request):
    """
    Simulates trip cost calculation. 
    takes list of random trip costs and computes average
    """
    trip_costs = np.array([150, 200, 175, 225, 300])
    avg_cost = np.mean(trip_costs)

    return JsonResponse({
        "trip_costs": trip_costs.tolist(),
        "average_trip_cost": round(avg_cost, 2)
})

def get_coordinates(request):
    city = request.GET.get("city", "San Francisco")  # Default city if none provided
    geolocator = Nominatim(user_agent="weather_sync")
    location = geolocator.geocode(city)
    
    if location:
        return JsonResponse({"city": city, "latitude": location.latitude, "longitude": location.longitude})
    else:
        return JsonResponse({"error": "Location not found"}, status=404)
    

def encode_route(request):
    """Encodes a travel route into polyline format."""
    coords_str = request.GET.get("coords")
    if not coords_str:
        return JsonResponse({"error": "Provide coordinates in 'lat,lng;lat,lng' format"}, status=400)

    try:
        coords = [tuple(map(float, c.split(','))) for c in coords_str.split(';')]
        return JsonResponse({"encoded_polyline": polyline.encode(coords)})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)
    
def estimate_trip_cost(expenses):
    df = pd.DataFrame(expenses, columns=["Category", "Cost"])
    return df["Cost"].sum()

expenses = [["Hotel", 200], ["Flight", 150], ["Food", 50]]
print(estimate_trip_cost(expenses))


# views.py example
from django.shortcuts import render
from django.http import JsonResponse
from .models import Event, WeatherData
from .services import EventbriteService, WeatherService
from datetime import datetime, timedelta


def fetch_and_store_data(request):
    """View to manually trigger data fetching and storing"""
    location = request.GET.get('location', 'San Francisco')
    days = int(request.GET.get('days', 7))
    
    # Calculate date range
    today = datetime.now().date()
    end_date = today + timedelta(days=days)
    
    # Format dates for API
    start_date_str = today.strftime('%Y-%m-%d')
    end_date_str = end_date.strftime('%Y-%m-%d')
    
    # Fetch and save events
    events = EventbriteService.fetch_events(location, start_date_str, end_date_str)
    events_count = EventbriteService.save_events(events)
    
    # Fetch and save weather data
    weather_data = WeatherService.fetch_weather(location)
    weather_saved = False
    if weather_data:
        weather = WeatherService.save_weather_data(weather_data)
        weather_saved = weather is not None
    
    return JsonResponse({
        'success': True,
        'events_fetched': len(events),
        'events_saved': events_count,
        'weather_fetched': weather_data is not None,
        'weather_saved': weather_saved
    })


def get_events(request):
    """View to retrieve events with optional filtering"""
    location = request.GET.get('location')
    category = request.GET.get('category')
    
    # Start with all events
    events = Event.objects.all()
    
    # Apply filters if provided
    if location:
        events = events.filter(location__icontains=location)
    if category:
        events = events.filter(category__icontains=category)
    
    # Convert to list of dictionaries
    events_list = list(events.values())
    
    return JsonResponse({
        'success': True,
        'count': len(events_list),
        'events': events_list
    })


def get_weather(request):
    """View to retrieve the latest weather data for a location"""
    location = request.GET.get('location')
    
    if not location:
        return JsonResponse({
            'success': False,
            'error': 'Location parameter is required'
        }, status=400)
    
    # Get the latest weather data for the location
    try:
        weather = WeatherData.objects.filter(
            location__icontains=location
        ).order_by('-timestamp').first()
        
        if not weather:
            return JsonResponse({
                'success': False,
                'error': 'No weather data found for this location'
            }, status=404)
        
        return JsonResponse({
            'success': True,
            'weather': {
                'location': weather.location,
                'temperature': weather.temperature,
                'rain_chance': weather.rain_chance,
                'weather_conditions': weather.weather_conditions,
                'timestamp': weather.timestamp
            }
        })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)