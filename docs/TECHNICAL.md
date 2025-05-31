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
9. [WebSocket Integration](#websocket-integration)
10. [Build and Deployment](#build-and-deployment)
11. [Development Guidelines](#development-guidelines)
12. [Testing Strategy](#testing-strategy)
13. [Performance Optimization](#performance-optimization)
14. [Troubleshooting](#troubleshooting)

## Architecture Overview

The application follows a modern React architecture with a component-based design pattern, utilizing React 19 features and hooks for state management and side effects.

### Core Architecture Principles
- **Component-Based Design**: Modular, reusable UI components
- **Unidirectional Data Flow**: React Context for global state management
- **Separation of Concerns**: Clear separation between UI, logic, and data layers
- **Error Boundaries**: Comprehensive error handling at component levels
- **Progressive Enhancement**: Graceful degradation for unsupported features

### Application Flow

The application follows a unidirectional data flow pattern from user input through state management, API layer, to backend services.

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
- **WebSocket API**: Real-time bidirectional communication
- **MediaRecorder API**: Video recording functionality
- **Canvas API**: Image manipulation and frame capture
- **Web Storage API**: Local data persistence

### Build and Deployment
- **Docker**: Containerization with multi-stage builds
- **Nginx**: Production web server with SSL/TLS
- **OpenSSL**: SSL certificate generation

## Project Structure

The application follows a well-organized directory structure with components, hooks, pages, services, and utilities properly separated. Key directories include:

- **components/**: Reusable UI components like AppNavbar, ErrorBoundary, LoadingSpinner, etc.
- **context/**: Global state management with AppContext
- **hooks/**: Custom React hooks including useAuth, useWebcam, and useWebSocket
- **pages/**: Main application pages (HomePage, ProfilePage, ImagePage, FinalPage)
- **services/**: External service integration with apiService
- **utils/**: Helper functions and utilities
- **constants/**: Application constants and configurations

### File Organization Principles
- **Barrel Exports**: `index.js` files for clean imports
- **Single Responsibility**: Each file has a clear, focused purpose
- **Consistent Naming**: PascalCase for components, camelCase for utilities
- **Logical Grouping**: Related functionality grouped in directories

## Component Architecture

### Component Hierarchy

The application follows a hierarchical structure with the main App component at the root, containing an ErrorBoundary for error handling, AppProvider for context management, Router for navigation, and AppNavbar for the navigation bar. Pages include HomePage, ProfilePage, ImagePage (with WebcamDisplay, LoadingSpinner, and NotificationSystem), and FinalPage (with LoadingSpinner).

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

Components are composed together using wrapper patterns, such as ProtectedRoute wrapping page components like ImagePage to provide authentication and access control.

#### Render Props Pattern

Components like WebcamDisplay can provide render props, allowing child components to access streaming state and capture functions through a render prop pattern.

#### Custom Hooks Pattern

Custom hooks like useWebcam provide reusable logic for webcam functionality, returning video reference, streaming status, and control methods for starting and stopping the webcam.

## State Management

### Context API Implementation

#### AppContext Structure

The initial state object contains a profile object with user information (nickname, email, age, gender, nationality, userId), an array of images from the API, current image index for tracking progress, image reactions array for user responses, assessment results for final data, loading and error states for UI feedback, and authentication status.

#### State Actions

The application uses action types for state management including SET_PROFILE, UPDATE_PROFILE_FIELD, SET_IMAGES, SET_CURRENT_IMAGE_INDEX, ADD_IMAGE_REACTION, SET_ASSESSMENT_RESULTS, SET_LOADING, SET_ERROR, SET_AUTHENTICATED, and RESET_STATE.

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

The ApiService class manages HTTP communication with the backend, featuring a configurable base URL from environment variables, JWT token management methods (getAccessToken, setAuthTokens, clearAuthTokens, refreshAccessToken), a generic HTTP request wrapper, and specific API endpoint methods for profile submission, image retrieval, emotion prediction, and assessment submission.

#### API Endpoints

The application defines endpoint constants for the emotion recognition API (/api/classifier/predict/), profile login (/api/v1/login), image download (/api/v1/download-image), and assessment submission (/api/v1/register-result).

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

The useWebcam hook manages webcam functionality with state for streaming status, error handling, and references to video, stream, and canvas elements. It provides methods for starting the webcam, stopping the stream, and capturing frame images.

#### Media Constraints

The webcam configuration defines video constraints with ideal dimensions of 640x480, 30fps frame rate, and user-facing camera mode. Recording options specify WebM format with VP9 codec and 2.5Mbps video bitrate.

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

The authentication system uses secure cookie-based token storage with HTTP-only, secure, and SameSite attributes. Access tokens have a 15-minute expiration while refresh tokens last 7 days. The refresh mechanism automatically renews tokens before expiration.

#### Protected Routes

The ProtectedRoute component checks authentication status and redirects unauthenticated users to the home page while preserving the intended destination for post-login redirection.

### Security Features
- **HTTP-Only Cookies**: Prevent XSS attacks
- **Secure Transmission**: HTTPS enforcement
- **Token Expiration**: Short-lived access tokens
- **Automatic Refresh**: Seamless token renewal
- **Route Protection**: Authentication-required pages

## WebSocket Integration

### Real-time Communication Architecture

The application implements WebSocket connections for real-time features, providing instant updates and live interaction capabilities between users and the server.

#### useWebSocket Hook Implementation

The useWebSocket hook manages WebSocket connections with state tracking for connection status, active user count, and error handling. It provides methods for connecting, disconnecting, and sending messages with automatic reconnection logic.

#### Message Handling System

The message handling system processes different message types including active user updates, emotion predictions, user join/leave notifications, and custom application-specific messages.

### Real-time Features Implementation

#### 1. Active Users Counter

The application displays a live count of connected users in the navigation bar, showing connection status with colored badges and user count when online.

#### 2. Real-time Emotion Detection

Live emotion classification analyzes user text input when connected, sending messages to the server for processing and displaying results with confidence scores.

### Connection Management

#### Automatic Reconnection

The reconnection system implements exponential backoff with a maximum of 5 attempts, increasing delay between attempts to prevent server overload.

#### Cleanup and Memory Management

Proper cleanup includes closing connections on component unmount, handling page visibility changes to pause connections when hidden, and removing event listeners to prevent memory leaks.

### Environment Configuration

#### WebSocket Configuration

Configuration includes development and production WebSocket URLs, reconnection parameters (3-second initial interval, 5 max attempts), ping interval for keep-alive (30 seconds), and message type constants.

#### Environment Variables

Environment configuration supports WebSocket URL (REACT_APP_WS_URL), connection timeout (REACT_APP_WS_TIMEOUT), and feature enablement flag (REACT_APP_ENABLE_WEBSOCKET).

### Error Handling and Fallbacks

#### Connection Error Handling

Error handling provides user-friendly messages, graceful degradation of real-time features, and automatic reconnection attempts with exponential backoff.

#### Graceful Degradation
- **Offline Mode**: Application functions without WebSocket features
- **Progressive Enhancement**: Real-time features enhance but don't break core functionality
- **User Feedback**: Clear indicators of connection status
- **Fallback Mechanisms**: Alternative data fetching when WebSocket unavailable

### Performance Considerations

#### Message Throttling

Message throttling limits transmission to one message per 500ms to prevent server overload and ensure optimal performance.

#### Memory Management
- **Message Queue Cleanup**: Prevent memory leaks from queued messages
- **Event Listener Cleanup**: Proper removal of WebSocket event listeners
- **State Reset**: Clear WebSocket-related state on disconnect
- **Garbage Collection**: Explicit cleanup of WebSocket instances

## Build and Deployment

### Development Environment

Development commands include dependency installation (npm install), development server startup (npm start), test execution (npm test), code linting (npm run lint), and code formatting (npm run format).

### Production Build

Production build process includes optimized build creation (npm run build) and bundle analysis (npm run analyze) for performance monitoring.

### Docker Configuration

#### Multi-stage Dockerfile

The Docker configuration uses a multi-stage build with Node.js 20 Alpine for building and Nginx Alpine for serving. It includes OpenSSL for SSL certificate generation and custom Nginx configuration.

#### Container Features
- **Multi-stage Build**: Optimized image size
- **SSL/TLS Support**: Automatic certificate generation
- **Nginx Configuration**: Production-ready web server
- **Health Checks**: Container health monitoring

### Environment Configuration

Environment variables include API URL (REACT_APP_API_URL), environment specification (REACT_APP_ENVIRONMENT), and version tracking (REACT_APP_VERSION).

## Development Guidelines

### Code Style
- **ESLint Configuration**: Enforced coding standards
- **Prettier Integration**: Consistent code formatting
- **Naming Conventions**: Clear, descriptive names
- **File Organization**: Logical structure and imports

### Component Development

Component templates follow React best practices with proper hook usage, effect management with cleanup, memoized event handlers, and structured JSX rendering with prop spreading.

### Error Handling

Error boundary implementation captures component errors, provides fallback UI, logs errors for debugging, and maintains application stability.

## Testing Strategy

### Test Configuration

Test setup includes Jest DOM extensions for enhanced assertions and mock implementations for browser APIs like mediaDevices.getUserMedia.

### Testing Patterns

Component testing uses React Testing Library with custom render helpers that wrap components in context providers, enabling realistic testing of context-dependent components.

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

Webcam debugging involves checking available devices through navigator.mediaDevices.enumerateDevices(), testing camera access with getUserMedia(), and logging device information for troubleshooting.

#### API Integration Issues

API debugging includes health endpoint testing, response status checking, and comprehensive error logging to identify connection and authentication issues.

#### State Management Issues

Context debugging uses effect hooks to log state changes and monitor context updates for identifying state management problems.

#### WebSocket Connection Issues

WebSocket debugging creates test connections, monitors connection events (open, close, error), and implements ping/pong testing to verify connectivity.

**Common WebSocket Issues:**
- **Connection Refused**: Check if WebSocket server is running on correct port
- **CORS Issues**: Ensure WebSocket server allows connections from frontend domain
- **SSL/TLS Issues**: Use `wss://` for HTTPS sites, `ws://` for HTTP
- **Network Firewalls**: Corporate firewalls may block WebSocket connections
- **Browser Limits**: Some browsers limit concurrent WebSocket connections

**Troubleshooting Steps:**

1. Verify WebSocket URL in environment variables
2. Check browser console for connection errors
3. Test WebSocket server independently
4. Confirm network connectivity
5. Check for proxy or firewall blocking connections

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
