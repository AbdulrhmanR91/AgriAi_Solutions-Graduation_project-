import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUnreadNotificationsCount } from '../../../utils/apiService';
import bell from "/src/assets/images/bell.png";
import { toast } from 'react-hot-toast';
import PropTypes from 'prop-types';

const NotificationBadge = ({ userType }) => {
    const [unreadCount, setUnreadCount] = useState(0);
    const [error, setError] = useState(null);

    const loadUnreadCount = async () => {
        try {
            setError(null);
            const response = await getUnreadNotificationsCount();
            if (response.success) {
                if (response.data !== unreadCount) {
                    setUnreadCount(response.data);
                    if (response.data > unreadCount) {
                        toast.success('لديك إشعار جديد!', {
                            duration: 3000,
                            position: 'top-right'
                        });
                    }
                }
            }
        } catch (error) {
            console.error('خطأ في تحميل عدد الإشعارات غير المقروءة:', error);
            setError(error.message);
        }
    };

    useEffect(() => {
        loadUnreadCount();
        const interval = setInterval(loadUnreadCount, 10000);
        return () => clearInterval(interval);
    }, [unreadCount]);

    const getNotificationsPath = () => {
        switch (userType) {
            case 'expert':
                return '/expert/notifications';
            case 'company':
                return '/company/notifications';
            case 'farmer':
                return '/farmer/notifications';
            default:
                return '/notifications';
        }
    };

    return (
        <Link to={getNotificationsPath()} className="relative">
            <div className="w-6 h-6 relative">
                <img
                    src={bell}
                    alt="إشعارات"
                    className={`w-full h-full transition-transform duration-200 ${unreadCount > 0 ? 'animate-bounce' : ''}`}
                />
                {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full px-2 py-0.5 text-xs animate-pulse">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </div>
        </Link>
    );
};

NotificationBadge.propTypes = {
    userType: PropTypes.oneOf(['expert', 'company', 'farmer']).isRequired
};

export default NotificationBadge;