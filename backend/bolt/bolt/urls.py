from django.contrib import admin
from django.urls import path, include
from django_otp.admin import OTPAdminSite
from django_otp.admin import OTPAdminSite  

admin.site.__class__ = OTPAdminSite

urlpatterns = [
    path("admin/", admin.site.urls),
    path('auth/', include('users.urls')),
    path("api/plaid/", include('boltxplaid.urls')),
]