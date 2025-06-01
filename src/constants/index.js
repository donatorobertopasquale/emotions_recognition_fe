// API endpoints
export const API_ENDPOINTS = {
  RECOGNITION: 'https://emotion-recognition-classifier-egezbjckewc2hcce.italynorth-01.azurewebsites.net/api/predict/',
  PROFILE: 'https://emotion-recognition-be-e0abamfshzgyeaca.italynorth-01.azurewebsites.net/api/login',
  IMAGE: 'https://emotion-recognition-be-e0abamfshzgyeaca.italynorth-01.azurewebsites.net/api/download-image',
  SUBMIT_ASSESSMENT: 'https://emotion-recognition-be-e0abamfshzgyeaca.italynorth-01.azurewebsites.net/api/register-result'

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
