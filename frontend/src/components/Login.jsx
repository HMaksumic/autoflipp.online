import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Login = ({ toggleForm }) => {
    const { login } = useContext(AuthContext);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await login(username, password);
            if (response.success) {
                setMessage('Login successful!');
                setError('');
                navigate('/personal');
            } else {
                setError(response.message || 'Login failed.');
                setMessage('');
            }
        } catch (err) {
            setError('An error occurred during login.');
            setMessage('');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="auth-form">
            <h2>Login</h2>
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
            <button type="submit">Log In</button>
            <p>Don't have an account? <span onClick={toggleForm}>Register</span></p>
        </form>
    );
};

export default Login;