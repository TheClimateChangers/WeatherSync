from django.urls import path
from .views import hello_world, marks_message, julians_message

urlpatterns = [
    path('hello/', hello_world),
    path('mark/', marks_message),  # New route for Mark's message
    path('julian/', julians_message), # New route for Julian's message
]
