import { useState, useEffect, useRef, useCallback } from 'react';
import { isAuthenticated } from '../utils/authUtils';

/**
 * Custom hook for managing WebSocket connections for emotion classification
 */
export const useWebSocket = () => {
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');
  const [lastMessage, setLastMessage] = useState(null);
  const [emotionClassification, setEmotionClassification] = useState(null);
  const [error, setError] = useState(null);
  
  const ws = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const maxReconnectAttempts = 5;
  const reconnectAttemptsRef = useRef(0);

  // Get WebSocket URL based on current environment
  const getWebSocketUrl = useCallback(() => {
    const baseURL = process.env.REACT_APP_API_URL || window.location.origin;
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    
    // Remove http/https protocol and replace with ws/wss
    const wsBaseURL = baseURL.replace(/^https?:/, wsProtocol);
    const wsUrl = `${wsBaseURL}/api/classifier/ws`;  // Fixed: Server uses /api/ws not /api/classifier/ws
    
    console.log('WebSocket URL:', wsUrl);
    return wsUrl;
  }, []);

  // Connect to WebSocket
  const connect = useCallback(() => {
    try {
      // Check if user is authenticated before connecting
      if (!isAuthenticated()) {
        setError('Authentication required. Please log in first.');
        setConnectionStatus('Error');
        return;
      }

      const wsUrl = getWebSocketUrl();
      ws.current = new WebSocket(wsUrl);
      
      ws.current.onopen = () => {
        setConnectionStatus('Connected');
        setError(null);
        reconnectAttemptsRef.current = 0;
        // eslint-disable-next-line no-console
        console.log('WebSocket connected for emotion classification');
      };
      
      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setLastMessage(data);
          
          // Debug: Log received WebSocket message
          console.log('WebSocket message received:', data);
          
          // Handle emotion classification response
          if (data.type === 'emotion_classification' && data.label && data.score !== undefined) {
            // Server sends: {type: 'emotion_classification', label: 'joy', score: 0.988...}
            console.log('Processing emotion classification:', data);
            setEmotionClassification({
              label: data.label,
              score: Math.round(data.score * 100) / 100 // Round to 2 decimal places
            });
          } else if (data.label && data.score !== undefined) {
            // Handle direct emotion classification format (fallback)
            console.log('Processing direct emotion format:', data);
            setEmotionClassification({
              label: data.label,
              score: Math.round(data.score * 100) / 100
            });
          } else {
            console.log('Unrecognized message format:', data);
          }
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error('Error parsing WebSocket message:', err);
          setError('Failed to parse server response');
        }
      };
      
      ws.current.onclose = (event) => {
        setConnectionStatus('Disconnected');
        
        // Log close details for debugging
        console.log('WebSocket closed:', {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean
        });
        
        // Handle authentication errors (code 4001 is custom for auth failure)
        if (event.code === 4001) {
          setError('Authentication failed. Please log in again.');
          return;
        }
        
        // Attempt to reconnect if not closed intentionally
        if (!event.wasClean && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current += 1;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
          
          // eslint-disable-next-line no-console
          console.log(`WebSocket disconnected. Attempting to reconnect in ${delay}ms (attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            if (ws.current?.readyState === WebSocket.CLOSED) {
              connect();
            }
          }, delay);
        } else {
          // eslint-disable-next-line no-console
          console.log('WebSocket connection closed');
        }
      };
      
      ws.current.onerror = (error) => {
        // eslint-disable-next-line no-console
        console.error('WebSocket error:', error);
        setError('WebSocket connection error');
        setConnectionStatus('Error');
      };
      
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to create WebSocket connection:', err);
      setError('Failed to establish WebSocket connection');
      setConnectionStatus('Error');
    }
  }, [getWebSocketUrl]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (ws.current) {
      ws.current.close(1000, 'User initiated disconnect');
      ws.current = null;
    }
    
    setConnectionStatus('Disconnected');
    setEmotionClassification(null);
    setError(null);
  }, []);

  // Send text for emotion classification
  const sendText = useCallback((text) => {
    if (ws.current?.readyState === WebSocket.OPEN && text.trim()) {
      try {
        console.log('Sending text to WebSocket:', text.trim());
        // Send plain text string as expected by the WebSocket API
        ws.current.send(text.trim());
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Failed to send message:', err);
        setError('Failed to send message');
      }
    } else {
      console.log('Cannot send text - WebSocket not ready:', {
        readyState: ws.current?.readyState,
        textLength: text.trim().length,
        expectedReadyState: WebSocket.OPEN
      });
    }
  }, []);

  // Clear emotion classification result
  const clearEmotionClassification = useCallback(() => {
    setEmotionClassification(null);
  }, []);

  // Initialize connection on mount
  useEffect(() => {
    connect();
    
    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    connectionStatus,
    lastMessage,
    emotionClassification,
    error,
    sendText,
    clearEmotionClassification,
    connect,
    disconnect,
    isConnected: connectionStatus === 'Connected',
    isAuthenticated: isAuthenticated()
  };
};

export default useWebSocket;
