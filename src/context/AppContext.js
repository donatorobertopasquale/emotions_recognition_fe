import React, { createContext, useContext, useReducer } from 'react';

// Initial state
const initialState = {
  profile: {
    nickname: '',
    email: '',
    age: null,
    gender: '',
    nationality: '',
  },
  capturedFrames: [],
  comments: [],
  assessmentResults: null,
  isLoading: false,
  error: null
};

// Action types
export const ACTION_TYPES = {
  SET_PROFILE: 'SET_PROFILE',
  UPDATE_PROFILE_FIELD: 'UPDATE_PROFILE_FIELD',
  ADD_CAPTURED_FRAME: 'ADD_CAPTURED_FRAME',
  SET_CAPTURED_FRAMES: 'SET_CAPTURED_FRAMES',
  ADD_COMMENT: 'ADD_COMMENT',
  SET_ASSESSMENT_RESULTS: 'SET_ASSESSMENT_RESULTS',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
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
    case ACTION_TYPES.ADD_CAPTURED_FRAME:
      return {
        ...state,
        capturedFrames: [...state.capturedFrames, action.payload]
      };
    case ACTION_TYPES.SET_CAPTURED_FRAMES:
      return {
        ...state,
        capturedFrames: action.payload
      };
    case ACTION_TYPES.ADD_COMMENT:
      return {
        ...state,
        comments: [...state.comments, action.payload]
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
      };
    case ACTION_TYPES.SET_ERROR:
      return {
        ...state,
        error: action.payload
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
    addCapturedFrame: (frame) => dispatch({ type: ACTION_TYPES.ADD_CAPTURED_FRAME, payload: frame }),
    setCapturedFrames: (frames) => dispatch({ type: ACTION_TYPES.SET_CAPTURED_FRAMES, payload: frames }),
    addComment: (comment) => dispatch({ type: ACTION_TYPES.ADD_COMMENT, payload: comment }),
    setAssessmentResults: (results) => dispatch({ type: ACTION_TYPES.SET_ASSESSMENT_RESULTS, payload: results }),
    setLoading: (loading) => dispatch({ type: ACTION_TYPES.SET_LOADING, payload: loading }),
    setError: (error) => dispatch({ type: ACTION_TYPES.SET_ERROR, payload: error }),
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
