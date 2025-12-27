import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { all_routes } from './all_routes';

const ProtectedRoute = () => {
  const token = localStorage.getItem('authToken');

  if (!token) {
    return <Navigate to={all_routes.login} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
