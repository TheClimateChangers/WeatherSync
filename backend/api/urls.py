from django.urls import path
from .views import *
urlpatterns = [
    path('hello/', hello_world),
    path('mark/', marks_message),  # New route for Mark's message
    path('julian/', julians_message), # New route for Julian's message
    path('michael/', michaels_message), # New route for Michael's message
    path('giselle/', giselles_message), # New route for Giselle's message
    path('nate/', nates_message), # New route for Nate's message
    path("events-psycopg2/", get_events_psycopg2, name="get_events_psycopg2"),
    path("trip-costs-numpy/", calc_trip_costs, name="calc_trip_costs"),
    path("coordinates/", get_coordinates, name="get_coordinates"),
    path('encode-route/', encode_route, name='encode_route'),
    path('estimate-trip-cost-pandas/', estimate_trip_cost, name='estimate_trip_costs'),
]
