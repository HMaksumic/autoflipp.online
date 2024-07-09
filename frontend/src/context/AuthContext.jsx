import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem('user');
        return storedUser ? JSON.parse(storedUser) : null;
    });
    const [favorites, setFavorites] = useState([]);

    useEffect(() => {
        if (user && user.access_token) {
            fetchFavorites();
        }
    }, [user]);

    const fetchFavorites = async () => {
        if (!user || !user.access_token) {
            console.error('User token is missing');
            return;
        }
        try {
            const response = await fetch('https://autoflipp-backend.online/favorites', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.access_token}`,
                },
            });
            const data = await response.json();
            if (data.success) {
                setFavorites(data.favorites);
            } else {
                console.error(data.message);
            }
        } catch (error) {
            console.error('Error fetching favorites:', error);
        }
    };

    const register = async (username, password) => {
        try {
            const response = await axios.post('https://autoflipp-backend.online/register', {
                username,
                password
            });
            return response.data;
        } catch (error) {
            console.error('Register error from server:', error);
            throw error;
        }
    };

    const login = async (username, password) => {
        try {
            const response = await fetch('https://autoflipp-backend.online/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });
            const data = await response.json();
            if (data.success) {
                console.log('Login successful, setting token');
                localStorage.setItem('user', JSON.stringify({ ...data.user, token: data.access_token }));
                setUser({ ...data.user, token: data.access_token });
                await fetchFavorites();
                return { success: true };
            } else {
                console.log('Login failed:', data.message);
                return { success: false, message: data.message };
            }
        } catch (error) {
            console.log('Error during login:', error);
            return { success: false, message: 'An error occurred during login.' };
        }
    };
    const logout = () => {
        localStorage.removeItem('user');
        setUser(null);
        setFavorites([]);
    };

    const addFavorite = async (car) => {
        try {
            console.log('Adding favorite with car data:', car);
            const response = await fetch('https://autoflipp-backend.online/favorites', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`,
                },
                body: JSON.stringify({ car }),
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error response:', errorData);
            } else {
                const data = await response.json();
                if (data.success) {
                    setFavorites(prevFavorites => [...prevFavorites, car]);
                } else {
                    console.error(data.message);
                }
            }
        } catch (error) {
            console.error('Error adding favorite:', error);
        }
    };

    const removeFavorite = async (carId) => {
        try {
            const response = await fetch(`https://autoflipp-backend.online/favorites/${carId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                },
            });
            const data = await response.json();
            if (data.success) {
                setFavorites(prevFavorites => prevFavorites.filter(fav => fav.id !== carId));
            } else {
                console.error(data.message);
            }
        } catch (error) {
            console.error('Error removing favorite:', error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, favorites, addFavorite, removeFavorite }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;