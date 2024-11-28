import React, { useState } from 'react';
import Comments from './Comments';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const Announcements = ({ announcements, class_id, refreshStream }) => {
  const [isCreating, setIsCreating] = useState(false); // To track modal state
  const [newAnnouncement, setNewAnnouncement] = useState('');
  const [createError, setCreateError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const accessToken = localStorage.getItem('accessToken');
  const decodedToken = jwtDecode(accessToken);
  const isTeacher = decodedToken.role;

  // Handle Create Announcement
  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setCreateError(null);

    try {
      const creatorId = decodedToken.user_id; // Assuming the decoded token has the user ID
      const payload = {
        description: newAnnouncement,
        class_card: class_id,
        creator: creatorId,
        attachments: null, // Leave empty or implement file attachment functionality later
      };

      await axios.post(
        'http://127.0.0.1:8000/api/create-announcement/',
        payload,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      setNewAnnouncement(''); // Clear the input field
      setIsCreating(false); // Close the modal
      refreshStream(); // Refresh the announcements after creation
    } catch (error) {
      console.error('Error creating announcement:', error);
      setCreateError('Failed to create announcement. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h2>Announcements</h2>
      {/* Render Announcements */}
      {announcements.length ? (
        announcements.map((announcement) => (
          <div key={announcement.id} style={{ marginBottom: '16px' }}>
            <p><strong>Description:</strong> {announcement.description}</p>
            <p><strong>Created At:</strong> {new Date(announcement.created_at).toLocaleString()}</p>
            {announcement.is_edited && <p>(Edited)</p>}
            {announcement.attachments.map((attachment, index) => (
              <a key={index} href={attachment.file_url} target="_blank" rel="noopener noreferrer">
                {attachment.file_name || 'View Attachment'}
              </a>
            ))}
            <Comments itemType="announcement" itemId={announcement.id} />
          </div>
        ))
      ) : (
        <p>No announcements available.</p>
      )}

      {/* Create Announcement (Visible only to teachers) */}
      {isTeacher && (
        <div style={{ marginTop: '20px' }}>
          <button
            onClick={() => setIsCreating(true)}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            Create Announcement
          </button>

          {/* Modal for Creating Announcement */}
          {isCreating && (
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
                <h2>Create Announcement</h2>
                <form onSubmit={handleCreateAnnouncement}>
                  <textarea
                    value={newAnnouncement}
                    onChange={(e) => setNewAnnouncement(e.target.value)}
                    placeholder="Enter announcement content"
                    style={{
                      width: '100%',
                      height: '100px',
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
                    {isSubmitting ? 'Submitting...' : 'Submit'}
                  </button>
                </form>
                <button
                  onClick={() => setIsCreating(false)}
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
                {createError && <p style={{ color: 'red', marginTop: '10px' }}>{createError}</p>}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Announcements;
