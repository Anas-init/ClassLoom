import React from 'react';
import { Navigate } from 'react-router-dom';

// Wrapper for protected routes
const PrivateRoute = ({ children, session }) => {
  return session?.user ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
