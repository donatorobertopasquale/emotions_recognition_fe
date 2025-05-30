import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { AppProvider, useAppContext } from './context/AppContext';
import ErrorBoundary from './components/ErrorBoundary';
import AppNavbar from './components/AppNavbar';
import ProtectedRoute from './components/ProtectedRoute';
import ProfilePage from './pages/ProfilePage';
import ImagePage from './pages/ImagePage';
import FinalPage from './pages/FinalPage';
import HomePage from './pages/HomePage';
import { ROUTES } from './constants';
import { isAuthenticated } from './utils/authUtils';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';

// App content component that has access to context
const AppContent = () => {
  const { setAuthenticated, state, webSocket } = useAppContext();
  const location = useLocation();

  // Check authentication status on app load
  useEffect(() => {
    const checkAuth = () => {
      const isAuth = isAuthenticated();
      setAuthenticated(isAuth);
    };

    checkAuth();
  }, [setAuthenticated]);

  // Handle WebSocket connection based on route
  useEffect(() => {
    if (!state.isAuthenticated || !webSocket) {
      return;
    }

    const currentPath = location.pathname;
    
    // Connect WebSocket when entering IMAGE route
    if (currentPath === ROUTES.IMAGE && !webSocket.isConnected) {
      // eslint-disable-next-line no-console
      console.log('Connecting WebSocket for ImagePage');
      webSocket.connect();
    }
    
    // Disconnect WebSocket when leaving IMAGE/FINAL routes (going back to HOME or PROFILE)
    if ((currentPath === ROUTES.HOME || currentPath === ROUTES.PROFILE) && webSocket.isConnected) {
      // eslint-disable-next-line no-console
      console.log('Disconnecting WebSocket - leaving image flow');
      webSocket.disconnect();
    }
  }, [location.pathname, state.isAuthenticated, webSocket]);

  return (
    <div className="App min-vh-100 bg-dark">
      <AppNavbar />
      <Container fluid>
        <Routes>
          <Route path={ROUTES.HOME} element={<HomePage />} />
          <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
          <Route 
            path={ROUTES.IMAGE} 
            element={
              <ProtectedRoute>
                <ImagePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path={ROUTES.FINAL} 
            element={
              <ProtectedRoute>
                <FinalPage />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
        </Routes>
      </Container>
    </div>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <Router>
          <AppContent />
        </Router>
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;
