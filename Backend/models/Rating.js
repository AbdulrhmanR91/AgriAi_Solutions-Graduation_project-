import mongoose from 'mongoose';

const ratingSchema = new mongoose.Schema({
    farmer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    expert: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ChatRoom',
        required: true
    },
    consultOrder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ConsultOrder',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    feedback: {
        type: String,
        default: ''
    }
}, { timestamps: true });

// Create a compound index to ensure a farmer can only rate each consultation once
ratingSchema.index({ farmer: 1, expert: 1, consultOrder: 1 }, { unique: true });

// Additional index for efficient queries
ratingSchema.index({ expert: 1 });
ratingSchema.index({ consultOrder: 1 });

export default mongoose.model('Rating', ratingSchema);
