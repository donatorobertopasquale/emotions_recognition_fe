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
        const selectedEmotionCounts = {};
        const sentimentCounts = {};
        
        imageReactions.forEach(reaction => {
          // AI detected emotions
          const emotion = reaction.reaction;
          emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
          
          // User selected emotions
          if (reaction.selectedEmotions && reaction.selectedEmotions.length > 0) {
            reaction.selectedEmotions.forEach(selectedEmotion => {
              selectedEmotionCounts[selectedEmotion] = (selectedEmotionCounts[selectedEmotion] || 0) + 1;
            });
          }
          
          // Sentiment analysis from comments
          if (reaction.sentimentAnalysis && reaction.sentimentAnalysis.label) {
            const sentiment = reaction.sentimentAnalysis.label;
            sentimentCounts[sentiment] = (sentimentCounts[sentiment] || 0) + 1;
          }
        });

        const totalReactions = imageReactions.length;
        const dominantEmotion = Object.keys(emotionCounts).reduce((a, b) => 
          emotionCounts[a] > emotionCounts[b] ? a : b
        );
        
        const dominantSelectedEmotion = Object.keys(selectedEmotionCounts).length > 0 
          ? Object.keys(selectedEmotionCounts).reduce((a, b) => 
              selectedEmotionCounts[a] > selectedEmotionCounts[b] ? a : b
            )
          : null;
          
        const dominantSentiment = Object.keys(sentimentCounts).length > 0 
          ? Object.keys(sentimentCounts).reduce((a, b) => 
              sentimentCounts[a] > sentimentCounts[b] ? a : b
            )
          : null;

        // Create results summary
        const resultsData = {
          dominantEmotion,
          dominantSelectedEmotion,
          dominantSentiment,
          totalImages: totalReactions,
          emotionBreakdown: {},
          selectedEmotionBreakdown: {},
          sentimentBreakdown: {},
          reactions: imageReactions,
          submissionResponse: response
        };

        // Calculate percentages for AI emotions
        Object.keys(emotionCounts).forEach(emotion => {
          resultsData.emotionBreakdown[emotion] = (emotionCounts[emotion] / totalReactions) * 100;
        });
        
        // Calculate percentages for user selected emotions
        const totalSelectedEmotions = Object.values(selectedEmotionCounts).reduce((sum, count) => sum + count, 0);
        if (totalSelectedEmotions > 0) {
          Object.keys(selectedEmotionCounts).forEach(emotion => {
            resultsData.selectedEmotionBreakdown[emotion] = (selectedEmotionCounts[emotion] / totalSelectedEmotions) * 100;
          });
        }
        
        // Calculate percentages for sentiment analysis
        const totalSentiments = Object.values(sentimentCounts).reduce((sum, count) => sum + count, 0);
        if (totalSentiments > 0) {
          Object.keys(sentimentCounts).forEach(sentiment => {
            resultsData.sentimentBreakdown[sentiment] = (sentimentCounts[sentiment] / totalSentiments) * 100;
          });
        }        
        
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
      [EMOTIONS.NEUTRAL]: 'light',
      // Additional mappings for user-selected emotions
      'happy': 'success',
      'sad': 'primary', 
      'anger': 'danger',
      'surprise': 'warning',
      'fear': 'dark',
      'disgust': 'secondary',
      'neutral': 'light'
    };
    return colors[emotion] || 'light';
  };

  const getSentimentIcon = (sentiment) => {
    const icons = {
      'joy': '😊',
      'anger': '😠',
      'disgust': '🤢',
      'fear': '😨',
      'neutral': '😐',
      'sadness': '😢',
      'surprise': '😲'
    };
    return icons[sentiment] || '😐';
  };

  const getSentimentColor = (sentiment) => {
    const colors = {
      'joy': 'success',
      'anger': 'danger',
      'disgust': 'warning',
      'fear': 'dark',
      'neutral': 'secondary',
      'sadness': 'info',
      'surprise': 'primary'
    };
    return colors[sentiment] || 'secondary';
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
                    AI-Detected Emotion Summary
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

              {/* User Selected Emotions Summary */}
              {Object.keys(results.selectedEmotionBreakdown).length > 0 && (
                <Card className="mb-4">
                  <Card.Header>
                    <h5 className="mb-0">
                      <i className="bi bi-check2-square me-2"></i>
                      Your Selected Emotions
                    </h5>
                  </Card.Header>
                  <Card.Body>
                    <div className="mb-3">
                      <small className="text-muted">
                        These are the emotions you personally selected for each image
                      </small>
                    </div>
                    {Object.entries(results.selectedEmotionBreakdown)
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
              )}

              {/* Sentiment Analysis Summary */}
              {Object.keys(results.sentimentBreakdown).length > 0 && (
                <Card className="mb-4">
                  <Card.Header>
                    <h5 className="mb-0">
                      <i className="bi bi-chat-text me-2"></i>
                      Comment Sentiment Analysis
                    </h5>
                  </Card.Header>
                  <Card.Body>
                    <div className="mb-3">
                      <small className="text-muted">
                        Sentiment detected from your written comments in real-time
                      </small>
                    </div>
                    {Object.entries(results.sentimentBreakdown)
                      .sort(([,a], [,b]) => b - a)
                      .map(([sentiment, percentage]) => (
                        <div key={sentiment} className="mb-3">
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <span className="text-capitalize fw-medium">
                              <span className="me-2">{getSentimentIcon(sentiment)}</span>
                              {sentiment}
                            </span>
                            <Badge bg={getSentimentColor(sentiment)}>
                              {percentage.toFixed(1)}%
                            </Badge>
                          </div>
                          <div className="progress" style={{ height: '8px' }}>
                            <div
                              className={`progress-bar bg-${getSentimentColor(sentiment)}`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                  </Card.Body>
                </Card>
              )}

              {/* Comparison Summary */}
              {results.dominantSelectedEmotion && results.dominantSentiment && (
                <Card className="mb-4 border-info">
                  <Card.Header className="bg-info text-white">
                    <h5 className="mb-0">
                      <i className="bi bi-graph-up me-2"></i>
                      Multi-Modal Analysis Summary
                    </h5>
                  </Card.Header>
                  <Card.Body>
                    <Row>
                      <Col md={4}>
                        <div className="text-center p-3">
                          <div className="mb-2">
                            <i className={`bi ${getEmotionIcon(results.dominantEmotion)} display-6 text-${getEmotionColor(results.dominantEmotion)}`}></i>
                          </div>
                          <h6 className="text-muted">AI Video Analysis</h6>
                          <p className={`text-${getEmotionColor(results.dominantEmotion)} text-capitalize fw-bold mb-0`}>
                            {results.dominantEmotion}
                          </p>
                        </div>
                      </Col>
                      <Col md={4}>
                        <div className="text-center p-3">
                          <div className="mb-2">
                            <i className={`bi ${getEmotionIcon(results.dominantSelectedEmotion)} display-6 text-${getEmotionColor(results.dominantSelectedEmotion)}`}></i>
                          </div>
                          <h6 className="text-muted">Your Selection</h6>
                          <p className={`text-${getEmotionColor(results.dominantSelectedEmotion)} text-capitalize fw-bold mb-0`}>
                            {results.dominantSelectedEmotion}
                          </p>
                        </div>
                      </Col>
                      <Col md={4}>
                        <div className="text-center p-3">
                          <div className="mb-2">
                            <span className={`display-6`}>{getSentimentIcon(results.dominantSentiment)}</span>
                          </div>
                          <h6 className="text-muted">Comment Sentiment</h6>
                          <p className={`text-${getSentimentColor(results.dominantSentiment)} text-capitalize fw-bold mb-0`}>
                            {results.dominantSentiment}
                          </p>
                        </div>
                      </Col>
                    </Row>
                    <hr className="my-3" />
                    <div className="text-center">
                      <small className="text-muted">
                        This analysis combines facial expression detection, emotion selection, and text sentiment analysis
                      </small>
                    </div>
                  </Card.Body>
                </Card>
              )}

              {/* Individual Responses */}
              <Card className="mb-4">
                <Card.Header>
                  <h6 className="mb-0">
                    <i className="bi bi-list-ul me-2"></i>
                    Detailed Individual Image Responses
                  </h6>
                </Card.Header>
                <Card.Body>
                  {results.reactions.map((reaction, index) => (
                    <div key={index} className="border rounded p-3 mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <strong className="text-primary">Image {index + 1}: {reaction.imageId}</strong>
                        <small className="text-muted">{new Date(reaction.timestamp).toLocaleString()}</small>
                      </div>
                      
                      {/* AI Detection */}
                      <div className="mb-2">
                        <small className="text-muted">AI Video Analysis:</small>
                        <Badge bg={getEmotionColor(reaction.reaction)} className="ms-2 text-capitalize">
                          {reaction.aiComment || reaction.reaction}
                        </Badge>
                      </div>
                      
                      {/* User Selected Emotions */}
                      {reaction.selectedEmotions && reaction.selectedEmotions.length > 0 && (
                        <div className="mb-2">
                          <small className="text-muted">Your Selected Emotions:</small>
                          <div className="mt-1">
                            {reaction.selectedEmotions.map((emotion, idx) => (
                              <Badge 
                                key={idx} 
                                bg={getEmotionColor(emotion)} 
                                className="me-1 text-capitalize"
                              >
                                {emotion}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Sentiment Analysis */}
                      {reaction.sentimentAnalysis && (
                        <div className="mb-2">
                          <small className="text-muted">Comment Sentiment:</small>
                          <Badge 
                            bg={getSentimentColor(reaction.sentimentAnalysis.label)} 
                            className="ms-2 text-capitalize"
                          >
                            <span className="me-1">{getSentimentIcon(reaction.sentimentAnalysis.label)}</span>
                            {reaction.sentimentAnalysis.label}
                            {reaction.sentimentAnalysis.score && (
                              <span className="ms-1">({reaction.sentimentAnalysis.score})</span>
                            )}
                          </Badge>
                        </div>
                      )}
                      
                      {/* User Comment */}
                      {reaction.description && (
                        <div className="mt-2">
                          <small className="text-muted">Your Comment:</small>
                          <p className="mb-0 mt-1 p-2 bg-light rounded small fst-italic">
                            "{reaction.description}"
                          </p>
                        </div>
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