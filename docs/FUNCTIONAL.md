# Functional Documentation - Emotion Recognition Frontend

## Table of Contents
1. [Application Overview](#application-overview)
2. [User Workflow](#user-workflow)
3. [Feature Descriptions](#feature-descriptions)
4. [User Interface Guide](#user-interface-guide)
5. [Data Collection Process](#data-collection-process)
6. [Security and Privacy](#security-and-privacy)

## Application Overview

The Emotion Recognition Frontend is a research-oriented web application designed to collect emotional response data through a systematic workflow. Users create profiles, view emotion-inducing images, record their reactions via webcam, and submit their responses for analysis.

### Purpose
- Collect demographic and emotional response data for research
- Provide standardized emotion assessment tools
- Enable real-time video recording of emotional reactions
- Support large-scale emotion recognition studies

### Target Users
- Research participants in emotion studies
- Psychology researchers and students
- Data scientists working on emotion recognition
- Anyone interested in contributing to emotion research

## User Workflow

### 1. Welcome Screen (Home Page)
**Route**: `/`

The landing page introduces users to the application and explains the emotion recognition process.

**Features**:
- Application overview and purpose
- Step-by-step process explanation
- Browser compatibility check
- "Get Started" button to begin the process

**User Actions**:
- Read about the application
- Click "Get Started" to proceed to profile creation

### 2. Profile Creation
**Route**: `/profile`

Users provide demographic information required for research purposes.

**Required Information**:
- **Nickname**: Display name for the session
- **Email**: Contact information and unique identifier
- **Age**: Must be between 5-110 years
- **Gender**: Male, Female, Other, or Prefer not to say
- **Nationality**: Dropdown list of countries

**Process**:
1. Fill out the profile form
2. Validate all required fields
3. Submit profile to backend API
4. Receive user ID and image list from server
5. Automatically proceed to image viewing

**Error Handling**:
- Real-time field validation
- Clear error messages for invalid inputs
- Form submission error feedback

### 3. Image Viewing and Reaction Recording
**Route**: `/image`

The core functionality where users view images and record their emotional reactions.

**Process Flow**:
1. **Image Display**: One image shown at a time from the assigned list
2. **Webcam Activation**: User grants camera permission
3. **Reaction Recording**: 
   - User views the image
   - Webcam records video of user's facial expressions
   - Recording duration: 5-30 seconds (configurable)
4. **Emotion Selection**: User selects perceived emotions from predefined list
5. **Comment Addition**: Optional text description of reaction
6. **AI Analysis**: Video sent to emotion recognition API
7. **Next Image**: Process repeats for all assigned images

**Emotion Categories Available**:
- Happy 😊
- Surprise 😲
- Sad 😢
- Anger 😠
- Disgust 🤢
- Fear 😨
- Neutral 😐

**Features**:
- Progress indicator showing current image position
- Webcam preview with recording controls
- Auto-stop recording after maximum duration
- Manual recording control
- Retry functionality for unsatisfactory recordings

### 4. Results and Completion
**Route**: `/final`

Summary page showing the assessment completion and basic statistics.

**Information Displayed**:
- Total number of images processed
- Emotion distribution summary
- Dominant emotion detected
- Session completion confirmation

**Actions Available**:
- Start new assessment (resets all data)
- View detailed statistics (if implemented)

## Feature Descriptions

### Authentication System
- JWT-based authentication with secure HTTP-only cookies
- Automatic token refresh for extended sessions
- Protected routes requiring authentication
- Secure logout with token cleanup

### Webcam Integration
- Real-time video stream preview
- Configurable recording duration (5-30 seconds)
- Automatic recording controls
- Video compression for efficient upload
- Browser compatibility checks for WebRTC support

### State Management
- Global application state using React Context
- Persistent data across page navigation
- Real-time state updates during recording
- Error state management

### Responsive Design
- Mobile-first approach with Bootstrap 5
- Adaptive layout for various screen sizes
- Touch-friendly controls for mobile devices
- Optimized for both desktop and mobile webcam usage

### Error Handling
- Comprehensive error boundaries
- Graceful degradation for unsupported features
- User-friendly error messages
- Automatic retry mechanisms where appropriate

## User Interface Guide

### Navigation
- **Top Navigation Bar**: Shows current page and authentication status
- **Progress Indicators**: Visual feedback on current position in workflow
- **Breadcrumb Navigation**: Easy navigation between completed steps

### Visual Design
- **Dark Theme**: Reduces eye strain during extended usage
- **High Contrast**: Ensures accessibility for users with visual impairments
- **Consistent Icons**: Bootstrap Icons for familiar user experience
- **Loading States**: Clear feedback during API calls and processing

### Accessibility Features
- Keyboard navigation support
- Screen reader compatible markup
- High contrast color scheme
- Alternative text for images and icons

## Data Collection Process

### Profile Data
Collected during registration:
- Demographic information (age, gender, nationality)
- Contact information (email)
- Session identifier (nickname)

### Reaction Data
Collected for each image:
- **Video Recording**: Facial expression data during image viewing
- **Emotion Labels**: User-selected emotional responses
- **Textual Comments**: Optional descriptive feedback
- **Timing Data**: Duration of viewing and recording
- **Metadata**: Image identifier, timestamp, session info

### AI Analysis Data
Generated by emotion recognition API:
- **Predicted Emotions**: AI-detected emotional states
- **Confidence Scores**: Accuracy levels for predictions
- **Facial Landmarks**: Key points detected in video frames
- **Temporal Analysis**: Emotion changes over time

## Security and Privacy

### Data Protection
- Secure transmission using HTTPS/TLS
- JWT tokens for authenticated sessions
- No permanent storage of video data on client
- Secure API communication with backend

### Privacy Considerations
- Minimal data collection (only research-necessary information)
- Clear consent process before data collection
- Option to withdraw participation
- Secure handling of biometric data (facial video)

### User Consent
- Explicit consent for webcam access
- Clear explanation of data usage
- Option to review data before submission
- Withdrawal options at any stage

### Compliance Features
- GDPR-compliant data handling practices
- Clear privacy policy integration
- User data access and deletion capabilities
- Audit trail for data processing activities

## Troubleshooting Common Issues

### Webcam Problems
- **No Camera Access**: Check browser permissions and hardware
- **Poor Video Quality**: Ensure adequate lighting and stable connection
- **Recording Fails**: Verify browser WebRTC support

### Form Issues
- **Validation Errors**: Check required fields and format requirements
- **Submission Failures**: Verify internet connection and try again
- **Data Loss**: Application preserves state during navigation

### Performance Issues
- **Slow Loading**: Check internet connection and browser performance
- **Memory Usage**: Clear browser cache and restart session
- **Video Upload**: Reduce recording duration or check connection speed

For technical support and additional troubleshooting, refer to the [Technical Documentation](./TECHNICAL.md).
