import React from 'react';
import { Routes, Route } from 'react-router-dom'; 
import Admin from './component/Admin/Admin';
import User from './component/User/User';
import RoleProtectedRoute from './component/RoleProtectedRoute';
import Login from './component/Login';
import Navbar from './component/Navbar';
import AuthRedirect from './component/AuthRedirect'; 

const App = () => {
  return (
    <AuthRedirect>
      <div>
        <Navbar />
        <Routes>
          {/* Public route */}
          <Route path="/" element={<Login />} />

          {/* Admin route protected by RoleProtectedRoute */}
          <Route
            path="/admin"
            element={
              <RoleProtectedRoute allowedRoles={['admin']}>
                <Admin />
              </RoleProtectedRoute>
            }
          />

          {/* User route protected by RoleProtectedRoute */}
          <Route
            path="/user"
            element={
              <RoleProtectedRoute allowedRoles={['user', 'admin']}>
                <User />
              </RoleProtectedRoute>
            }
          />

          {/* Unauthorized access route */}
          <Route path="/unauthorized" element={<h2>Access Denied</h2>} />
        </Routes>
      </div>
      </AuthRedirect>

  );
};

export default App;
