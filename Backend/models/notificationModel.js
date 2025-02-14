import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    from: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    type: {
        type: String,
        enum: ['order', 'message', 'consultOrder', 'system', 'cart', 'favorite', 'order_status_update'],
        required: true
    },
    message: {
        type: String,
        required: true
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// إضافة فهارس للبحث السريع
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ recipient: 1, type: 1 });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification; 