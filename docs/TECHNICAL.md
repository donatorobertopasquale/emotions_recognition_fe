# Technical Documentation - Emotion Recognition Frontend

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Component Architecture](#component-architecture)
5. [State Management](#state-management)
6. [API Integration](#api-integration)
7. [Webcam and Media Handling](#webcam-and-media-handling)
8. [Authentication System](#authentication-system)
9. [Build and Deployment](#build-and-deployment)
10. [Development Guidelines](#development-guidelines)
11. [Testing Strategy](#testing-strategy)
12. [Performance Optimization](#performance-optimization)
13. [Troubleshooting](#troubleshooting)

## Architecture Overview

The application follows a modern React architecture with a component-based design pattern, utilizing React 19 features and hooks for state management and side effects.

### Core Architecture Principles
- **Component-Based Design**: Modular, reusable UI components
- **Unidirectional Data Flow**: React Context for global state management
- **Separation of Concerns**: Clear separation between UI, logic, and data layers
- **Error Boundaries**: Comprehensive error handling at component levels
- **Progressive Enhancement**: Graceful degradation for unsupported features

### Application Flow
```
User Input → State Management → API Layer → Backend Services
     ↓              ↓              ↓              ↓
 UI Components → Context Store → HTTP Client → REST APIs
```

## Technology Stack

### Frontend Core
- **React 19.1.0**: Modern React with concurrent features
- **React Router 6.26.2**: Client-side routing and navigation
- **React Bootstrap 2.10.9**: UI component library
- **Bootstrap 5.3.5**: CSS framework for responsive design
- **Bootstrap Icons 1.13.1**: Icon library

### Development Tools
- **React Scripts 5.0.1**: Build tooling and development server
- **ESLint**: Code linting and style enforcement
- **Prettier**: Code formatting
- **Jest**: Unit testing framework
- **React Testing Library**: Component testing utilities

### Browser APIs
- **WebRTC**: Real-time communication for webcam access
- **MediaRecorder API**: Video recording functionality
- **Canvas API**: Image manipulation and frame capture
- **Web Storage API**: Local data persistence

### Build and Deployment
- **Docker**: Containerization with multi-stage builds
- **Nginx**: Production web server with SSL/TLS
- **OpenSSL**: SSL certificate generation

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── AppNavbar.js        # Main navigation component
│   ├── ErrorBoundary.js    # Error handling wrapper
│   ├── LoadingSpinner.js   # Loading state indicators
│   ├── NotificationSystem.js # Toast notifications
│   ├── ProtectedRoute.js   # Route authentication guard
│   ├── WebcamDisplay.js    # Camera interface component
│   └── index.js            # Component barrel exports
├── context/             # Global state management
│   └── AppContext.js       # Main application context
├── hooks/               # Custom React hooks
│   ├── useAuth.js          # Authentication logic
│   ├── useWebcam.js        # Webcam functionality
│   └── index.js            # Hook barrel exports
├── pages/               # Main application pages
│   ├── HomePage.js         # Landing/welcome page
│   ├── ProfilePage.js      # User registration form
│   ├── ImagePage.js        # Image viewing and recording
│   └── FinalPage.js        # Results and completion
├── services/            # External service integration
│   └── apiService.js       # HTTP client and API calls
├── utils/               # Helper functions and utilities
│   ├── authUtils.js        # Authentication utilities
│   └── helpers.js          # General helper functions
├── constants/           # Application constants
│   └── index.js            # API endpoints, routes, configs
├── styles/              # Global styling
│   └── global.css          # Application-wide styles
└── nationalities.js     # Country/nationality data
```

### File Organization Principles
- **Barrel Exports**: `index.js` files for clean imports
- **Single Responsibility**: Each file has a clear, focused purpose
- **Consistent Naming**: PascalCase for components, camelCase for utilities
- **Logical Grouping**: Related functionality grouped in directories

## Component Architecture

### Component Hierarchy
```
App
├── ErrorBoundary
├── AppProvider (Context)
├── Router
├── AppNavbar
└── Pages
    ├── HomePage
    ├── ProfilePage
    ├── ImagePage
    │   ├── WebcamDisplay
    │   ├── LoadingSpinner
    │   └── NotificationSystem
    └── FinalPage
        └── LoadingSpinner
```

### Component Types

#### 1. Page Components
- **Purpose**: Top-level route components
- **Responsibilities**: Data fetching, page-level state, layout
- **Examples**: `HomePage`, `ProfilePage`, `ImagePage`, `FinalPage`

#### 2. UI Components
- **Purpose**: Reusable interface elements
- **Responsibilities**: Presentation, user interaction
- **Examples**: `LoadingSpinner`, `AppNavbar`, `WebcamDisplay`

#### 3. Higher-Order Components
- **Purpose**: Component enhancement and logic reuse
- **Responsibilities**: Authentication, error handling, data provision
- **Examples**: `ErrorBoundary`, `ProtectedRoute`

### Component Design Patterns

#### Composition Pattern
```javascript
// Example: ProtectedRoute composition
<ProtectedRoute>
  <ImagePage />
</ProtectedRoute>
```

#### Render Props Pattern
```javascript
// Example: WebcamDisplay with render props
<WebcamDisplay>
  {({ isStreaming, captureFrame }) => (
    <RecordingControls 
      isActive={isStreaming}
      onCapture={captureFrame}
    />
  )}
</WebcamDisplay>
```

#### Custom Hooks Pattern
```javascript
// Example: useWebcam hook
const { videoRef, isStreaming, startWebcam, stopWebcam } = useWebcam();
```

## State Management

### Context API Implementation

#### AppContext Structure
```javascript
const initialState = {
  profile: {
    nickname: '',
    email: '',
    age: null,
    gender: '',
    nationality: '',
    userId: null,
  },
  images: [],              // List of image names from API
  currentImageIndex: 0,    // Current image position
  imageReactions: [],      // User reactions to images
  assessmentResults: null, // Final assessment data
  isLoading: false,        // Global loading state
  error: null,            // Global error state
  isAuthenticated: false, // Authentication status
};
```

#### State Actions
```javascript
export const ACTION_TYPES = {
  SET_PROFILE: 'SET_PROFILE',
  UPDATE_PROFILE_FIELD: 'UPDATE_PROFILE_FIELD',
  SET_IMAGES: 'SET_IMAGES',
  SET_CURRENT_IMAGE_INDEX: 'SET_CURRENT_IMAGE_INDEX',
  ADD_IMAGE_REACTION: 'ADD_IMAGE_REACTION',
  SET_ASSESSMENT_RESULTS: 'SET_ASSESSMENT_RESULTS',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_AUTHENTICATED: 'SET_AUTHENTICATED',
  RESET_STATE: 'RESET_STATE'
};
```

#### State Flow
1. **Profile Creation**: User data collected and stored
2. **Authentication**: JWT tokens managed, auth state updated
3. **Image Processing**: Progress tracked through image list
4. **Reaction Collection**: User responses accumulated
5. **Final Submission**: Assessment data compiled and sent

### Local State Management
- **Component State**: For UI-specific data (form inputs, loading states)
- **Ref Management**: For DOM manipulation and media streams
- **Effect Cleanup**: Proper cleanup of subscriptions and timers

## API Integration

### Service Layer Architecture

#### ApiService Class
```javascript
class ApiService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || '';
  }
  
  // JWT token management
  getAccessToken()
  setAuthTokens(accessToken, refreshToken)
  clearAuthTokens()
  refreshAccessToken()
  
  // HTTP request wrapper
  async request(endpoint, options = {})
  
  // API endpoints
  async submitProfile(profileData)
  async getImage(imageName)
  async predictEmotion(videoBlob)
  async submitAssessment(assessmentData)
}
```

#### API Endpoints
```javascript
export const API_ENDPOINTS = {
  RECOGNITION: '/api/classifier/predict/',
  PROFILE: '/api/v1/login',
  IMAGE: '/api/v1/download-image',
  SUBMIT_ASSESSMENT: '/api/v1/register-result'
};
```

### HTTP Client Configuration
- **Base URL**: Environment-configurable API endpoint
- **Authentication**: Automatic JWT token inclusion
- **Error Handling**: Centralized error processing
- **Request/Response Interceptors**: Token refresh, logging
- **Timeout Management**: Configurable request timeouts

### Authentication Flow
1. **Login**: Submit profile data to `/api/v1/login`
2. **Token Storage**: Store JWT in HTTP-only cookies
3. **Request Authentication**: Include tokens in API calls
4. **Token Refresh**: Automatic refresh before expiration
5. **Logout**: Clear tokens and redirect to home

## Webcam and Media Handling

### WebRTC Integration

#### useWebcam Hook
```javascript
export const useWebcam = () => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(null);

  // Core functionality
  const startWebcam = useCallback(async () => { /* ... */ });
  const stopWebcam = useCallback(() => { /* ... */ });
  const captureFrame = useCallback(() => { /* ... */ });

  return {
    videoRef,
    canvasRef,
    streamRef,
    isStreaming,
    error,
    startWebcam,
    stopWebcam,
    captureFrame
  };
};
```

#### Media Constraints
```javascript
export const WEBCAM_CONFIG = {
  VIDEO_CONSTRAINTS: {
    width: { ideal: 640 },
    height: { ideal: 480 },
    frameRate: { ideal: 30 },
    facingMode: 'user'
  },
  RECORDING_OPTIONS: {
    mimeType: 'video/webm;codecs=vp9',
    videoBitsPerSecond: 2500000
  }
};
```

### Video Recording Process
1. **Stream Initialization**: Request camera access with constraints
2. **Recording Setup**: Configure MediaRecorder with options
3. **Data Collection**: Capture video chunks during recording
4. **Blob Creation**: Compile chunks into video blob
5. **Upload Preparation**: Convert blob for API transmission

### Error Handling
- **Permission Denied**: Graceful handling of camera access denial
- **Hardware Issues**: Detection of missing or faulty cameras
- **Browser Compatibility**: WebRTC support detection
- **Network Issues**: Handling of upload failures

## Authentication System

### JWT Implementation

#### Token Management
```javascript
// Cookie-based storage for security
setAuthTokens(accessToken, refreshToken) {
  document.cookie = `accessToken=${accessToken}; path=/; secure; SameSite=Strict; max-age=900`;
  document.cookie = `refreshToken=${refreshToken}; path=/; secure; SameSite=Strict; max-age=604800`;
}

// Automatic token refresh
async refreshAccessToken() {
  const response = await this.request('/auth/refresh', { method: 'POST' });
  if (response?.accessToken) {
    this.setAuthTokens(response.accessToken);
    return response.accessToken;
  }
  throw new Error('Failed to refresh token');
}
```

#### Protected Routes
```javascript
const ProtectedRoute = ({ children }) => {
  const { state } = useAppContext();
  const location = useLocation();

  if (!state.isAuthenticated) {
    return <Navigate to={ROUTES.HOME} state={{ from: location }} replace />;
  }

  return children;
};
```

### Security Features
- **HTTP-Only Cookies**: Prevent XSS attacks
- **Secure Transmission**: HTTPS enforcement
- **Token Expiration**: Short-lived access tokens
- **Automatic Refresh**: Seamless token renewal
- **Route Protection**: Authentication-required pages

## Build and Deployment

### Development Environment
```bash
# Install dependencies
npm install

# Start development server
npm start

# Run tests
npm test

# Code linting
npm run lint

# Code formatting
npm run format
```

### Production Build
```bash
# Create optimized build
npm run build

# Analyze bundle size
npm run analyze
```

### Docker Configuration

#### Multi-stage Dockerfile
```dockerfile
# Stage 1: Build
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine
RUN apk add --no-cache openssl
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
# SSL certificate generation and nginx configuration
```

#### Container Features
- **Multi-stage Build**: Optimized image size
- **SSL/TLS Support**: Automatic certificate generation
- **Nginx Configuration**: Production-ready web server
- **Health Checks**: Container health monitoring

### Environment Configuration
```bash
# Environment variables
REACT_APP_API_URL=https://api.example.com
REACT_APP_ENVIRONMENT=production
REACT_APP_VERSION=1.0.0
```

## Development Guidelines

### Code Style
- **ESLint Configuration**: Enforced coding standards
- **Prettier Integration**: Consistent code formatting
- **Naming Conventions**: Clear, descriptive names
- **File Organization**: Logical structure and imports

### Component Development
```javascript
// Component template
import React, { useState, useEffect } from 'react';
import { ComponentProps } from './types';

const ComponentName = ({ prop1, prop2, ...otherProps }) => {
  // Hooks
  const [state, setState] = useState(initialValue);
  
  // Effects
  useEffect(() => {
    // Side effects
    return () => {
      // Cleanup
    };
  }, [dependencies]);
  
  // Event handlers
  const handleEvent = useCallback(() => {
    // Handler logic
  }, [dependencies]);
  
  // Render
  return (
    <div {...otherProps}>
      {/* Component JSX */}
    </div>
  );
};

export default ComponentName;
```

### Error Handling
```javascript
// Error boundary implementation
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

## Testing Strategy

### Test Configuration
```javascript
// setupTests.js
import '@testing-library/jest-dom';

// Mock implementations for testing
global.navigator.mediaDevices = {
  getUserMedia: jest.fn()
};
```

### Testing Patterns
```javascript
// Component testing example
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AppProvider } from '../context/AppContext';
import ProfilePage from '../pages/ProfilePage';

describe('ProfilePage', () => {
  const renderWithContext = (component) => {
    return render(
      <AppProvider>
        {component}
      </AppProvider>
    );
  };

  test('renders profile form', () => {
    renderWithContext(<ProfilePage />);
    expect(screen.getByLabelText(/nickname/i)).toBeInTheDocument();
  });
});
```

### Test Categories
- **Unit Tests**: Individual component and function testing
- **Integration Tests**: Component interaction testing
- **API Tests**: Service layer testing
- **E2E Tests**: Complete workflow testing

## Performance Optimization

### React Optimization
- **React.memo**: Prevent unnecessary re-renders
- **useCallback**: Memoize event handlers
- **useMemo**: Optimize expensive calculations
- **Code Splitting**: Dynamic imports for route-based splitting

### Bundle Optimization
- **Tree Shaking**: Remove unused code
- **Minification**: Reduce bundle size
- **Compression**: Gzip/Brotli compression
- **Caching**: Browser and CDN caching strategies

### Media Optimization
- **Video Compression**: Optimized recording settings
- **Frame Rate Control**: Balanced quality and performance
- **Upload Optimization**: Chunked uploads for large files

## Troubleshooting

### Common Issues

#### Webcam Problems
```javascript
// Debug webcam issues
const debugWebcam = async () => {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    console.log('Available devices:', devices);
    
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true
    });
    console.log('Camera access successful');
    stream.getTracks().forEach(track => track.stop());
  } catch (error) {
    console.error('Webcam error:', error);
  }
};
```

#### API Integration Issues
```javascript
// Debug API calls
const debugAPI = async () => {
  try {
    const response = await fetch('/api/health');
    console.log('API Status:', response.status);
    console.log('Response:', await response.json());
  } catch (error) {
    console.error('API Error:', error);
  }
};
```

#### State Management Issues
```javascript
// Debug context state
const DebugContext = () => {
  const { state } = useAppContext();
  
  useEffect(() => {
    console.log('Current state:', state);
  }, [state]);
  
  return null;
};
```

### Development Tools
- **React DevTools**: Component inspection and profiling
- **Browser DevTools**: Network, console, and performance analysis
- **Source Maps**: Debugging in development builds
- **Error Reporting**: Comprehensive error logging

### Performance Monitoring
- **Web Vitals**: Core performance metrics
- **Bundle Analysis**: Code splitting effectiveness
- **Memory Usage**: Leak detection and optimization
- **Network Performance**: API call optimization

For deployment-specific information, see the [Deployment Documentation](./DEPLOYMENT.md).
For user-facing features, see the [Functional Documentation](./FUNCTIONAL.md).
