import React, { useState, useContext } from 'react';
import Login from "../components/Login.jsx";
import Register from "../components/Register.jsx";
import AuthContext from '../context/AuthContext';
import './AuthBox.css';

const AuthBox = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { user } = useContext(AuthContext);

  const toggleForm = () => {
    setIsLogin(!isLogin);
  };

  return (
    <div className="auth-container">
      {isLogin ? <Login toggleForm={toggleForm} /> : <Register toggleForm={toggleForm} />}
    </div>
  );
};

export default AuthBox;