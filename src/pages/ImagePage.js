import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Card, Form, Button, Alert, Row, Col, ProgressBar } from 'react-bootstrap';
import { useAppContext } from '../context/AppContext';
import { useWebcam } from '../hooks/useWebcam';
import WebcamDisplay from '../components/WebcamDisplay';
import LoadingSpinner from '../components/LoadingSpinner';
import ApiService from '../services/apiService';
import { ROUTES, WEBCAM_CONFIG } from '../constants';

const ImagePage = () => {
  const [comment, setComment] = useState('');
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureProgress, setCaptureProgress] = useState(0);
  const [error, setError] = useState(null);
  const [capturedFrames, setCapturedFrames] = useState([]);
  
  const navigate = useNavigate();
  const { state, addCapturedFrame, addComment } = useAppContext();
  
  const {
    videoRef,
    canvasRef,
    isStreaming,
    error: webcamError,
    startWebcam,
    stopWebcam,
    captureMultipleFrames
  } = useWebcam();

  // Redirect if no profile data
  useEffect(() => {
    if (!state.profile.nickname) {
      navigate(ROUTES.PROFILE);
    }
  }, [state.profile, navigate]);

  useEffect(() => {
    startWebcam();
    return () => {
      stopWebcam();
    };
  }, [startWebcam, stopWebcam]);

  const handleCapture = async () => {
    if (!isStreaming) {
      setError('Camera is not active. Please allow camera access and try again.');
      return;
    }

    setIsCapturing(true);
    setError(null);
    setCaptureProgress(0);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setCaptureProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 30;
        });
      }, WEBCAM_CONFIG.CAPTURE_INTERVAL / 3);

      const frames = await captureMultipleFrames();
      clearInterval(progressInterval);
      setCaptureProgress(100);
      
      setCapturedFrames(frames);
      
      // Add frames to global state
      frames.forEach(frame => addCapturedFrame(frame));
      
      // Add comment if provided
      if (comment.trim()) {
        addComment({
          text: comment.trim(),
          timestamp: new Date().toISOString()
        });
      }

      // Simulate API submission
      setTimeout(() => {
        handleNext();
      }, 1000);
      
    } catch (err) {
      setError('Failed to capture images. Please try again.');
      console.error('Capture error:', err);
    } finally {
      setIsCapturing(false);
    }
  };

  const handleNext = async () => {
    try {
      // Submit to API (replace with actual implementation)
      const response = await ApiService.submitRecognition(capturedFrames, comment);
      
      if (response.code === 200) { // Temporary bypass for demo
        navigate(ROUTES.FINAL);
      } else {
        setError('Failed to process images. Please try again.');
      }
    } catch (err) {
      // For demo purposes, continue anyway
      console.warn('API submission failed, continuing for demo:', err);
      navigate(ROUTES.FINAL);
    }
  };

  if (isCapturing) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col lg={6} className="text-center text-white">
            <div className="mb-4">
              <i className="bi bi-camera display-1 text-primary mb-3"></i>
              <h3>Capturing Images...</h3>
              <p className="text-muted">Please look at the camera and remain still</p>
            </div>
            <ProgressBar 
              animated 
              variant="primary" 
              now={captureProgress} 
              className="mb-3"
              style={{ height: '8px' }}
            />
            <p className="small text-muted">
              Capturing {WEBCAM_CONFIG.FRAME_COUNT} frames with {WEBCAM_CONFIG.CAPTURE_INTERVAL/1000}s intervals
            </p>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col lg={8}>
          <div className="text-center text-white mb-4">
            <h2 className="h3 mb-2">Emotion Capture</h2>
            <p className="text-muted">
              We'll capture a few images to analyze your facial expressions. 
              Please ensure good lighting and look directly at the camera.
            </p>
          </div>

          {(error || webcamError) && (
            <Alert variant="danger" className="mb-4">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error || webcamError}
            </Alert>
          )}

          <Row>
            <Col lg={8}>
              <WebcamDisplay
                videoRef={videoRef}
                canvasRef={canvasRef}
                isStreaming={isStreaming}
                className="mb-4"
              />
            </Col>
            <Col lg={4}>
              <Card className="h-100">
                <Card.Body className="d-flex flex-column">
                  <h5 className="mb-3">Instructions</h5>
                  <ul className="list-unstyled flex-grow-1">
                    <li className="mb-2">
                      <i className="bi bi-check-circle text-success me-2"></i>
                      Look directly at the camera
                    </li>
                    <li className="mb-2">
                      <i className="bi bi-check-circle text-success me-2"></i>
                      Ensure good lighting
                    </li>
                    <li className="mb-2">
                      <i className="bi bi-check-circle text-success me-2"></i>
                      Stay still during capture
                    </li>
                    <li className="mb-2">
                      <i className="bi bi-check-circle text-success me-2"></i>
                      Express naturally
                    </li>
                  </ul>
                  
                  <Form className="mt-3">
                    <Form.Group className="mb-3">
                      <Form.Label>Optional Comment</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="How are you feeling right now? (optional)"
                      />
                    </Form.Group>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {capturedFrames.length > 0 && (
            <Card className="mt-4">
              <Card.Header>
                <h6 className="mb-0">Captured Frames ({capturedFrames.length})</h6>
              </Card.Header>
              <Card.Body>
                <Row>
                  {capturedFrames.map((frame, index) => (
                    <Col key={index} xs={4} className="mb-3">
                      <img
                        src={frame.data}
                        alt={`Captured frame ${index + 1}`}
                        className="img-fluid rounded border"
                      />
                      <small className="text-muted d-block text-center mt-1">
                        Frame {frame.frameNumber}
                      </small>
                    </Col>
                  ))}
                </Row>
              </Card.Body>
            </Card>
          )}

          <div className="text-center mt-4">
            {capturedFrames.length === 0 ? (
              <Button
                variant="primary"
                size="lg"
                onClick={handleCapture}
                disabled={!isStreaming || isCapturing}
                className="px-5"
              >
                <i className="bi bi-camera me-2"></i>
                Capture Images
              </Button>
            ) : (
              <div className="d-flex gap-3 justify-content-center">
                <Button
                  variant="outline-primary"
                  onClick={() => {
                    setCapturedFrames([]);
                    setComment('');
                  }}
                >
                  <i className="bi bi-arrow-clockwise me-2"></i>
                  Capture Again
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleNext}
                  className="px-5"
                >
                  Continue to Results
                  <i className="bi bi-arrow-right ms-2"></i>
                </Button>
              </div>
            )}
          </div>
        </Col>
      </Row>
    </Container>
    );
};

export default ImagePage;