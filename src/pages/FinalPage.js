import React from 'react';
import { Container, Button } from 'react-bootstrap';

const FinalPage = () => {
  const handleFinish = () => {
    console.log('Final assessment sent'); // Debugging
  };

return (
    <Container fluid className="d-flex flex-column justify-content-center align-items-center vh-100 text-white bg-dark">
        <h1>Thank You!</h1>
        <p>Your assessment has been completed.</p>
        {/* <Button variant="primary" onClick={handleFinish}>
            Finish
        </Button> */}
    </Container>
);
};

export default FinalPage;