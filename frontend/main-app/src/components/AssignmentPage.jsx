import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const AssignmentPage = () => {
  const { assignment_id } = useParams();
  const [assignmentDetails, setAssignmentDetails] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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

        // The API returns assignment as an array, so we take the first object
        const assignmentData = response.data.assignment[0];
        setAssignmentDetails(assignmentData);
      } catch (err) {
        console.error('Error fetching assignment details:', err);
        setError('Failed to load assignment details.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssignmentDetails();
  }, [assignment_id]);

  if (isLoading) return <p>Loading assignment details...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div style={{ padding: '20px' }}>
      <h1>{assignmentDetails.title}</h1>
      <p><strong>Created By:</strong> {assignmentDetails.creator.name}</p>
      <p><strong>Created At:</strong> {new Date(assignmentDetails.created_at).toLocaleString()}</p>
      <p><strong>Due Date:</strong> {new Date(assignmentDetails.due_date).toLocaleString()}</p>
      <p><strong>Description:</strong></p>
      <p>{assignmentDetails.description}</p>
      <p><strong>Grade:</strong> {assignmentDetails.grade}</p>

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
    </div>
  );
};

export default AssignmentPage;
