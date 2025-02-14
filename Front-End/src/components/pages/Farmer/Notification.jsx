import { useState, useEffect } from 'react';
import { Bell, Trash2 } from 'lucide-react';
import { getNotifications, markNotificationAsRead, clearAllNotifications, deleteNotification } from '../../../utils/apiService';
import toast from 'react-hot-toast';
import user from '/src/assets/images/user.png';

const BASE_URL = 'https://dark-gennifer-abdulrhman-5d081501.koyeb.app';

const NotificationsPage = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadNotifications();
    }, []);

    const loadNotifications = async () => {
        try {
            setLoading(true);
            const response = await getNotifications();
            
            if (response.success) {
                const sortedNotifications = response.data.sort((a, b) => 
                    new Date(b.createdAt) - new Date(a.createdAt)
                );
                setNotifications(sortedNotifications);
                
                const unreadNotifications = sortedNotifications.filter(n => !n.isRead);
                for (const notification of unreadNotifications) {
                    try {
                        await markNotificationAsRead(notification._id);
                    } catch (error) {
                        console.error(`Failed to mark notification ${notification._id} as read:`, error);
                    }
                }
            }
        } catch (error) {
            console.error('Load notifications error:', error);
            toast.error(error.message || 'Failed to load notifications');
        } finally {
            setLoading(false);
        }
    };

    const getTimeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + ' years ago';
        
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + ' months ago';
        
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + ' days ago';
        
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + ' hours ago';
        
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + ' minutes ago';
        
        return 'Just now';
    };

    const filteredNotifications = notifications.filter(notification =>
        notification.message.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleClearAll = async () => {
        try {
            const response = await clearAllNotifications();
            if (response.success) {
                setNotifications([]);
                toast.success('All notifications cleared');
            }
        } catch (error) {
            console.error('Clear notifications error:', error);
            toast.error(error.message || 'Failed to clear notifications');
        }
    };

    const handleDeleteNotification = async (notificationId) => {
        try {
            const response = await deleteNotification(notificationId);
            if (response.success) {
                setNotifications(prev => prev.filter(n => n._id !== notificationId));
                toast.success('Notification deleted');
            }
        } catch (error) {
            console.error('Delete notification error:', error);
            toast.error(error.message || 'Failed to delete notification');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          );    }

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <div className="max-w-2xl mx-auto p-4">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
                    {notifications.length > 0 && (
                        <button
                            onClick={handleClearAll}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center gap-2"
                        >
                            <Trash2 className="w-4 h-4" />
                            Clear All
                        </button>
                    )}
                </div>

                {/* Search Bar */}
                <div className="relative mb-6">
                    <input
                        type="text"
                        placeholder="Search notifications..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border rounded-full border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-400"
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                        <Bell className="w-5 h-5 text-gray-400" />
                    </div>
                </div>

                {/* Notifications List */}
                <div className="space-y-4">
                    {filteredNotifications.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">No notifications found</p>
                    ) : (
                        filteredNotifications.map((notification) => (
                            <div
                                key={notification._id}
                                className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow relative"
                            >
                                <button
                                    onClick={() => handleDeleteNotification(notification._id)}
                                    className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                                
                                <div className="flex items-start gap-4">
                                    {/* صورة المستخدم */}
                                    {notification.from && (
                                        <img
                                            src={notification.from.profileImage ? 
                                                notification.from.profileImage.startsWith('http') ? 
                                                notification.from.profileImage : 
                                                `${BASE_URL}${notification.from.profileImage}` 
                                                : user}
                                            alt={notification.from.name}
                                            className="w-10 h-10 rounded-full object-cover"
                                        />
                                    )}
                                    
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-medium text-gray-800">
                                                {notification.from?.name || 'System'}
                                            </h3>
                                            <span className="text-sm text-gray-500">
                                                {getTimeAgo(notification.createdAt)}
                                            </span>
                                        </div>
                                        <p className="text-gray-600 mt-1">
                                            {notification.message}
                                        </p>
                                        
                                        {/* إذا كان الإشعار يتعلق بطلب، نعرض تفاصيل إضافية */}
                                        {notification.order && (
                                            <div className="mt-2 p-2 bg-gray-50 rounded-lg text-sm">
                                                <p>Order #{notification.order._id.slice(-6)}</p>
                                                <p>Product: {notification.order.product.name}</p>
                                                <p>Quantity: {notification.order.quantity}</p>
                                                <p>Total: EGP {notification.order.totalPrice}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationsPage;  

