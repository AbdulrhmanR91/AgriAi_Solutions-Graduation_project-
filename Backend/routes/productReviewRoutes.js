import express from 'express';
import ProductReview from '../models/ProductReview.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Add a review for a product
router.post('/:productId/reviews', protect, async (req, res) => {
    try {
        const { productId } = req.params;
        const { rating, comment } = req.body;
        const userId = req.user._id;

        // Validate input
        if (!rating || !comment) {
            return res.status(400).json({
                success: false,
                message: 'Rating and comment are required'
            });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be between 1 and 5'
            });
        }

        // Check if product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Check if user has purchased this product
        const hasPurchased = await Order.findOne({
            product: productId,
            buyer: userId,
            status: 'delivered'
        });

        // Check if user already reviewed this product
        const existingReview = await ProductReview.findOne({
            product: productId,
            user: userId
        });

        if (existingReview) {
            // Update existing review
            existingReview.rating = rating;
            existingReview.comment = comment;
            existingReview.isVerifiedPurchase = !!hasPurchased;
            await existingReview.save();
        } else {
            // Create new review
            await ProductReview.create({
                product: productId,
                user: userId,
                rating,
                comment,
                isVerifiedPurchase: !!hasPurchased
            });
        }

        // Update product's average rating and review count
        const reviews = await ProductReview.find({ product: productId });
        const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
        
        await Product.findByIdAndUpdate(productId, {
            averageRating: parseFloat(averageRating.toFixed(1)),
            reviewCount: reviews.length
        });

        res.status(200).json({
            success: true,
            message: existingReview ? 'Review updated successfully' : 'Review added successfully'
        });

    } catch (error) {
        console.error('Add review error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add review'
        });
    }
});

// Get reviews for a product
router.get('/:productId/reviews', async (req, res) => {
    try {
        const { productId } = req.params;
        const { page = 1, limit = 10 } = req.query;

        const reviews = await ProductReview.find({ product: productId })
            .populate('user', 'name profileImage')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const totalReviews = await ProductReview.countDocuments({ product: productId });

        res.status(200).json({
            success: true,
            data: {
                reviews,
                totalReviews,
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalReviews / limit)
            }
        });

    } catch (error) {
        console.error('Get reviews error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch reviews'
        });
    }
});

// Delete a review
router.delete('/:productId/reviews/:reviewId', protect, async (req, res) => {
    try {
        const { productId, reviewId } = req.params;
        const userId = req.user._id;

        const review = await ProductReview.findOne({
            _id: reviewId,
            product: productId,
            user: userId
        });

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found or unauthorized'
            });
        }

        await ProductReview.findByIdAndDelete(reviewId);

        // Update product's average rating and review count
        const reviews = await ProductReview.find({ product: productId });
        const averageRating = reviews.length > 0 
            ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
            : 0;
        
        await Product.findByIdAndUpdate(productId, {
            averageRating: parseFloat(averageRating.toFixed(1)),
            reviewCount: reviews.length
        });

        res.status(200).json({
            success: true,
            message: 'Review deleted successfully'
        });

    } catch (error) {
        console.error('Delete review error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete review'
        });
    }
});

export default router;
