import React from 'react';
import { Spinner, Container } from 'react-bootstrap';

const LoadingSpinner = ({ 
  message = "Loading...", 
  size = "lg", 
  variant = "primary",
  fullScreen = false 
}) => {
  const content = (
    <div className="d-flex flex-column justify-content-center align-items-center">
      <Spinner 
        animation="border" 
        variant={variant} 
        size={size}
        role="status"
        aria-hidden="true"
      />
      <span className="mt-3 text-muted">{message}</span>
    </div>
  );

  if (fullScreen) {
    return (
      <Container 
        fluid 
        className="d-flex justify-content-center align-items-center vh-100"
      >
        {content}
      </Container>
    );
  }

  return content;
};

export default LoadingSpinner;
