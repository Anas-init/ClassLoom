import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Participants = ({ class_id }) => {
  const [participants, setParticipants] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken'); // Replace with your key
        const response = await axios.get(
          `http://127.0.0.1:8000/api/all-students/?class_id=${class_id}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        setParticipants(response.data);
      } catch (err) {
        console.error('Error fetching participants:', err);
        setError('Failed to load participants.');
      }
    };

    fetchParticipants();
  }, [class_id]);

  if (error) {
    return <p>{error}</p>;
  }

  if (!participants) {
    return <p>Loading participants...</p>;
  }

  return (
    <div style={{ marginTop: '20px' }}>
      {/* Class Creator */}
      <div
        style={{
          marginBottom: '20px',
          padding: '10px',
          border: '1px solid #ddd',
          borderRadius: '8px',
          backgroundColor: '#f9f9f9',
        }}
      >
        <h3>Class Creator</h3>
        <p>
          <strong>Name:</strong> {participants.creator.creator_name}
        </p>
        <p>
          <strong>Email:</strong> {participants.creator.creator_email}
        </p>
      </div>

      {/* Students */}
      <div>
        <h3>Students</h3>
        {participants.students.length > 0 ? (
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            {participants.students.map((student) => (
              <li
                key={student.id}
                style={{
                  marginBottom: '10px',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  backgroundColor: '#f1f1f1',
                }}
              >
                <p>
                  <strong>Name:</strong> {student.name}
                </p>
                <p>
                  <strong>Email:</strong> {student.email}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No students enrolled yet.</p>
        )}
      </div>
    </div>
  );
};

export default Participants;
