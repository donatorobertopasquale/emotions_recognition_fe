import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
  const { setAuthenticated } = useAppContext();

  // Check authentication status on app load
  useEffect(() => {
    const checkAuth = () => {
      const isAuth = isAuthenticated();
      setAuthenticated(isAuth);
    };

    checkAuth();
  }, [setAuthenticated]);

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
