import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Card, Form, Button, Alert, Row, Col, ProgressBar } from 'react-bootstrap';
import { useAppContext } from '../context/AppContext';
import { useWebcam } from '../hooks/useWebcam';
import WebcamDisplay from '../components/WebcamDisplay';
import LoadingSpinner from '../components/LoadingSpinner';
import ApiService from '../services/apiService';
import { ROUTES } from '../constants';

const ImagePage = () => {
  const [comment, setComment] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [error, setError] = useState(null);
  const [currentImageUrl, setCurrentImageUrl] = useState(null);
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState(null);
  
  const navigate = useNavigate();  const { 
    state, 
    setCurrentImageIndex, 
    addImageReaction
  } = useAppContext();
  
  const {
    videoRef,
    canvasRef,
    isStreaming,
    error: webcamError,
    startWebcam,
    stopWebcam,
  } = useWebcam();

  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);
  // Redirect if no profile data or images
  useEffect(() => {
    if (!state.profile.nickname || !state.images || state.images.length === 0 || !state.isAuthenticated) {
      navigate(ROUTES.HOME);
    }
  }, [state.profile, state.images, state.isAuthenticated, navigate]);

  // Start webcam
  useEffect(() => {
    startWebcam();
    return () => {
      stopWebcam();
    };
  }, [startWebcam, stopWebcam]);  // Load current image
  useEffect(() => {
    const loadCurrentImage = async () => {
      if (state.images && state.images.length > 0 && state.currentImageIndex < state.images.length) {
        setIsLoadingImage(true);
        try {
          const imageName = state.images[state.currentImageIndex];
          const imageBlob = await ApiService.downloadImage(imageName);
          const imageUrl = URL.createObjectURL(imageBlob);
          setCurrentImageUrl(imageUrl);
        } catch (err) {
          // Handle authentication errors specifically
          if (err.message.includes('Session expired') || err.message.includes('log in again')) {
            setError('Your session has expired. Redirecting to home page...');
            setTimeout(() => navigate(ROUTES.HOME), 2000);
          } else {
            setError(`Failed to load image: ${err.message}`);
          }
        } finally {
          setIsLoadingImage(false);
        }
      }
    };

    loadCurrentImage();
  }, [state.currentImageIndex, state.images, navigate]);
  // Cleanup image URL when component unmounts or currentImageUrl changes
  useEffect(() => {
    return () => {
      if (currentImageUrl) {
        URL.revokeObjectURL(currentImageUrl);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentImageUrl]);

  const startRecording = async () => {
    if (!isStreaming) {
      setError('Camera is not active. Please allow camera access and try again.');
      return;
    }

    try {
      recordedChunksRef.current = [];
      const stream = videoRef.current.srcObject;
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9'
      });
      
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        setRecordedVideo(blob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);
      setError(null);

      // Start timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

    } catch (err) {
      setError(`Failed to start recording: ${err.message}`);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
  };

  const handleSubmitReaction = async () => {
    if (!recordedVideo) {
      setError('Please record a video reaction first.');
      return;
    }

    setIsSubmitting(true);
    setError(null);    try {
      // Call emotion prediction API
      const emotionResponse = await ApiService.submitRecognition(recordedVideo);
      
      const emotion = emotionResponse.emotion || 'unknown';
      
      // Store the reaction data
      const reactionData = {
        imageId: state.images[state.currentImageIndex],
        description: comment.trim() || '',
        reaction: emotion,
        aiComment: emotion, // Using emotion as aiComment for now
        videoBlob: recordedVideo, // Store for potential future use
        timestamp: new Date().toISOString()
      };

      addImageReaction(reactionData);

      // Move to next image or final page
      const nextIndex = state.currentImageIndex + 1;
      if (nextIndex < state.images.length) {
        setCurrentImageIndex(nextIndex);
        // Reset form for next image
        setComment('');
        setRecordedVideo(null);
        setRecordingDuration(0);
      } else {
        // All images processed, go to final page
        navigate(ROUTES.FINAL);
      }

    } catch (err) {
      // Handle authentication errors specifically
      if (err.message.includes('Session expired') || err.message.includes('log in again')) {
        setError('Your session has expired. Redirecting to home page...');
        setTimeout(() => navigate(ROUTES.HOME), 2000);
      } else {
        setError(`Failed to process reaction: ${err.message}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!state.images || state.images.length === 0) {
    return <LoadingSpinner message="Loading images..." fullScreen />;
  }

  if (isSubmitting) {
    return <LoadingSpinner message="Processing your reaction..." fullScreen />;
  }

  const currentImageName = state.images[state.currentImageIndex];
  const progress = ((state.currentImageIndex + 1) / state.images.length) * 100;

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col lg={10}>
          <div className="text-center text-white mb-4">
            <h2 className="h3 mb-2">Image Reaction Capture</h2>
            <p className="text-muted">
              Image {state.currentImageIndex + 1} of {state.images.length}
            </p>
            <ProgressBar 
              now={progress} 
              className="mb-3"
              style={{ height: '8px' }}
              label={`${Math.round(progress)}%`}
            />
          </div>

          {(error || webcamError) && (
            <Alert variant="danger" className="mb-4">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error || webcamError}
            </Alert>
          )}

          <Row>
            {/* Image Display */}
            <Col lg={6}>
              <Card className="mb-4">
                <Card.Header>
                  <h5 className="mb-0">Current Image: {currentImageName}</h5>
                </Card.Header>
                <Card.Body className="text-center">
                  {isLoadingImage ? (
                    <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
                      <LoadingSpinner message="Loading image..." />
                    </div>
                  ) : currentImageUrl ? (                    <img
                      src={currentImageUrl}
                      alt={`Stimulus ${state.currentImageIndex + 1}`}
                      className="img-fluid rounded"
                      style={{ maxHeight: '400px', objectFit: 'contain' }}
                    />
                  ) : (
                    <div className="text-muted">Failed to load image</div>
                  )}
                </Card.Body>
              </Card>
            </Col>

            {/* Video Recording */}
            <Col lg={6}>
              <Card className="mb-4">
                <Card.Header>
                  <h5 className="mb-0">Record Your Reaction</h5>
                </Card.Header>
                <Card.Body>
                  <WebcamDisplay
                    videoRef={videoRef}
                    canvasRef={canvasRef}
                    isStreaming={isStreaming}
                    className="mb-3"
                    style={{ maxHeight: '300px' }}
                  />
                  
                  <div className="text-center mb-3">
                    {isRecording ? (
                      <div>
                        <div className="text-danger mb-2">
                          <i className="bi bi-record-circle-fill me-2"></i>
                          Recording: {formatTime(recordingDuration)}
                        </div>
                        <Button
                          variant="danger"
                          onClick={stopRecording}
                          size="lg"
                        >
                          <i className="bi bi-stop-fill me-2"></i>
                          Stop Recording
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="primary"
                        onClick={startRecording}
                        disabled={!isStreaming || !currentImageUrl}
                        size="lg"
                      >
                        <i className="bi bi-camera-video me-2"></i>
                        Start Recording
                      </Button>
                    )}
                  </div>

                  {recordedVideo && (
                    <Alert variant="success" className="text-center">
                      <i className="bi bi-check-circle me-2"></i>
                      Video recorded successfully ({formatTime(recordingDuration)})
                    </Alert>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Comment Section */}
          <Card className="mb-4">
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label>Your thoughts about this image (optional)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Describe what you see or how you feel about this image..."
                />
              </Form.Group>
            </Card.Body>
          </Card>

          {/* Action Buttons */}
          <div className="text-center">
            <Button
              variant="primary"
              size="lg"
              onClick={handleSubmitReaction}
              disabled={!recordedVideo || isSubmitting}
              className="px-5"
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Processing...
                </>
              ) : (
                <>
                  {state.currentImageIndex + 1 < state.images.length ? 'Next Image' : 'Complete Assessment'}                <i className="bi bi-arrow-right ms-2"></i>
                </>
              )}
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default ImagePage;