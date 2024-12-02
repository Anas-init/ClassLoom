from django.shortcuts import render , HttpResponse
from rest_framework.exceptions import NotFound

from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
import psycopg2
from home.renderers import BaseRenderer
from .serializers import UserRegisterSerializer, UserLoginSerializer,ClassCardSerializer,LectureSerializer,ClassCardRetrieveSerializer,EnrollmentSerializer,AnnouncementSerializer,AssignmentSerializer,CommentSerializer,AssignmentSubmissionSerializer,AssignmentResultSerializer
from rest_framework.permissions import IsAuthenticated,AllowAny
from django.core.exceptions import ValidationError
from rest_framework.exceptions import ParseError
from django.db.models import Count
from home.models import MyUser
from math import ceil
from django.core.mail import send_mass_mail
import json
from rest_framework import filters
from django.conf import settings
from django.db.models import Count
import jwt,os
from django.shortcuts import get_object_or_404
from datetime import timedelta
import datetime
from django.db import transaction
import uuid
from rest_framework.parsers import MultiPartParser, FormParser
from django.db import connection
from home.models import MyUser,ClassCard,Assignment,Comment,AssignmentSubmission,Enrollment,Announcement,Attachment,Lecture,AssignmentResult
from django.utils.dateformat import format
from django.utils.timezone import now,localtime
from rest_framework.permissions import BasePermission
def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    refresh['role'] = user.is_admin  
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

class IsAdminUser(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and getattr(request.user, 'is_admin', False))
class isEnrolled(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and Enrollment.objects.filter(user=request.user.id).exists() or(getattr(request.user, 'is_admin', False)))

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
            'role': user.is_admin,
        }
        new_access_token = jwt.encode(new_access_token_payload, settings.SECRET_KEY, algorithm='HS256')
        return Response({'access_token': new_access_token,'name':user.name,'email':user.email}, status=status.HTTP_200_OK)

