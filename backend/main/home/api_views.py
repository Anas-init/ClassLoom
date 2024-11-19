from django.shortcuts import render , HttpResponse
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from home.renderers import BaseRenderer
from .serializers import UserRegisterSerializer, UserLoginSerializer,ClassCardSerializer,ClassCardRetrieveSerializer
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count
from home.models import MyUser
from math import ceil
from rest_framework import filters
from django.conf import settings
import jwt,os
import datetime
import uuid
from django.db import connection
from home.models import MyUser,ClassCard,Assignment,Comment,AssignmentSubmission,Enrollment,Announcement
def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),

    }

class GenerateAccessToken(APIView):
    def get(self, request, format=None):
        refresh_token = request.query_params.get('token')
        if not refresh_token:
            return Response({'error': 'Refresh token is required.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            payload = jwt.decode(refresh_token, settings.SECRET_KEY, algorithms=['HS256'])
        except jwt.ExpiredSignatureError:
            return Response({'error': 'Refresh token has expired.'}, status=status.HTTP_401_UNAUTHORIZED)
        except jwt.InvalidTokenError:
            return Response({'error': 'Invalid refresh token.'}, status=status.HTTP_401_UNAUTHORIZED)
        current_time = datetime.datetime.now(datetime.timezone.utc)
        expiration_time = current_time + datetime.timedelta(minutes=10)
        new_access_token_payload = {
            'token_type': 'access',
            'exp': int(expiration_time.timestamp()),  # Expiration time
            'iat': int(current_time.timestamp()),     # Issued at time
            'jti': str(uuid.uuid4()),                # Unique identifier
            'user_id': payload['user_id']
        }
        new_access_token = jwt.encode(new_access_token_payload, settings.SECRET_KEY, algorithm='HS256')
        return Response({'access_token': new_access_token}, status=status.HTTP_200_OK)
class UserregistrationView(APIView):
    renderer_classes=[BaseRenderer]
    def post(self, request,format=None):  
        serializer = UserRegisterSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            user=serializer.save()
            token=get_tokens_for_user(user)
            msg={'token':token,'message':'registration successful'}
            return Response(msg,status=status.HTTP_201_CREATED)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
    
    

class UserLoginView(APIView):
    renderer_classes=[BaseRenderer]
    def post(self, request,format=None):  
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            email=request.data.get('email')
            password=request.data.get('password')
            user=authenticate(email=email,password=password)
            if user is not None:
                token=get_tokens_for_user(user)
                msg={'token':token,'message': 'Login Succesfull'}
                return Response(msg,status=status.HTTP_201_CREATED)
            else:
                msg={'message': 'Invalid Credentials'}
                return Response(msg,status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class ClassCardView(APIView):
    permission_classes=[IsAuthenticated]
    renderer_classes=[BaseRenderer]
    def post(self ,request,format=None):
        serializer=ClassCardSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return Response({'msg': 'Class Created succesffully '}, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    def get (self, request,format=None):
        with connection.cursor() as cursor:
            cursor.execute("SELECT class_name,creator FROM ClassCard");
            data=cursor.fetchall();
        serializer=ClassCardRetrieveSerializer(data)
        return Response(serializer.data, status=status.HTTP_200_OK)
    def put (self,request,format=None ):
        class_id=request.query_params.get('class_id')
        if class_id is None :
            return Response({'error': ' class_id is required'},status=status.HTTP_400_BAD_REQUEST)
        try: 
            classcard=ClassCard.objects.get(id=class_id)
            serializer=ClassCardSerializer(classcard,request.data,partial=True)
            if serializer.is_valid(raise_exception=True):
                serializer.save()
                return Response({'msg':'Class updated succesfully'},status=status.HTTP_202_ACCEPTED)
            else:
                return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
        except ClassCard.DoesNotExist:
            return Response({"error":"Class record not found"}, status=status.HTTP_404_NOT_FOUND)
    def delete (self,request,format=None ):
        class_id = request.query_params.get('class_id')
        if class_id is None:
            return Response({'error':'class_id is required'},status=status.HTTP_400_BAD_REQUEST)
        try:
            classcard=ClassCard.objects.get(id=class_id)
            classcard.delete()            
            return Response({'msg':'class card deleted successfully'},status=status.HTTP_200_OK)
        except ClassCard.DoesNotExist:
            return Response({'error':'class_card does not exist'},status=status.HTTP_400_BAD_REQUEST)  
 
    