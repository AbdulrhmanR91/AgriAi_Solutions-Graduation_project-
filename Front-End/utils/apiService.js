import axios from 'axios';

const BASE_URL = 'https://agri-backend-production.up.railway.app';

export const registerUser = async (userData) => {
    try {
        console.log('Attempting to register user with data:', { ...userData, password: '***' });
        const response = await axios.post(
            `${BASE_URL}/api/users/register`,
            userData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                withCredentials: true
            }
        );
        console.log('Registration successful:', response.data);
        return response.data;
    } catch (error) {
        console.error('Registration error details:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });
        throw error.response?.data?.error || error.message || 'Registration failed';
    }
};

export const loginUser = async (credentials) => {
    try {
        const response = await axios.post(
            `${BASE_URL}/api/users/login`,
            credentials,
            {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            }
        );
        return response.data;
    } catch (error) {
        console.error('Login error:', error.response?.data || error.message);
        throw error.response?.data || error.message;
    }
};

export const getDocumentUrl = (filename) => {
    return `${BASE_URL}/uploads/${filename}`;
}; 