class UserregistrationView(APIView):
    renderer_classes = [BaseRenderer]

    def post(self, request, format=None):  
        serializer = UserRegisterSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            user = serializer.save()
            token = get_tokens_for_user(user)
            msg = {
                'token': token,
                'name':serializer.data.get('name'),
                'email':serializer.data.get('email'),
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
                    'name':user.name,
                    'email':user.email,
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
        user_id = request.user.id  
        is_admin = request.user.is_admin  

        query = ""
        params = []

        if is_admin:
            query = """
                SELECT c.id AS class_id, c.class_name, u.name AS creator_name
                FROM home_classcard c
                INNER JOIN home_myuser u ON c.creator_id = u.id
                WHERE c.creator_id = %s;
            """
            params = [user_id]
        else:
            query = """
                SELECT c.id AS class_id, c.class_name, u.name AS creator_name
                FROM home_enrollment e
                INNER JOIN home_classcard c ON e.class_card_id = c.id
                INNER JOIN home_myuser u ON c.creator_id = u.id
                WHERE e.user_id = %s;
            """
            params = [user_id]

        with connection.cursor() as cursor:
            cursor.execute(query, params)
            data = cursor.fetchall()

        data_list = [
            {
                "class_id": row[0],
                "class_name": row[1],
                "creator_name": row[2],
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
    renderer_classes = [BaseRenderer]
    permission_classes = [IsAuthenticated]

    def post(self, request, format=None):
        class_code = request.query_params.get('class_code')
        if not class_code:
            return Response({'error': 'Class code is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            class_card = ClassCard.objects.get(class_code=class_code)
        except ClassCard.DoesNotExist:
            return Response({'error': 'Class not found'}, status=status.HTTP_400_BAD_REQUEST)

        if Enrollment.objects.filter(user=request.user, class_card=class_card).exists():
            return Response({'msg': 'You are already enrolled in this class'}, status=status.HTTP_400_BAD_REQUEST)
        data = request.data.copy()
        data['user'] = request.user.id
        data['class_card'] = class_card.id

        serializer = EnrollmentSerializer(data=data)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return Response({'msg': 'Class joined successfully'}, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

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
    permission_classes = [IsAuthenticated,isEnrolled]
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
            
            #self.send_emails_to_students(announcement)
            
            return Response({'msg': 'Announcement created successfully'}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def send_emails_to_students(self, announcement): 
        class_card = announcement.class_card
        
        # Fetch student emails for the class
        students = MyUser.objects.filter(
            enrollments__class_card=class_card,
            is_admin=False  # Filter for students
        ).values_list('email', flat=True)
        
        # Prepare email content
        teacher_name = announcement.creator.name
        class_name = class_card.class_name
        subject = f"New Announcement in {class_name}"
        message = f"""
        Hello,

        {teacher_name} has posted a new announcement in your class, {class_name}.

        Title: {"Announcement"}
        Description: {announcement.description}

        Best regards,
        Class Management System
        """
        email_messages = [
            (subject, message, settings.EMAIL_HOST_USER, [student_email])
            for student_email in students
        ]
        send_mass_mail(email_messages, fail_silently=False)

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
                'created_at': (localtime(announcement.created_at)).strftime('%Y-%m-%d %H:%M:%S'),
                'is_updated': (localtime(announcement.updated_at)).strftime('%Y-%m-%d %H:%M:%S') if announcement.updated_at else None,
                'is_edited':announcement.is_edited, 
                'creator': {
                    'name': announcement.creator.name
                },
                'attachments': [
                    {
                        'file_name': attachment.file.name,
                        'file_url': request.build_absolute_uri(f'/api/media/{attachment.file.name}')
                    }
                    for attachment in announcement.attachments.all()
                ]
            }
            for announcement in announcements
        ]
        formatted_data = json.dumps({'Announcements': data}, indent=4)
        return Response(json.loads(formatted_data), status=status.HTTP_200_OK)
    def put(self, request, format=None):
        ann_id = request.query_params.get('announcement_id')
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
            return Response({'error': 'Announcement with that id does not exist'}, status=status.HTTP_200_OK)

class AssignmentView(APIView):
    permission_classes=[IsAuthenticated]
    renderer_classes=[BaseRenderer]
    parser_classes=[MultiPartParser,FormParser]
    def post(self, request, format=None):
        serializer = AssignmentSerializer(data=request.data, context={'request': request})
        attachments = request.FILES.getlist('attachments')

        if serializer.is_valid(raise_exception=True):
            assignment = serializer.save()
            if attachments:
                for file in attachments:
                    Attachment.objects.create(file=file, assignment=assignment)
            #self.send_emails_to_students(assignment)
            return Response({'msg': 'Assignment created successfully'}, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    def get( self, request, format=None):
        ass_id=request.query_params.get('assignment_id')
        if not ass_id:
            return Response({'error': 'Assignment id not provided'},status=status.HTTP_400_BAD_REQUEST)
        if Assignment.objects.filter(id=ass_id).exists():
            assignments=Assignment.objects.filter(id=ass_id).prefetch_related('attachments','creator')
            data = [
            {
                'id': assignment.id,
                'title':assignment.title,
                'description': assignment.description,
                'due_date':localtime(assignment.due_date).strftime('%Y-%m-%d %H:%M:%S'),
                'grade':assignment.grade,
                'created_at': (localtime(assignment.created_at)).strftime('%Y-%m-%d %H:%M:%S'),
                'is_updated': (localtime(assignment.updated_at)).strftime('%Y-%m-%d %H:%M:%S') if assignment.updated_at else None,
                'is_edited':assignment.is_edited, 
                'creator': {
                    'name': assignment.creator.name
                },
                'attachments': [
                    {
                        'file_name': attachment.file.name,
                        'file_url': request.build_absolute_uri(f'/api/media/{attachment.file.name}')
                    }
                    for attachment in assignment.attachments.all()
                ]
            }
                for assignment in assignments
            ]
            formatted_data = json.dumps({'assignment': data}, indent=4)
            return Response(json.loads(formatted_data), status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Assignment with that id doesnt exist'},status=status.HTTP_400_BAD_REQUEST)                     
    def put (self,request,format=None):
        ass_id = request.query_params.get('assignment_id')
        if not ass_id:
            return Response({'error': 'Assignment ID is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            assignment = Assignment.objects.get(pk=ass_id, creator=request.user)
        except Assignment.DoesNotExist:
            return Response({'error': 'Assignment not found or access denied'}, status=status.HTTP_404_NOT_FOUND)

        data = request.data
        new_attachments = request.FILES.getlist('attachments')  
        remove_attachment_ids = data.getlist('remove_attachments', [])  
        assignment.title = data.get('title',assignment.title)
        assignment.due_date=data.get('due_date',assignment.due_date)
        assignment.grade = data.get('grade',assignment.grade)
        assignment.description = data.get('description', assignment.description)
        assignment.updated_at = now()
        assignment.is_edited = True
        assignment.save()
        with transaction.atomic():
            if remove_attachment_ids:
                attachments_to_remove = Attachment.objects.filter(
                    id__in=remove_attachment_ids, 
                    assignment=assignment
                )
                for attachment in attachments_to_remove:
                    if attachment.file:
                        attachment.file.delete(save=False)  
                        attachment.delete()  
            if new_attachments:
                for file in new_attachments:
                    Attachment.objects.create(file=file, assignment=assignment)

        return Response({'msg': 'Assignment updated successfully'}, status=status.HTTP_200_OK)  
    def delete(self,request,format=None):
        ass_id=request.query_params.get('assignment_id')
        try:
            assignment=Assignment.objects.get(id=ass_id)
            attachments=Attachment.objects.filter(assignment=assignment)
            for attachment in attachments:
                attachment.file.delete(save=False)
            assignment.delete()
            return Response({'msg':'Assignment deleted successfully'},status=status.HTTP_200_OK)
        except Assignment.DoesNotExist:
            return Response({'error': 'Assignment with that id does not exist'}, status=status.HTTP_200_OK)
    def send_emails_to_students(self, assignment): 
        class_card = assignment.class_card
        students = MyUser.objects.filter(
            enrollments__class_card=class_card,
            is_admin=False  
        ).values_list('email', flat=True)
        
        teacher_name = assignment.creator.name
        class_name = class_card.class_name
        subject = f"New Assignment in {class_name}"
        message = f"""
        Hello,

        {teacher_name} has posted a new assignment in your class, {class_name}.

        Title: {"Assignment"}
        Description: {assignment.description}

        Best regards,
        Class Management System
        """
        email_messages = [
            (subject, message, settings.EMAIL_HOST_USER, [student_email])
            for student_email in students
        ]
        send_mass_mail(email_messages, fail_silently=False)
class LectureView(APIView):
    permission_classes=[IsAuthenticated,IsAdminUser]
    renderer_classes=[BaseRenderer]
    parser_classes=[MultiPartParser,FormParser]
    def post(self,request,format=None):
        serializer=LectureSerializer(data=request.data)
        attachments=request.FILES.getlist('attachments')
        if serializer.is_valid(raise_exception=True):
            lecture=serializer.save()
            if lecture:
                for file in attachments:
                    Attachment.objects.create(file=file,lecture=lecture)
                #self.send_emails_to_students(lecture)
            return Response({'msg':'Lecture created successfully'}, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    def send_emails_to_students(self, lecture): 
        class_card = lecture.class_card
        students = MyUser.objects.filter(
            enrollments__class_card=class_card,
            is_admin=False  
        ).values_list('email', flat=True)
        

        teacher_name = lecture.creator.name
        class_name = class_card.class_name
        subject = f"New Lecture in {class_name}"
        message = f"""
        Hello,

        {teacher_name} has posted a new lecture in your class, {class_name}.

        Title: {"Lecture"}
        Description: {lecture.description}

        Best regards,
        Class Management System
        """
        email_messages = [
            (subject, message, settings.EMAIL_HOST_USER, [student_email])
            for student_email in students
        ]
        send_mass_mail(email_messages, fail_silently=False)
    def get( self, request, format=None):
        lec_id=request.query_params.get('lecture_id')
        if not lec_id:
            return Response({'error': 'Lecture id not provided'},status=status.HTTP_400_BAD_REQUEST)
        if Lecture.objects.filter(id=lec_id).exists():
            lectures=Lecture.objects.filter(id=lec_id).prefetch_related('attachments','creator')
            data = [
            {
                'id': lecture.id,
                'title':lecture.title,
                'description': lecture.description,
                'created_at': (localtime(lecture.created_at)).strftime('%Y-%m-%d %H:%M:%S'),
                'is_updated': (localtime(lecture.updated_at)).strftime('%Y-%m-%d %H:%M:%S') if  lecture.updated_at else None,
                'is_edited':lecture.is_edited, 
                'creator': {
                    'name': lecture.creator.name
                },
                'attachments': [
                    {
                        'file_name': attachment.file.name,
                        'file_url': request.build_absolute_uri(f'/api/media/{attachment.file.name}')
                    }
                    for attachment in lecture.attachments.all()
                ]
            }
                for lecture in lectures
            ]
            formatted_data = json.dumps({'Lecture': data}, indent=4)
            return Response(json.loads(formatted_data), status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Lecture with that id doesnt exist'},status=status.HTTP_400_BAD_REQUEST)                     
    def put (self,request,format=None):
        lec_id = request.query_params.get('lecture_id')
        if not lec_id:
            return Response({'error': 'Lecture ID is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            lecture = Lecture.objects.get(pk=lec_id, creator=request.user)
        except Lecture.DoesNotExist:
            return Response({'error': 'Lecture not found or access denied'}, status=status.HTTP_404_NOT_FOUND)

        data = request.data
        new_attachments = request.FILES.getlist('attachments')  
        remove_attachment_ids = data.getlist('remove_attachments', [])  
        lecture.title = data.get('title',lecture.title)
        lecture.description = data.get('description', lecture.description)
        lecture.updated_at = now()
        lecture.is_edited = True
        lecture.save()
        with transaction.atomic():
            if remove_attachment_ids:
                attachments_to_remove = Attachment.objects.filter(
                    id__in=remove_attachment_ids, 
                    lecture=lecture
                )
                for attachment in attachments_to_remove:
                    if attachment.file:
                        attachment.file.delete(save=False)  
                        attachment.delete()  
            if new_attachments:
                for file in new_attachments:
                    Attachment.objects.create(file=file, lecture=lecture)
        return Response({'msg': 'Lecture updated successfully'}, status=status.HTTP_200_OK)  
    def delete(self,request,format=None):
        lec_id=request.query_params.get('lecture_id')
        try:
            lecture=Lecture.objects.get(id=lec_id)
            attachments=Attachment.objects.filter(lecture=lecture)
            for attachment in attachments:
                attachment.file.delete(save=False)
            lecture.delete()
            return Response({'msg':'Lecture deleted successfully'},status=status.HTTP_200_OK)
        except Lecture.DoesNotExist:
            return Response({'error': 'Lecture with that id does not exist'}, status=status.HTTP_200_OK)
    
            
class CommentListView(APIView):
    permission_classes=[IsAuthenticated,isEnrolled]
    renderer_classes=[BaseRenderer]
    
    def get(self, request, format=None):
        try:

            assignment_id = request.query_params.get('assignment_id')
            announcement_id = request.query_params.get('announcement_id')
            lecture_id = request.query_params.get('lecture_id')
            comments = Comment.objects.all()
            if assignment_id:
                comments = comments.filter(assignment_id=assignment_id)
            elif announcement_id:
                comments = comments.filter(announcement_id=announcement_id)
            elif lecture_id:
                comments = comments.filter(lecture_id=lecture_id)
            else:
                return Response({'msg': 'No material id provided'}, status=status.HTTP_400_BAD_REQUEST)
            comment_count = comments.aggregate(count=Count('id'))['count']
            serializer = CommentSerializer(comments, many=True)

            response_data = {
                "count": comment_count,
                "comments": serializer.data,
            }

            return Response(response_data, status=status.HTTP_200_OK)

        except ValidationError as e:
            return Response({"error": "Invalid query parameter", "details": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        except ParseError as e:
            return Response({"error": "Malformed request", "details": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({"error": "An unexpected error occurred", "details": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    def post(self, request,format=None):
        serializer = CommentSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return Response({'msg':'Comment added succesfully'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    def put(self, request,format=None):
        comm_id=request.query_params.get('comment_id')
        try:
            comment=Comment.objects.get(id=comm_id)
            serializer=CommentSerializer(comment,request.data,partial=True)    
            if serializer.is_valid(raise_exception=True):
                serializer.save()
                return Response({'msg':'Comment Updated Succesfully'}, status=status.HTTP_200_OK)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Comment.DoesNotExist:
            return Response({'error': 'Comment does not exist'}, status=status.HTTP_400_BAD_REQUEST)
    def delete(self,request,format=None):
        comm_id=request.query_params.get('comment_id')
        if comm_id is None:
            return Response({'error':'Comment id not specified'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            comment=Comment.objects.get(id=comm_id)
            comment.delete()
            return Response({'msg':'Comment deleted succesfully' }, status=status.HTTP_200_OK)
        except Comment.DoesNotExist:
            return Response({'error': 'Comment does not exist'}, status=status.HTTP_400_BAD_REQUEST)


class AssignmentSubmissionView(APIView):
    permission_classes=[IsAuthenticated,isEnrolled]
    renderer_classes=[BaseRenderer]
    parser_classes=[MultiPartParser,FormParser]
    def get(self, request, format=None):
        sub_id=request.query_params.get('submission_id')
        try:
            submissions=AssignmentSubmission.objects.filter(id=sub_id).prefetch_related('attachments')
            data = [
            {
                'id': submission.id,
                'submitted_at': (localtime(submission.submitted_at) ).strftime('%Y-%m-%d %H:%M:%S'),
                'attachments': [
                    {
                        'file_name': attachment.file.name,
                        'file_url': request.build_absolute_uri(f'/api/media/{attachment.file.name}')
                    }
                    for attachment in submission.attachments.all()
                ]
            }
                for submission in submissions
            ]
            formatted_data = json.dumps({'Submission': data}, indent=4)
            return Response(json.loads(formatted_data), status=status.HTTP_200_OK)
        except AssignmentSubmission.DoesNotExist:
            return Response({'msg':'Assignment Submission with that id does not exist'}, status=status.HTTP_200_OK)
    def post(self, request, format=None):
        serializer=AssignmentSubmissionSerializer(data=request.data)
        attachment=request.FILES.getlist('attachments')
        if serializer.is_valid(raise_exception=True):
            turn_in=serializer.save()
            if turn_in:
                for file in attachment:
                    Attachment.objects.create(file=file,submission=turn_in)
            return Response({'msg':'Assignment turned in successfully'},status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        
    def put(self, request, format=None):
        sub_id=request.query_params.get('submission_id')
        if not sub_id:
            return Response({'error': 'Submission ID is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            submission = AssignmentSubmission.objects.get(pk=sub_id, student=request.user)
        except Lecture.DoesNotExist:
            return Response({'error': 'Lecture not found or access denied'}, status=status.HTTP_404_NOT_FOUND)

        data = request.data
        submission.submitted_at=now()
        new_attachments = request.FILES.getlist('attachments')  
        remove_attachment_ids = data.getlist('remove_attachments', [])  
        with transaction.atomic():
            if remove_attachment_ids:
                attachments_to_remove = Attachment.objects.filter(
                    id__in=remove_attachment_ids, 
                    submission=submission
                )
                for attachment in attachments_to_remove:
                    if attachment.file:
                        attachment.file.delete(save=False)  
                        attachment.delete()  
            if new_attachments:
                for file in new_attachments:
                    Attachment.objects.create(file=file, submission=submission)
        return Response({'msg': 'Submission updated successfully'}, status=status.HTTP_200_OK)  
    def delete(self, request, format=None):
        sub_id=request.query_params.get('submission_id')
        try:
            submission=AssignmentSubmission.objects.get(id=sub_id)
            attachments=Attachment.objects.filter(submission=submission)
            for attachment in attachments:
                attachment.file.delete(save=False)
            submission.delete()
            return Response({'msg':'Submission deleted successfully'},status=status.HTTP_200_OK)
        except Lecture.DoesNotExist:
            return Response({'error': 'Submission with that id does not exist'}, status=status.HTTP_200_OK)
class AssignmentCheckingView(APIView):
    renderer_classes=[BaseRenderer]
    permission_classes=[IsAuthenticated,isEnrolled]
   
    def get(self, request, format=None):
        try:
            # Get assignment ID from query parameters
            assi_id = request.query_params.get('assignment_id')
            if not assi_id:
                return Response({"error": "assignment_id is required"}, status=status.HTTP_400_BAD_REQUEST)

            # Fetch the AssignmentSubmission object
            query = AssignmentSubmission.objects.get(assignment_id=assi_id, student=request.user)

            # Fetch the AssignmentResult object
            temp_query = AssignmentResult.objects.get(assignmentsubmission=query.id)

            # Serialize and return the result
            serializer = AssignmentResultSerializer(temp_query)
            return Response({'flag':True,'data':serializer.data}, status=status.HTTP_200_OK)
        except AssignmentSubmission.DoesNotExist:
            raise NotFound("Assignment submission not found for the given assignment_id and user.")
        except AssignmentResult.DoesNotExist:
            return Response ({'flag':False,'data':{}},status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self,request,format=None):
        serializer=AssignmentResultSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return Response({'msg':'Result returned uccessfully'},status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST) 
    def put(self,request,format=None):
        sub_id=request.query_params.get('submission_id')
        if sub_id :
            try:
                submission=AssignmentResult.objects.get(assignmentsubmission=sub_id)
                serializer=AssignmentResultSerializer(submission,request.data,partial=True)
                if serializer.is_valid(raise_exception=True):
                    serializer.save()
                    return Response({'msg':'Assignment Checking updated Succesfully'},status=status.HTTP_200_OK)
            except AssignmentResult.DoesNotExist:
                return Response({'error':'Assignment result does not exist'},status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({'error':'Submission id not provided'},status=status.HTTP_400_BAD_REQUEST)


class ClassStreamView(APIView):
    renderer_classes = [BaseRenderer]
    permission_classes = [IsAuthenticated, isEnrolled]
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request, format=None):
        class_id = request.query_params.get('class_id')
        
        if class_id is None:
            return Response({'error': 'class_id not provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        if not ClassCard.objects.filter(id=class_id).exists():
            return Response({'error': 'Classcard with that id does not exist'}, status=status.HTTP_400_BAD_REQUEST)
        
        query = """
            WITH announcement_data AS (
            SELECT 
                a.id AS announcement_id,
                a.description,
                (a.created_at - INTERVAL '8 hours') AS created_at,
                (CASE WHEN a.updated_at IS NOT NULL THEN (a.updated_at - INTERVAL '8 hours') ELSE NULL END) AS updated_at, 
                a.is_edited,
                COALESCE(
                    json_agg(
                        CASE 
                            WHEN att.id IS NOT NULL THEN 
                                json_build_object(
                                    'id', att.id,
                                    'file_name', att.file,
                                    'file_url', CONCAT('http://127.0.0.1:8000/api/media/', att.file)
                                )
                            ELSE NULL 
                        END
                    ) FILTER (WHERE att.id IS NOT NULL), '[]'
                ) AS attachments
            FROM home_announcement a
            LEFT JOIN home_attachment att ON a.id = att.announcement_id
            WHERE a.class_card_id = %s
            GROUP BY a.id, a.description, a.created_at, a.updated_at, a.is_edited
        ),
        lecture_data AS (
            SELECT 
                l.id AS lecture_id,
                l.title
            FROM home_lecture l
            WHERE l.class_card_id = %s
        ),
        assignment_data AS (
            SELECT 
                ass.id AS assignment_id,
                ass.title
            FROM home_assignment ass
            WHERE ass.class_card_id = %s
        )
        SELECT 
            COALESCE((
                SELECT json_agg(json_build_object(
                    'type', 'announcement',
                    'id', ad.announcement_id,
                    'description', ad.description,
                    'created_at', ad.created_at,
                    'updated_at', ad.updated_at,
                    'is_edited', ad.is_edited,
                    'attachments', ad.attachments
                ))
                FROM announcement_data ad
            ), '[]') AS announcements,
            COALESCE((
                SELECT json_agg(json_build_object(
                    'type', 'lecture',
                    'id', ld.lecture_id,
                    'title', ld.title
                ))
                FROM lecture_data ld
            ), '[]') AS lectures,
            COALESCE((
                SELECT json_agg(json_build_object(
                    'type', 'assignment',
                    'id', ad.assignment_id,
                    'title', ad.title
                ))
                FROM assignment_data ad
            ), '[]') AS assignments;

        """
        
        with connection.cursor() as cursor:
            cursor.execute(query, [class_id, class_id, class_id])
            result = cursor.fetchone()
        if not result or all(data is None for data in result):
            return Response({'error': 'No data found for the given class_id'}, status=status.HTTP_404_NOT_FOUND)
        announcements, lectures, assignments = result
        return Response({ 'announcements': announcements or [],'lectures': lectures or [],'assignments': assignments or []}, status=status.HTTP_200_OK)
    
class TodoView(APIView):
    renderer_classes = [BaseRenderer]
    permission_classes = [IsAuthenticated, isEnrolled]

    def get(self, request, format=None):
        p_class_id = request.data.get('class_id')
        p_student_id = request.data.get('student_id')

        if not p_class_id or not p_student_id:
            return Response({"error": "class_id and student_id are required."}, status=400)

        try:
            with connection.cursor() as cursor:
                cur=connection.cursor()
                cur.callproc('get_assignment_status', (p_class_id, p_student_id,))
                result = cur.fetchone()  
            if result:
                stats = result[0]
            else:
                stats = {
                    "total_assigned": 0,
                    "total_assigned_details": [],
                    "total_turned_in": 0,
                    "total_turned_in_details": [],
                    "total_missed": 0,
                    "total_missed_details": [],
                    "total_late_submitted": 0,
                    "total_late_submitted_details": []
                }

            return Response(stats, status=200)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AllSubmissionsView(APIView):
    renderer_classes=[BaseRenderer]
    permission_classes=[IsAuthenticated,IsAdminUser]
    
    def get(self, request, format=None):
        assi_id = request.query_params.get('assignment_id')
        
        if not assi_id:
            return Response({"error": "assignment_id is required"}, status=400)
        
        assignment = get_object_or_404(Assignment, pk=assi_id)
        submissions = AssignmentSubmission.objects.filter(assignment=assignment).select_related('student')
        total_submissions = submissions.count()


        total_students = Enrollment.objects.filter(class_card=assignment.class_card).count()
        submissions_data = [
            {
                "submission_id": submission.pk,
                "student_id": submission.student.pk,
                "student_name": submission.student.name,
                "submitted_at":(localtime(submission.submitted_at)).strftime('%Y-%m-%d %H:%M:%S'),
                
            }
            for submission in submissions
        ]
        
        response_data = {
            "assignment_id": assignment.pk,
            "assignment_title": assignment.title,
            "total_submissions": total_submissions,
            "total_students": total_students,
            "submissions_summary": f"{total_submissions}/{total_students} students submitted",
            "submissions": submissions_data,
        }

        return Response(response_data, status=200)
    

class RestrictSubmission(APIView):
    renderer_classes=[BaseRenderer]
    permission_classes=[IsAuthenticated,isEnrolled]
    def get ( self,request,format =None):
        assi_id=request.query_params.get('assignment_id')
        if AssignmentSubmission.objects.filter(assignment=assi_id,student=request.user.id).exists():
            return Response({'flag':True },status=status.HTTP_200_OK)
        else:
            return Response({'flag':False},status=status.HTTP_200_OK)