import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ChatRoom',
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        // Allow null for system messages
        required: false
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    isSystem: {
        type: Boolean,
        default: false
    },
    visibleTo: {
        type: [String],
        validate: {
            validator: function(array) {
                // Check that all values are valid
                return array.every(value => ['farmer', 'expert', 'all'].includes(value));
            },
            message: 'visibleTo values must be either "farmer", "expert", or "all"'
        },
        default: ['all'] // By default, messages are visible to everyone
    },
    messageType: {
        type: String,
        enum: ['text', 'image'],
        default: 'text'
    },
    imageUrl: {
        type: String,
        default: null
    },
    imageName: {
        type: String,
        default: null
    }
}, { timestamps: true });

// Create index on roomId for faster queries
messageSchema.index({ roomId: 1 });

export default mongoose.model('Message', messageSchema);