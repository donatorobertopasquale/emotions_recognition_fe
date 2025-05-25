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
      }
    } catch (err) {
      setError('Failed to access webcam: ' + err.message);
      console.error('Webcam error:', err);
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
  }, []);

  const captureFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) {
      return null;
    }

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    return canvas.toDataURL('image/jpeg', 0.8);
  }, []);

  const captureMultipleFrames = useCallback((count = WEBCAM_CONFIG.FRAME_COUNT) => {
    return new Promise((resolve) => {
      const frames = [];
      let capturedCount = 0;

      const captureInterval = setInterval(() => {
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
