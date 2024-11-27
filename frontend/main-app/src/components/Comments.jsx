import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const Comments = ({ itemType, itemId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [error, setError] = useState(null);
  const [isCommentsVisible, setIsCommentsVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState('');


  const getUserIdFromToken = () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) throw new Error('No access token found.');
      
      const decodedToken = jwtDecode(token);
      return decodedToken.user_id;
    } catch (error) {
      console.error('Failed to decode token:', error);
      return null;
    }
  };
  
  var userId = getUserIdFromToken();

  const toggleComments = () => {
    setIsCommentsVisible((prev) => !prev);
  };

  const fetchComments = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      let url = '';

      switch (itemType) {
        case 'announcement':
          url = `http://127.0.0.1:8000/api/all-comment/?announcement_id=${itemId}`;
          break;
        case 'lecture':
          url = `http://127.0.0.1:8000/api/all-comment/?lecture_id=${itemId}`;
          break;
        case 'assignment':
          url = `http://127.0.0.1:8000/api/all-comment/?assignment_id=${itemId}`;
          break;
        default:
          setError('Invalid item type.');
          return;
      }

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.data.count > 0) {
        setComments(response.data.comments);
      } else {
        setComments([]);
      }
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError('Failed to load comments.');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
  
    try {
      setIsSubmitting(true);
  
      // Decode the token to get user ID
      userId = getUserIdFromToken(); // Function to decode token and retrieve user_id
      const accessToken = localStorage.getItem('accessToken');
  
      // Create payload based on the API spec you provided
      const payload = {
        user: userId,
        description: newComment,
        [itemType]: itemId, // Dynamically sets "announcement", "lecture", or "assignment"
      };
  
      // Send POST request with payload
      await axios.post('http://127.0.0.1:8000/api/create-comment/', payload, {
        headers: {
          Authorization: `Bearer ${accessToken}`, // Add token in header
        },
      });
  
      setNewComment(''); // Clear the input after successful submission
      fetchComments(); // Refresh comments list
    } catch (err) {
      console.error('Error adding comment:', err);
      setError('Failed to add comment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId, commentUserId) => {
    // Get the user ID from the token
    userId = getUserIdFromToken();
  
    if (userId !== commentUserId) {
      alert("You are not authorized to delete this comment.");
      return;
    }
  
    try {
      const accessToken = localStorage.getItem('accessToken');
  
      // Make DELETE API call
      await axios.delete(`http://127.0.0.1:8000/api/delete-comment/?comment_id=${commentId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
  
      // Remove the deleted comment from the state
      setComments((prevComments) => prevComments.filter((comment) => comment.id !== commentId));
      alert("Comment deleted successfully.");
      fetchComments();
    } catch (err) {
      console.error("Error deleting comment:", err);
      alert("Failed to delete comment.");
    }
  };

  const handleEditComment = async (commentId, updatedDescription, resourceId, resourceType) => {
    const userId = getUserIdFromToken();
  
    // Check if the logged-in user is the comment owner
    const commentToEdit = comments.find((comment) => comment.id === commentId);
    if (userId !== commentToEdit.user) {
      alert("You are not authorized to edit this comment.");
      return;
    }
  
    try {
      const accessToken = localStorage.getItem('accessToken');
  
      // Build the payload dynamically based on the resource type
      const payload = {
        description: updatedDescription,
        [resourceType]: resourceId,
      };
  
      // Make PUT request to update the comment
      const response = await axios.put(
        `http://127.0.0.1:8000/api/update-comment/?comment_id=${commentId}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
  
      // Update the state with the edited comment
      setComments((prevComments) =>
        prevComments.map((comment) =>
          comment.id === commentId ? { ...comment, description: updatedDescription } : comment
        )
      );
      alert("Comment updated successfully.");
      fetchComments();
    } catch (err) {
      console.error("Error editing comment:", err);
      alert("Failed to update comment.");
    }
  };  

  useEffect(() => {
    if (isCommentsVisible) {
      fetchComments();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCommentsVisible]);

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div style={{ marginTop: '10px' }}>
      <button
        onClick={toggleComments}
        style={{
          padding: '6px 12px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        {isCommentsVisible ? 'Hide Comments' : 'View Comments'}
      </button>
  
      {isCommentsVisible && (
        <div style={{ marginTop: '10px' }}>
          {comments.length > 0 ? (
            comments.map((comment) => (
              <div
                key={comment.id}
                style={{
                  marginBottom: '8px',
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                }}
              >
                {editingCommentId === comment.id ? (
                  // Editing Comment UI
                  <div>
                    <textarea
                      value={editingCommentText}
                      onChange={(e) => setEditingCommentText(e.target.value)}
                      rows="2"
                      style={{
                        width: '100%',
                        padding: '8px',
                        marginBottom: '8px',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                      }}
                    ></textarea>
                    <button
                      onClick={() =>
                        handleEditComment(
                          comment.id,
                          editingCommentText,
                          comment.announcement || comment.lecture || comment.assignment,
                          comment.announcement
                            ? 'announcement'
                            : comment.lecture
                            ? 'lecture'
                            : 'assignment'
                        )
                      }
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        marginRight: '8px',
                        cursor: 'pointer',
                      }}
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingCommentId(null)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#f44336',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  // Displaying Comment UI
                  <div>
                    <p>
                      <strong>User {comment.user}</strong>: {comment.description}
                    </p>
                    <p style={{ fontSize: '12px', color: '#666' }}>
                      {new Date(comment.created_at).toLocaleString()}
                    </p>
                    {getUserIdFromToken() === comment.user && (
                      <div>
                        <button
                          onClick={() => {
                            setEditingCommentId(comment.id);
                            setEditingCommentText(comment.description);
                          }}
                          style={{
                            padding: '4px 8px',
                            backgroundColor: '#ffc107',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            marginRight: '8px',
                            cursor: 'pointer',
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteComment(comment.id, comment.user)}
                          style={{
                            padding: '4px 8px',
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          ) : (
            <p>No comments yet.</p>
          )}
  
          {/* Add Comment Form */}
          <form onSubmit={handleAddComment} style={{ marginTop: '16px' }}>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write your comment..."
              rows="3"
              style={{
                width: '100%',
                padding: '8px',
                marginBottom: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px',
              }}
              required
            ></textarea>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: '6px 12px',
                backgroundColor: isSubmitting ? '#ccc' : '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
              }}
            >
              {isSubmitting ? 'Adding...' : 'Add Comment'}
            </button>
          </form>
        </div>
      )}
    </div>
  );  
};

export default Comments;
