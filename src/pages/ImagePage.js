import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  const [selectedEmotions, setSelectedEmotions] = useState([]);
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
    streamRef,
    isStreaming,
    error: webcamError,
    startWebcam,
    stopWebcam,
  } = useWebcam();

  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);
  const autoStopTimerRef = useRef(null);

  // Available emotion options
  const emotionOptions = [
    { value: 'happy', emoji: '😊', label: 'Happy' },
    { value: 'surprise', emoji: '😲', label: 'Surprise' },
    { value: 'sad', emoji: '😢', label: 'Sad' },
    { value: 'anger', emoji: '😠', label: 'Anger' },
    { value: 'disgust', emoji: '🤢', label: 'Disgust' },
    { value: 'fear', emoji: '😨', label: 'Fear' },
    { value: 'neutral', emoji: '😐', label: 'Neutral' }
  ];

  // Handle emotion selection
  const handleEmotionToggle = (emotionValue) => {
    setSelectedEmotions(prev => {
      if (prev.includes(emotionValue)) {
        return prev.filter(emotion => emotion !== emotionValue);
      } else {
        return [...prev, emotionValue];
      }
    });
  };
  
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

  // Reset state when moving to next image
  useEffect(() => {
    const resetStateForNewImage = () => {
      // Stop any ongoing recording
      if (isRecording) {
        stopRecording();
      }
      
      // Reset all state for new image
      setRecordedVideo(null);
      setRecordingDuration(0);
      setComment('');
      setSelectedEmotions([]);
      setError(null);
    };

    resetStateForNewImage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.currentImageIndex]); // Only trigger when currentImageIndex changes

  const startRecording = useCallback(async () => {
    if (!isStreaming || !streamRef.current) {
      setError('Camera is not active. Please allow camera access and try again.');
      return;
    }

    try {
      recordedChunksRef.current = [];
      const stream = streamRef.current;
      
      // Check if stream is still active
      const videoTracks = stream.getVideoTracks();
      if (videoTracks.length === 0 || videoTracks[0].readyState !== 'live') {
        setError('Camera stream is not available. Please refresh and try again.');
        return;
      }
      
      // Try different codec options based on browser support
      let mediaRecorderOptions;
      if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
        mediaRecorderOptions = { mimeType: 'video/webm;codecs=vp9' };
      } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) {
        mediaRecorderOptions = { mimeType: 'video/webm;codecs=vp8' };
      } else if (MediaRecorder.isTypeSupported('video/webm')) {
        mediaRecorderOptions = { mimeType: 'video/webm' };
      } else {
        mediaRecorderOptions = {}; // Use default
      }
      
      const mediaRecorder = new MediaRecorder(stream, mediaRecorderOptions);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { 
          type: mediaRecorderOptions.mimeType || 'video/webm' 
        });
        setRecordedVideo(blob);
      };

      mediaRecorder.onerror = (event) => {
        setError(`Recording error: ${event.error?.message || 'Unknown error'}`);
        setIsRecording(false);
        if (recordingTimerRef.current) {
          clearInterval(recordingTimerRef.current);
          recordingTimerRef.current = null;
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);
      setError(null);

      // Start timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

      // Auto-stop recording after 4 seconds
      autoStopTimerRef.current = setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          stopRecording();
        }
      }, 4000);

    } catch (err) {
      setError(`Failed to start recording: ${err.message}`);
    }
  }, [isStreaming, streamRef]);

  // Auto-start recording when conditions are met
  useEffect(() => {
    const autoStartRecording = () => {
      const canStartRecording = currentImageUrl && 
                               isStreaming && 
                               !isRecording && 
                               !recordedVideo;

      if (canStartRecording) {
        // Small delay to ensure everything is ready
        const timer = setTimeout(() => {
          // Double check to prevent race conditions
          if (!isRecording && !recordedVideo) {
            startRecording();
          }
        }, 500);

        return () => clearTimeout(timer);
      }
    };

    const cleanup = autoStartRecording();
    return cleanup;
  }, [currentImageUrl, isStreaming, isRecording, recordedVideo, startRecording]);
  // Cleanup image URL when component unmounts or currentImageUrl changes
  useEffect(() => {
    return () => {
      if (currentImageUrl) {
        URL.revokeObjectURL(currentImageUrl);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentImageUrl]);

  // Cleanup timers on component unmount
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      if (autoStopTimerRef.current) {
        clearTimeout(autoStopTimerRef.current);
      }
    };
  }, []);

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    
    // Clear auto-stop timer
    if (autoStopTimerRef.current) {
      clearTimeout(autoStopTimerRef.current);
      autoStopTimerRef.current = null;
    }
  };

  const handleSubmitReaction = async () => {
    try {
      // Auto-stop recording if still recording
      if (isRecording) {
        stopRecording();
        // Wait for recording to finish processing
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Check if we have a recorded video after stopping
      if (!recordedVideo) {
        setError('Recording is still processing. Please wait a moment and try again.');
        return;
      }

      // Validation for required fields
      if (selectedEmotions.length === 0) {
        setError('Please select at least one emotion that describes how this image makes you feel.');
        return;
      }

      setIsSubmitting(true);
      setError(null);

      // Submit to API
      const emotionResponse = await ApiService.submitRecognition(recordedVideo);
      const emotion = emotionResponse.emotion || 'unknown';
      
      // Store reaction data - prioritize AI-detected emotion, fallback to user-selected if no AI result
      const reactionData = {
        imageId: state.images[state.currentImageIndex],
        description: comment.trim() || '',
        reaction: emotion !== 'unknown' ? emotion : (selectedEmotions.length > 0 ? selectedEmotions[0] : 'neutral'),
        aiComment: emotion,
        videoBlob: recordedVideo,
        timestamp: new Date().toISOString()
      };

      addImageReaction(reactionData);

      // Navigate to next image or final page
      const nextIndex = state.currentImageIndex + 1;
      if (nextIndex < state.images.length) {
        setCurrentImageIndex(nextIndex);
      } else {
        navigate(ROUTES.FINAL);
      }

    } catch (err) {
      // Handle authentication errors
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

  // Utility functions
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getValidationMessage = () => {
    if (selectedEmotions.length === 0) {
      return 'Please select at least one emotion to continue';
    }
    return '';
  };

  const getButtonText = () => {
    if (isSubmitting) {
      return (
        <>
          <span className="spinner-border spinner-border-sm me-2" />
          Processing...
        </>
      );
    }
    
    const isLastImage = state.currentImageIndex + 1 >= state.images.length;
    const buttonText = isLastImage ? 'Complete Assessment' : 'Next Image';
    
    return (
      <>
        {isRecording && <i className="bi bi-stop-fill me-1" title="Will stop recording" />}
        {buttonText}
        <i className="bi bi-arrow-right ms-2"></i>
      </>
    );
  };

  // Early returns for loading states
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

          {/* Image Display - Full width now */}
          <Card className="mb-4 position-relative">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Current Image: {currentImageName}</h5>
              {/* Recording indicator badge */}
              {(isStreaming || isRecording || recordedVideo) && (
                <div className="recording-status">
                  {isRecording ? (
                    <span className="badge bg-danger d-flex align-items-center">
                      <i className="bi bi-record-circle-fill me-1"></i>
                      Recording {formatTime(recordingDuration)}
                    </span>
                  ) : recordedVideo ? (
                    <span className="badge bg-success d-flex align-items-center">
                      <i className="bi bi-check-circle-fill me-1"></i>
                      Recorded ({formatTime(recordingDuration)})
                    </span>
                  ) : isStreaming ? (
                    <span className="badge bg-info d-flex align-items-center">
                      <i className="bi bi-camera-video me-1"></i>
                      Camera Ready
                    </span>
                  ) : null}
                </div>
              )}
            </Card.Header>
            <Card.Body className="text-center">
              {isLoadingImage ? (
                <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
                  <LoadingSpinner message="Loading image..." />
                </div>
              ) : currentImageUrl ? (
                <img
                  src={currentImageUrl}
                  alt={`Stimulus ${state.currentImageIndex + 1}`}
                  className="img-fluid rounded"
                  style={{ maxHeight: '600px', objectFit: 'contain', width: '100%' }}
                />
              ) : (
                <div className="text-muted">Failed to load image</div>
              )}
            </Card.Body>
          </Card>

          {/* Hidden webcam for recording - not visible to user */}
          <div style={{ display: 'none' }}>
            <WebcamDisplay
              videoRef={videoRef}
              canvasRef={canvasRef}
              isStreaming={isStreaming}
            />
          </div>

          {/* Emotion and Comment Section */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Your Reaction</h5>
              {isRecording && (
                <small className="text-muted">
                  <i className="bi bi-info-circle me-1"></i>
                  Recording your reaction automatically. Select emotions and click "Next" when ready.
                </small>
              )}
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>How does this image make you feel? <span className="text-danger">*</span></Form.Label>
                    <div className="d-flex flex-wrap gap-2 mt-2">
                      {emotionOptions.map((option) => (
                        <div
                          key={option.value}
                          className={`emotion-checkbox ${selectedEmotions.includes(option.value) ? 'selected' : ''}`}
                          onClick={() => handleEmotionToggle(option.value)}
                        >
                          <div className="emoji">
                            {option.emoji}
                          </div>
                          <div className="label">
                            {option.label}
                          </div>
                        </div>
                      ))}
                    </div>
                    {selectedEmotions.length > 0 && (
                      <Form.Text className="text-muted mt-2">
                        Selected: {selectedEmotions.map(emotion => 
                          emotionOptions.find(opt => opt.value === emotion)?.label
                        ).join(', ')}
                      </Form.Text>
                    )}
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Additional thoughts (optional)</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Describe what you see or how you feel about this image..."
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Action Buttons */}
          <div className="text-center">
            <Button
              variant="primary"
              size="lg"
              onClick={handleSubmitReaction}
              disabled={selectedEmotions.length === 0 || isSubmitting}
              className="px-5"
            >
              {getButtonText()}
            </Button>
            
            {selectedEmotions.length === 0 && (
              <div className="mt-2">
                <small className="text-muted">
                  {getValidationMessage()}
                </small>
              </div>
            )}
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default ImagePage;