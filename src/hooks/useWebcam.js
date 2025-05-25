import { useState, useRef, useCallback } from 'react';
import { WEBCAM_CONFIG } from '../constants';

export const useWebcam = () => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(null);

  const startWebcam = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: WEBCAM_CONFIG.VIDEO_CONSTRAINTS,
        audio: false
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsStreaming(true);
      }    } catch (err) {
      setError('Failed to access webcam: ' + err.message);
    }
  }, []);

  const stopWebcam = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
  }, []);  const captureFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !isStreaming) {
      return null;
    }

    const canvas = canvasRef.current;
    const video = videoRef.current;
      // Check if video has valid dimensions
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      return null;
    }

    try {
      const context = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);      return canvas.toDataURL('image/jpeg', 0.8);
    } catch (error) {
      return null;
    }
  }, [isStreaming]);
  const captureMultipleFrames = useCallback((count = WEBCAM_CONFIG.FRAME_COUNT) => {
    return new Promise((resolve, reject) => {
      const frames = [];
      let capturedCount = 0;
      let attempts = 0;
      const maxAttempts = count * 5; // Allow 5 attempts per frame

      const captureInterval = setInterval(() => {
        attempts++;
        
        // Check if we've exceeded max attempts
        if (attempts > maxAttempts) {
          clearInterval(captureInterval);
          if (frames.length > 0) {
            resolve(frames); // Return whatever frames we captured
          } else {
            reject(new Error('Failed to capture any frames after maximum attempts'));
          }
          return;
        }

        const frame = captureFrame();
        if (frame) {
          frames.push({
            data: frame,
            timestamp: new Date().toISOString(),
            frameNumber: capturedCount + 1
          });
          capturedCount++;

          if (capturedCount >= count) {
            clearInterval(captureInterval);
            resolve(frames);
          }
        }
      }, WEBCAM_CONFIG.CAPTURE_INTERVAL);

      // Set a timeout as a fallback
      setTimeout(() => {
        clearInterval(captureInterval);
        if (frames.length > 0) {
          resolve(frames);
        } else {
          reject(new Error('Capture timeout - no frames captured'));
        }
      }, (count * WEBCAM_CONFIG.CAPTURE_INTERVAL * 2) + 5000); // Give extra time
    });
  }, [captureFrame]);

  return {
    videoRef,
    canvasRef,
    isStreaming,
    error,
    startWebcam,
    stopWebcam,
    captureFrame,
    captureMultipleFrames
  };
};
