import React from 'react';
import { render, screen } from '@testing-library/react';
import GoogleSignIn from '../GoogleSignIn';

// Mock Google Identity Services
const mockGoogle = {
  accounts: {
    id: {
      initialize: jest.fn(),
      renderButton: jest.fn(),
      disableAutoSelect: jest.fn(),
    },
  },
};

// Mock window.google
Object.defineProperty(window, 'google', {
  value: mockGoogle,
  writable: true,
});

describe('GoogleSignIn Component', () => {
  const mockOnSuccess = jest.fn();
  const mockOnError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders without crashing', () => {
    const { container } = render(
      <GoogleSignIn 
        onSuccess={mockOnSuccess} 
        onError={mockOnError} 
      />
    );
    
    // The component should render a div container for the Google button
    expect(container.querySelector('.d-grid')).toBeInTheDocument();
  });

  test('initializes Google Identity Services', () => {
    render(
      <GoogleSignIn 
        onSuccess={mockOnSuccess} 
        onError={mockOnError} 
      />
    );

    expect(mockGoogle.accounts.id.initialize).toHaveBeenCalledWith(
      expect.objectContaining({
        client_id: "117151816412-k3bheigoqrcrm4h9aul8203unrr1ldit.apps.googleusercontent.com",
        auto_select: false,
        cancel_on_tap_outside: false,
      })
    );
  });

  test('renders disabled state correctly', () => {
    render(
      <GoogleSignIn 
        onSuccess={mockOnSuccess} 
        onError={mockOnError} 
        disabled={true}
        text="Sign in disabled"
      />
    );

    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByText('Sign in disabled')).toBeInTheDocument();
  });
});

describe('GoogleSignIn Component - Credential Handling', () => {
  test('handles successful credential response', () => {
    const mockOnSuccess = jest.fn();
    const mockOnError = jest.fn();
    
    // Mock a valid JWT payload
    const mockPayload = {
      sub: 'google-user-id-123',
      email: 'test@gmail.com',
      name: 'Test User',
      picture: 'https://example.com/avatar.jpg',
      email_verified: true,
    };
    
    // Mock atob to return our test payload
    global.atob = jest.fn(() => JSON.stringify(mockPayload));
    
    render(
      <GoogleSignIn 
        onSuccess={mockOnSuccess} 
        onError={mockOnError} 
      />
    );

    // Get the callback that was passed to Google initialize
    const initializeCall = mockGoogle.accounts.id.initialize.mock.calls[0][0];
    const callback = initializeCall.callback;

    // Simulate Google credential response
    const mockResponse = {
      credential: 'header.payload.signature'
    };

    callback(mockResponse);

    expect(mockOnSuccess).toHaveBeenCalledWith({
      googleId: 'google-user-id-123',
      email: 'test@gmail.com',
      name: 'Test User',
      picture: 'https://example.com/avatar.jpg',
      emailVerified: true,
      credential: 'header.payload.signature'
    });
  });

  test('handles credential parsing error', () => {
    const mockOnSuccess = jest.fn();
    const mockOnError = jest.fn();
    
    // Mock atob to throw an error
    global.atob = jest.fn(() => {
      throw new Error('Invalid token');
    });
    
    render(
      <GoogleSignIn 
        onSuccess={mockOnSuccess} 
        onError={mockOnError} 
      />
    );

    // Get the callback that was passed to Google initialize
    const initializeCall = mockGoogle.accounts.id.initialize.mock.calls[0][0];
    const callback = initializeCall.callback;

    // Simulate Google credential response
    const mockResponse = {
      credential: 'invalid-jwt-token'
    };

    callback(mockResponse);

    expect(mockOnError).toHaveBeenCalledWith('Failed to process Google sign-in');
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });
});
