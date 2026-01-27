
import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  
  // If there's no token, redirect to the login page
  if (!token) {
    return <Navigate to="/admin" replace />;
  }

  // If there is a token, show the protected page
  return children;
};

export default PrivateRoute;