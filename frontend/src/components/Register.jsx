import React, { useState, useContext } from 'react';
import AuthContext from '../context/AuthContext';

const Register = ({ toggleForm }) => {
    const { register } = useContext(AuthContext);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await register(username, password);
            if (response.success) {
                setMessage('Registration successful! You can now log in.');
                setError('');
                toggleForm();
            } else {
                setError(response.message || 'Registration failed.');
                setMessage('');
            }
        } catch (err) {
            setError('An error occurred during registration.');
            setMessage('');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="auth-form">
            <h2>Register</h2>
            {message && <p className="success-message">{message}</p>}
            {error && <p className="error-message">{error}</p>}
            <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />
            <button type="submit">Register</button>
            <p>Already have an account? <span onClick={toggleForm}>Log In</span></p>
        </form>
    );
};

export default Register;