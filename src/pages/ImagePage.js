import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Card, Form, Button } from 'react-bootstrap';
import { useEffect, useRef } from 'react';

const ImagePage = () => {
  const [comment, setComment] = useState('');
  const navigate = useNavigate();

  const handleNext = async () => {
    console.log('Comment:', comment); // Debugging
    // Simulate API call for recognition and next image
    const response = await fetch('/api/recognition', { method: 'POST' });
    const data = await response.json();
    if (data.code === 0) {
      navigate('/final');
    }
  };

useEffect(() => {
    const videoElement = document.createElement('video');
    const canvasElements = [
        document.getElementById('frame1'),
        document.getElementById('frame2'),
        document.getElementById('frame3'),
    ];
    let currentCanvasIndex = 0;
    let intervalId;

    const startWebcam = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            videoElement.srcObject = stream;
            videoElement.play();

            intervalId = setInterval(() => {
                if (currentCanvasIndex < canvasElements.length) {
                    const canvas = canvasElements[currentCanvasIndex];
                    const context = canvas.getContext('2d');
                    context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
                    currentCanvasIndex++;
                } else {
                    clearInterval(intervalId);
                    stream.getTracks().forEach((track) => track.stop());
                }
            }, 2000);
        } catch (error) {
            console.error('Error accessing webcam:', error);
        }
    };

    startWebcam();

    return () => {
        clearInterval(intervalId);
        videoElement.srcObject?.getTracks().forEach((track) => track.stop());
    };
}, []);

return (
    <Container className="d-flex flex-column justify-content-center align-items-center text-white mt-5">
        <Card className="text-center bg-secondary text-white w-100">
            <Card.Img variant="top" src="https://www.giovannicarrieri.com/photography/italy/bari-2020/bari-lungomare-araldo-di-crollalanza.jpg" />
            <Card.Body>
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>Your comment</Form.Label>
                        <Form.Control
                            type="text"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        />
                    </Form.Group>
                </Form>
                <Button variant="primary" onClick={handleNext}>
                    Next
                </Button>
            </Card.Body>
        </Card>
        
        <div className="mt-3 d-flex justify-content-center" style={{ width: '100%' }}>
            <canvas id="frame1" width="300" height="200" style={{ border: '1px solid white' }} />
            <canvas id="frame2" width="300" height="200" style={{ border: '1px solid white' }} />
            <canvas id="frame3" width="300" height="200" style={{ border: '1px solid white' }} />
        </div>
    </Container>
);
};

export default ImagePage;