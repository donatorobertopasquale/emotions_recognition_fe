import { AGE_CONSTRAINTS } from '../constants';

/**
 * Validates profile data
 */
export const validateProfile = (profile) => {
  const errors = {};

  if (!profile.nickname?.trim()) {
    errors.nickname = 'Nickname is required';
  }

  if (!profile.age || !Number.isInteger(profile.age) || profile.age < AGE_CONSTRAINTS.MIN || profile.age > AGE_CONSTRAINTS.MAX) {
    errors.age = `Age is required and must be between ${AGE_CONSTRAINTS.MIN} and ${AGE_CONSTRAINTS.MAX}`;
  }

  if (!profile.gender) {
    errors.gender = 'Gender is required';
  }

  if (!profile.nationality) {
    errors.nationality = 'Nationality is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Formats timestamp to readable string
 */
export const formatTimestamp = (timestamp) => {
  return new Date(timestamp).toLocaleString();
};

/**
 * Generates unique session ID
 */
export const generateSessionId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * Debounce function for performance optimization
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Deep clone object
 */
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Check if browser supports required features
 */
export const checkBrowserSupport = () => {
  const support = {
    getUserMedia: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
    webRTC: !!(window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection),
    canvas: !!document.createElement('canvas').getContext,
    localStorage: !!window.localStorage
  };

  return {
    ...support,
    isSupported: Object.values(support).every(Boolean)
  };
};

/**
 * Convert data URL to blob
 */
export const dataURLToBlob = (dataURL) => {
  const arr = dataURL.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
};

/**
 * Error message formatter
 */
export const formatErrorMessage = (error) => {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error?.message) {
    return error.message;
  }
  
  return 'An unexpected error occurred. Please try again.';
};
