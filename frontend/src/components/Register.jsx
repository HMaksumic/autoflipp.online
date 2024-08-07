import React, { useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import AuthContext from '../context/AuthContext';

const Register = ({ toggleForm }) => {
    const { t } = useTranslation();
    const { register } = useContext(AuthContext);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError(t('error_password_mismatch'));
            return;
        }

        try {
            const response = await register(username, password);
            if (response.success) {
                setMessage(t('register_success'));
                setError('');
                toggleForm();
            } else {
                setError(response.message || t('register_failure'));
                setMessage('');
            }
        } catch (err) {
            if (err.response && err.response.status === 400) {
                setError(t('error_username_taken'));
            } else {
                setError(t('error_during_registration'));
            }
            setMessage('');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="auth-form">
            <h2>{t('register_title')}</h2>
            {message && <p className="success-message">{message}</p>}
            {error && <p className="error-message">{error}</p>}
            <input
                type="text"
                placeholder={t('username_placeholder')}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
            />
            <input
                type={showPassword ? "text" : "password"}
                placeholder={t('password_placeholder')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />
            <input
                type={showPassword ? "text" : "password"}
                placeholder={t('confirm_password_placeholder')}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
            />
            <label>
                <input
                    type="checkbox"
                    checked={showPassword}
                    onChange={() => setShowPassword(!showPassword)}
                /> {t('show_password')}
            </label>
            <button type="submit">{t('register_button')}</button>
            <p>{t('have_account')} <span onClick={toggleForm}>{t('switch_to_login')}</span></p>
        </form>
    );
};

export default Register;
