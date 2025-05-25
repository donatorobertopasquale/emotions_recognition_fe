import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { AppProvider } from './context/AppContext';
import ErrorBoundary from './components/ErrorBoundary';
import AppNavbar from './components/AppNavbar';
import ProfilePage from './pages/ProfilePage';
import ImagePage from './pages/ImagePage';
import FinalPage from './pages/FinalPage';
import HomePage from './pages/HomePage';
import { ROUTES } from './constants';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <Router>
          <div className="App min-vh-100 bg-dark">
            <AppNavbar />
            <Container fluid>
              <Routes>
                <Route path={ROUTES.HOME} element={<HomePage />} />
                <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
                <Route path={ROUTES.IMAGE} element={<ImagePage />} />
                <Route path={ROUTES.FINAL} element={<FinalPage />} />
                <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
              </Routes>
            </Container>
          </div>
        </Router>
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;
