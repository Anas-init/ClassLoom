import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const SubmissionPage = () => {
  const { submission_id } = useParams();
  const [submissionDetails, setSubmissionDetails] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [resultGrade, setResultGrade] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isGraded, setIsGraded] = useState(false);

  const fetchSubmissionDetails = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(
        `http://127.0.0.1:8000/api/retrieve-submission/?submission_id=${submission_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(response.data);
      const submissionData = response.data.Submission[0];
      setSubmissionDetails(submissionData);
    } catch (err) {
      console.error('Error fetching submission details:', err);
      setError('Failed to load submission details.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGradeSubmission = async (e) => {
    e.preventDefault();

    if (!resultGrade || !feedback) {
      alert('Please provide both a grade and feedback.');
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.post(
        `http://127.0.0.1:8000/api/check-assignment/?submission_id=${submission_id}`,
        {
          assignmentsubmission: submission_id, // Submission ID
          result_grade: resultGrade,
          feedback: feedback,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        alert('Assignment graded successfully!');
        setIsGraded(true);
      } else {
        setError('Failed to submit grade and feedback.');
      }
    } catch (err) {
      console.error('Error submitting grade:', err);
      setError('Error grading assignment. Please try again later.');
    }
  };

  useEffect(() => {
    fetchSubmissionDetails();
  }, [submission_id]);

  if (isLoading) return <p>Loading submission details...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div style={{ padding: '20px' }}>
      <h1>Submission Details</h1>
      <p>
        <strong>Submitted At:</strong>{' '}
        {new Date(submissionDetails.submitted_at).toLocaleString()}
      </p>

      {submissionDetails.attachments && submissionDetails.attachments.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h3>Attachments:</h3>
          <ul>
            {submissionDetails.attachments.map((attachment, index) => (
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

      {!isGraded && (
        <div style={{ marginTop: '30px' }}>
          <h2>Grade This Submission</h2>
          <form onSubmit={handleGradeSubmission}>
            <div>
              <label htmlFor="result_grade">Grade:</label>
              <input
                type="number"
                id="result_grade"
                name="result_grade"
                value={resultGrade}
                onChange={(e) => setResultGrade(e.target.value)}
                required
                min="0"
                max="100"
              />
            </div>
            <div style={{ marginTop: '10px' }}>
              <label htmlFor="feedback">Feedback:</label>
              <textarea
                id="feedback"
                name="feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                required
              />
            </div>
            <div style={{ marginTop: '10px' }}>
              <button type="submit">Submit Grade & Feedback</button>
            </div>
          </form>
        </div>
      )}

      {isGraded && (
        <div style={{ marginTop: '20px' }}>
          <h3>Graded</h3>
          <p><strong>Grade:</strong> {resultGrade}</p>
          <p><strong>Feedback:</strong> {feedback}</p>
        </div>
      )}
    </div>
  );
};

export default SubmissionPage;
