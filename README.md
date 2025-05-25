# Emotion Recognition Frontend

A modern React application for emotion recognition using facial analysis technology.

## 🚀 Features

- **User Profile Management**: Secure demographic data collection
- **Real-time Webcam Integration**: Live video capture with multiple frame sampling  
- **Emotion Analysis**: Advanced facial expression recognition
- **Responsive Design**: Mobile-first approach with Bootstrap integration
- **Error Handling**: Comprehensive error boundaries and user feedback
- **State Management**: Context API for global state management
- **Modern Architecture**: Clean, scalable folder structure

## 🏗️ Project Structure

``` bash
src/
├── components/          # Reusable UI components
│   ├── ErrorBoundary.js    # Error handling wrapper
│   ├── LoadingSpinner.js   # Loading states
│   ├── WebcamDisplay.js    # Camera component
│   ├── AppNavbar.js        # Navigation
│   └── index.js            # Component exports
├── context/             # Global state management
│   └── AppContext.js       # Main application context
├── hooks/               # Custom React hooks
│   ├── useWebcam.js        # Webcam functionality
│   └── index.js            # Hook utilities
├── pages/               # Page components
│   ├── HomePage.js         # Landing page
│   ├── ProfilePage.js      # User profile form
│   ├── ImagePage.js        # Camera capture
│   └── FinalPage.js        # Results display
├── services/            # API services
│   └── apiService.js       # HTTP client
├── utils/               # Utility functions
│   └── helpers.js          # Common utilities
├── constants/           # Application constants
│   └── index.js            # Constants and enums
├── styles/              # Global styles
│   └── global.css          # Custom CSS
└── assets/              # Static assets
    ├── images/
    └── icons/
```

## 🛠️ Technologies Used

- **React 19.1.0**: Latest React with concurrent features
- **React Router**: Client-side routing
- **React Bootstrap**: UI component library
- **Bootstrap Icons**: Icon library (install with `npm install bootstrap-icons`)
- **Context API**: State management
- **Modern JavaScript**: ES6+ features

## 📱 Key Components

### 1. Context & State Management

- **AppContext**: Centralized state management with useReducer
- **Actions**: Predefined action types for state updates
- **Custom hooks**: Easy access to context throughout the app

### 2. Custom Hooks

- **useWebcam**: Complete webcam functionality with error handling
- **useLocalStorage**: Persistent storage management
- **useDebounce**: Performance optimization for inputs
- **useAsync**: Async operation handling

### 3. Reusable Components

- **ErrorBoundary**: Graceful error handling
- **LoadingSpinner**: Consistent loading states
- **WebcamDisplay**: Professional camera interface
- **AppNavbar**: Responsive navigation

### 4. Utility Functions

- **Validation**: Email and profile validation
- **Helpers**: Date formatting, session management
- **Browser Support**: Feature detection
- **Data Conversion**: Image processing utilities

## 🚦 Installation & Setup

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Modern browser with camera support

### Quick Start

```bash
# Install dependencies (note: npm may need to be installed first)
npm install bootstrap-icons

# Start development server  
npm start
```

### Environment Configuration

Create a `.env` file:

```env
REACT_APP_API_URL=http://localhost:3001
REACT_APP_WEBCAM_TIMEOUT=10000
REACT_APP_CAPTURE_INTERVAL=2000
```

## 🎯 Usage Flow

1. **Home Page** (`/`): Welcome screen with instructions
2. **Profile Page** (`/profile`): User demographic data collection
3. **Image Page** (`/image`): Camera capture with real-time preview
4. **Final Page** (`/final`): Results display with emotion breakdown

## 🔧 Architecture Benefits

### Scalability

- Modular component structure
- Centralized state management
- Reusable utility functions
- Clear separation of concerns

### Maintainability  

- Consistent naming conventions
- Comprehensive error handling
- Type-safe constants
- Documentation and comments

### Performance

- Optimized rendering with Context API
- Debounced inputs
- Lazy loading capabilities
- Memory leak prevention

### User Experience

- Responsive design
- Loading states
- Error feedback
- Accessibility features

## 🛡️ Error Handling

The application includes comprehensive error handling:

- **ErrorBoundary**: Catches and displays React errors
- **Form Validation**: Real-time input validation
- **API Error Handling**: Graceful fallbacks for network issues
- **Browser Compatibility**: Feature detection and warnings

## 🎨 Styling System

- **Global Variables**: CSS custom properties for theming
- **Bootstrap Integration**: Consistent component styling
- **Responsive Design**: Mobile-first approach
- **Custom Animations**: Smooth transitions and loading states

## 🔒 Security Features

- Input sanitization and validation
- Secure camera permission handling
- No sensitive data persistence
- Error message sanitization

---

## Original Create React App Documentation

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

## Building and Running with Docker

You can also build and run this project using Docker.

### Build the Docker image

Use the following command in the project's root directory (where the `Dockerfile` is located) to build the Docker image:

```sh
docker build -t emotions-recognition-fe .
```

### Run the Docker container

Once the image is built, you can run it as a container. This command will also load environment variables from the `.config` file and map port 80 of the container to port 80 on your host machine:

```sh
docker run --env-file .config -p 443:443 emotions-recognition-fe
```

You should then be able to access the application at [http://localhost:80](http://localhost:80).

docker run -d --env-file .config --name emotions-fe-fixed --network emotions_recognition_default -p 443:443 -p 80:80  emotions-recognition-fe
