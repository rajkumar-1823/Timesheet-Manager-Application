import React from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";

const RoleProtectedRoute = ({ allowedRoles, children }) => {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/" />;
  }
  try {
    const decoded = jwtDecode(token);

    if (allowedRoles.includes(decoded.role)) {
      return children;
    } else {
      return <Navigate to="/unauthorized" />;
    }
  } catch {
    return <Navigate to="/" />;
  }
};

export default RoleProtectedRoute;
