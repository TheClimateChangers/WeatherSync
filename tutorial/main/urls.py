from django.urls import path

from . import views

urlpatterns = [
    path("<int:id>", views.index, name="index"), # if in home directory go to index() view
    
]