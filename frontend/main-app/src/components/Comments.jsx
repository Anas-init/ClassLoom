import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Comments = ({ itemType, itemId }) => {
  const [comments, setComments] = useState([]);
  const [error, setError] = useState(null);
  const [isCommentsVisible, setIsCommentsVisible] = useState(false);

  const toggleComments = () => {
    setIsCommentsVisible((prev) => !prev);
  };

  useEffect(() => {
    if (!isCommentsVisible) return;

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

        setComments(response.data);
      } catch (err) {
        console.error('Error fetching comments:', err);
        setError('Failed to load comments.');
      }
    };

    fetchComments();
  }, [isCommentsVisible, itemType, itemId]);

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div style={{ marginTop: '10px' }}>
      <button onClick={toggleComments} style={{ padding: '6px 12px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}>
        {isCommentsVisible ? 'Hide Comments' : 'View Comments'}
      </button>
      {isCommentsVisible && (
        <div style={{ marginTop: '10px' }}>
          {comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment.id} style={{ marginBottom: '8px', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}>
                <p><strong>{comment.author_name}</strong>: {comment.content}</p>
                <p style={{ fontSize: '12px', color: '#666' }}>{new Date(comment.created_at).toLocaleString()}</p>
              </div>
            ))
          ) : (
            <p>No comments yet.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Comments;
