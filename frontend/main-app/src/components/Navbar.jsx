import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Stack,
  Tooltip,
  IconButton,
  Modal,
  Box,
  TextField,
  CircularProgress,
  Snackbar,
  Alert,
  AlertTitle,
  Menu,
  MenuItem
} from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import SchoolIcon from '@mui/icons-material/School';
import CreateIcon from '@mui/icons-material/Create';
import ReplayIcon from '@mui/icons-material/Replay';
import AccountCircle from '@mui/icons-material/AccountCircle';

const generateClassCode = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

const Navbar = () => {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [accessToken, setAccessToken] = useState('');
  const [decodedToken, setDecodedToken] = useState('');
  const [isTeacher, setIsTeacher] = useState(false);

  useEffect(() => {
    try {
      const aToken = localStorage.getItem('accessToken');
      const dToken = jwtDecode(aToken);
      if (dToken) {
        setIsLoggedIn(true);
        setAccessToken(aToken);
        setDecodedToken(dToken);
        setIsTeacher(decodedToken.role);
      }
    } catch (error) {
      console.log(error);
      setIsLoggedIn(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.location.href = '/login';
  };

  const handleLogin = () => {
    window.location.href = '/login';
  };

  const [className, setClassName] = useState('');
  const [classCode, setClassCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: '' });

  const [createOpen, setCreateOpen] = useState(false);
  const handleCreateOpen = () => {
    setCreateOpen(true);
    setClassCode(generateClassCode());
  };
  const handleCreateClose = () => {
    setCreateOpen(false);
    setClassName('');
    setClassCode('');
    setLoading(false);
  };
  const handleCreate = async () => {
    setLoading(true);
    try {
      // API call here
      // await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulated delay
      await axios.post(
        'http://127.0.0.1:8000/api/create-class/',
        {
          class_name: className,
          class_code: classCode,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      setSnackbar({
        open: true,
        message: 'Class created successfully!',
        severity: 'success',
      });
      // Refresh page here
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to create the class. Please try again.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
      handleCreateClose();
    }
  };

  const [joinOpen, setJoinOpen] = useState(false);
  const handleJoinOpen = () => setJoinOpen(true);
  const handleJoinClose = () => {
    setJoinOpen(false);
    setClassCode('');
    setLoading(false);
  };
  const handleJoin = async () => {
    setLoading(true);
    try {
      // await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulated delay
      await axios.post(
        `http://127.0.0.1:8000/api/join-class/?class_code=${classCode}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      setSnackbar({
        open: true,
        message: 'Class joined successfully!',
        severity: 'success',
      });
      window.location.refresh();
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to join the class. Please try again.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
      handleJoinClose();
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <SchoolIcon sx={{ display: { md: 'flex' }, mr: 1 }} />
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          ClassLoom
        </Typography>
        <Stack direction="row" spacing={2}>
          {isLoggedIn && (
            <>
              <IconButton color='inherit' size='large'
                onClick={handleJoinOpen}
              >
                <Tooltip title="Join Class">
                  <AddIcon fontSize='inherit' />
                </Tooltip>
              </IconButton>
              {isTeacher && (
                <IconButton color='inherit' size='large'
                  onClick={handleCreateOpen}
                >
                  <Tooltip title="Create Class">
                    <CreateIcon fontSize='inherit' />
                  </Tooltip>
                </IconButton>
              )}
            </>
          )}

          {isLoggedIn ? (
            <>
              <Button color="inherit"
                onClick={handleLogout}
              >
                Logout
              </Button>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenuOpen}
                color="inherit"
              >
                <AccountCircle />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </>
          ) : (
            <Button color="inherit"
              onClick={handleLogin}
            >
              Login
            </Button>
          )}
        </Stack>
      </Toolbar>

      {/* Create Class Modal */}
      <Modal open={createOpen} onClose={handleCreateClose}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            borderRadius: 3,
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography
            variant="h5"
            sx={{ mb: 2, fontWeight: 'bold', textAlign: 'center' }}
          >
            Create a Class
          </Typography>
          <TextField
            fullWidth
            label="Class Name"
            variant="outlined"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            disabled={loading}
            sx={{
              mb: 3,
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': { borderColor: '#1976d2' },
                '&.Mui-focused fieldset': { borderColor: '#1976d2' },
              },
            }}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <TextField
              fullWidth
              label="Class Code"
              variant="outlined"
              value={classCode || 'Generating...'}
              InputProps={{
                readOnly: true,
              }}
              sx={{
                mr: 2,
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#1976d2' },
                  '&.Mui-focused fieldset': { borderColor: '#1565c0' },
                },
              }}
            />
            <IconButton color='primary' size='large'
              onClick={() => setClassCode(generateClassCode())}
            >
              <Tooltip title="Regenerate">
                <ReplayIcon fontSize='inherit' />
              </Tooltip>
            </IconButton>
          </Box>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={handleCreate}
            disabled={!classCode.trim() || loading}
            sx={{
              bgcolor: '#1976d2',
              '&:hover': { bgcolor: '#1565c0' },
              textTransform: 'none',
              fontWeight: 'bold',
              py: 1.5,
            }}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: 'white' }} />
            ) : (
              'Create'
            )}
          </Button>
        </Box>
      </Modal>

      {/* Join Class Modal */}
      <Modal open={joinOpen} onClose={handleJoinClose}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            borderRadius: 3,
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography
            variant="h5"
            sx={{ mb: 2, fontWeight: 'bold', textAlign: 'center' }}
          >
            Join a Class
          </Typography>
          <TextField
            fullWidth
            label="Class Code"
            variant="outlined"
            value={classCode}
            onChange={(e) => setClassCode(e.target.value)}
            disabled={loading}
            sx={{
              mb: 3,
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': { borderColor: '#1976d2' },
                '&.Mui-focused fieldset': { borderColor: '#1976d2' },
              },
            }}
          />
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={handleJoin}
            disabled={!classCode.trim() || loading}
            sx={{
              bgcolor: '#1976d2',
              '&:hover': { bgcolor: '#1565c0' },
              textTransform: 'none',
              fontWeight: 'bold',
              py: 1.5,
            }}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: 'white' }} />
            ) : (
              'Join'
            )}
          </Button>
        </Box>
      </Modal>

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
    </AppBar>
  );
};

export default Navbar;
