import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import Navbar from './components/Navbar';
import { ThemeProvider } from '@emotion/react';
import darkTheme from './theme';
import { CssBaseline } from '@mui/material';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Navbar />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);

