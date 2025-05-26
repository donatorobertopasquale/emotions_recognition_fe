import React, { createContext, useContext, useReducer } from 'react';

// Initial state
const initialState = {
  profile: {
    nickname: '',
    email: '',
    age: null,
    gender: '',
    nationality: '',
    userId: null, // Store userId from login response
  },
  images: [], // List of image names from login response
  currentImageIndex: 0, // Track which image we're currently showing
  imageReactions: [], // Store reactions for each image
  assessmentResults: null,
  isLoading: false,
  error: null,
  isAuthenticated: false, // Track authentication status
};

// Action types
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

// Reducer
const appReducer = (state, action) => {
  switch (action.type) {
    case ACTION_TYPES.SET_PROFILE:
      return {
        ...state,
        profile: action.payload
      };
    case ACTION_TYPES.UPDATE_PROFILE_FIELD:
      return {
        ...state,
        profile: {
          ...state.profile,
          [action.payload.field]: action.payload.value
        }
      };
    case ACTION_TYPES.SET_IMAGES:
      return {
        ...state,
        images: action.payload
      };
    case ACTION_TYPES.SET_CURRENT_IMAGE_INDEX:
      return {
        ...state,
        currentImageIndex: action.payload
      };
    case ACTION_TYPES.ADD_IMAGE_REACTION:
      return {
        ...state,
        imageReactions: [...state.imageReactions, action.payload]
      };
    case ACTION_TYPES.SET_ASSESSMENT_RESULTS:
      return {
        ...state,
        assessmentResults: action.payload
      };
    case ACTION_TYPES.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      };    case ACTION_TYPES.SET_ERROR:
      return {
        ...state,
        error: action.payload
      };
    case ACTION_TYPES.SET_AUTHENTICATED:
      return {
        ...state,
        isAuthenticated: action.payload
      };
    case ACTION_TYPES.RESET_STATE:
      return initialState;
    default:
      return state;
  }
};

// Context
const AppContext = createContext();

// Provider component
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const value = {
    state,
    dispatch,
    // Action creators
    setProfile: (profile) => dispatch({ type: ACTION_TYPES.SET_PROFILE, payload: profile }),
    updateProfileField: (field, value) => dispatch({ 
      type: ACTION_TYPES.UPDATE_PROFILE_FIELD, 
      payload: { field, value } 
    }),
    setImages: (images) => dispatch({ type: ACTION_TYPES.SET_IMAGES, payload: images }),
    setCurrentImageIndex: (index) => dispatch({ type: ACTION_TYPES.SET_CURRENT_IMAGE_INDEX, payload: index }),
    addImageReaction: (reaction) => dispatch({ type: ACTION_TYPES.ADD_IMAGE_REACTION, payload: reaction }),    setAssessmentResults: (results) => dispatch({ type: ACTION_TYPES.SET_ASSESSMENT_RESULTS, payload: results }),
    setLoading: (loading) => dispatch({ type: ACTION_TYPES.SET_LOADING, payload: loading }),
    setError: (error) => dispatch({ type: ACTION_TYPES.SET_ERROR, payload: error }),
    setAuthenticated: (authenticated) => dispatch({ type: ACTION_TYPES.SET_AUTHENTICATED, payload: authenticated }),
    resetState: () => dispatch({ type: ACTION_TYPES.RESET_STATE })
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Custom hook to use the context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
