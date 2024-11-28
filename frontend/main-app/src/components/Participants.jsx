import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const Participants = ({ class_id }) => {
  const [participants, setParticipants] = useState(null);
  const [error, setError] = useState(null);
  const [isRemoving, setIsRemoving] = useState(false);

  const accessToken = localStorage.getItem('accessToken');
  const decodedToken = jwtDecode(accessToken);
  const isTeacher = decodedToken.role;

  const fetchParticipants = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
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

  const handleRemoveStudent = async (studentId) => {
    if (!window.confirm('Are you sure you want to remove this student?')) {
      return; // Abort if the user cancels
    }

    setIsRemoving(true);
    try {
      const accessToken = localStorage.getItem('accessToken');
      const payload = {
        ids: [studentId], // Pass the student's ID in an array
        class_id: class_id,
      };

      const response = await axios.delete(
        'http://127.0.0.1:8000/api/remove-students/',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          data: payload, // Pass payload in the 'data' property
        }
      );    

      // Refresh participants list after successful removal
      await fetchParticipants();
    } catch (err) {
      console.error('Error removing student:', err);
      alert('Failed to remove the student. Please try again.');
    } finally {
      setIsRemoving(false);
    }
  };

  useEffect(() => {
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
                key={student.student_id}
                style={{
                  marginBottom: '10px',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  backgroundColor: '#f1f1f1',
                }}
              >
                <p>
                  <strong>Name:</strong> {student.student_name}
                </p>
                <p>
                  <strong>Email:</strong> {student.student_email}
                </p>
                { isTeacher && (<button
                    onClick={() => handleRemoveStudent(student.student_id)}
                    disabled={isRemoving}
                    style={{
                      marginTop: '10px',
                      padding: '8px',
                      backgroundColor: isRemoving ? '#ccc' : '#f44336',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: isRemoving ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {isRemoving ? 'Removing...' : 'Remove Student'}
                  </button>
                )}
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
