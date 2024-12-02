import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

import {
  Avatar,
  Box,
  Card,
  CardContent,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Stack,
  Typography,
  Snackbar,
  Alert,
  AlertTitle
} from "@mui/material";

import PersonIcon from "@mui/icons-material/Person";
import SchoolIcon from "@mui/icons-material/School";
import EmailIcon from "@mui/icons-material/Email";
import DeleteIcon from "@mui/icons-material/Delete";

const Participants = ({ class_id }) => {
  const [participants, setParticipants] = useState(null);
  const [error, setError] = useState(null);

  const accessToken = localStorage.getItem('accessToken');
  const decodedToken = jwtDecode(accessToken);
  const isTeacher = decodedToken.role;

  const fetchParticipants = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const response = await axios.get(
        `http://127.0.0.1:8000/api/all-students/?class_id=${class_id}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setParticipants(response.data);
    } catch (err) {
      console.error('Error fetching participants:', err);
      setError('Failed to load participants.');
    }
  };

  const [participantSnackbar, setParticipantSnackbar] = useState({ open: false, message: '', severity: '' });

  const handleAssignmentSnackbarClose = () => {
    setParticipantSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleRemoveStudent = async (studentId) => {
    // Replace with a modal
    if (!window.confirm('Are you sure you want to remove this student?')) {
      return;
    }

    try {
      const accessToken = localStorage.getItem('accessToken');
      const payload = {
        ids: [studentId], // Pass the student's ID in an array
        class_id: class_id,
      };

      await axios.delete(
        'http://127.0.0.1:8000/api/remove-students/',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          data: payload, // Pass payload in the 'data' property
        }
      );

      // Refresh participants list after successful removal
      setParticipantSnackbar({
        open: true,
        message: 'Participant removed successfully!',
        severity: 'success',
      });
      await fetchParticipants();
    } catch (err) {
      setParticipantSnackbar({
        open: true,
        message: 'Error removing Participant/Student: ' + error,
        severity: 'error',
      });
    } finally {
    }
  };

  useEffect(() => {
    fetchParticipants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [class_id]);

  if (error) {
    return <p>{error}</p>;
  }

  if (!participants) {
    return <p>Loading participants...</p>;
  }

  return (
    <Box sx={{ px: 3, py: 2 }}>
      <Typography
        variant="h4"
        sx={{
          mb: 3,
          fontWeight: "bold",
          textAlign: "center",
          color: "rgba(255, 255, 255, 0.8)",
        }}
      >
        Participants for Class {class_id}
      </Typography>

      {/* Class Creator Card */}
      <Card
        sx={{
          mb: 3,
          p: 2,
          backgroundColor: "rgba(87, 166, 161, 0.1)",
          color: "rgba(255, 255, 255, 0.9)",
          borderRadius: 3,
          boxShadow: 3,
        }}
      >
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar sx={{ bgcolor: "#57A6A1", width: 56, height: 56 }}>
              <SchoolIcon fontSize="large" />
            </Avatar>
            <Box flexGrow={1}>
              <Typography variant="h5" fontWeight="bold">
                Class Creator
              </Typography>
              <Typography variant="subtitle1">
                {participants.creator.creator_name}
              </Typography>
              <Typography variant="subtitle1">
                {participants.creator.creator_email}
              </Typography>
            </Box>
            {/* Email Button */}
            <IconButton
              aria-label="email class creator"
              sx={{
                bgcolor: "#57A6A1",
                color: "white",
                "&:hover": { bgcolor: "#459d8d" },
              }}
              onClick={() =>
                window.location.href = `mailto:${participants.creator.creator_email}`
              }
            >
              <EmailIcon />
            </IconButton>
          </Stack>
        </CardContent>
      </Card>


      {/* Students List */}
      <Box>
        <Typography
          variant="h5"
          sx={{ mb: 2, fontWeight: "bold", color: "rgba(255, 255, 255, 0.8)" }}
        >
          Students
        </Typography>

        {participants.students.length > 0 ? (
          <List sx={{ bgcolor: "rgba(255, 255, 255, 0.1)", borderRadius: 3 }}>
            {participants.students.map((student) => (
              <ListItem
                key={student.student_id}
                sx={{
                  borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                  "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.05)" },
                }}
                secondaryAction={
                  <Stack direction="row" spacing={1}>
                    <IconButton
                      aria-label="email student"
                      sx={{
                        bgcolor: "#57A6A1",
                        color: "white",
                        "&:hover": { bgcolor: "#459d8d" },
                      }}
                      onClick={() =>
                        window.location.href = `mailto:${student.student_email}`
                      }
                    >
                      <EmailIcon />
                    </IconButton>
                    {isTeacher && (
                      <IconButton
                        aria-label="remove student"
                        sx={{
                          bgcolor: "#ff5252",
                          color: "white",
                          "&:hover": { bgcolor: "#d94545" },
                        }}
                        onClick={() =>
                          handleRemoveStudent(student.student_id)
                        }
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Stack>
                }
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: "#344C64" }}>
                    <PersonIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: "bold", color: "white" }}
                    >
                      {student.student_name}
                    </Typography>
                  }
                  secondary={
                    <Typography
                      variant="body2"
                      sx={{ color: "rgba(255, 255, 255, 0.7)" }}
                    >
                      {student.student_email}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography
            variant="body1"
            sx={{ mt: 2, textAlign: "center", color: "rgba(255, 255, 255, 0.6)" }}
          >
            No students enrolled yet.
          </Typography>
        )}
      </Box>

      {/* Snackbar for Notifications */}
      <Snackbar
        open={participantSnackbar.open}
        autoHideDuration={3000}
        onClose={handleAssignmentSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert
          onClose={handleAssignmentSnackbarClose}
          variant='filled'
          severity={participantSnackbar.severity}
          sx={{
            width: '100%',
            color: '#ffffff'
          }}
        >
          <AlertTitle>
            {participantSnackbar.severity === 'success' && 'Success'}
            {participantSnackbar.severity === 'error' && 'Error'}
          </AlertTitle>
          {participantSnackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Participants;
