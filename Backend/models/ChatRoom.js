import mongoose from 'mongoose';

const chatRoomSchema = new mongoose.Schema({
    user1: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    user2: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    lastMessage: {
        type: String,
        default: 'New conversation'
    },
    isRated: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// Ensure we can't have duplicate rooms for the same pair of users
chatRoomSchema.index({ user1: 1, user2: 1 }, { unique: true });

export default mongoose.model('ChatRoom', chatRoomSchema);
