from django.contrib import admin

# Register your models here.
from .models import Trip, TripDay, Activity, DayActivity, Weather

admin.site.register(Trip)
admin.site.register(TripDay)
admin.site.register(Activity)
admin.site.register(DayActivity)
admin.site.register(Weather)
