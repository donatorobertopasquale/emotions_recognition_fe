// API endpoints
export const API_ENDPOINTS = {
  RECOGNITION: '/api/classifier/predict/',
  PROFILE: '/api/v1/google-login', // Updated to use Google login endpoint
  IMAGE: '/api/v1/download-image',
  SUBMIT_ASSESSMENT: '/api/v1/register-result'
};

// Application routes
export const ROUTES = {
  HOME: '/',
  PROFILE: '/profile',
  IMAGE: '/image',
  FINAL: '/final'
};

// Gender options
export const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer-not-to-say', label: 'Prefer not to say' }
];

// Age constraints
export const AGE_CONSTRAINTS = {
  MIN: 5,
  MAX: 110
};

// Emotion categories
export const EMOTIONS = {
  HAPPY: 'happy',
  SAD: 'sad',
  ANGRY: 'angry',
  SURPRISED: 'surprised',
  FEARFUL: 'fearful',
  DISGUSTED: 'disgusted',
  NEUTRAL: 'neutral'
};

// Webcam settings
export const WEBCAM_CONFIG = {
  VIDEO_CONSTRAINTS: {
    width: { ideal: 640 },
    height: { ideal: 480 },
    facingMode: 'user'
  },
  CAPTURE_INTERVAL: 2000, // 2 seconds
  FRAME_COUNT: 3
};
