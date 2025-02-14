import axios from 'axios';

export const BASE_URL = 'https://dark-gennifer-abdulrhman-5d081501.koyeb.app/api';
export const UPLOADS_URL = 'https://dark-gennifer-abdulrhman-5d081501.koyeb.app';

// Error handling function
const handleError = (error) => {
    console.error('API Error Details:', {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status,
        config: {
            url: error.config?.url,
            method: error.config?.method,
            baseURL: error.config?.baseURL
        }
    });

    if (error.code === 'ERR_NETWORK') {
        throw new Error('Unable to connect to server. Please check your internet connection or try again later.');
    }

    if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
    }
    
    throw new Error(error.message || 'An error occurred');
};

// Create and export axios instance
export const axiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    timeout: 10000,
    withCredentials: true
});

// Add token interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
       
        return Promise.reject(error);
    }
);

// Add response interceptor
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Authentication Services
export const registerUser = async (userData) => {
    try {
     
        
        const response = await axios.post(`${BASE_URL}/auth/register`, userData);

        
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
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'فشل في تسجيل الدخول');
    }
};

// Profile Services
export const getFarmerProfile = async () => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No authentication token found');
        }

        const response = await axios.get(
            `${BASE_URL}/farmers/profile`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );
 
        return response.data.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const updateFarmerProfile = async (updates) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.put(
            `${BASE_URL}/farmers/profile`,
            updates,
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );
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
        
        if (!response.data.success) {
            throw new Error(response.data.message || 'Failed to fetch profile');
        }
        
        return response.data.data;
    } catch (error) {
        console.error('Get expert profile error:', error);
        throw new Error(error.response?.data?.message || 'Failed to fetch profile');
    }
};

export const updateExpertProfile = async (profileData) => {
    try {
        
        const response = await axiosInstance.put('/experts/profile', profileData);
        
        if (!response.data.success) {
            throw new Error(response.data.message || 'Failed to update profile');
        }
        
        return response.data;
    } catch (error) {
        console.error('Update profile error:', error);
        throw new Error(error.response?.data?.message || 'Failed to update profile');
    }
};

export const uploadProfileImage = async (formData) => {
    try {
        const token = localStorage.getItem('token');
        const userType = localStorage.getItem('userType');
        const endpoint = userType === 'expert' ? '/experts/upload-image' : '/users/upload-image';

        const response = await axios.post(
            `${BASE_URL}${endpoint}`,
            formData,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            }

            
        );

        return response.data;
    } catch (error) {
        console.error('Upload image error:', error);
        throw new Error(error.response?.data?.message || 'فشل في تحميل الصورة');
    }
};

export const uploadExpertProfileImage = async (formData) => {
    try {
        const response = await axiosInstance.post('/experts/upload-image', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Update profile image error:', error);
        throw new Error(error.response?.data?.message || 'Failed to upload image');
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

export const getAvailableExperts = async () => {
    try {
        const response = await axiosInstance.get('/experts/available');
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

        const token = localStorage.getItem('token');
        const userType = localStorage.getItem('userType');
        const endpoint = userType === 'expert' ? '/experts/upload-image' : '/users/upload-image';

        const response = await axios.post(
            `${BASE_URL}${endpoint}`,
            formData,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            }
        );

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

export const updateConsultOrderStatus = async (orderId, status) => {
    try {
        const response = await axiosInstance.patch(`/consult-orders/${orderId}`, { status });
        return response.data;
    } catch (error) {
        console.error('Update consult order error:', error);
        throw new Error(error.response?.data?.message || 'Failed to update consultation order');
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
        const userType = localStorage.getItem('userType');
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

// Farm Services
export const addNewFarm = async (farmData) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.post(
            `${BASE_URL}/farmers/farms`,
            farmData,
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error adding new farm:', error);
        throw new Error(error.response?.data?.message || 'Failed to add new farm');
    }
};

// Helper function to get complete image URL
export const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `${UPLOADS_URL}${imagePath}`;
};