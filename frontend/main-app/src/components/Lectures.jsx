import React, { useState } from "react";
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

import Comments from "./Comments";

const Lectures = ({ lectures, class_id }) => {
  const [openLectureModal, setOpenLectureModal] = useState(false);
  const [lectureTitle, setLectureTitle] = useState("");
  const [lectureDescription, setLectureDescription] = useState("");
  const [lectureSnackbar, setLectureSnackbar] = useState({ open: false, message: '', severity: '' });

  const toggleLectureModal = () => setOpenLectureModal(!openLectureModal);

  const handleCreateLecture = () => {
    try {

      // API Call here
      // const formData = new FormData();
      // formData.append('description', announcementDescription);
      // formData.append('class_card', class_id);
      // formData.append('creator', userId);
      // if (announcementAttachments) formData.append('attachments', announcementAttachments);

      // await axios.post('http://127.0.0.1:8000/api/create-announcement/', formData, {
      //   headers: {
      //     Authorization: `Bearer ${accessToken}`,
      //     'Content-Type': 'multipart/form-data',
      //   },
      // });

      setOpenLectureModal(false);
      setLectureSnackbar({
        open: true,
        message: 'Lecture created successfully!',
        severity: 'success',
      });
    } catch (error) {
      setLectureSnackbar({
        open: true,
        message: 'Error Creating Lecture: ' + error,
        severity: 'error',
      });
    }
  };

  const [lectureAttachments, setLectureAttachments] = useState([]);

  const handleLectureFileChange = (e) => {
    const files = e.target.files;
    setLectureAttachments([...lectureAttachments, ...Array.from(files)]);
  };

  const handleRemoveLectureAttachment = (index) => {
    const newAttachments = lectureAttachments.filter((_, i) => i !== index);
    setLectureAttachments(newAttachments);
  };

  const handleLectureSnackbarClose = () => {
    setLectureSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <Box sx={{ px: 3, py: 2 }}>
      {/* Title and Create Announcement Button */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', flexGrow: 1 }}>
          Lectures
        </Typography>
        <IconButton color='primary' size='large'
          onClick={toggleLectureModal}
        >
          <Tooltip title="Create Lecture">
            <AddCircleIcon fontSize='inherit' />
          </Tooltip>
        </IconButton>
      </Box>

      {lectures.length > 0 ? (
        <Stack spacing={3}>
          {lectures.map((lecture) => (
            <Card
              key={lecture.id}
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
                  {lecture.is_edited && (
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
                    {new Date(lecture.created_at).toLocaleString()}
                  </Box>
                </Box>
                <Typography variant='h5' sx={{ mt: 1 }}>
                  {lecture.title}
                </Typography>
                <Typography variant='h6' sx={{ mt: 1 }}>
                  {lecture.description}
                </Typography>

                {lecture.attachments?.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    {lecture.attachments.map((attachment, index) => (
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
                itemType="lecture"
                itemId={lecture.id}
              />

              <CardActions sx={{ justifyContent: "space-between" }}>
                <Stack direction="row" spacing={1}>
                  <IconButton
                    color="inherit"
                    onClick={() => console.log("Edit lecture")}
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
                      console.log("Delete lecture: " + lecture.id)
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
          No lectures available.
        </Typography>
      )}

      {/* Modal for creating an announcement */}
      <Dialog open={openLectureModal} onClose={toggleLectureModal}>
        <DialogTitle>Create New Lecture</DialogTitle>
        <DialogContent>
          <TextField
            label="Title"
            value={lectureTitle}
            onChange={(e) => setLectureTitle(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
            variant="outlined"
          />
          <TextField
            label="Description"
            value={lectureDescription}
            onChange={(e) => setLectureDescription(e.target.value)}
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
              onChange={handleLectureFileChange}
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

            {lectureAttachments.length > 0 && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="subtitle2">Attached Files:</Typography>
                <ul style={{ paddingLeft: '20px' }}>
                  {lectureAttachments.map((file, index) => (
                    <li key={index}>
                      <span>{file.name}</span>
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveLectureAttachment(index)}
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
          <Button onClick={toggleLectureModal} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleCreateLecture} color="primary">
            Create
          </Button>
        </DialogActions>
      </Dialog>
      {/* Snackbar for Notifications */}
      <Snackbar
        open={lectureSnackbar.open}
        autoHideDuration={3000}
        onClose={handleLectureSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert
          onClose={handleLectureSnackbarClose}
          variant='filled'
          severity={lectureSnackbar.severity}
          sx={{
            width: '100%',
            color: '#ffffff'
          }}
        >
          <AlertTitle>
            {lectureSnackbar.severity === 'success' && 'Success'}
            {lectureSnackbar.severity === 'error' && 'Error'}
          </AlertTitle>
          {lectureSnackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Lectures;
