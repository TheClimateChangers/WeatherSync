from django.http import JsonResponse
from .db_utils import fetch_events_from_db
import numpy as np

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

def location_list(request):
    locations = [
        {"name": "San Francisco", "latitude": 37.7749, "longitude": -122.4194},
        {"name": "New York", "latitude": 40.7128, "longitude": -74.0060},
        {"name": "Los Angeles", "latitude": 34.0522, "longitude": -118.2437},
    ]
    return JsonResponse(locations, safe=False)
