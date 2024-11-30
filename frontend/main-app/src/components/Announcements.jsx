import React, { useState, useEffect } from 'react';
import Comments from './Comments';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import '../ClassPage.css'; // Add custom CSS file for glossy design and styling

const Announcements = ({ class_id }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [createError, setCreateError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [announcementList, setAnnouncementList] = useState([]); // Initialize as empty array

  const accessToken = localStorage.getItem('accessToken');
  const decodedToken = jwtDecode(accessToken);
  const isTeacher = decodedToken.role === 'teacher';
  const userId = decodedToken.user_id;

  // Fetch updated announcements when component mounts or after a create/delete
  const fetchAnnouncements = async () => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/all-announcement/?class_id=${class_id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      //console.log(response.data);
      setAnnouncementList(response.data); 
    } catch (error) {
      console.error('Error fetching announcements:', error);
    }
  };

  useEffect(() => {
    fetchAnnouncements(); // Fetch announcements on initial render and whenever class_id changes
  }, [class_id]); // Only run when class_id changes

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setCreateError(null);

    try {
      const formData = new FormData();
      formData.append('description', newAnnouncement);
      formData.append('class_card', class_id);
      formData.append('creator', userId);
      if (attachment) formData.append('attachments', attachment);

      await axios.post('http://127.0.0.1:8000/api/create-announcement/', formData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      setNewAnnouncement('');
      setAttachment(null);
      setIsCreating(false);
      fetchAnnouncements(); // Refresh announcements after create
    } catch (error) {
      setCreateError('Failed to create announcement. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e) => {
    setAttachment(e.target.files[0]);
  };

  const handleDeleteAnnouncement = async (announcementId) => {
    try {
      setIsLoading(true);
      await axios.delete(
        `http://127.0.0.1:8000/api/delete-announcement/?announcement_id=${announcementId}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      fetchAnnouncements(); // Refresh announcements after delete
    } catch (error) {
      console.error('Error deleting announcement:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const openFilePreview = (file) => {
    setPreviewFile(file);
  };

  const closeFilePreview = () => {
    setPreviewFile(null);
  };

  return (
    <div className="announcements-container">
      <h2 className="header">Announcements</h2>
      {isLoading && <div className="loading-bar"></div>} {/* Loader */}
      {announcementList.length ? (
        announcementList.map((announcement) => (
          <div key={announcement.id} className="announcement-card">
            <p>
              <strong>Description:</strong> {announcement.description}
            </p>
            <p>
              <strong>Created At:</strong>{' '}
              {new Date(announcement.created_at).toLocaleString()}
            </p>
            {announcement.is_edited && <p>(Edited)</p>}
            {announcement.attachments?.map((attachment, index) => (
              <button
                key={index}
                className="preview-button"
                onClick={() => openFilePreview(attachment.file_url)}
              >
                {attachment.file_name || 'View Attachment'}
              </button>
            ))}
            <Comments itemType="announcement" itemId={announcement.id} />
            {isTeacher && (
              <button
                onClick={() => handleDeleteAnnouncement(announcement.id)}
                className="delete-button"
              >
                Delete Announcement
              </button>
            )}
          </div>
        ))
      ) : (
        <p className="no-announcements">No announcements available.</p>
      )}

      {isTeacher && (
        <div className="create-announcement">
          <button className="create-button" onClick={() => setIsCreating(true)}>
            Create Announcement
          </button>
          {isCreating && (
            <div className="modal-overlay">
              <div className="modal">
                <h2>Create Announcement</h2>
                <form onSubmit={handleCreateAnnouncement}>
                  <textarea
                    value={newAnnouncement}
                    onChange={(e) => setNewAnnouncement(e.target.value)}
                    placeholder="Enter announcement content"
                    className="input-textarea"
                    required
                  />
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="file-input"
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`submit-button ${isSubmitting ? 'disabled' : ''}`}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit'}
                  </button>
                </form>
                <button
                  className="cancel-button"
                  onClick={() => setIsCreating(false)}
                >
                  Cancel
                </button>
                {createError && <p className="error-message">{createError}</p>}
              </div>
            </div>
          )}
        </div>
      )}

      {previewFile && (
        <div className="file-preview-overlay" onClick={closeFilePreview}>
          <div className="file-preview">
            <iframe
              src={previewFile}
              frameBorder="0"
              className="preview-iframe"
              title="File Preview"
            ></iframe>
          </div>
        </div>
      )}
    </div>
  );
};

export default Announcements;
