import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Form, Button, Card } from 'react-bootstrap';
import countryList from '../nationalities.js'; 

const ProfilePage = () => {
    const [profile, setProfile] = useState({
        nickname: '',
        email: '',
        age: '',
        gender: '',
        nationality: '',
    });
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfile({ ...profile, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Profile:', profile); // Debugging
        navigate('/image');
    };

    return (
        <Container className="d-flex flex-column justify-content-center align-items-center vh-100 text-white">
            <Card className="w-100  p-4">
                <Card.Body>
                    <h1 className="text-center">Profile</h1>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Nickname</Form.Label>
                            <Form.Control
                                type="text"
                                name="nickname"
                                value={profile.nickname}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                name="email"
                                value={profile.email}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Age</Form.Label>
                            <Form.Control
                                type="number"
                                name="age"
                                value={profile.age}
                                onChange={handleChange}
                                min="1"
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Gender</Form.Label>
                            <Form.Select
                                name="gender"
                                value={profile.gender}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Nationality</Form.Label>
                            <Form.Select
                                name="nationality"
                                value={profile.nationality}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select Nationality</option>
                                {countryList.map((country, index) => (
                                    <option key={index} value={country}>
                                        {country}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                        <Button variant="primary" type="submit" className="w-100">
                            Next
                        </Button>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default ProfilePage;