import mongoose from 'mongoose';

const productReviewSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: true,
        trim: true,
        maxLength: 500
    },
    isVerifiedPurchase: {
        type: Boolean,
        default: false
    }
}, { 
    timestamps: true 
});

// Ensure one review per user per product
productReviewSchema.index({ product: 1, user: 1 }, { unique: true });

export default mongoose.model('ProductReview', productReviewSchema);
