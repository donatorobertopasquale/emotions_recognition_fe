import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Form, Button, Card, Alert, Row, Col } from 'react-bootstrap';
import { useAppContext } from '../context/AppContext';
import LoadingSpinner from '../components/LoadingSpinner';
import GoogleSignIn from '../components/GoogleSignIn';
import { validateProfile } from '../utils/helpers';
import { ROUTES, GENDER_OPTIONS, AGE_CONSTRAINTS } from '../constants';
import countryList from '../nationalities.js';
import apiService from '../services/apiService';

const ProfilePage = () => {
    const { state, setProfile, setImages, setAuthenticated } = useAppContext();
    const [localProfile, setLocalProfile] = useState(state.profile);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isGoogleSignedIn, setIsGoogleSignedIn] = useState(false);
    const [googleUserInfo, setGoogleUserInfo] = useState(null);
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

    const handleGoogleSignInSuccess = (userInfo) => {
        setGoogleUserInfo(userInfo);
        setIsGoogleSignedIn(true);
        
        // Update local profile with Google info
        setLocalProfile(prev => ({
            ...prev,
            email: userInfo.email,
            googleId: userInfo.googleId,
            // Optionally pre-fill nickname with Google name
            nickname: prev.nickname || userInfo.name || ''
        }));
        
        // Clear any Google-related errors
        setErrors(prev => ({ ...prev, google: '' }));
    };

    const handleGoogleSignInError = (error) => {
        setErrors(prev => ({ ...prev, google: error }));
        setIsGoogleSignedIn(false);
        setGoogleUserInfo(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        // Check if Google Sign-In is completed
        if (!isGoogleSignedIn || !googleUserInfo) {
            setErrors({ google: 'Please sign in with Google first' });
            setIsSubmitting(false);
            return;
        }
        
        const validation = validateProfile(localProfile);
        
        if (!validation.isValid) {
            setErrors({ ...validation.errors });
            setIsSubmitting(false);
            return;
        }
        
        try {
            // Submit profile to API with Google credential
            const profileDataWithGoogle = {
                ...localProfile,
                googleCredential: googleUserInfo.credential,
                email: googleUserInfo.email,
                googleId: googleUserInfo.googleId
            };
            
            const response = await apiService.submitProfile(profileDataWithGoogle);

            // Extract userId and images from response
            if (response && response.imagesName && Array.isArray(response.imagesName)) {
                // Update profile with userId if provided
                const updatedProfile = {
                    ...localProfile,
                    userId: response.userId || null,
                    email: googleUserInfo.email,
                    googleId: googleUserInfo.googleId
                };
                
                // Save profile and images to context
                setProfile(updatedProfile);
                setImages(response.imagesName);
                setAuthenticated(true); // Set authentication status
                
                // Use setTimeout to ensure state updates are completed before navigation
                setTimeout(() => {
                    navigate(ROUTES.IMAGE);
                }, 0);
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
                                    Sign in with Google and provide some basic information to continue with the assessment.
                                </p>
                            </div>

                            {errors.submit && (
                                <Alert variant="danger" className="mb-4">
                                    {errors.submit}
                                </Alert>
                            )}

                            {errors.google && (
                                <Alert variant="danger" className="mb-4">
                                    {errors.google}
                                </Alert>
                            )}

                            {/* Google Sign-In Section */}
                            <div className="mb-4">
                                {!isGoogleSignedIn ? (
                                    <div>
                                        <h5 className="mb-3">Step 1: Sign in with Google</h5>
                                        <GoogleSignIn
                                            onSuccess={handleGoogleSignInSuccess}
                                            onError={handleGoogleSignInError}
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                ) : (
                                    <Alert variant="success" className="d-flex align-items-center">
                                        <i className="bi bi-check-circle-fill me-2"></i>
                                        <div>
                                            <strong>Signed in as:</strong> {googleUserInfo?.email}
                                            <br />
                                            <small className="text-muted">You can now complete your profile below.</small>
                                        </div>
                                    </Alert>
                                )}
                            </div>

                            {/* Profile Form - Only show after Google Sign-In */}
                            {isGoogleSignedIn && (
                                <div>
                                    <h5 className="mb-3">Step 2: Complete Your Profile</h5>
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
                                        </Form.Group>                                        <Form.Group className="mb-3">
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
                                                disabled={isSubmitting || !isGoogleSignedIn}
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
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>        </Row>
        </Container>
    );
};

export default ProfilePage;