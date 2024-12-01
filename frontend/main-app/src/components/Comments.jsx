import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

import {
  Box,
  Card,
  Typography,
  TextField,
  Button,
  IconButton,
  Tooltip
} from "@mui/material";

import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SendIcon from "@mui/icons-material/Send";

const Comments = ({ itemType, itemId }) => {
  const [comments, setComments] = useState([]);
  const [isCommentsVisible, setIsCommentsVisible] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  // Set up editing logic
  const [isEditing, setIsEditing] = useState(false);
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

  const toggleComments = () => setIsCommentsVisible((prev) => !prev);

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
  
      userId = getUserIdFromToken();
      const accessToken = localStorage.getItem('accessToken');
  
      const payload = {
        user: userId,
        description: newComment,
        [itemType]: itemId,
      };
  
      await axios.post('http://127.0.0.1:8000/api/create-comment/', payload, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
  
      setNewComment('');
      fetchComments();
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
    <Box sx={{ px: 2, pt: 1 }}>
        {/* Show Comments Button */}
        {comments.count > 1 && (
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<ChatBubbleOutlineIcon />}
            onClick={toggleComments}
            sx={{
              padding: "4px 12px",
              fontSize: "0.75rem",
              textTransform: "none",
              marginBottom: "8px",
              borderRadius: "8px",
              minWidth: "auto",
            }}
          >
            {comments.count} Comments
          </Button>

        )}

        {isCommentsVisible && comments.count > 0 && (
          <Box>
            <Box>
              {/* Map over comments */}
              {comments.comments.map((comment) => (
                <Card
                  key={comment.id}
                  sx={{
                    mb: 2,
                    borderRadius: "16px",
                    backgroundColor: "#2A2D3E", // Slightly faded dark background
                    color: "#FFFFFF",
                    padding: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  {/* Left Section: User Details & Comment */}
                  <Box sx={{ display: "flex", flexDirection: "column", flexGrow: 1 }}>
                    <Typography variant="subtitle2" sx={{ color: "#9CA3AF", mb: 1 }}>
                      <strong>User {comment.user}</strong> | {new Date(comment.created_at).toLocaleString()}
                    </Typography>
                    <Typography variant="body1" sx={{ wordBreak: "break-word" }}>
                      {comment.description}
                    </Typography>
                  </Box>

                  {/* Right Section: Action Buttons */}
                  <Box>
                    <Tooltip title="Edit Comment">
                      <IconButton
                        onClick={() => console.log("Edit comment: " + comment.id + " " + comment.description)}
                        sx={{ color: "#FFC107" }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Comment">
                      <IconButton
                        onClick={() => handleDeleteComment(comment.id, comment.user)}
                        sx={{ color: "#F44336" }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Card>
              ))}
            </Box>

            {/* Add Comment Section */}
            <Box onSubmit={handleAddComment} component="form" display="flex" alignItems="center" gap={1} mt={2}>
              <TextField
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                variant="outlined"
                size="small"
                sx={{
                  flexGrow: 1,
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#2A2D3E",
                    color: "white",
                    borderRadius: "24px",
                    paddingLeft: "12px",
                    "& fieldset": {
                      borderColor: "rgba(255, 255, 255, 0.3)",
                    },
                    "&:hover fieldset": {
                      borderColor: "rgba(255, 255, 255, 0.5)",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#57A6A1",
                    },
                  },
                }}
                inputProps={{
                  style: { color: "white", padding: "8px 0" },
                }}
              />
              <IconButton
                type="submit"
                disabled={isSubmitting}
                color="primary"
                sx={{
                  backgroundColor: "#57A6A1",
                  color: "white",
                  borderRadius: "50%",
                  "&:hover": {
                    backgroundColor: "#43968A",
                  },
                }}
              >
                <SendIcon />
              </IconButton>
            </Box>
          </Box>
        )}
      </Box>
  );  
};

export default Comments;
