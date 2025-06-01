import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Form, Button, Card, Alert, Row, Col } from 'react-bootstrap';
import { useAppContext } from '../context/AppContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { validateProfile } from '../utils/helpers';
import { ROUTES, GENDER_OPTIONS, AGE_CONSTRAINTS } from '../constants';
import countryList from '../nationalities.js';
import apiService from '../services/apiService';

const ProfilePage = () => {
    const { state, setProfile, setImages, setAuthenticated } = useAppContext();
    const [localProfile, setLocalProfile] = useState(state.profile);
    const [errors, setErrors] = useState({});    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // Convert age to integer for number input
        const processedValue = name === 'age' ? (value === '' ? null : parseInt(value, 10)) : value;
        
        setLocalProfile({ ...localProfile, [name]: processedValue });
        
        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const validation = validateProfile(localProfile);
        
        if (!validation.isValid) {
            setErrors(validation.errors);
            setIsSubmitting(false);
            return;
        }
          try {
            // Submit profile to API (login endpoint)
            const response = await apiService.submitProfile(localProfile);
            console.log('Profile submission response:', response);

            // Extract userId and images from response
            if (response && response.imagesName && Array.isArray(response.imagesName)) {
                // Update profile with userId if provided
                const updatedProfile = {
                    ...localProfile,
                    userId: response.userId || null
                };
                
                console.log('Setting profile and images:', { updatedProfile, images: response.imagesName });
                
                // Save profile and images to context
                setProfile(updatedProfile);
                setImages(response.imagesName);
                setAuthenticated(true); // Set authentication status
                
                console.log('Authentication set to true, navigating to IMAGE route');
                
                // Navigate to image page immediately - no need to wait
                navigate(ROUTES.IMAGE);
            } else {
                throw new Error('Invalid response format from server');
            }
        } catch (error) {
            setErrors({ submit: 'Failed to save profile. Please try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSubmitting) {
        return <LoadingSpinner message="Saving your profile..." fullScreen />;
    }

    return (
        <Container className="py-4">
            <Row className="justify-content-center">
                <Col lg={6} xl={5}>
                    <Card>
                        <Card.Body className="p-4">
                            <div className="text-center mb-4">
                                <i className="bi bi-person-circle display-4 text-primary mb-3"></i>
                                <h2 className="h3 mb-2">Create Your Profile</h2>
                                <p className="text-muted">
                                    Please provide some basic information to continue with the assessment.
                                </p>
                            </div>

                            {errors.submit && (
                                <Alert variant="danger" className="mb-4">
                                    {errors.submit}
                                </Alert>
                            )}

                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Nickname <span className="text-danger">*</span></Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="nickname"
                                        value={localProfile.nickname}
                                        onChange={handleChange}
                                        isInvalid={!!errors.nickname}
                                        placeholder="Enter your preferred nickname"
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.nickname}
                                    </Form.Control.Feedback>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Email <span className="text-danger">*</span></Form.Label>
                                    <Form.Control
                                        type="email"
                                        name="email"
                                        value={localProfile.email}
                                        onChange={handleChange}
                                        isInvalid={!!errors.email}
                                        placeholder="Enter your email address"
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.email}
                                    </Form.Control.Feedback>
                                </Form.Group>                                <Form.Group className="mb-3">
                                    <Form.Label>Age <span className="text-danger">*</span></Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="age"
                                        value={localProfile.age || ''}
                                        onChange={handleChange}
                                        isInvalid={!!errors.age}
                                        placeholder="Enter your age"
                                        min={AGE_CONSTRAINTS.MIN}
                                        max={AGE_CONSTRAINTS.MAX}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.age}
                                    </Form.Control.Feedback>
                                    <Form.Text className="text-muted">
                                        Age must be between {AGE_CONSTRAINTS.MIN} and {AGE_CONSTRAINTS.MAX}
                                    </Form.Text>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Gender <span className="text-danger">*</span></Form.Label>
                                    <Form.Select
                                        name="gender"
                                        value={localProfile.gender}
                                        onChange={handleChange}
                                        isInvalid={!!errors.gender}
                                    >
                                        <option value="">Select gender</option>
                                        {GENDER_OPTIONS.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid">
                                        {errors.gender}
                                    </Form.Control.Feedback>
                                </Form.Group>

                                <Form.Group className="mb-4">
                                    <Form.Label>Nationality <span className="text-danger">*</span></Form.Label>
                                    <Form.Select
                                        name="nationality"
                                        value={localProfile.nationality}
                                        onChange={handleChange}
                                        isInvalid={!!errors.nationality}
                                    >
                                        <option value="">Select nationality</option>
                                        {countryList.map((country, index) => (
                                            <option key={index} value={country}>
                                                {country}
                                            </option>
                                        ))}
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid">
                                        {errors.nationality}
                                    </Form.Control.Feedback>
                                </Form.Group>

                                <div className="d-grid gap-2">
                                    <Button 
                                        variant="primary" 
                                        type="submit" 
                                        size="lg"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                Continue to Camera
                                                <i className="bi bi-arrow-right ms-2"></i>
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </Form>

                            <div className="text-center mt-3">
                                <small className="text-muted">
                                    <i className="bi bi-info-circle me-1"></i>
                                    All fields marked with * are required
                                </small>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>        </Row>
        </Container>
    );
};

export default ProfilePage;