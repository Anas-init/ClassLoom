import React, { useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Stack,
  IconButton,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Snackbar,
  Alert,
  AlertTitle,
  Tooltip
} from "@mui/material";

import AttachmentIcon from "@mui/icons-material/Attachment";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddCircleIcon from '@mui/icons-material/AddCircle';
import AttachFileIcon from '@mui/icons-material/AttachFile';

import Comments from './Comments';

const Announcements = ({ announcements, class_id }) => {
  const accessToken = localStorage.getItem('accessToken');
  const decodedToken = jwtDecode(accessToken);
  const isTeacher = decodedToken.role === 'teacher';
  const userId = decodedToken.user_id;

  // NEW
  const [openAnnouncementModal, setOpenAnnouncementModal] = useState(false);
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementDescription, setAnnouncementDescription] = useState("");
  const [announcementSnackbar, setAnnouncementSnackbar] = useState({ open: false, message: '', severity: '' });
  const toggleAnnoucementModal = () => setOpenAnnouncementModal(!openAnnouncementModal);
  const [announcementAttachments, setAnnouncementAttachments] = useState([]);

  const handleAnnouncementFileChange = (e) => {
    const files = e.target.files;
    setAnnouncementAttachments([...announcementAttachments, ...Array.from(files)]);
  };

  const handleRemoveAnnoucementAttachment = (index) => {
    const newAttachments = announcementAttachments.filter((_, i) => i !== index);
    setAnnouncementAttachments(newAttachments);
  };

  const handleAnnouncementSnackbarClose = () => {
    setAnnouncementSnackbar((prev) => ({ ...prev, open: false }));
  };


  // Fetch updated announcements when component mounts or after a create/delete
  // const fetchAnnouncements = async () => {
  //   try {
  //     const response = await axios.get(`http://127.0.0.1:8000/api/all-announcement/?class_id=${class_id}`, {
  //       headers: {
  //         Authorization: `Bearer ${accessToken}`,
  //       },
  //     });
  //     //console.log(response.data);
  //     setAnnouncementList(response.data); 
  //   } catch (error) {
  //     console.error('Error fetching announcements:', error);
  //   }
  // };

  // useEffect(() => {
  //   // fetchAnnouncements(); // Fetch announcements on initial render and whenever class_id changes
  // }, [class_id]); // Only run when class_id changes

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append('description', announcementDescription);
      formData.append('class_card', class_id);
      formData.append('creator', userId);
      if (announcementAttachments) formData.append('attachments', announcementAttachments);

      await axios.post('http://127.0.0.1:8000/api/create-announcement/', formData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      setOpenAnnouncementModal(false);
      setAnnouncementSnackbar({
        open: true,
        message: 'Annoucement created successfully!',
        severity: 'success',
      });
      // fetchAnnouncements(); // Refresh announcements after create
    } catch (error) {
      // handle inputs
      setAnnouncementSnackbar({
        open: true,
        message: 'Error Creating Annoucement: ' + {error},
        severity: 'error',
      });
    }
  };

  const handleDeleteAnnouncement = async (announcementId) => {
    try {
      await axios.delete(
        `http://127.0.0.1:8000/api/delete-announcement/?announcement_id=${announcementId}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      // fetchAnnouncements(); // Refresh announcements after delete
    } catch (error) {
      console.error('Error deleting announcement:', error);
    }
  };

  return (
    <Box sx={{ px: 3, py: 2 }}>
      {/* Title and Create Announcement Button */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', flexGrow: 1 }}>
          Announcements
        </Typography>
        <IconButton color='primary' size='large'
          onClick={toggleAnnoucementModal}
        >
          <Tooltip title="Create Annoucement">
            <AddCircleIcon fontSize='inherit' />
          </Tooltip>
        </IconButton>
      </Box>

      {announcements.length > 0 ? (
        <Stack spacing={3}>
          {announcements.map((announcement) => (
            <Card
              key={announcement.id}
              sx={{
                color: "white",
                borderRadius: 2,
                boxShadow: 3,
                "&:hover": {
                  boxShadow: 6,
                },
              }}
            >
              <CardContent sx={{ position: "relative" }}>
                <Box
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 16,
                    display: "flex",
                    gap: 1,
                  }}
                >
                  {announcement.is_edited && (
                    <Box
                      sx={{
                        bgcolor: "rgba(255, 255, 255, 0.1)",
                        color: "rgba(255, 255, 255, 0.7)",
                        px: 1.5,
                        py: 0.5,
                        borderRadius: "12px",
                        fontSize: "0.75rem",
                        fontStyle: "italic",
                      }}
                    >
                      Edited
                    </Box>
                  )}
                  <Box
                    sx={{
                      bgcolor: "rgba(255, 255, 255, 0.1)",
                      color: "rgba(255, 255, 255, 0.7)",
                      px: 1.5,
                      py: 0.5,
                      borderRadius: "12px",
                      fontSize: "0.75rem",
                    }}
                  >
                    {new Date(announcement.created_at).toLocaleString()}
                  </Box>
                </Box>
                <Typography variant='h5' sx={{ mt: 1 }}>
                  {announcement.title}
                </Typography>
                <Typography variant='h6' sx={{ mt: 1 }}>
                  {announcement.description}
                </Typography>

                {announcement.attachments?.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    {announcement.attachments.map((attachment, index) => (
                      <Button
                        key={index}
                        variant="outlined"
                        startIcon={<AttachmentIcon />}
                        sx={{
                          mr: 1,
                          mb: 1,
                        }}
                        onClick={() => console.log("file open")}
                      >
                        {attachment.file_name || "View Attachment"}
                      </Button>
                    ))}
                  </Box>
                )}
              </CardContent>

              <Divider sx={{ mb: 1 }} />
              <Comments
                itemType="announcement"
                itemId={announcement.id}
              />
              {isTeacher && (
                <CardActions sx={{ justifyContent: "space-between" }}>
                  <Stack direction="row" spacing={1}>
                    <IconButton
                      color="inherit"
                      onClick={() => console.log("Edit announcement")}
                      sx={{
                        color: "#57A6A1",
                        "&:hover": { bgcolor: "rgba(87, 166, 161, 0.1)" },
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="inherit"
                      onClick={() =>
                        handleDeleteAnnouncement(announcement.id)
                      }
                      sx={{
                        color: "#ff5252",
                        "&:hover": { bgcolor: "rgba(255, 82, 82, 0.1)" },
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Stack>
                </CardActions>
              )}
            </Card>
          ))}
        </Stack>
      ) : (
        <Typography
          variant="body1"
          sx={{
            textAlign: "center",
            color: "#999",
            mt: 4,
          }}
        >
          No announcements available.
        </Typography>
      )}

      {/* Modal for creating an announcement */}
      <Dialog open={openAnnouncementModal} onClose={toggleAnnoucementModal}>
        <DialogTitle>Create New Announcement</DialogTitle>

        <DialogContent>
          <TextField
            label="Title"
            value={announcementTitle}
            onChange={(e) => setAnnouncementTitle(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
            variant="outlined"
          />
          <TextField
            label="Description"
            value={announcementDescription}
            onChange={(e) => setAnnouncementDescription(e.target.value)}
            fullWidth
            multiline
            rows={4}
            variant="outlined"
          />
          {/* Attachments Section */}
          <Box sx={{ mb: 2 }}>
            <input
              type="file"
              multiple
              onChange={handleAnnouncementFileChange}
              style={{ display: 'none' }}
              id="file-input"
            />
            <label htmlFor="file-input">
              <Button
                sx={{ mt: 2 }}
                variant="outlined"
                color="primary"
                component="span"
                startIcon={<AttachFileIcon />}
              >
                Attach Files
              </Button>
            </label>

            {announcementAttachments.length > 0 && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="subtitle2">Attached Files:</Typography>
                <ul style={{ paddingLeft: '20px' }}>
                  {announcementAttachments.map((file, index) => (
                    <li key={index}>
                      <span>{file.name}</span>
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveAnnoucementAttachment(index)}
                        sx={{ ml: 1 }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </li>
                  ))}
                </ul>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={toggleAnnoucementModal} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleCreateAnnouncement} color="primary">
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for Notifications */}
      <Snackbar
        open={announcementSnackbar.open}
        autoHideDuration={3000}
        onClose={handleAnnouncementSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert
          onClose={handleAnnouncementSnackbarClose}
          variant='filled'
          severity={announcementSnackbar.severity}
          sx={{
            width: '100%',
            color: '#ffffff'
          }}
        >
          <AlertTitle>
            {announcementSnackbar.severity === 'success' && 'Success'}
            {announcementSnackbar.severity === 'error' && 'Error'}
          </AlertTitle>
          {announcementSnackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Announcements;
