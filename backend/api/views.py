from django.http import JsonResponse
from .db_utils import fetch_events_from_db

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
