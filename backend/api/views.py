from django.http import JsonResponse

def hello_world(request):
    return JsonResponse({"message": "Hello, World!"})

def marks_message(request):
    return JsonResponse({"message": "Mark's Message: Hey everyone!"})

def julians_message(request):
    return JsonResponse({"message": "Julian's Message: best swe"})

def michaels_message(request):
    return JsonResponse({"message": "Michael's Message: yo"})

def giselles_message(request):
    return JsonResponse({"message": "Giselle's Message: Happy to be here :)"})

def nates_message(request):
    return JsonResponse({"message": "Nate's Message: what's up guys!"})
