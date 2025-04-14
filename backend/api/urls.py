from django.urls import path
from . import views
from .views import YelpActivitiesView, WeatherDataView, WeatherForecastView

urlpatterns = [
    path("notes/", views.NoteListCreate.as_view(), name="note-list"),
    path("notes/delete/<int:pk>/", views.NoteDelete.as_view(), name="delete-note"),
    path("weather/", WeatherDataView.as_view(), name="weather-data"),
    path("weather/forecast/", WeatherForecastView.as_view(), name="weather-forecast"),
    path("yelp-activities/", YelpActivitiesView.as_view(), name="yelp-activities"),
]
