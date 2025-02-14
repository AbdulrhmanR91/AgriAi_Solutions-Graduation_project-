import Notification from '../models/notificationModel.js';

export const createNotification = async ({ recipient, from, type, message, order }) => {
    try {
        const notificationData = {
            recipient,
            from,
            type,
            message
        };

        if (order) {
            notificationData.order = order;
        }

        console.log('Creating notification with data:', notificationData);
        const notification = new Notification(notificationData);
        console.log('Notification instance created:', notification);

        await notification.save();
        console.log('Notification saved successfully');
        
        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
        console.error('Error stack:', error.stack);
        // لا نريد أن نوقف عملية الطلب إذا فشل إنشاء الإشعار
        return null;
    }
};

export const getNotificationsForUser = async (userId) => {
    try {
        return await Notification.find({ recipient: userId })
            .sort({ createdAt: -1 })
            .limit(50);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        throw error;
    }
};

export const markNotificationAsRead = async (notificationId) => {
    try {
        return await Notification.findByIdAndUpdate(
            notificationId,
            { isRead: true },
            { new: true }
        );
    } catch (error) {
        console.error('Error marking notification as read:', error);
        throw error;
    }
};

export const deleteNotification = async (notificationId) => {
    try {
        return await Notification.findByIdAndDelete(notificationId);
    } catch (error) {
        console.error('Error deleting notification:', error);
        throw error;
    }
};

export const getUnreadNotificationsCount = async (userId) => {
    try {
        return await Notification.countDocuments({ user: userId, isRead: false });
    } catch (error) {
        console.error('Error counting unread notifications:', error);
        throw error;
    }
};
