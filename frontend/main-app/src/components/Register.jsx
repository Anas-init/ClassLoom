import React, { useState } from 'react';
import { TextField, Button, Typography, Paper } from '@mui/material';


const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  //const [error, setError] = useState(null);

  // Change to axios
  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      // fetch implementation
      const response = await fetch('http://localhost:8000/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password })
      });
      const data = await response.json();

      // axios implementation
      /*
          const response = await axios.post('http://localhost:8000/register/', {
              username,
              email,
              password
          });
          console.log(response.data);
      */

      console.log(data);
    } catch (error) {
      //setError(error.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <Paper elevation={3} className="p-8 rounded-md shadow-lg max-w-md w-full">
        <Typography variant="h5" className="mb-6 text-center text-white">
          Create an Account
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
            label="Username"
            variant="outlined"
            fullWidth
            value={username}
            onChange={(e) => setUsername(e.target.value)}
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
            Register
          </Button>
        </form>
      </Paper>
    </div>
  );
};

export default Register;