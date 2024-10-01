from rest_framework import serializers
from home.models import MyUser
from django.utils.encoding import smart_str, force_bytes, DjangoUnicodeDecodeError
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.contrib.auth.tokens import PasswordResetTokenGenerator
import os

    
class UserRegisterSerializer(serializers.ModelSerializer):
  password2 = serializers.CharField(style={'input_type':'password'}, write_only=True)
  class Meta:
    model = MyUser
    fields=['email', 'name', 'password', 'password2','is_admin']
    extra_kwargs={
      'password':{'write_only':True}
    }

  def validate(self, attrs):
    password = attrs.get('password')
    password2 = attrs.get('password2')
    if password != password2:
      raise serializers.ValidationError("Passwords doesn't match")
    return attrs

  def create(self, validated_data):
    if MyUser.objects.filter(name=validated_data.get('name')).exists():
      raise serializers.ValidationError("Username already exists")
    if MyUser.objects.filter(email=validated_data.get('email')).exists():
      raise serializers.ValidationError("Email already exists")
    return MyUser.objects.create_user(**validated_data)
