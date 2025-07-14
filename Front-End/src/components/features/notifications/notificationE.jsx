import { useState, useEffect } from 'react';
import { Search, Bell, CheckCircle } from 'lucide-react';
import { getExpertNotifications, markNotificationAsRead } from '../../../utils/apiService';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const NotificationE = () => {
    const { t } = useTranslation();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        // Initial load
        loadNotifications();
        
        // Refresh notifications every minute
        const interval = setInterval(() => {
            loadNotifications();
        }, 60000);
        
        return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadNotifications = async () => {
        try {
            setLoading(true);
            const response = await getExpertNotifications();
            if (response.success) {
                setNotifications(response.data);
                // تحديث حالة الإشعارات غير المقروءة
                const unreadNotifications = response.data.filter(n => !n.isRead);
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
            toast.error(t('common.error'));
        } finally {
            setLoading(false);
        }
    };

    const getTimeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        if (seconds < 60) return t('expert.notifications.just_now');
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return t('expert.notifications.minutes_ago', { minutes });
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return t('expert.notifications.hours_ago', { hours });
        const days = Math.floor(hours / 24);
        if (days < 7) return t('expert.notifications.days_ago', { days });
        return new Date(date).toLocaleDateString();
    };

    const filteredNotifications = notifications.filter(notification => {
        const matchesSearch = notification.message.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filter === 'all' || notification.type === filter;
        return matchesSearch && matchesFilter;
    });

    const getNotificationIcon = (type, metadata) => {
        switch (type) {
            case 'consultOrder': {
                return '👨‍⚕️';
            }
            case 'rating': {
                // Show different stars based on rating value
                const rating = metadata?.rating || 5;
                return '⭐'.repeat(rating);
            }
            case 'consultCompleted': {
                return '✅';
            }
            default: {
                return '📌';
            }
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <div className="flex-grow max-w-2xl mx-auto p-4">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-green-500 mb-6">{t('expert.notifications.notifications')}</h1>
                    
                    {/* Search Bar */}
                    <div className="relative mb-6">
                        <input
                            type="text"
                            placeholder={t('expert.notifications.search_notifications')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    </div>

                    {/* Filter Buttons */}
                    <div className="flex gap-2 mb-6 overflow-x-auto">
                        {['all', 'consultOrder', 'rating'].map((filterType) => (
                            <button
                                key={filterType}
                                onClick={() => setFilter(filterType)}
                                className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
                                    filter === filterType
                                        ? filterType === 'rating' 
                                            ? 'bg-yellow-500 text-white'
                                            : 'bg-green-500 text-white'
                                        : 'bg-white border border-gray-300 text-gray-700'
                                }`}
                            >
                                {filterType === 'rating' ? '⭐ Ratings' : t(`expert.notifications.filter_${filterType}`)}
                            </button>
                        ))}
                    </div>

                    {/* Notifications List */}
                    {loading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
                        </div>
                    ) : filteredNotifications.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <Bell className="mx-auto h-12 w-12 mb-4" />
                            <p>{t('expert.notifications.no_notifications')}</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredNotifications.map((notification) => (
                                <div
                                    key={notification._id}
                                    className={`bg-white rounded-lg shadow p-4 transition-all ${
                                        !notification.isRead ? 'border-l-4 border-green-500' : ''
                                    }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="text-2xl">
                                            {notification.type === 'rating' ? 
                                                '⭐'.repeat(notification.metadata?.rating || 5) : 
                                                getNotificationIcon(notification.type)
                                            }
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-1">
                                                <p className="font-medium">
                                                    {notification.from?.name || t('expert.notifications.system')}
                                                </p>
                                                <span className="text-sm text-gray-500">
                                                    {getTimeAgo(notification.createdAt)}
                                                </span>
                                            </div>
                                            
                                            {notification.type === 'rating' ? (
                                                <div>
                                                    <p className="text-gray-700 font-medium">
                                                        {notification.metadata?.farmerName || 'A farmer'} rated your consultation {notification.metadata?.rating}⭐
                                                    </p>
                                                    {notification.metadata?.feedback && (
                                                        <blockquote className="mt-2 pl-3 border-l-2 border-yellow-300 text-sm italic text-gray-600">
                                                            &ldquo;{notification.metadata.feedback}&rdquo;
                                                        </blockquote>
                                                    )}
                                                </div>
                                            ) : (
                                                <p className="text-gray-600">{notification.message}</p>
                                            )}
                                            
                                            {notification.isRead && (
                                                <div className="flex items-center gap-1 mt-2 text-green-500 text-sm">
                                                    <CheckCircle size={16} />
                                                    <span>{t('expert.notifications.read')}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationE;