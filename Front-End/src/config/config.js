
const isDevelopment = import.meta.env.DEV || window.location.hostname === 'localhost';

const config = {
    // API URLs
    API_URL: isDevelopment 
        ? 'http://localhost:5000/api' // Development API URL
        : 'http://localhost:5000/api', // Production API URL

    
    // Base URLs
    BASE_URL: isDevelopment
        ? 'http://localhost:5000'
        : 'http://localhost:5000' ,
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
