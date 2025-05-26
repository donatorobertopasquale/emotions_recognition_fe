import { useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { isAuthenticated, needsTokenRefresh } from '../utils/authUtils';
import apiService from '../services/apiService';

/**
 * Custom hook to manage authentication state and token refresh
 * @returns {object} Authentication utilities
 */
export const useAuth = () => {
  const { state, setAuthenticated, resetState } = useAppContext();

  // Check authentication status and setup token refresh
  useEffect(() => {
    const checkAndRefreshAuth = async () => {
      if (!isAuthenticated()) {
        setAuthenticated(false);
        return;
      }

      // If we need to refresh the token, try to do so
      if (needsTokenRefresh()) {
        try {
          await apiService.refreshAccessToken();
          setAuthenticated(true);        } catch (error) {
          // eslint-disable-next-line no-console
          console.warn('Token refresh failed:', error);
          setAuthenticated(false);
          // Optionally reset state on failed refresh
          if (state.isAuthenticated) {
            resetState();
          }
        }
      } else {
        setAuthenticated(true);
      }
    };

    // Check immediately
    checkAndRefreshAuth();

    // Set up periodic check every 5 minutes
    const intervalId = setInterval(checkAndRefreshAuth, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [setAuthenticated, resetState, state.isAuthenticated]);

  const logout = async () => {
    try {
      await apiService.logout();    } catch (error) {
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
