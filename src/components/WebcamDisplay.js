import React from 'react';
import { Card } from 'react-bootstrap';

const WebcamDisplay = ({ 
  videoRef, 
  canvasRef, 
  isStreaming, 
  width = 640, 
  height = 480,
  className = "" 
}) => {
  return (
    <Card className={`webcam-container ${className}`}>
      <Card.Body className="p-3">
        <div className="position-relative">
          <video
            ref={videoRef}
            width={width}
            height={height}
            autoPlay
            muted
            playsInline
            className="w-100 rounded"
            style={{ 
              display: isStreaming ? 'block' : 'none',
              backgroundColor: '#000'
            }}
          />
          <canvas
            ref={canvasRef}
            style={{ display: 'none' }}
          />
          {!isStreaming && (
            <div 
              className="d-flex justify-content-center align-items-center bg-dark text-white rounded"
              style={{ width: '100%', height: height }}
            >
              <div className="text-center">
                <i className="bi bi-camera-video-off fs-1 mb-2"></i>
                <p className="mb-0">Camera not active</p>
              </div>
            </div>
          )}
          {isStreaming && (
            <div className="position-absolute top-0 end-0 m-2">
              <span className="badge bg-success">
                <i className="bi bi-circle-fill me-1" style={{ fontSize: '0.5rem' }}></i>
                Live
              </span>
            </div>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default WebcamDisplay;
