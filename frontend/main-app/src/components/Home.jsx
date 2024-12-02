import React, { useEffect, useState } from 'react';
import axios from 'axios';

import {
  Alert,
  AlertTitle,
  Snackbar,
  LinearProgress
} from '@mui/material';

import ClassCard from './ClassCard';

const Home = () => {
  const [classes, setClasses] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: '' });

  const fetchClasses = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      setIsLoading(true);
      const response = await axios.get('http://127.0.0.1:8000/api/classes/', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setClasses(response.data);
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      console.error('Error fetching classes:', err);
      setError('Failed to load classes.');
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleSnackbarClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };


  if (isLoading) {
    return (
      <LinearProgress />
    );
  }

  if (error) {
    setSnackbar({
      open: true,
      message: 'Failed to get classes...',
      severity: 'error',
    });
    return <>Please Reload or Login again</>;
  }

  return (
    <div>
      {/* Display Classes */}
      <ClassCard classes={classes} />

      {/* Snackbar for Notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          variant='filled'
          severity={snackbar.severity}
          sx={{
            width: '100%',
            color: '#ffffff'
          }}
        >
          <AlertTitle>
            {snackbar.severity === 'success' && 'Success'}
            {snackbar.severity === 'error' && 'Error'}
          </AlertTitle>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Home;
