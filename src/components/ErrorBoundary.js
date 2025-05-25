import React from 'react';
import { Alert } from 'react-bootstrap';

const ErrorBoundary = ({ children, fallback = null }) => {
  const [hasError, setHasError] = React.useState(false);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const handleError = (error) => {
      setHasError(true);
      setError(error);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleError);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleError);
    };
  }, []);

  if (hasError) {
    if (fallback) {
      return fallback;
    }

    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Alert variant="danger" className="text-center">
          <Alert.Heading>Something went wrong!</Alert.Heading>
          <p>
            We're sorry, but something unexpected happened. Please refresh the page and try again.
          </p>
          <hr />
          <div className="d-flex justify-content-center">
            <button
              className="btn btn-outline-danger"
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </button>
          </div>
        </Alert>
      </div>
    );
  }

  return children;
};

export default ErrorBoundary;
