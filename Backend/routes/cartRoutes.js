import express from 'express';
import auth from '../middleware/auth.js';
import CartItem from '../models/cartModel.js';
import Product from '../models/productModel.js';

const router = express.Router();

router.post('/', auth, async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        console.log('Adding to cart:', { productId, quantity, userId: req.user.id });

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        if (product.seller.toString() === req.user.id) {
            return res.status(400).json({
                success: false,
                message: "You can't add your own product to cart"
            });
        }

        let cartItem = await CartItem.findOne({
            user: req.user.id,
            product: productId
        });

        if (cartItem) {
            cartItem.quantity = quantity;
        } else {
            cartItem = new CartItem({
                user: req.user.id,
                product: productId,
                quantity
            });
        }

        await cartItem.save();
        
        const populatedItem = await CartItem.findById(cartItem._id)
            .populate({
                path: 'product',
                select: 'name price description image',
                populate: {
                    path: 'seller',
                    select: 'name profileImage'
                }
            });

        res.status(201).json({
            success: true,
            message: 'Product added to cart successfully',
            data: populatedItem
        });
    } catch (error) {
        console.error('Add to cart error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

router.get('/', auth, async (req, res) => {
    try {
        console.log('Getting cart for user:', req.user.id);

        const cartItems = await CartItem.find({ user: req.user.id })
            .populate({
                path: 'product',
                select: 'name price description image',
                populate: {
                    path: 'seller',
                    select: 'name profileImage'
                }
            });
        
        console.log('Found cart items:', cartItems);

        res.json({
            success: true,
            data: { items: cartItems }
        });
    } catch (error) {
        console.error('Get cart error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

router.delete('/:itemId', auth, async (req, res) => {
    try {
        const cartItem = await CartItem.findById(req.params.itemId);
        
        if (!cartItem) {
            return res.status(404).json({
                success: false,
                message: 'Cart item not found'
            });
        }

        if (cartItem.user.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to remove this item'
            });
        }

        await cartItem.deleteOne();

        res.json({
            success: true,
            message: 'Item removed from cart'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

export default router; 