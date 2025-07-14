/**
 * Application configuration
 * Automatically selects appropriate API URL based on environment
 */
const isDevelopment = import.meta.env.DEV || window.location.hostname === 'localhost';

const config = {
    // API URLs
    API_URL: isDevelopment 
        ? 'http://localhost:5000/api' 
        : https://agriai-ten.vercel.app/api',
    
    // Base URLs
    BASE_URL: isDevelopment 
        ? 'http://localhost:5000' 
        : https://agriai-ten.vercel.app',
        
    // Request timeout (in milliseconds)
    REQUEST_TIMEOUT: 15000,
    
    // Storage keys
    STORAGE_KEYS: {
        TOKEN: 'token',
        USER_INFO: 'userInfo',
        USER_TYPE: 'userType',
        LANGUAGE: 'i18nextLng'
    }
};

export default config;
