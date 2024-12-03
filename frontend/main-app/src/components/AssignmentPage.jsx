import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

import { Link } from 'react-router-dom';

import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Divider,
  Input
} from "@mui/material";

import AttachmentIcon from "@mui/icons-material/Attachment";

const AssignmentPage = () => {
  const { assignment_id } = useParams();
  const [assignmentDetails, setAssignmentDetails] = useState(null);
  const [submissions, setSubmissions] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  // Replace with snackbar functionality
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [canSubmit, setCanSubmit] = useState(true);
  const [result, setResult] = useState(null); // To store result data
  const [resultLoading, setResultLoading] = useState(false); // To show loading while fetching result
  const [resultError, setResultError] = useState(null); // To handle result fetching errors

  const accessToken = localStorage.getItem('accessToken');
  const decodedToken = jwtDecode(accessToken);
  const isTeacher = decodedToken.role;
  const studentId = decodedToken.user_id; // Assuming the token contains the student's ID

  const fetchAssignmentDetails = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(
        `http://127.0.0.1:8000/api/retrieve-assignment/?assignment_id=${assignment_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const assignmentData = response.data.assignment[0];
      setAssignmentDetails(assignmentData);
    } catch (err) {
      console.error('Error fetching assignment details:', err);
      setError('Failed to load assignment details.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSubmissionStatus = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(
        `http://127.0.0.1:8000/api/restrict-submission/?assignment_id=${assignment_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("submission status" + response.data);
      setCanSubmit(response.data.can_submit);
    } catch (err) {
      console.error('Error checking submission status:', err);
      setError('Failed to check submission status.');
    }
  };

  const fetchSubmissions = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(
        `http://127.0.0.1:8000/api/all-submissions/?assignment_id=${assignment_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSubmissions(response.data.submissions);
    } catch (err) {
      console.error('Error fetching submissions:', err);
      setError('Failed to load submissions.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      alert('Please select a file to submit.');
      return;
    }

    const formData = new FormData();
    formData.append('assignment', assignment_id);
    formData.append('student', studentId);
    formData.append('attachments', selectedFile);

    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.post(
        'http://127.0.0.1:8000/api/submit-submission/',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data) {
        setSubmissionSuccess(true);
        alert('Submission successful!');
      } else {
        setError('Failed to submit the assignment.');
      }
    } catch (err) {
      console.error('Error submitting assignment:', err);
      setError('Error submitting assignment. Please try again later.');
    }
  };

  const fetchResult = async () => {
    setResultLoading(true);
    setResultError(null);

    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/api/get-result/?assignment_id=${assignment_id}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.data) {
        setResult(response.data); // Store the result data
      } else {
        setResultError('Your submission is not graded yet.');
      }
    } catch (err) {
      console.error('Error fetching result:', err);
      setResultError('Error fetching result. Please try again later.');
    } finally {
      setResultLoading(false); // Hide loading state
    }
  };

  useEffect(() => {
    if (isTeacher) {
      fetchSubmissions();
    } else {
      fetchAssignmentDetails();
      fetchSubmissionStatus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTeacher]);

  if (isLoading) return <p>Loading assignment details...</p>;
  if (error) return <p>{error}</p>;

  if (isTeacher) {
    return (
      <Box sx={{ padding: "20px" }}>
        <Typography variant="h4" sx={{ fontWeight: "bold", mb: 3 }}>
          Submissions for {assignmentDetails?.title || "this Assignment"}
        </Typography>
        <div
          style={{
            display: 'flex',
            gap: '16px',
            flexWrap: 'wrap',
            marginTop: '20px',
            justifyContent: 'center',
          }}
        >
          {submissions.map((submission) => (
            <Card
              key={submission.submission_id}
              sx={{
                width: { sm: '100%', md: 300 },
                height: 150,
                borderRadius: '12px',
                color: 'white',
                boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'scale(1.03)' },
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <CardContent>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
                  {submission.student_name}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ marginBottom: 1, fontSize: '14px', color: '#F1F1F1' }}
                >
                  <strong>Submitted At:</strong>{' '}
                  {new Date(submission.submitted_at).toLocaleString()}
                </Typography>
              </CardContent>
              <CardActions
                sx={{
                  padding: '8px 16px',
                  justifyContent: 'center',
                  borderTop: '1px solid #344C64',
                }}
              >
                <Button
                  component={Link}
                  to={`/submission/${submission.submission_id}`}
                  variant="outlined"
                  color="primary"
                  size="small"
                  sx={{
                    '&:hover': {
                      backgroundColor: 'rgba(87, 166, 161, 0.1)',
                      borderColor: '#57A6A1',
                    },
                  }}
                >
                  View Submission Details
                </Button>
              </CardActions>
            </Card>
          ))}
        </div>
      </Box>
    );
  } else {
    return (
      <Box
        sx={{
          display: "flex",
          gap: 3,
          flexWrap: "wrap",
          flexDirection: {
            sm: "column",
            md: "row"
          },
        }}
      >
        {/* Main Assignment Card - 3/4 Width */}
        <Card
          sx={{
            flex: {
              sm: "1 1 auto",
              md: 3
            },
            padding: "20px",
            borderRadius: "16px",
            color: "white",
            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.3)",
            display: "flex",
            flexDirection: "column",
            gap: 3,
          }}
        >
          {/* Card Header */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingBottom: "5px",
            }}
          >
            <Box>
              <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                {assignmentDetails.title}
              </Typography>
              <Typography variant="body2">
                By: {assignmentDetails.creator.name}
              </Typography>
              <Typography variant="body2">
                Created At: {new Date(assignmentDetails.created_at).toLocaleString()}
              </Typography>
            </Box>
            <Box sx={{ textAlign: "right" }}>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                <Box
                  sx={{
                    backgroundColor: "primary.main",
                    color: "white",
                    borderRadius: "20px",
                    padding: "5px 10px",
                    fontSize: "14px",
                  }}
                >
                  Due: {new Date(assignmentDetails.due_date).toLocaleDateString()}
                </Box>
                <Box
                  sx={{
                    backgroundColor: "#4caf50",
                    color: "white",
                    borderRadius: "20px",
                    padding: "5px 10px",
                    fontSize: "14px",
                  }}
                >
                  Grade: {assignmentDetails.grade}
                </Box>
              </Box>
            </Box>
          </Box>

          <Divider />

          {/* Card Body */}
          <Box>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {assignmentDetails.description}
            </Typography>

            {/* Attachments */}
            {assignmentDetails.attachments?.length > 0 && (
              <Box sx={{ mt: 2 }}>
                {assignmentDetails.attachments.map((attachment, index) => (
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
        </Card>

        {/* Submission Form Card - 1/4 Width */}
        <Card
          sx={{
            flex: {
              sm: "1 1 auto",
              md: 1,
            },
            padding: "20px",
            borderRadius: "16px",
            color: "white",
            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.3)",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
            Submit Your Solution
          </Typography>
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            {/* Display Selected File */}
            {selectedFile && (
              <Typography
                variant="body2"
                sx={{
                  marginTop: "10px",
                  color: "#57A6A1",
                  backgroundColor: "#240750",
                  padding: "10px 20px",
                  borderRadius: "8px",
                  display: "inline-block",
                }}
              >
                Selected File: {selectedFile.name}
              </Typography>
            )}
            {/* File Input */}
            <Input
              type="file"
              onChange={handleFileChange}
              accept=".pdf, .docx, .txt"
              sx={{ display: "none" }}
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              style={{
                display: "inline-block",
                padding: "10px 10px",
                backgroundColor: "#344C64",
                color: "white",
                borderRadius: "12px",
                cursor: "pointer",
                textAlign: "center",
                transition: "background-color 0.3s ease",
              }}
              onMouseOver={(e) => (e.target.style.backgroundColor = "#57A6A1")}
              onMouseOut={(e) => (e.target.style.backgroundColor = "#344C64")}
            >
              Upload File
            </label>

            <Button
              variant="contained"
              color="primary"
              type="submit"
            >
              Submit Solution
            </Button>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Button
            variant="outlined"
            color="secondary"
            onClick={fetchResult}
          >
            Get Result
          </Button>
          {result && (
            <Box sx={{ marginTop: 2 }}>
              <Typography variant="body1">
                <strong>Grade:</strong> {result.grade}
              </Typography>
              <Typography variant="body1">
                <strong>Feedback:</strong> {result.feedback || "No feedback available."}
              </Typography>
            </Box>
          )}
        </Card>
      </Box>
    );
  }
};

export default AssignmentPage;
