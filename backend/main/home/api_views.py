from django.shortcuts import render , HttpResponse
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from home.renderers import BaseRenderer
from .serializers import UserRegisterSerializer, UserLoginSerializer,ClassCardSerializer,ClassCardRetrieveSerializer,EnrollmentSerializer,AnnouncementSerializer
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count
from home.models import MyUser
from math import ceil
from rest_framework import filters
from django.conf import settings
import jwt,os
import datetime
from django.db import transaction
import uuid
from rest_framework.parsers import MultiPartParser, FormParser
from django.db import connection
from home.models import MyUser,ClassCard,Assignment,Comment,AssignmentSubmission,Enrollment,Announcement,Attachment
from django.utils.dateformat import format
from django.utils.timezone import now
def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    refresh['role'] = user.is_admin  
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
        user_id = payload['user_id']
        user = MyUser.objects.get(id=user_id)
        current_time = datetime.datetime.now(datetime.timezone.utc)
        expiration_time = current_time + datetime.timedelta(minutes=10)
        new_access_token_payload = {
            'token_type': 'access',
            'exp': int(expiration_time.timestamp()), 
            'iat': int(current_time.timestamp()),     
            'jti': str(uuid.uuid4()),                
            'user_id': user_id,
            'role': user.is_admin                       
        }
        new_access_token = jwt.encode(new_access_token_payload, settings.SECRET_KEY, algorithm='HS256')
        return Response({'access_token': new_access_token}, status=status.HTTP_200_OK)

