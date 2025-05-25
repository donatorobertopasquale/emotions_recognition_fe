// API endpoints
export const API_ENDPOINTS = {
  RECOGNITION: '/api/recognition',
  PROFILE: '/api/profile',
  SUBMIT_ASSESSMENT: '/api/assessment'
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

// Age ranges
export const AGE_RANGES = [
  { value: '18-25', label: '18-25' },
  { value: '26-35', label: '26-35' },
  { value: '36-45', label: '36-45' },
  { value: '46-55', label: '46-55' },
  { value: '56-65', label: '56-65' },
  { value: '65+', label: '65+' }
];

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
