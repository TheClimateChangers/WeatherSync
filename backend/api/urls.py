from django.urls import path
from .views import hello_world, marks_message, julians_message, michaels_message, giselles_message, nates_message

urlpatterns = [
    path('hello/', hello_world),
    path('mark/', marks_message),  # New route for Mark's message
    path('julian/', julians_message), # New route for Julian's message
    path('michael/', michaels_message), # New route for Michael's message
    path('giselle/', giselles_message), # New route for Giselle's message
    path('nate/', nates_message), # New route for Nate's message
]
