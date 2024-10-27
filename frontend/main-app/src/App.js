import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import { ThemeProvider } from '@emotion/react';
import darkTheme from './theme';
import './index.css'

import Register from './components/Register';
import Login from './components/Login';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Sidebar from './components/Sidebar';


// React Browser Router

function App() {
  return (
    <Router>
      <ThemeProvider theme={darkTheme}>
        <div className="App">
          <Navbar />
          <Sidebar />
          <Routes>
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/home" element={<Home />} />
          </Routes>
        </div>
      </ThemeProvider>
    </Router>
  );
}

export default App;
