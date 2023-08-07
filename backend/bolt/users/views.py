from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from urllib.parse import urljoin
import hashlib
import time
from django.http import HttpResponseBadRequest
from django.contrib.auth import authenticate
from django.utils.translation import gettext_lazy as _
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import CustomUser
from rest_framework_simplejwt.views import token_refresh
from rest_framework import status

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import AllowAny

class CustomTokenRefreshView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        try:
            print('TOKEN REFRESH')
            refresh_token = request.data.get('refresh')
            token = RefreshToken(refresh_token)
            access_token = str(token.access_token)
            return Response({'access': access_token})
        except Exception as e:
            return Response({'error': str(e)})

def generate_verification_token(email, password):
    timestamp = str(int(time.time()))
    message = f"{email}{password}{timestamp}{settings.SECRET_KEY}"
    token = hashlib.sha256(message.encode()).hexdigest()
    return token

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    email = request.data.get('email')
    password = request.data.get('password')

    if CustomUser.objects.filter(email=email).exists():
        return Response({"detail": "Email already exists."}, status=400)

    user = CustomUser.objects.create_user(email=email, password=password)
    token = generate_verification_token(email, password)
    user.verification_token = token
    user.save()

    frontend_url = settings.FRONTEND_URL
    backend_url = request.build_absolute_uri('/')
    verify_link = urljoin(frontend_url, f'email-verify/{token}')

    subject = 'Confirm Account Creation'
    from_email = 'noreply@boltfinance.io'
    to = email

    html_content = render_to_string('verify_email.html', {
        'verify_link': verify_link,
        'base_url': frontend_url,
        'backend_url': backend_url,
    })
    text_content = strip_tags(html_content)

    msg = EmailMultiAlternatives(subject, text_content, from_email, [to])
    msg.attach_alternative(html_content, "text/html")
    msg.send()
    return Response({"detail": "Verification email sent."}, status=200)

@api_view(['POST'])
@permission_classes([AllowAny])
def verify_email(request, token):
    try:
        user = CustomUser.objects.get(verification_token=token)
        if user.is_active:
            return Response({"detail": "Email already verified."}, status=400)
        user.is_active = True
        user.verification_token = ''
        user.save()
        return Response({"detail": "Email verified."})
    except CustomUser.DoesNotExist:
        return Response({"detail": "Invalid token."}, status=400)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reset_password(request):
    # TODO: Implement reset password functionality.
    return Response({"detail": "Not implemented."}, status=501)

@api_view(['POST'])
def my_token_obtain_pair(request):
    if request.method == 'POST':
        email = request.data['email']
        password = request.data['password']
        if email is None or password is None:
            return HttpResponseBadRequest("Missing required parameter(s)")

        # authenticate user
        user = authenticate(request, email=email, password=password)
        if user is None:
            return Response('Invalid email/password.', status=400)

        # check if user is active
        if not user.is_active:
            return Response('Account is inactive.', status=400)

        # generate token pair
        token_data = TokenObtainPairSerializer.get_token(user)
        return Response({
            'refresh': str(token_data),
            'access': str(token_data.access_token),
        })

    else:
        return HttpResponseBadRequest("Invalid request method")
