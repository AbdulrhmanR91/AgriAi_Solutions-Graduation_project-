import express from 'express';
import mongoose from 'mongoose';
import auth from '../middleware/auth.js';
import Notification from '../models/notificationModel.js';

const router = express.Router();

// جلب الإشعارات الخاصة بالمستخدم الحالي فقط
router.get('/', auth, async (req, res) => {
    try {
        console.log('Fetching notifications for user:', req.user.id);
        
        const notifications = await Notification.find({ 
            recipient: req.user.id
        })
            .populate('from', 'name profileImage')
            .populate({
                path: 'order',
                populate: {
                    path: 'product',
                    select: 'name price image'
                }
            })
            .sort({ createdAt: -1 });

        console.log('Found notifications:', notifications.length);

        res.json({
            success: true,
            data: notifications
        });
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get notifications'
        });
    }
});

// جلب عدد الإشعارات غير المقروءة
router.get('/unread-count', auth, async (req, res) => {
    try {
        const count = await Notification.countDocuments({
            recipient: req.user.id,
            isRead: false
        });

        res.json({
            success: true,
            data: count
        });
    } catch (error) {
        console.error('Get unread count error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get unread count'
        });
    }
});

// تحديث حالة القراءة للإشعارات الخاصة بالمستخدم الحالي فقط
router.patch('/mark-as-read', auth, async (req, res) => {
    try {
        await Notification.updateMany(
            { 
                recipient: req.user.id,
                isRead: false 
            },
            { isRead: true }
        );

        res.json({
            success: true,
            message: 'All notifications marked as read'
        });
    } catch (error) {
        console.error('Mark as read error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to mark notifications as read'
        });
    }
});

// حذف كل إشعارات المستخدم
router.delete('/clear-all', auth, async (req, res) => {
    try {
        await Notification.deleteMany({ 
            recipient: req.user.id
        });
        
        res.json({
            success: true,
            message: 'All notifications cleared'
        });
    } catch (error) {
        console.error('Clear notifications error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to clear notifications'
        });
    }
});

// تحديث حالة القراءة لإشعار واحد
router.patch('/:notificationId/read', auth, async (req, res) => {
    try {
        const { notificationId } = req.params;
        
        if (!notificationId) {
            console.log('Missing notification ID');
            return res.status(400).json({
                success: false,
                message: 'Notification ID is required'
            });
        }

        if (!mongoose.Types.ObjectId.isValid(notificationId)) {
            console.log('Invalid notification ID format:', notificationId);
            return res.status(400).json({
                success: false,
                message: 'Invalid notification ID format'
            });
        }

        const notification = await Notification.findOneAndUpdate(
            { 
                _id: notificationId,
                recipient: req.user.id 
            },
            { isRead: true },
            { 
                new: true,
                runValidators: true
            }
        ).populate('from', 'name profileImage')
         .populate({
             path: 'order',
             populate: {
                 path: 'product',
                 select: 'name price image'
             }
         });

        if (!notification) {
            console.log('Notification not found or unauthorized');
            return res.status(404).json({
                success: false,
                message: 'Notification not found or not authorized'
            });
        }

        console.log('Successfully marked notification as read:', notification._id);
        res.json({
            success: true,
            data: notification
        });
    } catch (error) {
        console.error('Mark as read error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark notification as read'
        });
    }
});

// حذف إشعار محدد
router.delete('/:notificationId', auth, async (req, res) => {
    try {
        const notification = await Notification.findOneAndDelete({
            _id: req.params.notificationId,
            recipient: req.user.id
        });

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found or not authorized'
            });
        }

        res.json({
            success: true,
            message: 'Notification deleted successfully'
        });
    } catch (error) {
        console.error('Delete notification error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to delete notification'
        });
    }
});

// جلب إشعارات الخبير
router.get('/expert', auth, async (req, res) => {
    try {
        console.log('Fetching expert notifications for user:', req.user.id);
        
        const notifications = await Notification.find({ 
            recipient: req.user.id,
            type: 'consultOrder'
        })
            .populate('from', 'name profileImage')
            .populate({
                path: 'order',
                populate: {
                    path: 'farmer',
                    select: 'name profileImage phone'
                }
            })
            .sort({ createdAt: -1 });

        console.log('Found expert notifications:', notifications.length);

        res.json({
            success: true,
            data: notifications
        });
    } catch (error) {
        console.error('Get expert notifications error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'فشل في جلب إشعارات الخبير'
        });
    }
});

export default router;