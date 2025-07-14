import React, { createContext, useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import config from '../config/config';
import { storage } from '../utils/storage';
import { initializeAuth, logout as authLogout, shouldRefreshToken } from '../utils/auth';

const API_URL = config.API_URL;

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sessionChecked, setSessionChecked] = useState(false);

    // Initialize authentication from stored session - only once
    useEffect(() => {
        const initializeSession = async () => {
            try {
                const session = initializeAuth();
                
                if (session) {
                    // Validate session with server
                    try {
                        const response = await axios.get(`${API_URL}/users/me`);
                        
                        // Update session with fresh user data ensuring userType is preserved
                        const updatedUserData = {
                            ...response.data,
                            userType: response.data.userType || session.userData?.userType
                        };
                        storage.setSession(session.token, updatedUserData, session.rememberMe);
                        setUser(updatedUserData);
                    } catch (error) {
                        console.error('Session validation failed:', error);
                        authLogout();
                        setUser(null);
                    }
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error('Session initialization failed:', error);
                authLogout();
                setUser(null);
            } finally {
                setLoading(false);
                setSessionChecked(true);
            }
        };

        initializeSession();

        // Listen for storage changes across tabs
        const handleStorageChange = (e) => {
            if (e.key?.includes('agriai_token')) {
                if (!e.newValue) {
                    // Token was removed
                    setUser(null);
                } else {
                    // Token was updated, refresh user data
                    const session = storage.getSession();
                    if (session && session.userData) {
                        setUser(session.userData);
                    }
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []); // Empty dependency array - only run once

    // Set up automatic session refresh - only after session is checked
    useEffect(() => {
        if (!sessionChecked) return;

        const refreshInterval = setInterval(async () => {
            const session = storage.getSession();
            
            if (session && session.token) {
                if (shouldRefreshToken(session.token)) {
                    try {
                        const response = await axios.post(`${API_URL}/auth/refresh-token`);
                        if (response.data?.token) {
                            storage.setSession(response.data.token, session.userData, session.rememberMe);
                            axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
                        }
                    } catch (error) {
                        console.error('Auto refresh failed:', error);
                        logout();
                    }
                }
            }
        }, 15 * 60 * 1000); // Check every 15 minutes

        return () => clearInterval(refreshInterval);
    }, [sessionChecked]);

    const login = async (email, password, rememberMe = false) => {
        try {
            const response = await axios.post(`${API_URL}/auth/login`, {
                email,
                password
            });

            const { token, user: userData } = response.data;
            
            // Store session with remember me option
            storage.setSession(token, userData, rememberMe);
            
            // Set token in axios headers
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            
            setUser(userData);
            
            // Trigger storage event to notify other components
            window.dispatchEvent(new StorageEvent('storage', {
                key: 'agriai_token',
                newValue: token
            }));
            
            return { success: true, user: userData };
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed'
            };
        }
    };

    const logout = () => {
        // Clear session storage
        storage.clearSession();
        
        // Remove token from axios headers
        delete axios.defaults.headers.common['Authorization'];
        
        setUser(null);
        
        // Trigger storage event to notify other components
        window.dispatchEvent(new StorageEvent('storage', {
            key: 'agriai_token',
            newValue: null
        }));
    };

    const fetchUser = async () => {
        try {
            const response = await axios.get(`${API_URL}/users/me`);
            
            // Update session with fresh data
            const session = storage.getSession();
            if (session) {
                storage.setSession(session.token, response.data, session.rememberMe);
            }
            
            setUser(response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching user:', error);
            throw error;
        }
    };

    const refreshToken = async () => {
        try {
            const session = storage.getSession();
            if (!session) return false;

            const response = await axios.post(`${API_URL}/auth/refresh-token`);
            const { token } = response.data;
            
            // Update session with new token
            storage.setSession(token, session.userData, session.rememberMe);
            
            // Update token in axios headers
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            
            return true;
        } catch (error) {
            console.error('Error refreshing token:', error);
            logout();
            return false;
        }
    };

    const value = {
        user,
        loading,
        login,
        logout,
        fetchUser,
        refreshToken,
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

AuthProvider.propTypes = {
    children: PropTypes.node.isRequired
};

export default AuthContext;