class UserregistrationView(APIView):
    renderer_classes = [BaseRenderer]

    def post(self, request, format=None):  
        serializer = UserRegisterSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            user = serializer.save()
            token = get_tokens_for_user(user)
            msg = {
                'token': token,
                'message': 'Registration successful'
            }
            return Response(msg, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserLoginView(APIView):
    renderer_classes = [BaseRenderer]

    def post(self, request, format=None):  
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            email = request.data.get('email')
            password = request.data.get('password')
            user = authenticate(email=email, password=password)
            if user is not None:
                token = get_tokens_for_user(user)
                msg = {
                    'token': token,
                    'message': 'Login Successful'
                }
                return Response(msg, status=status.HTTP_200_OK)
            else:
                msg = {'error': 'Invalid Credentials'}
                return Response(msg, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    
class ClassCardView(APIView):
    permission_classes=[IsAuthenticated]
    renderer_classes=[BaseRenderer]
    def post(self ,request,format=None):
        serializer=ClassCardSerializer(data=request.data,context={'request':request})
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return Response({'msg': 'Class Created succesffully '}, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    def get (self, request,format=None):
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT c.id AS class_id , c.class_name,creator.name FROM home_classcard c INNER JOIN home_myuser creator ON c.creator_id=creator.id;"
            )
            data=cursor.fetchall();
            data_list = [
            {
             'class_id':row[0],
             'class_name': row[1], 
             'creator': row[2]
            }
            for row in data
        ]
        return Response(data_list, status=status.HTTP_200_OK)
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
 
    
class EnrollmentsView(APIView):
    renderer_classes=[BaseRenderer]
    permission_classes=[IsAuthenticated]
    def post (self, request,format=None ):
        class_code=request.query_params.get('class_code')
        if ClassCard.objects.filter(class_code=class_code).exists():
            serializer=EnrollmentSerializer(data=request.data)
            if serializer.is_valid(raise_exception= True):
                serializer.save()
                return Response({'msg': 'Class joined successfully'},status=status.HTTP_200_OK)
            else:
                return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({'error':'Class not found'},status=status.HTTP_400_BAD_REQUEST)
    def get(self, request, format=None):
        class_id = request.query_params.get('class_id')
        if class_id is not None and ClassCard.objects.filter(id=class_id).exists():
            try:
                query = """
                    SELECT student_user.id as student_id, student_user.name AS student_name, student_user.email AS student_email, 
                    creator_user.id as teacher_id, creator_user.name AS creator_name, creator_user.email AS creator_email
                    FROM home_classcard c
                    INNER JOIN home_myuser creator_user ON c.creator_id = creator_user.id
                    LEFT JOIN home_enrollment e ON c.id = e.class_card_id
                    LEFT JOIN home_myuser student_user ON e.user_id = student_user.id
                    WHERE c.id = %s
                    """
                with connection.cursor() as cursor:
                    cursor.execute(query, [class_id])
                    rows = cursor.fetchall()

                if rows:
                    creator_info = {
                        'creator_id':rows[0][3],
                        'creator_name': rows[0][4],
                        'creator_email': rows[0][5]
                    }
                else:
                    creator_info = {}
                students=[]
                if rows[0][0] is not None:                  
                    students = [
                        {
                            'student_id':row[0],
                            'student_name': row[1],
                            'student_email': row[2],
                        }
                        for row in rows
                    ]
                response_data = {
                    'creator': creator_info,
                    'students': students
                }

                return Response(response_data, status=status.HTTP_200_OK)

            except Exception as e:
                return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
            return Response({'error': 'Class id not provided or Class with that id doesn\'t exist'}, status=status.HTTP_400_BAD_REQUEST)
    def delete(self, request, format=None):  # only teachers can remove students
        ids = request.data.get('ids')  
        class_id = request.data.get('class_id')
        if not ids or not isinstance(ids, list):
            return Response({'error': 'Invalid data, array of IDs is required'}, status=status.HTTP_400_BAD_REQUEST)
        if not class_id or not ClassCard.objects.filter(id=class_id).exists():
            return Response({'error': 'Class ID is invalid or does not exist'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            placeholders = ', '.join(['%s'] * len(ids))
            query = f"""
                DELETE FROM home_enrollment 
                WHERE user_id IN ({placeholders}) AND class_card_id = %s
            """
            params = ids + [class_id]
            
            with connection.cursor() as cursor:
                cursor.execute(query, params)

            return Response({'msg': 'Records deleted successfully'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
class AnnouncementView(APIView):
    renderer_classes = [BaseRenderer]
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, format=None):
        data = request.data
        attachments = request.FILES.getlist('attachments')  
        serializer = AnnouncementSerializer(data=data)
        if serializer.is_valid(raise_exception=True):
            announcement = serializer.save()
            if attachments:
                for file in attachments:
                    Attachment.objects.create(file=file, announcement=announcement)
            return Response({'msg': 'Announcement created successfully'}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    def get(self, request, format=None):
        class_id = request.query_params.get('class_id')
        if not class_id:
            return Response({'error': 'class_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        if not ClassCard.objects.filter(id=class_id).exists():
            return Response({'error': 'Class with the provided id does not exist'}, status=status.HTTP_404_NOT_FOUND)
        announcements = Announcement.objects.filter(class_card_id=class_id).prefetch_related('attachments', 'creator')
        data = [
            {
                'id': announcement.id,
                'description': announcement.description,
                'created_at': announcement.created_at.isoformat(),
                'creator': {
                    'name': announcement.creator.name
                },
                'attachments': [
                    {
                        'file_name': attachment.file.name,
                        'file_url': request.build_absolute_uri(attachment.file.url),
                    }
                    for attachment in announcement.attachments.all()
                ]
            }
            for announcement in announcements
        ]

        return Response({'announcements': data}, status=status.HTTP_200_OK)
    def put(self, request, format=None):
        ann_id = request.query_params.get('announcement_id')

        # Ensure announcement ID is provided
        if not ann_id:
            return Response({'error': 'Announcement ID is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            announcement = Announcement.objects.get(pk=ann_id, creator=request.user)
        except Announcement.DoesNotExist:
            return Response({'error': 'Announcement not found or access denied'}, status=status.HTTP_404_NOT_FOUND)

        data = request.data
        new_attachments = request.FILES.getlist('attachments')  
        remove_attachment_ids = data.getlist('remove_attachments', [])  
        announcement.description = data.get('description', announcement.description)
        announcement.updated_at = now()
        announcement.is_edited = True
        announcement.save()
        with transaction.atomic():
            if remove_attachment_ids:
                attachments_to_remove = Attachment.objects.filter(
                    id__in=remove_attachment_ids, 
                    announcement=announcement
                )
                for attachment in attachments_to_remove:
                    if attachment.file:
                        attachment.file.delete(save=False)  
                        attachment.delete()  
            if new_attachments:
                for file in new_attachments:
                    Attachment.objects.create(file=file, announcement=announcement)

        return Response({'msg': 'Announcement updated successfully'}, status=status.HTTP_200_OK)  
    def delete(self, request,format=None):
        ann_id=request.query_params.get('announcement_id')
        try:
            announcement=Announcement.objects.get(id=ann_id)
            attachments=Attachment.objects.filter(announcement=announcement)
            for attachment in attachments:
                attachment.file.delete(save=False)
            announcement.delete()
            return Response({'msg':'Announcement deleted successfully'},status=status.HTTP_200_OK)
        except Announcement.DoesNotExist:
            return Response({'msg': 'Announcement with that id does not exist'}, status=status.HTTP_200_OK)
        
         