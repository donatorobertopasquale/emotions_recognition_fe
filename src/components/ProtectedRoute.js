import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { isAuthenticated } from '../utils/authUtils';
import { ROUTES } from '../constants';

/**
 * ProtectedRoute component that checks authentication before rendering children
 * @param {object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if authenticated
 * @returns {React.ReactElement} - Children or redirect to profile page
 */
const ProtectedRoute = ({ children }) => {
  const { state } = useAppContext();
  
  // Check both context state and cookie-based authentication
  const hasValidAuth = state.isAuthenticated && isAuthenticated();
    if (!hasValidAuth) {
    // Redirect to home page if not authenticated
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return children;
};

export default ProtectedRoute;
