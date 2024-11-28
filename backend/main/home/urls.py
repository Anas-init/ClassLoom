from django.urls import path,include
from django.conf import settings
from django.conf.urls.static import static
from .api_views import UserregistrationView,UserLoginView,ClassCardView,EnrollmentsView,GenerateAccessToken,AnnouncementView,AssignmentView,LectureView,CommentListView,AssignmentSubmissionView,AssignmentCheckingView,ClassStreamView,TodoView,AllSubmissionsView,RestrictSubmission
urlpatterns = [
    #MyUser APIs
    path('register/',UserregistrationView.as_view(),name='register'),
    path('login/',UserLoginView.as_view(),name='login'),
    path('access/',GenerateAccessToken.as_view(),name='access'),
    #ClassCard APIs
    path('classes/',ClassCardView.as_view(),name='classcards'),
    path('create-class/',ClassCardView.as_view(),name='create-class'),
    path('delete-class/',ClassCardView.as_view(),name='delete-class'),
    path('update-class/',ClassCardView.as_view(),name='update-class'),
    #StudentandTeachers APIs
    path('join-class/',EnrollmentsView.as_view(),name='join-class'),
    path('all-students/',EnrollmentsView.as_view(),name='all-students'),
    path('remove-students/',EnrollmentsView.as_view(),name='remove-students'),
    #Announcements APIs
    path('create-announcement/',AnnouncementView.as_view(),name='create-announcement'),
    path('all-announcement/',AnnouncementView.as_view(),name='all-announcement'),
    path('update-announcement/',AnnouncementView.as_view(),name='update-announcement'),
    path('delete-announcement/',AnnouncementView.as_view(),name='delete-announcement'),
    #Assignments APIs
    path('create-assignment/',AssignmentView.as_view(),name='create-assignment'),
    path('retrieve-assignment/',AssignmentView.as_view(),name='retrieve-assignment'),
    path('update-assignment/',AssignmentView.as_view(),name='update-assignment'),
    path('delete-assignment/',AssignmentView.as_view(),name='delete-assignment'),
    #Lectures APIs
    path('create-lecture/',LectureView.as_view(),name='create-lecture'),
    path('retrieve-lecture/',LectureView.as_view(),name='retrieve-lecture'),
    path('update-lecture/',LectureView.as_view(),name='update-lecture'),
    path('delete-lecture/',LectureView.as_view(),name='delete-lecture'),
    #Comment APIs
    path('create-comment/',CommentListView.as_view(),name='create-comment'),
    path('all-comment/',CommentListView.as_view(),name='all-comment'),
    path('update-comment/',CommentListView.as_view(),name='update-comment'),
    path('delete-comment/',CommentListView.as_view(),name='delete-comment'),
    #AssignmentSubmission API
    path('submit-submission/',AssignmentSubmissionView.as_view(),name='submit-assignment'),
    path('retrieve-submission/',AssignmentSubmissionView.as_view(),name='retrieve-assignment'),
    path('update-submission/',AssignmentSubmissionView.as_view(),name='update-assignment'),
    path('delete-submission/',AssignmentSubmissionView.as_view(),name='delete-assignment'),
    #AssignmentChecking APIs 
    path('check-assignment/',AssignmentCheckingView.as_view(),name='check-assignment'),
    path('update-checking/',AssignmentCheckingView.as_view(),name='update-checking'),
    path('get-result/',AssignmentCheckingView.as_view(),name='get-result'),
    #ClassStream APIs
    path('class-stream/',ClassStreamView.as_view(),name='class-stream'),
    #Todo Assignments
    path('todo/',TodoView.as_view(),name='todo'),
    #All submissions
    path('all-submissions/',AllSubmissionsView.as_view(),name='all-submissions'),
    #RestrictSubmission
    path('restrict-submission/',RestrictSubmission.as_view(),name='restrict-submissions'),
]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
