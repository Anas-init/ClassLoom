import React, { useState } from 'react';
import axios from 'axios';
import {
  TextField,
  Button,
  Typography,
  CssBaseline,
  styled,
  Stack,
  Box,
  FormControl,
  FormLabel,
  FormControlLabel,
  Divider,
  Checkbox,
} from '@mui/material';
import MuiCard from '@mui/material/Card';


// Picked template from https://github.com/mui/material-ui/blob/v6.1.8/docs/data/material/getting-started/templates/sign-up/SignUp.js
const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: 'auto',
  boxShadow:
    'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
  [theme.breakpoints.up('sm')]: {
    width: '450px',
  },
  ...theme.applyStyles('dark', {
    boxShadow:
      'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
  }),
}));

const SignUpContainer = styled(Stack)(({ theme }) => ({
  height: 'calc((1 - var(--template-frame-height, 0)) * 100dvh)',
  minHeight: '100%',
  padding: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(4),
  },
  '&::before': {
    content: '""',
    display: 'block',
    position: 'absolute',
    zIndex: -1,
    inset: 0,
    backgroundImage:
      'radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))',
    backgroundRepeat: 'no-repeat',
    ...theme.applyStyles('dark', {
      backgroundImage:
        'radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))',
    }),
  },
}));

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const validateInputs = () => {
    let isValid = true;

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.');
      isValid = false;
    } else if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      isValid = false;
    } else if (password !== confirmPassword) {
      setError("Passwords don't match!");
      isValid = false;
    } else {
      setError('');
    }

    return isValid;
  };

  const handleCheckboxChange = (event) => {
    setIsAdmin(event.target.checked);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateInputs()) return;

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/register/', {
        name: username,
        email: email,
        password: password,
        confirm_password: confirmPassword,
        is_admin: isAdmin
      });
      const token = response.data;
      localStorage.setItem('accessToken', token.token.access);
      localStorage.setItem('refreshToken', token.token.refresh);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred.');
    }
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-gradient-to-r from-gray-800 via-gray-900 to-black"
      style={{
        background: 'radial-gradient(circle at top, #121212, #000000)',
      }}
    >
      <CssBaseline enableColorScheme />
      <SignUpContainer direction="column" justifyContent="space-between">
        <Card variant="outlined">
          <Typography
            component="h1"
            variant="h4"
            sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
          >
            Sign up
          </Typography>
          {error && (
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          )}
          {success && (
            <Typography color="success" variant="body2">
              Registration successful!
            </Typography>
          )}
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
          >
            <FormControl>
              <FormLabel htmlFor="username">Full Name</FormLabel>
              <TextField
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Jon Snow"
                required
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="email">Email</FormLabel>
              <TextField
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="password">Password</FormLabel>
              <TextField
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                required
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="confirmPassword">Confirm Password</FormLabel>
              <TextField
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••"
                required
              />
            </FormControl>
            <FormControlLabel
              control={
                <Checkbox
                  checked={isAdmin}
                  onChange={handleCheckboxChange}
                  color="primary"
                />
              }
              label="Are you a Teacher?"
            />
            <Divider />
            <Button type="submit" fullWidth variant="contained">
              Sign up
            </Button>
          </Box>
        </Card>
      </SignUpContainer>
    </div>
  );
};

export default Register;