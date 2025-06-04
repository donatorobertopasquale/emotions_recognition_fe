import React, { useState, useEffect } from 'react';
import { Button, Alert } from 'react-bootstrap';

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      // Show the custom install prompt
      setShowInstallPrompt(true);
    };

    const handleAppInstalled = () => {
      console.log('PWA was installed');
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }

    // Clear the deferredPrompt
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    // Don't clear deferredPrompt so user can still install later
  };

  if (!showInstallPrompt) return null;

  return (
    <Alert 
      variant="info" 
      dismissible 
      onClose={handleDismiss}
      className="m-3 d-flex align-items-center justify-content-between"
    >
      <div>
        <strong>Install App</strong>
        <p className="mb-0 small">
          Install this app on your device for a better experience!
        </p>
      </div>
      <Button 
        variant="primary" 
        size="sm" 
        onClick={handleInstallClick}
        className="ms-2"
      >
        <i className="bi bi-download me-1"></i>
        Install
      </Button>
    </Alert>
  );
};

export default PWAInstallPrompt;
