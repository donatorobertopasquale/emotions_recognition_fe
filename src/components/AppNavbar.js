import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { ROUTES } from '../constants';

const AppNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { resetState } = useAppContext();

  const handleReset = () => {
    resetState();
    navigate(ROUTES.HOME);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
      <Container>
        <Navbar.Brand href={ROUTES.HOME}>
          <i className="bi bi-emoji-smile me-2"></i>
          Emotion Recognition
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link 
              href={ROUTES.PROFILE}
              className={isActive(ROUTES.PROFILE) ? 'active' : ''}
            >
              Profile
            </Nav.Link>
            <Nav.Link 
              href={ROUTES.IMAGE}
              className={isActive(ROUTES.IMAGE) ? 'active' : ''}
            >
              Capture
            </Nav.Link>
          </Nav>
          
          <Nav>
            <Button 
              variant="outline-light" 
              size="sm"
              onClick={handleReset}
              className="ms-2"
            >
              <i className="bi bi-arrow-clockwise me-1"></i>
              Reset
            </Button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;
