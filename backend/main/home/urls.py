from django.urls import path,include
from .api_views import UserregistrationView,UserLoginView,ClassCardView
urlpatterns = [
    #MyUser APIs
    path('register/',UserregistrationView.as_view(),name='register'),
    path('login/',UserLoginView.as_view(),name='login'),
    #ClassCard APIs
    path('classes/',ClassCardView.as_view(),name='classcards'),
    path('create-class/',UserLoginView.as_view(),name='create-class'),
    path('delete-class/',ClassCardView.as_view(),name='delete-class'),
    path('update-class/',ClassCardView.as_view(),name='update-class'),
    
]
