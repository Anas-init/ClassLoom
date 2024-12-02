import React, { useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

import { Link } from 'react-router-dom';
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
  Tooltip,
} from "@mui/material";

import AttachmentIcon from "@mui/icons-material/Attachment";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddCircleIcon from '@mui/icons-material/AddCircle';
import AttachFileIcon from '@mui/icons-material/AttachFile';

import Comments from './Comments';

const Assignments = ({ assignments, class_id }) => {
  const accessToken = localStorage.getItem('accessToken');
  const decodedToken = jwtDecode(accessToken);
  const isTeacher = decodedToken.role;
  const creator_id = decodedToken.user_id;

  const [openAssignmentModal, setOpenAssignmentModal] = useState(false);
  const [assignmentTitle, setAssignmentTitle] = useState("");
  const [assignmentDescription, setAssignmentDescription] = useState("");
  const [assignmentDueDate, setAssignmentDueDate] = useState('');
  const [assignmentGrade, setAssignmentGrade] = useState('');
  const [assignmentSnackbar, setAssignmentSnackbar] = useState({ open: false, message: '', severity: '' });
  const [assignmentAttachments, setAssignmentAttachments] = useState([]);

  const toggleAssignmentModal = () => setOpenAssignmentModal(!openAssignmentModal);

  const handleCreateAssignment = async () => {
    if (!assignmentTitle || !assignmentDescription || !assignmentDueDate ||
      !assignmentDescription || !assignmentGrade || !assignmentAttachments) {
      alert('Please fill in all fields');
      return;
    }

    const formData = new FormData();
    formData.append('title', assignmentTitle);
    formData.append('description', assignmentDescription);
    formData.append('due_date', assignmentDueDate);
    formData.append('class_card', parseInt(class_id));
    formData.append('creator', parseInt(creator_id));
    formData.append('grade', assignmentGrade);
    for (let i = 0; i < assignmentAttachments.length; i++) {
      formData.append('attachments', assignmentAttachments[i]);
    }

    try {
      await axios.post('http://127.0.0.1:8000/api/create-assignment/', formData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setOpenAssignmentModal(false);
      setAssignmentSnackbar({
        open: true,
        message: 'Assignment created successfully!',
        severity: 'success',
      });
      // Modulize fetching annoucements, lectures and assignments
      window.location.href = `/class/` + class_id;

    } catch (error) {
      setAssignmentSnackbar({
        open: true,
        message: 'Error Creating Assignment' + error,
        severity: 'error',
      });
    }
  };

  const handleDeleteAssignment = async (assignmentId) => {
    try {
      await axios.delete(
        `http://127.0.0.1:8000/api/delete-assignment/?assignment_id=${assignmentId}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      setAssignmentSnackbar({
        open: true,
        message: 'Assignment deleted successfully!',
        severity: 'success',
      });
    } catch (error) {
      setAssignmentSnackbar({
        open: true,
        message: 'Error deleting Assignment: ' + error,
        severity: 'error',
      });
    }
  };

  const handleAssignmentFileChange = (e) => {
    const files = e.target.files;
    setAssignmentAttachments([...assignmentAttachments, ...Array.from(files)]);
  };

  const handleRemoveAssignmentAttachment = (index) => {
    const newAttachments = assignmentAttachments.filter((_, i) => i !== index);
    setAssignmentAttachments(newAttachments);
  };

  const handleAssignmentSnackbarClose = () => {
    setAssignmentSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <Box sx={{ px: 3, py: 2 }}>
      {/* Title and Create Announcement Button */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', flexGrow: 1 }}>
          Assignments
        </Typography>
        <IconButton color='primary' size='large'
          onClick={toggleAssignmentModal}
        >
          <Tooltip title="Create Assignment">
            <AddCircleIcon fontSize='inherit' />
          </Tooltip>
        </IconButton>
      </Box>

      {assignments.length > 0 ? (
        <Stack spacing={3}>
          {assignments.map((assignment) => (
            <Card
              key={assignment.id}
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
                <Typography
                  variant="h5"
                  component={Link}
                  to={`/assignment/${assignment.id}`}
                  sx={{
                    textDecoration: 'none',
                    color: 'inherit',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    mt: 1,
                    '&:hover': {
                      textDecoration: 'underline',
                    }
                  }}
                >
                  {assignment.title}
                </Typography>

                <Typography variant='h6' sx={{ mt: 1 }}>
                  {assignment.description}
                </Typography>
                {assignment.attachments?.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    {assignment.attachments.map((attachment, index) => (
                      <Button
                        key={index}
                        variant="outlined"
                        startIcon={<AttachmentIcon />}
                        sx={{
                          mr: 1,
                          mb: 1,
                        }}
                        component="a"
                        href={attachment.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {attachment.file_name || "View Attachment"}
                      </Button>
                    ))}
                  </Box>
                )}
              </CardContent>

              <Divider sx={{ mb: 1 }} />
              <Comments
                itemType="assignment"
                itemId={assignment.id}
              />

              {isTeacher && (
                <CardActions sx={{ justifyContent: "space-between" }}>
                  <Stack direction="row" spacing={1}>
                    <IconButton
                      color="inherit"
                      onClick={() => console.log("Edit assignment")}
                      sx={{
                        color: "#57A6A1",
                        "&:hover": { bgcolor: "rgba(87, 166, 161, 0.1)" },
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="inherit"
                      onClick={() => handleDeleteAssignment(assignment.id)}
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
          No assignments available.
        </Typography>
      )}

      {/* Modal for creating an announcement */}
      <Dialog open={openAssignmentModal} onClose={toggleAssignmentModal}>
        <DialogTitle>Create New Assignment</DialogTitle>
        <DialogContent>
          <TextField
            label="Title"
            value={assignmentTitle}
            onChange={(e) => setAssignmentTitle(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
            variant="outlined"
          />
          <TextField
            label="Description"
            value={assignmentDescription}
            onChange={(e) => setAssignmentDescription(e.target.value)}
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            sx={{ mb: 2 }}
          />
          <TextField
            label="Assignment Grade"
            value={assignmentGrade}
            onChange={(e) => setAssignmentGrade(e.target.value)}
            fullWidth
            type="number"
            variant="outlined"
            sx={{ mb: 2 }}
          />
          <TextField
            label="Due Date"
            value={assignmentDueDate}
            onChange={(e) => setAssignmentDueDate(e.target.value)}
            fullWidth
            type="date"
            variant="outlined"
            sx={{ mb: 2 }}
          />
          {/* Attachments Section */}
          <Box sx={{ mb: 2 }}>
            <input
              type="file"
              multiple
              onChange={handleAssignmentFileChange}
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

            {assignmentAttachments.length > 0 && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="subtitle2">Attached Files:</Typography>
                <ul style={{ paddingLeft: '20px' }}>
                  {assignmentAttachments.map((file, index) => (
                    <li key={index}>
                      <span>{file.name}</span>
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveAssignmentAttachment(index)}
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
          <Button onClick={toggleAssignmentModal} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleCreateAssignment} color="primary">
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for Notifications */}
      <Snackbar
        open={assignmentSnackbar.open}
        autoHideDuration={3000}
        onClose={handleAssignmentSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert
          onClose={handleAssignmentSnackbarClose}
          variant='filled'
          severity={assignmentSnackbar.severity}
          sx={{
            width: '100%',
            color: '#ffffff'
          }}
        >
          <AlertTitle>
            {assignmentSnackbar.severity === 'success' && 'Success'}
            {assignmentSnackbar.severity === 'error' && 'Error'}
          </AlertTitle>
          {assignmentSnackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Assignments;