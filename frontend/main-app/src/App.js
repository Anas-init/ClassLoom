import React, { useState, useEffect, useMemo } from 'react';
// import axios from 'axios';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

// import { AppProvider } from '@toolpad/core/AppProvider';
// import { DashboardLayout } from '@toolpad/core/DashboardLayout';
// import { Chip } from '@mui/material';
// import { PageContainer } from '@toolpad/core/PageContainer';

// Icons
// import ClassIcon from '@mui/icons-material/Class';
// import SettingsIcon from '@mui/icons-material/Settings';
// import AssignmentIcon from '@mui/icons-material/Assignment';
// import HomeIcon from '@mui/icons-material/Home';

// Components
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Settings from './components/Settings';
import ClassPage from './components/ClassPage';
import Assignments from './components/Assignments';

// Helpers
import fetchNavigation from './helpers/fetchNavigation';

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
            user: {
              exp: decoded.exp,
              iat: decoded.iat,
              jti: decoded.jti,
              role: decoded.role,
              token_type: decoded.token_type,
              user_id: decoded.user_id,

              name: "Placeholder",
              email: "example@placeholder.com",
              image: "",
            }
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

  const [NAVIGATION, setNavigation] = useState([]);
  useEffect(() => {
    const initializeNavigation = async () => {
      const navData = await fetchNavigation();
      setNavigation(navData);
    };

    const initializeApp = async () => {
      if (authentication.signIn()) {
        await initializeNavigation();
      }
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
          path="/assignments"
          element={
            <PrivateRoute session={session}>
              <Assignments />
            </PrivateRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <PrivateRoute session={session}>
              <Settings />
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
        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/register" />} />
      </Routes>
    </Router>
  );
}