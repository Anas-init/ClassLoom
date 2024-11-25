from django.db import models
from django.contrib.auth.models import BaseUserManager, AbstractBaseUser

# Custom user manager
class MyUserManager(BaseUserManager):
    def create_user(self, email, name, is_admin, password=None,confirm_password=None):
        if not email:
            raise ValueError("Users must have an email address")
        user = self.model(
            email=self.normalize_email(email),
            name=name,
            is_admin=is_admin,
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

# Custom User Model
class MyUser(AbstractBaseUser):
    email = models.EmailField(
        verbose_name="email address",
        max_length=255,
        unique=True,
    )
    name = models.CharField(max_length=200)
    is_admin = models.BooleanField(default=False)  # True for teachers, False for students

    objects = MyUserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["name", "is_admin"]

    def __str__(self):
        return self.name

class ClassCard(models.Model):
    class_name = models.CharField(max_length=255)
    class_code = models.CharField(max_length=255, unique=True)
    creator = models.ForeignKey(MyUser, on_delete=models.CASCADE, related_name="created_classes")

    def __str__(self):
        return self.class_name

class Enrollment(models.Model):
    user = models.ForeignKey(MyUser, on_delete=models.CASCADE, related_name="enrollments")
    class_card = models.ForeignKey(ClassCard, on_delete=models.CASCADE, related_name="enrollments")
    date_joined = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "class_card")

    def __str__(self):
        return f"{self.user.name} in {self.class_card.class_name}"

class Assignment(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    due_date = models.DateTimeField()
    class_card = models.ForeignKey(ClassCard, on_delete=models.CASCADE, related_name="assignments")
    creator = models.ForeignKey(MyUser, on_delete=models.CASCADE, related_name="created_assignments")
    grade = models.FloatField(null=False)
    updated_at = models.DateTimeField(null=True, blank=True)  
    is_edited = models.BooleanField(default=False) 
    def __str__(self):
        return f"{self.title} - {self.class_card.class_name}"

class AssignmentSubmission(models.Model):
    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, related_name="submissions")
    student = models.ForeignKey(MyUser, on_delete=models.CASCADE, related_name="submissions")
    submitted_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.student.name} - {self.assignment.title}"

class AssignmentResult(models.Model):
    assignmentsubmission=models.OneToOneField(AssignmentSubmission,on_delete=models.CASCADE, related_name="result")
    result_grade=models.FloatField(null=False)
    feedback = models.TextField(null=True, blank=True)


class Lecture(models.Model):
    title = models.CharField(max_length=255)
    description=models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    class_card = models.ForeignKey(ClassCard, on_delete=models.CASCADE, related_name="lectures")
    creator = models.ForeignKey(MyUser, on_delete=models.CASCADE, related_name="created_lectures")
    updated_at = models.DateTimeField(null=True, blank=True) 
    is_edited = models.BooleanField(default=False) 
    
class Announcement(models.Model):
    description = models.TextField()
    class_card = models.ForeignKey(ClassCard, on_delete=models.CASCADE, related_name="announcements")
    creator = models.ForeignKey(MyUser, on_delete=models.CASCADE, related_name="created_announcements")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(null=True, blank=True)  
    is_edited = models.BooleanField(default=False) 
    def __str__(self):
        return f"Announcement: {self.description} - {self.class_card.class_name}"
    


class Comment(models.Model):
    user = models.ForeignKey(MyUser, on_delete=models.CASCADE, related_name="comments")
    description = models.TextField(null=False)
    created_at = models.DateTimeField(auto_now_add=True)
    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, null=True, blank=True, related_name="comments")
    updated_at = models.DateTimeField(null=True, blank=True)  
    is_edited = models.BooleanField(default=False) 
    announcement = models.ForeignKey(Announcement, on_delete=models.CASCADE, null=True, blank=True, related_name="comments")
    lecture = models.ForeignKey(Lecture, on_delete=models.CASCADE, null=True, blank=True, related_name="comments")
    
    def __str__(self):
        if self.assignment:
            return f"Comment by {self.user.name} on Assignment {self.assignment.title}"

        if self.announcement:
            return f"Comment by {self.user.name} on Announcement {self.announcement.description}"
        return f"Comment by {self.user.name}"
class Attachment(models.Model):
    file = models.FileField(upload_to="attachments/")
    uploaded_at = models.DateTimeField(auto_now_add=True)
    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, null=True, blank=True, related_name="attachments")
    announcement = models.ForeignKey(Announcement, on_delete=models.CASCADE, null=True, blank=True, related_name="attachments")
    submission = models.ForeignKey(AssignmentSubmission, on_delete=models.CASCADE, null=True, blank=True, related_name="attachments")
    lecture = models.ForeignKey(Lecture, on_delete=models.CASCADE,null=True, blank=True, related_name="attachments")
    
    def __str__(self):
        return f"Attachment: {self.file.name}"
