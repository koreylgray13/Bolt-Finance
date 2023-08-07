from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import *

urlpatterns = [
    path('login/', my_token_obtain_pair, name='token_obtain_pair'),
    path('login/refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('register/', register_user, name='email_register'),
    path('validate-email/<str:token>/', verify_email, name='verifyEmail'),
    path('reset-password/', reset_password, name='reset_password'),
    ]