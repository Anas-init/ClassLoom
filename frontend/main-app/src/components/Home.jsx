import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ClassCard from './ClassCard'; // Assumes ClassCard is a separate component for displaying class cards
import Modal from 'react-modal';
import { jwtDecode } from 'jwt-decode';

const Home = () => {
  const [classes, setClasses] = useState([]);
  const [className, setClassName] = useState('');
  const [classCode, setClassCode] = useState('');
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const accessToken = localStorage.getItem('accessToken');
  const decodedToken = jwtDecode(accessToken);
  const isTeacher = decodedToken.role;

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // Fetch Classes from API
  const fetchClasses = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const response = await axios.get('http://127.0.0.1:8000/api/classes/', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setClasses(response.data);
    } catch (err) {
      console.error('Error fetching classes:', err);
      setError('Failed to load classes.');
    }
  };

  // Join Class Handler
  const handleJoinClass = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.post(
        `http://127.0.0.1:8000/api/join-class/?class_code=${classCode}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMessage({ type: 'success', text: `Successfully joined class: ${response.data.class_name}` });
      fetchClasses(); // Refresh classes after joining
    } catch (err) {
      console.error('Error joining class:', err);
      setMessage({
        type: 'error',
        text: err.response?.data?.detail || 'Failed to join class. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
      setClassCode('');
      setIsModalOpen(false);
    }
  };

  const handleCreateClass = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await axios.post(
        'http://127.0.0.1:8000/api/create-class/',
        {
          class_name: className,
          class_code: classCode,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      console.log('Class created successfully:', response.data);
      alert('Class created successfully!');
      closeModal();
      fetchClasses();
    } catch (err) {
      console.error('Error creating class:', err);
      alert('Failed to create class. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  // Render Error
  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <h1>Welcome to Home</h1>

      {/* Display Classes */}
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
          marginTop: '20px',
        }}
      >
        Join Class
      </button>
      {isTeacher && (
        <button
          onClick={openModal}
          style={{
            padding: '10px 20px',
            backgroundColor: '#28a745',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Create Class
        </button>
      )}

      {/* Modal for Joining Class */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        contentLabel="Join Class"
        style={{
          content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            padding: '20px',
            borderRadius: '8px',
            width: '400px',
          },
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          },
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
      </Modal>
      {/* Modal for Creating Class */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Create Class"
        style={{
          content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            padding: '20px',
            borderRadius: '8px',
          },
        }}
      >
        <h2>Create a New Class</h2>
        <form onSubmit={handleCreateClass}>
          <div>
            <label>
              Class Name:
              <input
                type="text"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                required
                style={{ marginLeft: '10px', padding: '5px', width: '100%' }}
              />
            </label>
          </div>
          <div>
            <label>
              Class Code:
              <input
                type="text"
                value={classCode}
                onChange={(e) => setClassCode(e.target.value)}
                required
                style={{ marginLeft: '10px', padding: '5px', width: '100%' }}
              />
            </label>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              padding: '10px 20px',
              backgroundColor: isSubmitting ? '#ccc' : '#007bff',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              marginTop: '10px',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
            }}
          >
            {isSubmitting ? 'Creating...' : 'Create Class'}
          </button>
          <button
            type="button"
            onClick={closeModal}
            style={{
              padding: '10px 20px',
              backgroundColor: '#dc3545',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              marginTop: '10px',
              marginLeft: '10px',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        </form>
      </Modal>

      {/* Display Messages */}
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
