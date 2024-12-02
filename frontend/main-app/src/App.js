import React, { useState, useEffect, useMemo } from 'react';
// import axios from 'axios';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

// Components
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import ClassPage from './components/ClassPage';
import AssignmentPage from './components/AssignmentPage';
import SubmissionPage from './components/SubmissionPage';

function PrivateRoute({ session, children }) {
  if (!session) {
    return <Navigate to="/login" />;
  }
  return children;
}

export default function App() {
  // Session Management
  const [session, setSession] = useState(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      try {
        const decoded = jwtDecode(accessToken);
        return { user: decoded };
      } catch (error) {
        console.error('Invalid token during initialization', error);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
    }
    return null;
  });

  // Account Display Management
  const authentication = useMemo(() => ({
    signIn: () => {
      const accessToken = localStorage.getItem('accessToken');
      if (accessToken) {
        try {
          const decoded = jwtDecode(accessToken);
          setSession({
            user: decoded
          });
          return true;
        } catch (error) {
          console.error('Invalid token', error);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          setSession(null);
        }
      }
      return false;
    },
    signOut: () => {
      setSession(null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    },
  }), []);

  useEffect(() => {
    const initializeApp = async () => {
      authentication.signIn()
    };
    initializeApp();
  }, [authentication]);

  return (
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Private Routes */}
          <Route
            path="/"
            element={
              <PrivateRoute session={session}>
                <Home />
              </PrivateRoute>
            }
          />
          <Route
            path="/class/:class_id"
            element={
              <PrivateRoute session={session}>
                <ClassPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/assignment/:assignment_id"
            element={
              <PrivateRoute session={session}>
                <AssignmentPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/submission/:submission_id"
            element={
              <PrivateRoute session={session}>
                <SubmissionPage />
              </PrivateRoute>
            }
          />

          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
  );
}