import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

import {
  Box,
  Button,
  Card,
  Typography,
  TextField,
  FormControl,
  IconButton,
  InputLabel,
} from "@mui/material";

import AttachmentIcon from "@mui/icons-material/Attachment";
import EditIcon from "@mui/icons-material/Edit";

const SubmissionPage = () => {
  const { submission_id } = useParams();
  const [submissionDetails, setSubmissionDetails] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [resultGrade, setResultGrade] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isGraded, setIsGraded] = useState(false);

  const fetchSubmissionDetails = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(
        `http://127.0.0.1:8000/api/retrieve-submission/?submission_id=${submission_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const submissionData = response.data.Submission[0];
      setSubmissionDetails(submissionData);
    } catch (err) {
      console.error('Error fetching submission details:', err);
      setError('Failed to load submission details.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGradeSubmission = async (e) => {
    e.preventDefault();

    if (!resultGrade || !feedback) {
      alert('Please provide both a grade and feedback.');
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.post(
        `http://127.0.0.1:8000/api/check-assignment/?submission_id=${submission_id}`,
        {
          assignmentsubmission: submission_id,
          result_grade: resultGrade,
          feedback: feedback,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(response.data);

      if (response.data) {
        alert('Assignment graded successfully!');
        setIsGraded(true);
      } else {
        setError('Failed to submit grade and feedback.');
      }
    } catch (err) {
      console.error('Error submitting grade:', err);
      setError('Error grading assignment. Please try again later.');
    }
  };

  useEffect(() => {
    fetchSubmissionDetails();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) return <p>Loading submission details...</p>;
  if (error) return <p>{error}</p>;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: {
          sm: "column",
          md: "row"
        },
        gap: 3,
        padding: "20px",
        maxWidth: "1100px",
        margin: "0 auto"
      }}>
      {/* Left side - Submission details and attachments */}
      <Card sx={{
        flex: {
          sm: "1 1 auto",
          md: 3
        },
        padding: "20px",
        borderRadius: "16px",
        color: "white",
        boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.3)"
      }}>
        <Typography variant="h4" sx={{ fontWeight: "bold", mb: 2 }}>Submission Details</Typography>

        <Typography variant="body1">
          <strong>Submitted At:</strong> {new Date(submissionDetails.submitted_at).toLocaleString()}
        </Typography>

        {submissionDetails.attachments && submissionDetails.attachments.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>Attachments:</Typography>
            {/* Attachments */}
            {submissionDetails.attachments?.length > 0 && (
              <Box sx={{ mt: 2 }}>
                {submissionDetails.attachments.map((attachment, index) => (
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
          </Box>
        )}
      </Card>

      {/* Right side - Grade and Feedback */}
      <Card
        sx={{
          flex: {
            sm: "1 1 auto",
            md: 1
          },
          padding: "20px",
          borderRadius: "16px",
          color: "white",
          boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.3)",
          position: "relative"
        }}
      >
        {/* Show edit icon only after grade is already submitted */}
        {/* Edit button
                {!isGraded && !isEditing && (
                    <IconButton
                        onClick={() => setIsEditing(true)}
                        sx={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            color: "#57A6A1",
                            backgroundColor: "rgba(0, 0, 0, 0.2)",
                            "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.3)" },
                        }}
                    >
                        <EditIcon />
                    </IconButton>
                )} */}

        <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2 }}>
          {isGraded ? "Graded" : "Grade This Submission"}
        </Typography>

        {!isGraded
          // && !isEditing
          ? (
            <>
              <form onSubmit={handleGradeSubmission}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel htmlFor="result_grade">Grade</InputLabel>
                  <TextField
                    type="number"
                    id="result_grade"
                    name="result_grade"
                    value={resultGrade}
                    onChange={(e) => setResultGrade(e.target.value)}
                    required
                    inputProps={{ min: 0, max: 100 }}
                    variant="outlined"
                  />
                </FormControl>

                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel htmlFor="feedback">Feedback</InputLabel>
                  <TextField
                    id="feedback"
                    name="feedback"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    required
                    multiline
                    rows={4}
                    variant="outlined"
                  />
                </FormControl>

                <Button variant="contained" type="submit" color="primary" sx={{ mt: 2 }}>
                  Submit Grade & Feedback
                </Button>
              </form>
            </>
          ) : (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1">
                <strong>Grade:</strong> {resultGrade}
              </Typography>
              <Typography variant="body1">
                <strong>Feedback:</strong> {feedback}
              </Typography>
            </Box>
          )}
      </Card>
    </Box>
  );
};

export default SubmissionPage;
