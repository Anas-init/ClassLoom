from django.urls import path,include
from .api_views import UserregistrationView
urlpatterns = [
    #MyUser APIs
    path('register/',UserregistrationView.as_view(),name='register'),
    
]
