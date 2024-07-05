import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const ProtectedRoute = ({ component: Component, ...rest }) => {
    const { user } = useContext(AuthContext);

    return user ? <Component {...rest} /> : <Navigate to="/home" />;
};

export default ProtectedRoute;
