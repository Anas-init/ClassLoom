import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import Register from './components/Register';
import Login from './components/Login';
import Navbar from './components/Navbar';
import './index.css'

import { ThemeProvider } from '@emotion/react';
import darkTheme from './theme';

// React Browser Router

function App() {
  return (
    <Router>
      <ThemeProvider theme={darkTheme}>
        <div className="App">
          <Navbar />
          <Routes>
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </div>
      </ThemeProvider>
    </Router>
  );
}

export default App;
