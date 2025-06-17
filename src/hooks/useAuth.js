import { useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { isAuthenticated, needsTokenRefresh } from '../utils/authUtils';
import apiService from '../services/apiService';

/**
 * Custom hook to manage authentication state and token refresh
 * Updated for Google Sign-In integration
 * @returns {object} Authentication utilities
 */
export const useAuth = () => {
  const { state, setAuthenticated, resetState } = useAppContext();

  // Check authentication status and setup token refresh
  useEffect(() => {
    let isMounted = true; // Track if component is still mounted
    
    const checkAndRefreshAuth = async () => {
      // Only proceed if component is still mounted
      if (!isMounted) return;
      
      if (!isAuthenticated()) {
        if (isMounted) setAuthenticated(false);
        return;
      }

      // If we need to refresh the token, try to do so
      if (needsTokenRefresh()) {
        try {
          await apiService.refreshAccessToken();
          if (isMounted) setAuthenticated(true);
        } catch (error) {
          // eslint-disable-next-line no-console
          console.warn('Token refresh failed:', error);
          if (isMounted) {
            setAuthenticated(false);
            // Only reset state if we were previously authenticated
            if (state.isAuthenticated) {
              resetState();
            }
          }
        }
      } else {
        if (isMounted) setAuthenticated(true);
      }
    };

    // Check immediately
    checkAndRefreshAuth();

    // Set up periodic check every 5 minutes
    const intervalId = setInterval(() => {
      if (isMounted) checkAndRefreshAuth();
    }, 5 * 60 * 1000);

    // Cleanup function
    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [setAuthenticated, resetState, state.isAuthenticated]);

  const logout = async () => {
    try {
      // Sign out from Google if available
      if (window.google && window.google.accounts && window.google.accounts.id) {
        window.google.accounts.id.disableAutoSelect();
      }
      
      await apiService.logout();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('Logout error:', error);
    } finally {
      setAuthenticated(false);
      resetState();
    }
  };

  return {
    isAuthenticated: state.isAuthenticated,
    logout
  };
};
