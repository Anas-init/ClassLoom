import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ClassCard from './ClassCard';

const Home = () => {
  const [classes, setClasses] = useState([]);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [classCode, setClassCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        const response = await axios.get(
          'http://127.0.0.1:8000/api/classes/',
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        setClasses(response.data);
        
      } catch (err) {
        console.error("Error fetching classes:", err);
        setError("Failed to load classes.");
      }
    };

    fetchClasses();
  }, []);

  const handleJoinClass = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.post(
        `http://127.0.0.1:8000/api/join-class/?class_code=${classCode}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage({ type: 'success', text: `Successfully joined class: ${response.data.class_name}` });
    } catch (error) {
      console.error('Error joining class:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.detail || 'Failed to join class. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
      setClassCode('');
    }
  };

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <h1>Welcome to Home</h1>
      <ClassCard classes={classes} />

      {/* Join Class Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        style={{
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
        }}
      >
        Join Class
      </button>

      {/* Modal */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              maxWidth: '400px',
              width: '100%',
            }}
          >
            <h2>Join a Class</h2>
            <form onSubmit={handleJoinClass}>
              <input
                type="text"
                value={classCode}
                onChange={(e) => setClassCode(e.target.value)}
                placeholder="Enter class code"
                style={{
                  width: '100%',
                  padding: '10px',
                  marginBottom: '10px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                }}
                required
              />
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  padding: '10px',
                  backgroundColor: isSubmitting ? '#ccc' : '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  width: '100%',
                }}
              >
                {isSubmitting ? 'Joining...' : 'Join Class'}
              </button>
            </form>
            <button
              onClick={() => setIsModalOpen(false)}
              style={{
                marginTop: '10px',
                padding: '10px',
                backgroundColor: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                width: '100%',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Message Display */}
      {message && (
        <div
          style={{
            marginTop: '20px',
            padding: '10px',
            backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
            color: message.type === 'success' ? '#155724' : '#721c24',
            border: `1px solid ${message.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
            borderRadius: '5px',
          }}
        >
          {message.text}
        </div>
      )}
    </div>
  );
};

export default Home;
