import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import axios from 'axios';

import {
  Box,
  Tabs,
  Tab,
  Typography,
  Paper,
  Avatar,
  Divider,
  Snackbar,
  Alert,
  AlertTitle,
  LinearProgress
} from '@mui/material';

import Announcements from './Announcements';
import Lectures from './Lectures';
import Assignments from './Assignments';
import Participants from './Participants';

// A11y TabPanel helper
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `tab-${index}`,
    'aria-controls': `tabpanel-${index}`,
  };
}

const ClassPage = () => {
  const [classPageSnackbar, setClassPageSnackbar] = useState({ open: false, message: '', severity: '' });
  const [isLoading, setIsLoading] = useState(false);
  const { class_id } = useParams();
  const [value, setValue] = useState(0);
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  const [stream, setStream] = useState({
    announcements: [],
    lectures: [],
    assignments: [],
  });
  const [error, setError] = useState(null);
  const location = useLocation();
  const { class_name, creator_name, class_color } = location.state || {};
  // const [activeTab, setActiveTab] = useState('stream');

  useEffect(() => {
    const fetchStream = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        setIsLoading(true);
        const response = await axios.get(
          `http://127.0.0.1:8000/api/class-stream/?class_id=${class_id}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        setStream(response.data);
        setIsLoading(false);
        console.log(response.data);
      } catch (err) {
        setIsLoading(false);
        setClassPageSnackbar({
          open: true,
          message: 'Error Loading Class Content: ' + { error },
          severity: 'error',
        });
        setError('Failed to load class stream.');
      }
    };

    fetchStream();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [class_id]);

  const handleAnnouncementSnackbarClose = () => {
    setClassPageSnackbar((prev) => ({ ...prev, open: false }));
  };

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  return (
    <Paper
      elevation={3}
      sx={{
        width: '80%',
        margin: 'auto',
        mt: 4,
        mb: 1,
        p: 4,
        bgcolor: 'background.paper',
        borderRadius: 3,
        boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.2)',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Avatar
          sx={{
            bgcolor: class_color,
            color: 'white',
            width: 56,
            height: 56,
            fontSize: '1.5rem',
            mr: 2,
          }}
        >
          {class_name[0]}
        </Avatar>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            {class_name}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {creator_name}
          </Typography>
        </Box>
      </Box>
      <Divider sx={{ mb: 2 }} />

      {isLoading ? (
        <LinearProgress />
      ) : (
        <>
          {/* Tabs */}
          <Tabs
            value={value}
            onChange={handleChange}
            textColor="primary"
            indicatorColor="primary"
            aria-label="class page tabs"
            variant="fullWidth"
          >
            <Tab label="Announcements" {...a11yProps(0)} />
            <Tab label="Lectures" {...a11yProps(1)} />
            <Tab label="Assignments" {...a11yProps(2)} />
            <Tab label="Participants" {...a11yProps(3)} />
          </Tabs>

          {/* Tab Panels */}
          <TabPanel value={value} index={0}>
            <Announcements class_id={class_id} announcements={stream.announcements} />
          </TabPanel>
          <TabPanel value={value} index={1}>
            <Lectures class_id={class_id} lectures={stream.lectures} />
          </TabPanel>
          <TabPanel value={value} index={2}>
            <Assignments class_id={class_id} assignments={stream.assignments} />
          </TabPanel>
          <TabPanel value={value} index={3}>
            <Participants class_id={class_id} />
          </TabPanel>
        </>
      )}

      {/* Snackbar for Notifications */}
      <Snackbar
        open={classPageSnackbar.open}
        autoHideDuration={3000}
        onClose={handleAnnouncementSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert
          onClose={handleAnnouncementSnackbarClose}
          variant='filled'
          severity={classPageSnackbar.severity}
          sx={{
            width: '100%',
            color: '#ffffff'
          }}
        >
          <AlertTitle>
            {classPageSnackbar.severity === 'success' && 'Success'}
            {classPageSnackbar.severity === 'error' && 'Error'}
          </AlertTitle>
          {classPageSnackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default ClassPage;
