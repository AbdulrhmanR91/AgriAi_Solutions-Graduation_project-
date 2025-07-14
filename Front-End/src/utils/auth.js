import config from '../config/config';
import axios from 'axios';
import { storage } from './storage';

/**
 * Get the current user's role from the authentication system
 * @returns {Promise<string>} The user's role ('farmer', 'expert', etc.)
 */
export const getUserRole = async () => {
  const session = storage.getSession();
  
  if (!session) {
    throw new Error('No authentication session found');
  }
  
  return session.userType;
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if authenticated
 */
export const isAuthenticated = () => {
  const session = storage.getSession();
  return !!session && !!session.token;
};

/**
 * Complete logout process - clears all auth data and redirects
 */
export const logout = async () => {
  try {
    console.log('Auth logout process starting...');
    
    // Get current session before clearing
    const session = storage.getSession();
    
    // Notify server about logout if we have a token
    if (session?.token) {
      try {
        await axios.post(`${config.API_URL}/auth/logout`, {}, {
          headers: {
            'Authorization': `Bearer ${session.token}`
          },
          timeout: 3000 // Short timeout for logout
        });
        console.log('Server logout successful');
      } catch (logoutError) {
        console.warn('Server logout failed (continuing with client cleanup):', logoutError);
      }
    }
    
    // Clear all storage
    storage.clearSession();
    localStorage.clear();
    sessionStorage.clear();
    
    // Clear axios headers
    delete axios.defaults.headers.common['Authorization'];
    
    console.log('Logout cleanup completed');
    
    // Force page reload to login
    window.location.href = '/login';
    
  } catch (error) {
    console.error('Error during logout:', error);
    
    // Force cleanup even if there's an error
    localStorage.clear();
    sessionStorage.clear();
    delete axios.defaults.headers.common['Authorization'];
    window.location.href = '/login';
  }
};

/**
 * Get current user data from session
 * @returns {Object|null} User data or null
 */
export const getCurrentUser = () => {
  const session = storage.getSession();
  return session ? session.userData : null;
};

/**
 * Get current auth token
 * @returns {string|null} Token or null
 */
export const getAuthToken = () => {
  const session = storage.getSession();
  return session ? session.token : null;
};

/**
 * Initialize auth state from storage
 * @returns {Object|null} Session data or null
 */
export const initializeAuth = () => {
  const session = storage.getSession();
  
  if (session && session.token) {
    // Set axios default header
    axios.defaults.headers.common['Authorization'] = `Bearer ${session.token}`;
    
    // Update activity timestamp
    storage.updateSessionActivity();
    
    return session;
  }
  
  return null;
};

/**
 * Get secure token expiration time
 * @param {string} token - JWT token
 * @returns {number|null} Timestamp of expiration or null if invalid
 */
export const getTokenExpiration = (token) => {
  if (!token) return null;
  
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(window.atob(base64));
    
    if (payload.exp) {
      return payload.exp * 1000;
    }
  } catch (error) {
    console.error('Error parsing token:', error);
  }
  
  return null;
};

/**
 * Check if token needs refresh (expires in less than 1 hour)
 * @param {string} token - JWT token
 * @returns {boolean} True if needs refresh
 */
export const shouldRefreshToken = (token) => {
  const expiration = getTokenExpiration(token);
  if (!expiration) return false;
  
  const now = Date.now();
  const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds
  
  return expiration - now < oneHour;
};

/**
 * Refresh current user data from server
 * @returns {Promise<Object>} Updated user data
 */
export const refreshUserData = async () => {
  const session = storage.getSession();
  
  if (!session?.token) {
    throw new Error('No authentication session found');
  }
  
  try {
    const response = await axios.get(`${config.API_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${session.token}`
      }
    });
    
    // Update session with fresh user data
    const updatedSession = {
      ...session,
      userData: response.data.user
    };
    
    storage.setSession(updatedSession);
    
    return response.data.user;
  } catch (error) {
    console.error('Error refreshing user data:', error);
    throw error;
  }
};

/**
 * Update user profile and refresh session data
 * @param {Object} profileData - Updated profile data
 * @returns {Promise<Object>} Updated user data
 */
export const updateUserProfile = async (profileData) => {
  const session = storage.getSession();
  
  if (!session?.token) {
    throw new Error('No authentication session found');
  }
  
  try {
    const response = await axios.put(`${config.API_URL}/auth/profile`, profileData, {
      headers: {
        'Authorization': `Bearer ${session.token}`
      }
    });
    
    // Update session with updated user data
    const updatedSession = {
      ...session,
      userData: response.data.user
    };
    
    storage.setSession(updatedSession);
    
    return response.data.user;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

/**
 * Upload profile image
 * @param {File} imageFile - The image file to upload
 * @returns {Promise<Object>} Updated user data with new image URL
 */
export const uploadProfileImage = async (imageFile) => {
  const session = storage.getSession();
  
  if (!session?.token) {
    throw new Error('No authentication session found');
  }
  
  try {
    // Create form data for image upload
    const formData = new FormData();
    formData.append('profileImage', imageFile);
    
    // Use the correct endpoint that matches the backend
    const response = await axios.post(`${config.API_URL}/users/upload-image`, formData, {
      headers: {
        'Authorization': `Bearer ${session.token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    
    // Update session with new profile image URL
    const updatedUserData = {
      ...session.userData,
      profileImage: response.data.imageUrl
    };
    
    const updatedSession = {
      ...session,
      userData: updatedUserData
    };
    
    // Update session storage
    storage.setSession(updatedSession);
    
    // Force UI refresh
    return updatedUserData;
  } catch (error) {
    console.error('Error uploading profile image (from auth.js):', error);
    // Re-throw the error so the calling component (e.g., profile.jsx) can handle it
    throw error;
  }
};
