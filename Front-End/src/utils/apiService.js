import config from '../config/config';
import axios from 'axios';
import { storage } from './storage';
import { logout, shouldRefreshToken } from './auth';

const API_URL = config.API_URL;

// Error handling utility function
const handleError = (error) => {
  if (error.response) {
    // Server responded with an error status
    return new Error(error.response.data?.message || 'Server error occurred');
  } else if (error.request) {
    // Request was made but no response received
    return new Error('No response from server. Please check your connection.');
  } else {
    // Error in setting up the request
    return new Error(error.message || 'An unexpected error occurred');
  }
};

export const axiosInstance = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    withCredentials: true
    // Don't set default Content-Type - let each request set its own
});

// Request interceptor to set appropriate headers
axiosInstance.interceptors.request.use((config) => {
  // Only set JSON headers if we're not sending FormData
  if (!(config.data instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json';
    config.headers['Accept'] = 'application/json';
  }
  // For FormData, let the browser set the multipart/form-data header with boundary
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Token refresh function
const refreshAuthToken = async (currentToken) => {
  try {
    const response = await axios.post(`${API_URL}/auth/refresh-token`, {}, {
      headers: { Authorization: `Bearer ${currentToken}` }
    });
    
    if (response.data && response.data.token) {
      const session = storage.getSession();
      if (session) {
        storage.setSession(response.data.token, session.userData, session.rememberMe);
        return response.data.token;
      }
    }
  } catch (error) {
    console.error('Token refresh failed:', error);
    logout();
  }
  return null;
};

// Add token interceptor with session management
axiosInstance.interceptors.request.use(
    async (config) => {
        const session = storage.getSession();
        
        if (session && session.token) {
            try {
                let token = session.token;
                
                // Check if token needs refresh
                if (shouldRefreshToken(token)) {
                    const newToken = await refreshAuthToken(token);
                    if (newToken) {
                        token = newToken;
                    }
                }
                
                config.headers.Authorization = `Bearer ${token}`;
                
                // Debug logging for farmer visits requests
                if (config.url.includes('farmer-visits')) {
                    console.log('Making farmer visit request:', config.url);
                    console.log('With token:', token ? 'Token present' : 'No token');
                    console.log('User session:', session);
                }
                
                // Update session activity
                storage.updateSessionActivity();
            } catch (e) {
                console.error('Error processing auth token:', e);
                logout();
            }
        } else {
            console.log('No session found for request:', config.url);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor with session management
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.warn('Unauthorized request, clearing session');
            
            // Import logout dynamically to avoid circular imports
            import('./auth').then(({ logout: authLogout }) => {
                authLogout();
            }).catch(() => {
                // Fallback if import fails
                storage.clearSession();
                window.location.href = '/login';
            });
        }
        return Promise.reject(error);
    }
);

// Authentication Services
export const registerUser = async (userData) => {
    try {
     
        
        const response = await axios.post(`${API_URL}/auth/register`, userData);

        
        return response.data;
    } catch (error) {
       
        if (error.response?.data?.message) {
            throw new Error(error.response.data.message);
        } else if (error.response?.data?.errors) {
            throw new Error(error.response.data.errors.join(', '));
        }
        throw new Error(error.message || 'Registration failed');
    }
};

export const loginUser = async (credentials) => {
  try {
    const response = await axiosInstance.post('/auth/login', credentials);
    
    // Save session with remember me option
    const rememberMe = credentials.rememberMe || false;
    storage.setSession(response.data.token, response.data.user, rememberMe);
    
    // Set axios default header
    axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
    
    // Force a small delay to ensure storage is written
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Trigger storage event to notify other components
    window.dispatchEvent(new StorageEvent('storage', {
      key: config.STORAGE_KEYS.TOKEN,
      newValue: response.data.token
    }));
    
    return response.data;
  } catch (error) {
    console.error('Login failed:', error.response?.data?.message || error.message);
    
    if (error.response) {
      const message = error.response.data?.message || 'Login failed';
      throw new Error(message);
    } else if (error.request) {
      throw new Error('Server did not respond. Please check your connection.');
    } else {
      throw new Error('Something went wrong. Please try again.');
    }
  }
};

// Profile Services
export const getFarmerProfile = async () => {
    try {
        const session = storage.getSession();
        if (!session || !session.token) {
            throw new Error('No authentication token found');
        }

        const response = await axiosInstance.get('/farmers/profile');
 
        return response.data.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const updateFarmerProfile = async (updates) => {
    try {
        const response = await axiosInstance.put('/farmers/profile', updates);
        return response.data.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const getCompanyProfile = async () => {
    try {
        const response = await axiosInstance.get('/users/profile');
        
        if (!response.data) {
            throw new Error('فشل في جلب بيانات الشركة');
        }
        
        return response.data;
    } catch (error) {
        console.error('Get company profile error:', error);
        throw new Error(error.response?.data?.message || 'فشل في جلب الملف الشخصي');
    }
};

export const updateCompanyProfile = async (profileData) => {
    try {
        const response = await axiosInstance.put('/users/profile', profileData);
        return response.data;
    } catch (error) {
        console.error('Error updating company profile:', error);
        throw new Error(error.response?.data?.message || 'فشل في تحديث الملف الشخصي');
    }
};

export const getExpertProfile = async () => {
    try {
        const response = await axiosInstance.get('/experts/profile');
        
        if (!response.data || !response.data.success) {
            console.error('Expert profile API error:', response.data);
            throw new Error(response.data?.message || 'Failed to fetch profile');
        }
        
        console.log('Expert profile API response:', response.data); // Debug log
        return response.data.data;
    } catch (error) {
        console.error('Get expert profile error details:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });
        
        // If the token is invalid, clear storage
        if (error.response?.status === 401) {
            localStorage.removeItem(config.STORAGE_KEYS.TOKEN);
        }
        
        throw new Error(error.response?.data?.message || 'Failed to fetch profile');
    }
};

export const updateExpertProfile = async (userData) => {
    try {
        const formData = new FormData();

        // Add basic user data
        formData.append('name', userData.name);
        formData.append('email', userData.email);
        formData.append('phone', userData.phone);
        formData.append('userType', userData.userType);

        // Add expert details
        if (userData.expertDetails) {
            formData.append('expertDetails', JSON.stringify(userData.expertDetails));
        }

        // Add ID file if exists
        if (userData.idFile) {
            formData.append('idFile', userData.idFile);
        }

        const response = await axiosInstance.put('/experts/profile', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        if (!response.data.success) {
            throw new Error(response.data.message || 'Failed to update profile');
        }

        return response.data;
    } catch (error) {
        console.error('Update expert profile error:', error);
        throw new Error(error.response?.data?.message || 'Failed to update profile');
    }
};

/**
 * Upload profile image
 * @param {File} imageFile - The image file to upload
 * @returns {Promise<Object>} Response with image URL
 */
export const uploadProfileImage = async (imageFile) => {
  try {
    const formData = new FormData();
    formData.append('profileImage', imageFile);

    const session = storage.getSession();
    if (!session || !session.token) {
      throw new Error('No authentication token found');
    }

    // Determine the correct endpoint based on user type
    const userType = session.userData?.userType || storage.get(config.STORAGE_KEYS.USER_TYPE);
    let endpoint;
    
    switch (userType) {
      case 'farmer':
        endpoint = '/farmers/upload-image';
        break;
      case 'expert':
        endpoint = '/experts/profile/image';
        break;
      case 'company':
      case 'user':
      default:
        endpoint = '/users/upload-image';
        break;
    }

    console.log('Uploading profile image for user type:', userType, 'to endpoint:', endpoint);

    // Use axiosInstance which includes auth headers automatically
    const response = await axiosInstance.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    // Important: Update the session with the new image URL
    const imageUrl = response.data.data?.profileImage || response.data.imageUrl;
    if (session?.userData && imageUrl) {
      session.userData.profileImage = imageUrl;
      storage.setSession(session.token, session.userData, session.rememberMe);
    }

    return {
      success: true,
      imageUrl: imageUrl,
      message: response.data.message
    };
  } catch (error) {
    console.error('Error uploading profile image:', error);
    throw error;
  }
};

// Products Services
export const getAllProducts = async () => {
    try {
        const response = await axiosInstance.get('/products');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'فشل في جلب المنتجات');
    }
};

export const getMyProducts = async () => {
    try {
        const response = await axiosInstance.get('/products/my-products');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'فشل في جلب منتجاتي');
    }
};

export const addProduct = async (productData) => {
    try {
        const response = await axiosInstance.post('/products', productData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Add product error:', error);
        throw new Error(error.response?.data?.message || 'فشل في إضافة المنتج');
    }
};

export const updateProduct = async (productId, productData) => {
    try {
        const response = await axiosInstance.put(`/products/${productId}`, productData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
  
        return response.data;
    } catch (error) {
        console.error('Update product error:', error);
        throw new Error(error.response?.data?.message || 'فشل في تحديث المنتج');
    }
};

export const deleteProduct = async (productId) => {
    try {
        const response = await axiosInstance.delete(`/products/${productId}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'فشل في حذف المنتج');
    }
};

// Cart Services
export const getCart = async () => {
    try {
        const response = await axiosInstance.get('/cart');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'فشل في جلب سلة التسوق');
    }
};

export const addToCart = async (productId, quantity) => {
    try {
        const response = await axiosInstance.post('/cart', {
            productId,
            quantity
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'فشل في إضافة المنتج إلى سلة التسوق');
    }
};

export const removeFromCart = async (itemId) => {
    try {
        const response = await axiosInstance.delete(`/cart/${itemId}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'فشل في حذف المنتج من سلة التسوق');
    }
};

export const updateCartQuantity = async (itemId, quantity) => {
    try {
        const response = await axiosInstance.patch(`/cart/${itemId}`, { quantity });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'فشل في تحديث كمية المنتج في سلة التسوق');
    }
};

// Orders Services
export const placeOrder = async (orderData) => {
    const response = await axiosInstance.post('/orders/', orderData);
    return response.data;
};
export const getMyOrders = async () => {
    try {
        const response = await axiosInstance.get('/orders/my-orders');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'فشل في جلب طلباتي');
    }
};

export const getSellerOrders = async () => {
    try {
        const response = await axiosInstance.get('/orders/seller-orders');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'فشل في جلب طلبات البائع');
    }
};

export const updateOrderStatus = async (orderId, status) => {
    try {
        const response = await axiosInstance.put(`/orders/${orderId}/status`, { status });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'فشل في تحديث حالة الطلب');
    }
};

// Companies Services
export const getCompanies = async (searchQuery = '') => {
    try {
        const queryParams = new URLSearchParams();
        if (searchQuery) {
            queryParams.append('query', searchQuery);
        }

        const response = await axiosInstance.get(`/companies/search${queryParams.toString() ? `?${queryParams.toString()}` : ''}`);
        if (!response.data.success) {
            throw new Error(response.data.message || 'لم يتم استلام بيانات من الخادم');
        }
        return response.data.data;
    } catch (error) {
        console.error('خطأ في جلب الشركات:', error);
        throw new Error(error.response?.data?.message || 'فشل في جلب الشركات');
    }
};

// Notifications Services
export const getNotifications = async () => {
    try {
       
        const response = await axiosInstance.get('/notifications');
   
        
        if (!response.data.success) {
            throw new Error(response.data.message || 'فشل في جلب الإشعارات');
        }
        
        return response.data;
    } catch (error) {
        console.error('Get notifications error:', error);
        throw new Error(error.response?.data?.message || 'فشل في جلب الإشعارات');
    }
};

export const markNotificationAsRead = async (notificationId) => {
    try {
        // Validate notification ID
        if (!notificationId || typeof notificationId !== 'string') {
            console.error('Invalid notification ID:', notificationId);
            throw new Error('معرف الإشعار غير صالح');
        }


        const response = await axiosInstance.patch(`/notifications/${notificationId}/read`);
  
        
        if (!response.data.success) {
            throw new Error(response.data.message || 'فشل في تحديث حالة الإشعار');
        }
        
        return response.data;
    } catch (error) {
        console.error('Mark notification as read error:', {
            notificationId,
            message: error.message,
            response: error.response?.data
        });
        throw new Error(error.response?.data?.message || 'فشل في تحديث حالة الإشعار');
    }
};

export const deleteNotification = async (notificationId) => {
    try {
        const response = await axiosInstance.delete(`/notifications/${notificationId}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'فشل في حذف الإشعار');
    }
};

export const getUnreadNotificationsCount = async () => {
    try {
        const response = await axiosInstance.get('/notifications/unread-count');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'فشل في جلب عدد الإشعارات غير المقروءة');
    }
};

// Favorites Services
export const getFavorites = async () => {
    try {
        const response = await axiosInstance.get('/favorites');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'فشل في جلب المفضلة');
    }
};

export const toggleFavorite = async (productId) => {
    try {
        const response = await axiosInstance.post('/favorites', { productId });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'فشل في تحديث المفضلة');
    }
};

export const clearAllNotifications = async () => {
    try {
        const response = await axiosInstance.delete('/notifications/clear-all');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'فشل في حذف جميع الإشعارات');
    }
};

export const createConsultOrder = async (consultData) => {
    try {
        const response = await axiosInstance.post('/consult-orders', consultData);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'فشل في إنشاء طلب الاستشارة');
    }
};

export const getAvailableExperts = async (sortBy = '') => {
    try {
        // Add sortBy parameter to the API request if provided
        const queryParam = sortBy ? `?sort=${sortBy}` : '';
        const response = await axiosInstance.get(`/experts/available${queryParam}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'فشل في جلب قائمة الخبراء المتاحين');
    }
};

export const searchExperts = async (searchQuery = '', filters = {}) => {
    try {
        const queryParams = new URLSearchParams();
        if (searchQuery) {
            queryParams.append('search', searchQuery);
        }
     //   console.log('Filters:', filters);
        Object.entries(filters).forEach(([key, value]) => {
            if (value) queryParams.append(key, value);
        });

        const response = await axiosInstance.get(`/experts/search?${queryParams.toString()}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'فشل في البحث عن الخبراء');
    }
};


export const getExpertOrders = async () => {
    try {
        const response = await axiosInstance.get('/consult-orders/expert');
        return response.data.data;
    } catch (error) {
        console.error('Get expert orders error:', error);
        throw error;
    }
};

export const updateProfileImage = async (formData) => {
    try {
        const file = formData.get('profileImage');
        if (!file) {
            throw new Error('No image file provided');
        }

        console.log('Uploading file details:', {
            name: file.name,
            type: file.type,
            size: file.size
        });

        const session = storage.getSession();
        if (!session || !session.token) {
            throw new Error('No authentication token found');
        }

        const userType = session.userData?.userType || storage.get(config.STORAGE_KEYS.USER_TYPE);
        const endpoint = userType === 'expert' ? '/experts/upload-image' : '/users/upload-image';

        const response = await axiosInstance.post(endpoint, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        if (!response.data.success) {
            throw new Error(response.data.message || 'Failed to update profile image');
        }

        return {
            success: true,
            imageUrl: response.data.imageUrl,
            message: response.data.message || 'Profile image updated successfully'
        };
    } catch (error) {
        console.error('Profile image upload error:', error);
        throw new Error(error.response?.data?.message || 'Failed to upload image');
    }
};

// Plant Analysis Services
export const getPlantAnalyses = async () => {
    try {
        // Check if user is authenticated
        const session = storage.getSession();
        if (!session || !session.token) {
            throw new Error('No authentication token found');
        }

        const response = await axiosInstance.get('/plant-analyses');
        
        console.log('Plant analyses API response status:', response.status);
        console.log('Plant analyses API response data type:', typeof response.data);
        console.log('Plant analyses API response data:', response.data);
        
        // Handle different response formats
        let analysesData;
        if (Array.isArray(response.data)) {
            analysesData = response.data;
        } else if (response.data && Array.isArray(response.data.data)) {
            analysesData = response.data.data;
        } else if (response.data && typeof response.data === 'object') {
            // Try to find an array property in the response
            const possibleArrays = Object.values(response.data).filter(Array.isArray);
            if (possibleArrays.length > 0) {
                analysesData = possibleArrays[0];
            } else {
                analysesData = [];
            }
        } else {
            analysesData = [];
        }
        
        console.log('Extracted analyses data:', analysesData);
        return analysesData;
    } catch (error) {
        console.error('Error fetching plant analyses:', error);
        console.error('Error response:', error.response?.data);
        throw new Error(error.response?.data?.message || error.message || 'Failed to fetch plant analyses');
    }
};

export const deletePlantAnalysis = async (analysisId) => {
    try {
        const response = await axiosInstance.delete(`/plant-analyses/${analysisId}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting plant analysis:', error);
        throw new Error(error.response?.data?.message || 'Failed to delete analysis');
    }
};




// Appointment notifications
export const getUpcomingAppointments = async () => {
    try {
        const response = await axiosInstance.get('/consult-orders/upcoming');
        return response.data;
    } catch (error) {
        console.error('Error fetching upcoming appointments:', error);
        throw new Error(error.response?.data?.message || 'Failed to fetch upcoming appointments');
    }
};

export const markAppointmentNotified = async (appointmentId) => {
    try {
        const response = await axiosInstance.patch(`/consult-orders/${appointmentId}/notified`);
        return response.data;
    } catch (error) {
        console.error('Error marking appointment as notified:', error);
        throw new Error(error.response?.data?.message || 'Failed to update appointment notification status');
    }
};

export const getActiveConsultOrder = async () => {
    try {
        const response = await axiosInstance.get('/consult-orders/active');
        return response.data;
    } catch (error) {
        console.error('Error fetching active consult order:', error);
        throw new Error(error.response?.data?.message || 'Failed to fetch active consultation order');
    }
};

// Chat Services
export const createChatRoom = async (expertId) => {
    try {
        console.log('Creating chat room with expert:', expertId);
        
        // Validate expertId to prevent unnecessary API calls
        if (!expertId || typeof expertId !== 'string') {
            console.error('Invalid expert ID provided:', expertId);
            return {
                success: false,
                message: 'Invalid expert ID'
            };
        }
        
        const session = storage.getSession();
        if (!session || !session.token) {
            return {
                success: false,
                message: 'No authentication token found'
            };
        }
        
        const response = await axiosInstance.post('/chat/rooms', { expertId });
        
        // Log success for debugging
        console.log('Chat room created successfully:', response.data);
        return response.data;
    } catch (error) {
        // Enhanced error logging
        console.error('Error creating chat room:', error.response?.data || error.message);
        console.error('Status code:', error.response?.status);
        
        // Check specifically for 404 errors related to expert not found
        if (error.response?.status === 404 && error.response?.data?.message?.includes('Expert not found')) {
            console.error('Expert with ID not found in the database. Check if the expert ID is valid.');
        }
        
        // Return a formatted error response instead of throwing
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to create chat room',
            statusCode: error.response?.status
        };
    }
};

// Function for experts to create chat room with farmers
export const createChatRoomWithFarmer = async (farmerId) => {
    try {
        console.log('Expert creating chat room with farmer:', farmerId);
        
        // Validate farmerId
        if (!farmerId || typeof farmerId !== 'string') {
            console.error('Invalid farmer ID provided:', farmerId);
            return {
                success: false,
                message: 'Invalid farmer ID'
            };
        }
        
        const session = storage.getSession();
        if (!session || !session.token) {
            return {
                success: false,
                message: 'No authentication token found'
            };
        }
        
        // The backend controller expects either expertId or farmerId based on user type
        // When an expert creates a room, we need to send farmerId
        // We'll log our request for debugging
        const requestBody = { farmerId };
        console.log('Sending chat room creation request with body:', requestBody);
        
        const response = await axiosInstance.post('/chat/rooms', requestBody);
        
        console.log('Chat room with farmer created successfully:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error creating chat room with farmer:', error.response?.data || error.message);
        console.error('Status code:', error.response?.status);
        console.error('Request data that failed:', { farmerId });
        
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to create chat room with farmer',
            statusCode: error.response?.status
        };
    }
};

export const getChatRooms = async () => {
    try {
        const response = await axiosInstance.get('/chat/rooms');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to get chat rooms');
    }
};

export const getChatMessages = async (roomId) => {
    try {
        const response = await axiosInstance.get(`/chat/rooms/${roomId}/messages`);
        return response.data;
    } catch (error) {
        console.error('Error fetching chat messages:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Failed to get chat messages');
    }
};

export const sendChatMessage = async (roomId, content, isSystem = false, visibleTo = 'all', imageFile = null) => {
    try {
        let requestData;
        
        if (imageFile) {
            // If sending an image, use FormData
            const formData = new FormData();
            formData.append('content', content || '');
            formData.append('isSystem', isSystem);
            formData.append('visibleTo', visibleTo);
            formData.append('messageType', 'image');
            formData.append('image', imageFile);
            
            console.log('🖼️ Sending image via FormData:', {
                contentLength: (content || '').length,
                isSystem,
                visibleTo,
                messageType: 'image',
                fileName: imageFile.name,
                fileSize: imageFile.size,
                fileType: imageFile.type
            });
            
            // Debug: log FormData contents
            for (let [key, value] of formData.entries()) {
                console.log(`FormData entry: ${key} =`, value);
            }
            
            requestData = formData;
            // Axios interceptor will handle headers automatically
        } else {
            // Regular text message
            requestData = { 
                content, 
                isSystem,
                visibleTo,
                messageType: 'text'
            };
        }

        console.log('📤 Making request to:', `/chat/rooms/${roomId}/messages`);
        console.log('📦 Request data type:', imageFile ? 'FormData' : 'JSON');
        
        const response = await axiosInstance.post(
            `/chat/rooms/${roomId}/messages`, 
            requestData
            // No need for config object - interceptor handles headers
        );
        
        console.log('✅ Response received:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Error in sendChatMessage:', error);
        if (error.response) {
            console.error('   Status:', error.response.status);
            console.error('   Data:', error.response.data);
        }
        throw new Error(error.response?.data?.message || 'Failed to send message');
    }
};

export const updateConsultOrderStatus = async (orderId, status) => {
    try {
        console.log(`Updating consultation order ${orderId} status to ${status}`);
        const response = await axiosInstance.patch(`/consult-orders/${orderId}`, { status });
        return response.data;
    } catch (error) {
        console.error('Error updating consultation status:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Failed to update consultation status');
    }
};

export const rateExpert = async (roomId, rating, feedback = '') => {
    try {
        const response = await axiosInstance.post(`/chat/rooms/${roomId}/rate`, { rating, feedback });
        return response.data;
    } catch (error) {
        console.error('Error submitting rating:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Failed to submit rating');
    }
};

export const getRecentRatings = async (limit = 5) => {
    try {
        const response = await axiosInstance.get(`/experts/recent-ratings?limit=${limit}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching recent ratings:', error);
        throw new Error(error.response?.data?.message || 'Failed to fetch recent ratings');
    }
};


// Alias for rateExpert to maintain compatibility with Chat.jsx
export const rateConsultation = async (roomId, rating, feedback = '') => {
    return rateExpert(roomId, rating, feedback);
};

// Add this function to get expert reviews
export const getExpertReviews = async (expertId) => {
    try {
        const response = await axiosInstance.get(`/experts/${expertId}/public-reviews`);
        return response.data;
    } catch (error) {
        console.error('Error fetching expert reviews:', error);
        throw new Error(error.response?.data?.message || 'Failed to fetch expert reviews');
    }
};

export const getExpertNotifications = async () => {
    // eslint-disable-next-line no-useless-catch
    try {
        const response = await axiosInstance.get('/notifications/expert');
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getUserProfile = async () => {
    try {
        const userType = localStorage.getItem(config.STORAGE_KEYS.USER_TYPE);
        const endpoint = userType === 'company' ? '/users/profile' : '/users/profile';
        const response = await axiosInstance.get(endpoint);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to get profile');
    }
};

// Company Orders Services
export const getCompanyOrders = async () => {
    try {
        const response = await axiosInstance.get('/orders/seller-orders');
        return response.data;
    } catch (error) {
        console.error('Error fetching company orders:', error);
        throw new Error(error.response?.data?.message || 'فشل في جلب طلبات الشركة');
    }
};

// Company Users Services
export const getCompanyUsers = async () => {
    try {
        const response = await axiosInstance.get('/users/companies');
        return response.data;
    } catch (error) {
        console.error('Error fetching company users:', error);
        throw new Error(error.response?.data?.message || 'Failed to fetch companies');
    }
};

// Admin Services
export const loginAdmin = async (credentials) => {
  try {
    const response = await axios.post(`${API_URL}/admin/login`, credentials);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Login failed');
  }
};

export const getAdminStats = async () => {
  try {
    const token = localStorage.getItem('adminToken');
    const response = await axios.get(`${API_URL}/admin/stats`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch stats');
  }
};

export const getAdminUsers = async (query = '') => {
  try {
    const token = localStorage.getItem('adminToken');
    const response = await axios.get(`${API_URL}/admin/users?${query}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch users');
  }
};

export const updateAdminUser = async (userId, userData) => {
  try {
    const token = localStorage.getItem('adminToken');
    const response = await axios.put(`${API_URL}/admin/users/${userId}`, userData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update user');
  }
};

export const toggleBlockAdminUser = async (userId) => {
  try {
    const token = localStorage.getItem('adminToken');
    const response = await axios.put(`${API_URL}/admin/users/${userId}/block`, {}, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to toggle user block status');
  }
};

export const deleteAdminUser = async (userId) => {
  try {
    const token = localStorage.getItem('adminToken');
    const response = await axios.delete(`${API_URL}/admin/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete user');
  }
};

export const getAdminProducts = async (query = '') => {
  try {
    const token = localStorage.getItem('adminToken');
    const response = await axios.get(`${API_URL}/admin/products?${query}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch products');
  }
};

export const getAdminOrders = async (query = '') => {
  try {
    const token = localStorage.getItem('adminToken');
    const response = await axios.get(`${API_URL}/admin/orders?${query}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch orders');
  }
};

export const getAdminUserDetails = async (userId) => {
  try {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      throw new Error('No admin authentication token found');
    }

    console.log('Fetching user details for ID:', userId);
    const response = await axios.get(`${API_URL}/admin/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.data) {
      throw new Error('No data received from server');
    }

    return response.data;
  } catch (error) {
    console.error('Error fetching user details:', error);
    throw new Error(
      error.response?.data?.message || 
      error.message || 
      'Failed to fetch user details'
    );
  }
};

export const getPlantAnalysisStats = async () => {
  try {
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      throw new Error('Admin authentication required');
    }

    const response = await axios.get(`${API_URL}/plant-analyses/statistics`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  } catch (error) {
    console.error('Plant analysis stats error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Access denied');
  }
};

// Farm Services
export const addNewFarm = async (farmData) => {
    try {
        const session = storage.getSession();
        if (!session || !session.token) {
            throw new Error('No authentication token found');
        }
        
        console.log('Sending farm data:', farmData);
        
        const response = await axiosInstance.post('/farmers/farms', farmData);
        
        if (!response.data || !response.data.success) {
            throw new Error(response.data?.message || 'Failed to add farm');
        }

        return response.data;
    } catch (error) {
        console.error('Error adding new farm:', error);
        if (error.response?.status === 500 && error.response?.data?.message) {
            throw new Error(error.response.data.message);
        }
        throw new Error(error.message || 'Failed to add farm');
    }
};

// Image utility function
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  
  // Remove any leading slash from imagePath to prevent double slashes
  const normalizedPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
  // Use BASE_URL instead of API_URL since static files are served from the base URL
  return `${config.BASE_URL}/${normalizedPath}`;
};

// Product Reviews
export const addProductReview = async (productId, rating, comment) => {
    try {
        const response = await axiosInstance.post(`/products/${productId}/reviews`, {
            rating,
            comment
        });
        return response.data;
    } catch (error) {
        console.error('Add product review error:', error);
        throw handleError(error);
    }
};

export const getProductReviews = async (productId, page = 1, limit = 10) => {
    try {
        const response = await axiosInstance.get(`/products/${productId}/reviews?page=${page}&limit=${limit}`);
        return response.data;
    } catch (error) {
        console.error('Get product reviews error:', error);
        throw handleError(error);
    }
};

export const deleteProductReview = async (productId, reviewId) => {
    try {
        const response = await axiosInstance.delete(`/products/${productId}/reviews/${reviewId}`);
        return response.data;
    } catch (error) {
        console.error('Delete product review error:', error);
        throw handleError(error);
    }
};

// Consult Order Services
export const getRoomConsultation = async (roomId) => {
    try {
        const response = await axiosInstance.get(`/consult-orders/room/${roomId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching room consultation:', error.response?.data || error.message);
        throw handleError(error);
    }
};

export const getCompletedConsultations = async () => {
    try {
        const response = await axiosInstance.get('/consult-orders/completed');
        return response.data;
    } catch (error) {
        console.error('Error fetching completed consultations:', error.response?.data || error.message);
        throw handleError(error);
    }
};

export const getExpertRatings = async () => {
    try {
        const response = await axiosInstance.get('/consult-orders/expert/ratings');
        return response.data;
    } catch (error) {
        console.error('Error fetching expert ratings:', error.response?.data || error.message);
        throw handleError(error);
    }
};

// Farmer Visits API functions for experts
export const getFarmerVisits = async (page = 1, limit = 10, status = '', priority = '') => {
    try {
        let query = `?page=${page}&limit=${limit}`;
        if (status) query += `&status=${status}`;
        if (priority) query += `&priority=${priority}`;
        
        const response = await axiosInstance.get(`/farmer-visits${query}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching farmer visits:', error);
        throw handleError(error);
    }
};

export const getFarmerVisit = async (visitId) => {
    try {
        const response = await axiosInstance.get(`/farmer-visits/${visitId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching farmer visit:', error);
        throw handleError(error);
    }
};

export const createFarmerVisit = async (visitData) => {
    try {
        console.log('Creating farmer visit with data:', visitData);
        console.log('API URL:', axiosInstance.defaults.baseURL);
        const response = await axiosInstance.post('/farmer-visits', visitData);
        return response.data;
    } catch (error) {
        console.error('Error creating farmer visit:', error);
        console.error('Error response:', error.response);
        console.error('Error status:', error.response?.status);
        console.error('Error data:', error.response?.data);
        throw handleError(error);
    }
};

export const updateFarmerVisit = async (visitId, visitData) => {
    try {
        const response = await axiosInstance.put(`/farmer-visits/${visitId}`, visitData);
        return response.data;
    } catch (error) {
        console.error('Error updating farmer visit:', error);
        throw handleError(error);
    }
};

export const deleteFarmerVisit = async (visitId) => {
    try {
        const response = await axiosInstance.delete(`/farmer-visits/${visitId}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting farmer visit:', error);
        throw handleError(error);
    }
};

export const updateVisitStatus = async (visitId, status) => {
    try {
        const response = await axiosInstance.put(`/farmer-visits/${visitId}/status`, { status });
        return response.data;
    } catch (error) {
        console.error('Error updating visit status:', error);
        throw handleError(error);
    }
};

export const getVisitStats = async (bustCache = false) => {
    try {
        const url = bustCache 
            ? `/farmer-visits/stats?_t=${Date.now()}` 
            : '/farmer-visits/stats';
        const response = await axiosInstance.get(url);
        return response.data;
    } catch (error) {
        console.error('Error fetching visit stats:', error);
        throw handleError(error);
    }
};

export const getFarmersSummary = async (bustCache = false) => {
    try {
        const url = bustCache 
            ? `/farmer-visits/farmers-summary?_t=${Date.now()}` 
            : '/farmer-visits/farmers-summary';
        const response = await axiosInstance.get(url);
        return response.data;
    } catch (error) {
        console.error('Error fetching farmers summary:', error);
        throw handleError(error);
    }
};

// Get all farmers for dropdown in visit form
export const getAllFarmers = async () => {
    try {
        const response = await axiosInstance.get('/experts/farmers');
        return response.data;
    } catch (error) {
        console.error('Error fetching farmers:', error);
        throw handleError(error);
    }
};

