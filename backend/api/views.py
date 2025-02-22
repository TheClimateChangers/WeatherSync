from django.http import JsonResponse

def hello_world(request):
    return JsonResponse({"message": "Hello, World!"})

def marks_message(request):
    return JsonResponse({"message": "Mark's Message: Hey everyone!"})

def julians_message(request):
    return JsonResponse({"message": "Julian's Message: best swe"})