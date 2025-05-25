import React, { useEffect, useState } from 'react';
import { Container, Button, Card, Row, Col, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { ROUTES, EMOTIONS } from '../constants';
import { formatTimestamp } from '../utils/helpers';

const FinalPage = () => {
  const [isProcessing, setIsProcessing] = useState(true);
  const [results, setResults] = useState(null);
  const navigate = useNavigate();
  const { state, resetState } = useAppContext();

  useEffect(() => {
    // Simulate processing time
    const timer = setTimeout(() => {
      // Mock results - replace with actual API response
      setResults({
        dominantEmotion: 'happy',
        confidence: 85.7,
        emotionBreakdown: {
          [EMOTIONS.HAPPY]: 85.7,
          [EMOTIONS.NEUTRAL]: 8.3,
          [EMOTIONS.SURPRISED]: 4.2,
          [EMOTIONS.SAD]: 1.8,
          [EMOTIONS.ANGRY]: 0.0,
          [EMOTIONS.FEARFUL]: 0.0,
          [EMOTIONS.DISGUSTED]: 0.0
        },
        processedFrames: state.capturedFrames.length,
        timestamp: new Date().toISOString()
      });
      setIsProcessing(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [state.capturedFrames]);

  const handleStartOver = () => {
    resetState();
    navigate(ROUTES.HOME);
  };

  const getEmotionIcon = (emotion) => {
    const icons = {
      [EMOTIONS.HAPPY]: 'bi-emoji-smile',
      [EMOTIONS.SAD]: 'bi-emoji-frown',
      [EMOTIONS.ANGRY]: 'bi-emoji-angry',
      [EMOTIONS.SURPRISED]: 'bi-emoji-surprise',
      [EMOTIONS.FEARFUL]: 'bi-emoji-dizzy',
      [EMOTIONS.DISGUSTED]: 'bi-emoji-expressionless',
      [EMOTIONS.NEUTRAL]: 'bi-emoji-neutral'
    };
    return icons[emotion] || 'bi-emoji-neutral';
  };

  const getEmotionColor = (emotion) => {
    const colors = {
      [EMOTIONS.HAPPY]: 'success',
      [EMOTIONS.SAD]: 'primary',
      [EMOTIONS.ANGRY]: 'danger',
      [EMOTIONS.SURPRISED]: 'warning',
      [EMOTIONS.FEARFUL]: 'dark',
      [EMOTIONS.DISGUSTED]: 'secondary',
      [EMOTIONS.NEUTRAL]: 'light'
    };
    return colors[emotion] || 'light';
  };

  if (isProcessing) {
    return (
      <LoadingSpinner 
        message="Processing your emotion analysis..." 
        fullScreen 
      />
    );
  }

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col lg={8}>
          <div className="text-center text-white mb-5">
            <i className="bi bi-check-circle display-1 text-success mb-3"></i>
            <h1 className="display-5 fw-bold mb-3">Analysis Complete!</h1>
            <p className="lead">
              Thank you for participating in our emotion recognition study. 
              Here are your results:
            </p>
          </div>

          {results && (
            <>
              {/* Main Result */}
              <Card className="mb-4 border-success">
                <Card.Body className="text-center p-4">
                  <div className="mb-3">
                    <i className={`bi ${getEmotionIcon(results.dominantEmotion)} display-1 text-${getEmotionColor(results.dominantEmotion)}`}></i>
                  </div>
                  <h3 className="mb-2">Primary Emotion Detected</h3>
                  <h2 className={`text-${getEmotionColor(results.dominantEmotion)} text-capitalize mb-2`}>
                    {results.dominantEmotion}
                  </h2>
                  <p className="text-muted mb-0">
                    Confidence: <strong>{results.confidence}%</strong>
                  </p>
                </Card.Body>
              </Card>

              {/* Detailed Breakdown */}
              <Card className="mb-4">
                <Card.Header>
                  <h5 className="mb-0">
                    <i className="bi bi-bar-chart me-2"></i>
                    Emotion Breakdown
                  </h5>
                </Card.Header>
                <Card.Body>
                  {Object.entries(results.emotionBreakdown)
                    .sort(([,a], [,b]) => b - a)
                    .map(([emotion, percentage]) => (
                      <div key={emotion} className="mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span className="text-capitalize fw-medium">
                            <i className={`bi ${getEmotionIcon(emotion)} me-2`}></i>
                            {emotion}
                          </span>
                          <Badge bg={getEmotionColor(emotion)}>
                            {percentage.toFixed(1)}%
                          </Badge>
                        </div>
                        <div className="progress" style={{ height: '8px' }}>
                          <div
                            className={`progress-bar bg-${getEmotionColor(emotion)}`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                </Card.Body>
              </Card>

              {/* Session Info */}
              <Card className="mb-4">
                <Card.Header>
                  <h6 className="mb-0">
                    <i className="bi bi-info-circle me-2"></i>
                    Session Information
                  </h6>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col sm={6}>
                      <p className="mb-2">
                        <strong>Participant:</strong> {state.profile.nickname}
                      </p>
                      <p className="mb-2">
                        <strong>Frames Processed:</strong> {results.processedFrames}
                      </p>
                    </Col>
                    <Col sm={6}>
                      <p className="mb-2">
                        <strong>Completed:</strong> {formatTimestamp(results.timestamp)}
                      </p>
                      <p className="mb-2">
                        <strong>Comments:</strong> {state.comments.length}
                      </p>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </>
          )}

          {/* Action Buttons */}
          <div className="text-center">
            <div className="d-flex gap-3 justify-content-center">
              <Button
                variant="outline-primary"
                onClick={handleStartOver}
                className="px-4"
              >
                <i className="bi bi-arrow-clockwise me-2"></i>
                Start Over
              </Button>
              <Button
                variant="primary"
                onClick={() => window.print()}
                className="px-4"
              >
                <i className="bi bi-printer me-2"></i>
                Print Results
              </Button>
            </div>
          </div>

          {/* Footer Message */}
          <div className="text-center mt-5">
            <Card className="bg-light">
              <Card.Body className="py-3">
                <p className="mb-0 text-muted">
                  <i className="bi bi-heart text-danger me-2"></i>
                  Thank you for contributing to emotion recognition research! 
                  Your participation helps improve AI understanding of human emotions.
                </p>
              </Card.Body>
            </Card>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default FinalPage;