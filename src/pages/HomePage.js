import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { ROUTES } from '../constants';
import { checkBrowserSupport } from '../utils/helpers';

const HomePage = () => {
  const navigate = useNavigate();
  const { resetState } = useAppContext();
  const browserSupport = checkBrowserSupport();

  const handleGetStarted = () => {
    resetState();
    navigate(ROUTES.PROFILE);
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col lg={8} xl={6}>
          <div className="text-center text-white mb-5">
            <div className="mb-4">
              <i className="bi bi-emoji-smile display-1 text-primary"></i>
            </div>
            <h1 className="display-4 fw-bold mb-3">Emotion Recognition</h1>
            <p className="lead mb-4">
              Advanced emotion detection system using facial recognition technology. 
              Help us understand human emotions better through this interactive assessment.
            </p>
          </div>

          <Card className="mb-4">
            <Card.Body className="p-4">
              <h3 className="h4 mb-3">How it works:</h3>
              <div className="d-flex flex-column gap-3">
                <div className="d-flex align-items-start">
                  <div className="badge bg-primary rounded-circle me-3 d-flex align-items-center justify-content-center" style={{width: '2rem', height: '2rem'}}>
                    1
                  </div>
                  <div>
                    <h6 className="mb-1">Create Your Profile</h6>
                    <p className="mb-0 text-muted">Provide basic demographic information for our research.</p>
                  </div>
                </div>
                <div className="d-flex align-items-start">
                  <div className="badge bg-primary rounded-circle me-3 d-flex align-items-center justify-content-center" style={{width: '2rem', height: '2rem'}}>
                    2
                  </div>
                  <div>
                    <h6 className="mb-1">Capture Images</h6>
                    <p className="mb-0 text-muted">Allow camera access to capture facial expressions.</p>
                  </div>
                </div>
                <div className="d-flex align-items-start">
                  <div className="badge bg-primary rounded-circle me-3 d-flex align-items-center justify-content-center" style={{width: '2rem', height: '2rem'}}>
                    3
                  </div>
                  <div>
                    <h6 className="mb-1">Get Results</h6>
                    <p className="mb-0 text-muted">View the emotion analysis and contribute to research.</p>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>

          {!browserSupport.isSupported && (
            <Card className="border-warning mb-4">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <i className="bi bi-exclamation-triangle-fill text-warning me-3 fs-4"></i>
                  <div>
                    <h6 className="mb-1">Browser Compatibility</h6>
                    <p className="mb-0 text-muted">
                      Your browser may not support all required features. For the best experience, 
                      please use a modern browser with camera access enabled.
                    </p>
                  </div>
                </div>              </Card.Body>
            </Card>
          )}          <div className="text-center">
            <Button 
              variant="primary" 
              size="lg" 
              onClick={handleGetStarted}
              className="px-5 py-3"
            >
              <i className="bi bi-play-circle me-2"></i>
              Get Started
            </Button>
          </div>

          <div className="text-center mt-4">
            <p className="text-muted small">
              <i className="bi bi-shield-check me-1"></i>
              Your privacy is important to us. All data is processed securely and anonymously.
            </p>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default HomePage;
