import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AuthContext from '../context/AuthContext';

const Login = ({ toggleForm }) => {
    const { t } = useTranslation();
    const { login } = useContext(AuthContext);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await login(username, password);
            if (response.success) {
                setMessage(t('login_success'));
                setError('');
                navigate('/personal');
            } else {
                setError(response.message || t('login_failure'));
                setMessage('');
            }
        } catch (err) {
            setError(t('error_during_login'));
            setMessage('');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="auth-form">
            <h2>{t('login_title')}</h2>
            {message && <p className="success-message">{message}</p>}
            {error && <p className="error-message">{error}</p>}
            <input
                type="text"
                id="login-username"
                name="username"
                placeholder={t('username_placeholder')}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
            />
            <input
                type={showPassword ? "text" : "password"}
                id="login-password"
                name="password"
                placeholder={t('password_placeholder')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />
            <label>
                <input
                    type="checkbox"
                    checked={showPassword}
                    onChange={() => setShowPassword(!showPassword)}
                /> {t('show_password')}
            </label>
            <button type="submit">{t('login_button')}</button>
            <p>{t('no_account')} <span onClick={toggleForm}>{t('switch_to_register')}</span></p>
        </form>
    );
};

export default Login;
