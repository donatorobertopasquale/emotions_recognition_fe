# Emotion Recognition Frontend - Documentation

## Overview

This is a comprehensive React-based emotion recognition system that allows users to create profiles, view emotion-inducing images, record their reactions, and participate in emotion analysis research. The application provides a complete workflow from user registration to final data submission.

## Quick Start

1. **Clone the repository**
2. **Install dependencies**: `npm install`
3. **Start development server**: `npm start`
4. **Build for production**: `npm run build`

## Documentation Structure

This documentation is organized into three main sections:

### 📖 [Functional Documentation](./FUNCTIONAL.md)
Complete guide to application features, user workflow, and functionality from an end-user perspective.

### 🔧 [Technical Documentation](./TECHNICAL.md)
In-depth technical reference covering architecture, technologies, APIs, and development guidelines.

### 🚀 [Deployment Documentation](./DEPLOYMENT.md)
Containerization, deployment strategies, and production configuration.

## Key Features

- **Multi-step User Workflow**: Profile creation → Image viewing → Reaction recording → Results submission
- **Real-time Webcam Integration**: Video recording during image viewing with configurable duration
- **Emotion Analysis**: Integration with AI-powered emotion recognition APIs
- **Responsive Design**: Mobile-first approach with Bootstrap 5
- **State Management**: Context API for global application state
- **Authentication**: JWT-based authentication with secure cookie storage
- **Error Handling**: Comprehensive error boundaries and user feedback
- **Internationalization Support**: Multi-language nationality selection

## Technology Stack

- **Frontend**: React 19, React Router 6, React Bootstrap
- **Styling**: Bootstrap 5, Bootstrap Icons
- **Media**: WebRTC for webcam access and video recording
- **Authentication**: JWT tokens with HTTP-only cookies
- **Testing**: Jest, React Testing Library
- **Containerization**: Docker with Nginx for production
- **SSL/TLS**: Automatic SSL certificate generation

## Project Structure

```
src/
├── components/          # Reusable UI components
├── context/            # Global state management
├── hooks/              # Custom React hooks
├── pages/              # Main application pages
├── services/           # API integration layer
├── utils/              # Helper functions and utilities
├── constants/          # Application constants
└── styles/             # Global styling
```

## Getting Started

For detailed setup instructions, see the [Technical Documentation](./TECHNICAL.md).

For understanding the user journey and features, see the [Functional Documentation](./FUNCTIONAL.md).

## Contributing

1. Review the technical documentation for architecture guidelines
2. Follow the established folder structure and naming conventions
3. Ensure all new features include appropriate error handling
4. Add tests for new functionality
5. Update documentation when adding new features

## Support

For technical issues, refer to the [Technical Documentation](./TECHNICAL.md) troubleshooting section.
For workflow questions, see the [Functional Documentation](./FUNCTIONAL.md).
