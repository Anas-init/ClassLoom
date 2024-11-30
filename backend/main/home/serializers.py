from rest_framework import serializers
from home.models import MyUser,ClassCard,Assignment,Comment,AssignmentSubmission,Enrollment,Announcement,Lecture,AssignmentResult
from django.utils.encoding import smart_str, force_bytes, DjangoUnicodeDecodeError
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.timezone import now,localtime
from datetime import timedelta
import os

    
class UserRegisterSerializer(serializers.ModelSerializer):
  confirm_password= serializers.CharField(style={'input_type':'password'}, write_only=True)
  class Meta:
    model = MyUser
    fields=['email', 'name', 'password', 'confirm_password','is_admin']
    extra_kwargs={
      'password':{'write_only':True}
    }
    

  def validate(self, attrs):
    password = attrs.get('password')
    confirm_password = attrs.get('confirm_password')
    if password != confirm_password:
      raise serializers.ValidationError("Passwords doesn't match")
    return attrs

  def create(self, validated_data):
    if MyUser.objects.filter(name=validated_data.get('name')).exists():
      raise serializers.ValidationError("Username already exists")
    if MyUser.objects.filter(email=validated_data.get('email')).exists():
      raise serializers.ValidationError("Email already exists")
    return MyUser.objects.create_user(**validated_data)
  
class UserChangePasswordSerializer(serializers.Serializer):
  password=serializers.CharField(style={'input_type':'password'}, write_only=True)
  confirm_password=serializers.CharField(style={'input_type':'password'}, write_only=True)
  class Meta:
    fields=['password', 'confirm_password']   
  def validate(self, attrs):
    password=attrs.get('password')
    confirm_password=attrs.get('confirm_password')
    user=self.context.get('user')
    if user.check_password(password):
          user.set_password(confirm_password)
          user.save()
          return attrs
    raise serializers.ValidationError ("Incorrect old password")
  
class UserLoginSerializer(serializers.ModelSerializer):
  email=serializers.EmailField(max_length=255)
  class Meta:
    model=MyUser
    fields=['email', 'password']

class ClassCardSerializer(serializers.ModelSerializer):
  
  class Meta:
      model = ClassCard
      fields = ['class_name', 'class_code']  
  def create(self, validated_data):
      validated_data['creator'] = self.context['request'].user  
      req_class_code = validated_data.get('class_code')
      if ClassCard.objects.filter(class_code=req_class_code).exists():
          raise serializers.ValidationError("Class card with this code already exists")
      return ClassCard.objects.create(**validated_data)
    
  def update(self, instance, validated_data):
    new_class_name= validated_data.get('class_name')
    new_class_code= validated_data.get('class_code')
    instance.class_name=new_class_name if new_class_name else instance.class_name 
    instance.class_code =new_class_code if new_class_code else instance.class_code 
    instance.save()
    return instance
class ClassCardRetrieveSerializer(serializers.ModelSerializer):
  class Meta:
    model=ClassCard
    fields=['id','class_name','creator']
class EnrollmentSerializer(serializers.ModelSerializer):
  class Meta:
    model=Enrollment
    fields='__all__'
  def create(self, validated_data):
    return Enrollment.objects.create(** validated_data )

class AnnouncementSerializer(serializers.ModelSerializer):
  class Meta:
    model=Announcement
    fields='__all__'
  def create(self, validated_data):
    return Announcement.objects.create(**validated_data)
class AssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assignment
        fields = '__all__'
    def create(self, validated_data):
        request = self.context.get('request')
        if request and request.user:
            validated_data['creator'] = request.user
        return super().create(validated_data)

class LectureSerializer(serializers.ModelSerializer):
  class Meta:
    model=Lecture
    fields='__all__'
  def create(self, validated_data):
    return Lecture.objects.create(**validated_data)
class CommentSerializer(serializers.ModelSerializer):
  class Meta:
      model = Comment
      fields = '__all__'

  def validate(self, validated_data):
      related_fields = ['assignment', 'announcement', 'lecture']
      related_count = sum(1 for field in related_fields if validated_data.get(field) is not None)
      if related_count == 0:
          raise serializers.ValidationError(
              "A comment must be related to either an assignment, announcement, or lecture."
          )
      if related_count > 1:
          raise serializers.ValidationError(
              "A comment can only be related to one of assignment, announcement, or lecture."
          )
      return validated_data
  def create(self, validated_data):
    return Comment.objects.create(**validated_data)
  def update(self, instance,validated_data):
    new_description= validated_data.get('description')
    instance.description=new_description if new_description else instance.description 
    instance.updated_at=now()
    instance.is_edited=True 
    instance.save()
    return instance
class AssignmentSubmissionSerializer(serializers.ModelSerializer):
  class Meta:
    model=AssignmentSubmission
    fields='__all__'
  def create(self,validated_data):
    return AssignmentSubmission.objects.create(**validated_data)
class AssignmentResultSerializer(serializers.ModelSerializer):
  class Meta:
    model=AssignmentResult
    fields='__all__'
  def create(self, validated_data):
    return AssignmentResult.objects.create(**validated_data)
  def update(self,instance, validated_data):
    new_grade=validated_data.get('result_grade')
    new_feedback=validated_data.get('feedback')
    instance.grade=new_grade if new_grade is not None else instance.grade
    instance.feedback=new_feedback if new_feedback is not None else instance.feedback
    instance.save()
    return instance
    
  