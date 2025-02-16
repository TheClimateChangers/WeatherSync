from django.urls import path
from .views import hello_world, marks_message

urlpatterns = [
    path('hello/', hello_world),
    path('mark/', marks_message),  # New route for Mark's message
]
