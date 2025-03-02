from django.http import JsonResponse
from .db_utils import fetch_events_from_db
import numpy as np
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
