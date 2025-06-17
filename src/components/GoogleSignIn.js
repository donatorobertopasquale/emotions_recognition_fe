import React, { useEffect, useRef, useState } from 'react';
import { Button } from 'react-bootstrap';

const GoogleSignIn = ({ onSuccess, onError, disabled = false, text = "Continue with Google" }) => {
  const googleButtonRef = useRef(null);
  const initializationAttempted = useRef(false);
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const GOOGLE_CLIENT_ID = "117151816412-k3bheigoqrcrm4h9aul8203unrr1ldit.apps.googleusercontent.com";

  const handleCredentialResponse = React.useCallback((response) => {
    try {
      // Decode the JWT credential to get user info
      const credential = response.credential;
      const payload = JSON.parse(atob(credential.split('.')[1]));
      
      const userInfo = {
        googleId: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        emailVerified: payload.email_verified,
        credential: credential // Pass the full credential for backend verification
      };

      onSuccess(userInfo);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error parsing Google credential:', error);
      onError('Failed to process Google sign-in');
    }
  }, [onSuccess, onError]);

  const initializeGoogleSignIn = React.useCallback(() => {
    if (initializationAttempted.current || !window.google?.accounts?.id) {
      return;
    }

    initializationAttempted.current = true;
    
    try {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: false,
      });

      // Render the Google Sign-In button
      if (googleButtonRef.current) {
        window.google.accounts.id.renderButton(
          googleButtonRef.current,
          {
            theme: 'outline',
            size: 'large',
            width: '100%',
            type: 'standard',
            text: 'continue_with',
            shape: 'rectangular',
            logo_alignment: 'left',
          }
        );
        setIsGoogleLoaded(true);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to initialize Google Sign-In:', error);
      onError('Failed to load Google Sign-In');
    }
  }, [handleCredentialResponse, onError]);

  useEffect(() => {
    // Check if Google Identity Services is already loaded
    if (window.google && window.google.accounts && window.google.accounts.id) {
      initializeGoogleSignIn();
      return;
    }

    // If not loaded, set up a polling mechanism with timeout
    let attempts = 0;
    const maxAttempts = 50; // 5 seconds maximum wait
    
    const checkGoogle = setInterval(() => {
      attempts++;
      
      if (window.google && window.google.accounts && window.google.accounts.id) {
        clearInterval(checkGoogle);
        initializeGoogleSignIn();
      } else if (attempts >= maxAttempts) {
        clearInterval(checkGoogle);
        // eslint-disable-next-line no-console
        console.warn('Google Identity Services failed to load within timeout');
        onError('Google Sign-In service is not available. Please refresh the page and try again.');
      }
    }, 100);

    // Cleanup function
    return () => {
      clearInterval(checkGoogle);
    };
  }, [initializeGoogleSignIn, onError]);

  return (
    <div className="d-grid gap-2">
      <div 
        ref={googleButtonRef} 
        style={{ 
          opacity: disabled ? 0.6 : 1, 
          pointerEvents: disabled ? 'none' : 'auto',
          minHeight: '44px' // Reserve space for the button
        }} 
      />
      {!isGoogleLoaded && !disabled && (
        <div className="text-center">
          <div className="spinner-border spinner-border-sm me-2" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <small className="text-muted">Loading Google Sign-In...</small>
        </div>
      )}
      {disabled && (
        <Button variant="outline-secondary" disabled size="lg">
          <i className="bi bi-google me-2"></i>
          {text}
        </Button>
      )}
    </div>
  );
};

export default GoogleSignIn;