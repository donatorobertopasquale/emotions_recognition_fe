import React, { useEffect, useState } from 'react';
import { Container, Button, Card, Row, Col, Badge, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ApiService from '../services/apiService';
import { ROUTES, EMOTIONS } from '../constants';
import { formatTimestamp } from '../utils/helpers';

const FinalPage = () => {  const [isSubmitting, setIsSubmitting] = useState(true);
  const [submissionError, setSubmissionError] = useState(null);
  const [results, setResults] = useState(null);
  const navigate = useNavigate();
  const { state, resetState } = useAppContext();
  
  // Extract specific values to avoid endless re-renders
  const { profile, imageReactions, isAuthenticated } = state;
  const userId = profile?.userId;
  const hasReactions = imageReactions && imageReactions.length > 0;
  
  useEffect(() => {
    const submitAssessment = async () => {
      // Redirect if no data to submit or not authenticated
      if (!userId || !hasReactions || !isAuthenticated) {
        navigate(ROUTES.HOME);
        return;
      }

      try {
        // Prepare the assessment data
        const assessmentData = {
          imagesDescriptionsAndReactions: imageReactions.map(reaction => ({
            image: reaction.imageId,
            description: reaction.description || '',
            reaction: reaction.reaction,
            aiComment: reaction.aiComment || reaction.reaction
          }))
        };

        // Submit to the register-result endpoint
        const response = await ApiService.submitAssessment(assessmentData);
        
        // Calculate some basic statistics for display
        const emotionCounts = {};
        imageReactions.forEach(reaction => {
          const emotion = reaction.reaction;
          emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
        });

        const totalReactions = imageReactions.length;
        const dominantEmotion = Object.keys(emotionCounts).reduce((a, b) => 
          emotionCounts[a] > emotionCounts[b] ? a : b
        );

        // Create results summary
        const resultsData = {
          dominantEmotion,
          totalImages: totalReactions,
          emotionBreakdown: {},
          reactions: imageReactions,
          submissionResponse: response
        };

        // Calculate percentages
        Object.keys(emotionCounts).forEach(emotion => {
          resultsData.emotionBreakdown[emotion] = (emotionCounts[emotion] / totalReactions) * 100;
        });        
        
        setResults(resultsData);
      } catch (error) {
        // Handle authentication errors specifically
        if (error.message.includes('Session expired') || error.message.includes('log in again')) {
          setSubmissionError('Your session has expired. Redirecting to home page...');
          setTimeout(() => navigate(ROUTES.HOME), 2000);
        } else {
          setSubmissionError(error.message || 'Failed to submit assessment');
        }
      } finally {
        setIsSubmitting(false);
      }
    };

    submitAssessment();
  }, [userId, hasReactions, isAuthenticated, imageReactions, navigate]);

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

  if (isSubmitting) {
    return (
      <LoadingSpinner 
        message="Submitting your assessment results..." 
        fullScreen 
      />
    );
  }

  if (submissionError) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col lg={6}>
            <Alert variant="danger" className="text-center">
              <i className="bi bi-exclamation-triangle display-4 mb-3"></i>
              <h4>Submission Failed</h4>
              <p>{submissionError}</p>
              <Button variant="outline-danger" onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </Alert>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col lg={8}>
          <div className="text-center text-white mb-5">
            <i className="bi bi-check-circle display-1 text-success mb-3"></i>
            <h1 className="display-5 fw-bold mb-3">Assessment Complete!</h1>
            <p className="lead">
              Thank you for participating in our emotion recognition study. 
              Your responses have been successfully submitted.
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
                  <h3 className="mb-2">Most Frequent Emotion Response</h3>
                  <h2 className={`text-${getEmotionColor(results.dominantEmotion)} text-capitalize mb-2`}>
                    {results.dominantEmotion}
                  </h2>
                  <p className="text-muted mb-0">
                    Images Processed: <strong>{results.totalImages}</strong>
                  </p>
                </Card.Body>
              </Card>

              {/* Emotion Response Summary */}
              <Card className="mb-4">
                <Card.Header>
                  <h5 className="mb-0">
                    <i className="bi bi-bar-chart me-2"></i>
                    Emotion Response Summary
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

              {/* Individual Responses */}
              <Card className="mb-4">
                <Card.Header>
                  <h6 className="mb-0">
                    <i className="bi bi-list-ul me-2"></i>
                    Individual Image Responses
                  </h6>
                </Card.Header>
                <Card.Body>
                  {results.reactions.map((reaction, index) => (
                    <div key={index} className="border-bottom pb-3 mb-3 last:border-bottom-0 last:pb-0 last:mb-0">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <strong>Image {index + 1}: {reaction.imageId}</strong>
                        <Badge bg={getEmotionColor(reaction.reaction)} className="text-capitalize">
                          {reaction.reaction}
                        </Badge>
                      </div>
                      {reaction.description && (
                        <p className="text-muted mb-0 small">
                          <em>"{reaction.description}"</em>
                        </p>
                      )}
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
                        <strong>Participant:</strong> {profile?.nickname || 'N/A'}
                      </p>
                      <p className="mb-2">
                        <strong>User ID:</strong> {userId || 'N/A'}
                      </p>
                    </Col>
                    <Col sm={6}>
                      <p className="mb-2">
                        <strong>Images Processed:</strong> {results.totalImages}
                      </p>
                      <p className="mb-2">
                        <strong>Completed:</strong> {formatTimestamp(new Date().toISOString())}
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
                Start New Assessment
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