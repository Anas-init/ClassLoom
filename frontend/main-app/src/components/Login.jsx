import React, { useState } from 'react';
import { TextField, Button, Typography, Paper } from '@mui/material';


const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle login logic
    console.log({ email, password });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <Paper elevation={3} className="p-8 rounded-md shadow-lg max-w-md w-full">
        <Typography variant="h5" className="mb-6 text-center text-white">
          Login to Your Account
        </Typography>
        <form onSubmit={handleSubmit} className="space-y-4">
          <TextField
            label="Email"
            variant="outlined"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            InputLabelProps={{
              style: { color: 'rgba(255, 255, 255, 0.7)' },
            }}
          />
          <TextField
            label="Password"
            type="password"
            variant="outlined"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            InputLabelProps={{
              style: { color: 'rgba(255, 255, 255, 0.7)' },
            }}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            className="mt-4"
          >
            Login
          </Button>
        </form>
      </Paper>
    </div>
  );
};

export default Login;
