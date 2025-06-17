// Utility functions for JWT token management and authentication

/**
 * Get a cookie value by name
 * @param {string} name - Cookie name
 * @returns {string|null} - Cookie value or null if not found
 */
export const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop().split(';').shift();
  }
  return null;
};

/**
 * Check if user is authenticated by verifying token existence
 * Note: With Google Sign-In, authentication is handled by Google tokens and backend verification
 * @returns {boolean} - True if access token exists
 */
export const isAuthenticated = () => {
  const accessToken = getCookie('accessToken');
  return !!accessToken;
};

/**
 * Check if refresh token exists
 * @returns {boolean} - True if refresh token exists
 */
export const hasRefreshToken = () => {
  const refreshToken = getCookie('refreshToken');
  return !!refreshToken;
};

/**
 * Parse JWT token payload (without verification - for client-side info only)
 * @param {string} token - JWT token
 * @returns {object|null} - Parsed payload or null if invalid
 */
export const parseJWTPayload = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
};

/**
 * Check if a JWT token is expired
 * @param {string} token - JWT token
 * @returns {boolean} - True if token is expired
 */
export const isTokenExpired = (token) => {
  const payload = parseJWTPayload(token);
  if (!payload || !payload.exp) {
    return true;
  }
  
  // exp is in seconds, Date.now() is in milliseconds
  return payload.exp * 1000 < Date.now();
};

/**
 * Get user info from access token
 * @returns {object|null} - User info from token or null
 */
export const getUserInfoFromToken = () => {
  const accessToken = getCookie('accessToken');
  if (!accessToken) {
    return null;
  }
  
  return parseJWTPayload(accessToken);
};

/**
 * Check if access token needs refresh (expired or will expire soon)
 * @returns {boolean} - True if token needs refresh
 */
export const needsTokenRefresh = () => {
  const accessToken = getCookie('accessToken');
  if (!accessToken) {
    return true;
  }
  
  const payload = parseJWTPayload(accessToken);
  if (!payload || !payload.exp) {
    return true;
  }
  
  // Refresh if token expires in less than 2 minutes
  const twoMinutesFromNow = (Date.now() + 2 * 60 * 1000) / 1000;
  return payload.exp < twoMinutesFromNow;
};
