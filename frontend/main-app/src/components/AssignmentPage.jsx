import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import Submissions from './Submissions';

const AssignmentPage = () => {
  const { assignment_id } = useParams();
  const [assignmentDetails, setAssignmentDetails] = useState(null);
  const [submissions, setSubmissions] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [canSubmit, setCanSubmit] = useState(true); 

  const accessToken = localStorage.getItem('accessToken');
  const decodedToken = jwtDecode(accessToken);
  const isTeacher = decodedToken.role;
  const studentId = decodedToken.user_id; // Assuming the token contains the student's ID

  const fetchAssignmentDetails = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(
        `http://127.0.0.1:8000/api/retrieve-assignment/?assignment_id=${assignment_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const assignmentData = response.data.assignment[0];
      setAssignmentDetails(assignmentData);
    } catch (err) {
      console.error('Error fetching assignment details:', err);
      setError('Failed to load assignment details.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSubmissionStatus = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(
        `http://127.0.0.1:8000/api/restrict-submission/?assignment_id=${assignment_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(response.data);
      setCanSubmit(response.data.can_submit); // Assuming the API returns { can_submit: true/false }
    } catch (err) {
      console.error('Error checking submission status:', err);
      setError('Failed to check submission status.');
    }
  };

  const fetchSubmissions = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(
        `http://127.0.0.1:8000/api/all-submissions/?assignment_id=${assignment_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSubmissions(response.data.submissions);
    } catch (err) {
      console.error('Error fetching submissions:', err);
      setError('Failed to load submissions.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      alert('Please select a file to submit.');
      return;
    }

    const formData = new FormData();
    formData.append('assignment', assignment_id);
    formData.append('student', studentId);
    formData.append('attachments', selectedFile);

    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.post(
        'http://127.0.0.1:8000/api/submit-submission/',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data) {
        setSubmissionSuccess(true);
        alert('Submission successful!');
      } else {
        setError('Failed to submit the assignment.');
      }
    } catch (err) {
      console.error('Error submitting assignment:', err);
      setError('Error submitting assignment. Please try again later.');
    }
  };

  useEffect(() => {
    if (isTeacher) {
      fetchSubmissions();
    } else {
      fetchAssignmentDetails();
      fetchSubmissionStatus();
    }
  }, [isTeacher]);

  if (isLoading) return <p>Loading assignment details...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div style={{ padding: '20px' }}>
      {isTeacher ? (
        <>
          <h1>Submissions for {assignmentDetails?.title || 'this Assignment'}</h1>
          <Submissions submissions={submissions} />
        </>
      ) : (
        <>
          <h1>{assignmentDetails.title}</h1>
          <p><strong>Created By:</strong> {assignmentDetails.creator.name}</p>
          <p><strong>Created At:</strong> {new Date(assignmentDetails.created_at).toLocaleString()}</p>
          <p><strong>Due Date:</strong> {new Date(assignmentDetails.due_date).toLocaleString()}</p>
          <p><strong>Description:</strong></p>
          <p>{assignmentDetails.description}</p>
          <p><strong>Grade:</strong> {assignmentDetails.grade}</p>

          {/* Restricting submission */}
          {canSubmit ? (
            <>
              <h2>Submit Your Assignment</h2>
              <form onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="file-upload">Upload your solution (PDF, DOCX, etc.):</label>
                  <input
                    type="file"
                    id="file-upload"
                    name="attachments"
                    onChange={handleFileChange}
                    accept=".pdf, .docx, .txt"
                    required
                  />
                </div>
                <button type="submit">Submit Assignment</button>
              </form>

              {submissionSuccess && <p>Your submission was successful!</p>}
            </>
          ) : (
            <p>You have already submitted this assignment.</p>
          )}

          {assignmentDetails.attachments && assignmentDetails.attachments.length > 0 && (
            <div style={{ marginTop: '20px' }}>
              <h3>Attachments:</h3>
              <ul>
                {assignmentDetails.attachments.map((attachment, index) => (
                  <li key={index}>
                    <a
                      href={attachment.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ textDecoration: 'none', color: '#007bff' }}
                    >
                      {attachment.file_name.split('/').pop()} {/* Extract just the file name */}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AssignmentPage;
