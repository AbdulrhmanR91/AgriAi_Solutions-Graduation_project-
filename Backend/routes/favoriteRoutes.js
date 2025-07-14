import express from 'express';
import auth from '../middleware/auth.js';
import Favorite from '../models/favoriteModel.js';
import Product from '../models/productModel.js';

const router = express.Router();

router.post('/', auth, async (req, res) => {
    try {
        const { productId } = req.body;
        console.log('Toggle favorite for product:', productId, 'user:', req.user.id);
        
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        const existingFavorite = await Favorite.findOne({
            user: req.user.id,
            product: productId
        });

        console.log('Existing favorite:', existingFavorite);

        if (existingFavorite) {
            await existingFavorite.deleteOne();
            console.log('Removed from favorites');
            return res.json({
                success: true,
                message: 'Product removed from favorites',
                isFavorite: false,
                productId
            });
        }

        const favorite = new Favorite({
            user: req.user.id,
            product: productId
        });

        await favorite.save();
        console.log('Added to favorites');

        res.status(201).json({
            success: true,
            message: 'Product added to favorites',
            isFavorite: true,
            productId,
            favorite
        });
    } catch (error) {
        console.error('Favorite toggle error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

router.get('/', auth, async (req, res) => {
    try {
        console.log('Getting favorites for user:', req.user.id);

        const favorites = await Favorite.find({ user: req.user.id })
            .populate({
                path: 'product',
                select: 'name price description image',
                populate: {
                    path: 'seller',
                    select: 'name profileImage'
                }
            });
        
        console.log('Found favorites:', favorites);

        res.json({
            success: true,
            data: favorites
        });
    } catch (error) {
        console.error('Get favorites error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

export default router;