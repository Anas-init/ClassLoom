import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const SubmissionPage = () => {
  const { submission_id } = useParams();
  const [submissionDetails, setSubmissionDetails] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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

      const submissionData = response.data.Submission[0];
      setSubmissionDetails(submissionData);
    } catch (err) {
      console.error('Error fetching submission details:', err);
      setError('Failed to load submission details.');
    } finally {
      setIsLoading(false);
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
    </div>
  );
};

export default SubmissionPage;
