import { useState, useEffect } from 'react';
import { getNotifications, markNotificationAsRead, clearAllNotifications, deleteNotification } from '../../../utils/apiService';
import toast from 'react-hot-toast';
import { Bell, Package, ShoppingCart, Heart, MessageCircle, Trash2 } from 'lucide-react';
import BottomNavigation from './BottomNavCompany';
import user from '/src/assets/images/user.png';

const BASE_URL = 'https://dark-gennifer-abdulrhman-5d081501.koyeb.app';

const NotificationsCPage = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('notifications');

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
                
                // تحديث حالة الإشعارات غير المقروءة
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
            toast.error(error.message || 'Failed to load notifications');
        } finally {
            setLoading(false);
        }
    };

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

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'order':
                return <Package className="w-6 h-6 text-blue-500" />;
            case 'cart':
                return <ShoppingCart className="w-6 h-6 text-yellow-500" />;
            case 'favorite':
                return <Heart className="w-6 h-6 text-red-500" />;
            case 'message':
                return <MessageCircle className="w-6 h-6 text-green-500" />;
            default:
                return <Bell className="w-6 h-6 text-gray-500" />;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          );    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <header className="sticky top-0 bg-white shadow-sm z-10">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
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
            </header>

            <main className="max-w-7xl mx-auto px-4 py-6">
                {notifications.length === 0 ? (
                    <div className="text-center py-12">
                        <Bell className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                        <h2 className="text-xl font-medium text-gray-900 mb-2">No notifications yet</h2>
                        <p className="text-gray-500">We'll notify you when something arrives</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {notifications.map((notification) => (
                            <div
                                key={notification._id}
                                className="bg-white rounded-lg shadow-sm p-4 transition-all relative hover:shadow-md"
                            >
                                <button
                                    onClick={() => handleDeleteNotification(notification._id)}
                                    className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0">
                                        {getNotificationIcon(notification.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-medium text-gray-800">
                                                {notification.from?.name || 'System'}
                                            </h3>
                                            <span className="text-sm text-gray-500">
                                                {getTimeAgo(notification.createdAt)}
                                            </span>
                                        </div>
                                        <p className={`text-gray-600 mt-1 ${!notification.isRead ? 'font-semibold' : ''}`}>
                                            {notification.message}
                                        </p>
                                        {notification.order && (
                                            <div className="mt-2 p-2 bg-gray-50 rounded-lg text-sm">
                                                <p>Order #{notification.order._id.slice(-6)}</p>
                                                <p>Product: {notification.order.product.name}</p>
                                                <p>Quantity: {notification.order.quantity}</p>
                                                <p>Total: EGP {notification.order.totalPrice}</p>
                                            </div>
                                        )}
                                    </div>
                                    {notification.from && (
                                        <div className="flex-shrink-0">
                                            <img
                                                src={notification.from.profileImage 
                                                    ? `${BASE_URL}${notification.from.profileImage}`
                                                    : user
                                                }
                                                alt={notification.from.name}
                                                className="w-10 h-10 rounded-full object-cover"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
    );
};

export default NotificationsCPage;


