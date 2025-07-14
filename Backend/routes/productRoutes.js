import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import auth from '../middleware/auth.js';
import Product from '../models/productModel.js';

const router = express.Router();

const uploadDir = './uploads/products';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG, PNG and JPG are allowed.'));
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024 
    }
});

router.get('/', async (req, res) => {
    try {
        const products = await Product.find()
            .populate('seller', 'name profileImage userType')
            .sort({ createdAt: -1 });
        
        res.json({
            success: true,
            data: products
        });
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

router.post('/', auth, upload.single('image'), async (req, res) => {
    try {
        const { name, type, price, quantity, description, sellerType } = req.body;
        
        if (!name || !type || !price || !quantity || !sellerType) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        const product = new Product({
            name,
            type,
            price: Number(price),
            quantity: Number(quantity),
            description,
            image: req.file ? `/uploads/products/${req.file.filename}` : null,
            seller: req.user._id,
            sellerType
        });

        await product.save();

        const populatedProduct = await Product.findById(product._id)
            .populate('seller', 'name profileImage userType');

        res.status(201).json({
            success: true,
            data: populatedProduct
        });
    } catch (error) {
        console.error('Add product error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });

        console.log('Request Body:', req.body);
console.log('File:', req.file);

    }
});

router.put('/:id', auth, upload.single('image'), async (req, res) => {
    try {
        console.log('Update product request received:', {
            body: req.body,
            file: req.file,
            params: req.params
        });

        const { name, type, price, quantity, description } = req.body;
        const productId = req.params.id;

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        if (product.seller.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this product'
            });
        }

        const updateData = {
            name: name || product.name,
            type: type || product.type,
            price: price ? Number(price) : product.price,
            quantity: quantity ? Number(quantity) : product.quantity,
            description: description || product.description
        };

        if (req.file) {
            console.log('New image uploaded:', req.file.filename);
            if (product.image) {
                const oldImagePath = path.join(process.cwd(), product.image);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
            updateData.image = `/uploads/products/${req.file.filename}`;
        }

        console.log('Updating product with data:', updateData);

        const updatedProduct = await Product.findByIdAndUpdate(
            productId,
            updateData,
            { new: true }
        ).populate('seller', 'name profileImage userType');

        console.log('Product updated successfully:', updatedProduct);

        res.json({
            success: true,
            data: updatedProduct
        });
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});


router.delete('/:id', auth, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Check if the current user is the seller
        if (product.seller.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this product'
            });
        }

        await Product.deleteOne({ _id: req.params.id });

        res.json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to delete product'
        });
    }
});


router.post('/my-products', auth, async (req, res) => {
    try {
        const { productId } = req.body;
        const product = await Product.findById(productId);
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        if (product.seller.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        product.isInMyProducts = true;
        await product.save();

        res.json({
            success: true,
            data: product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

router.get('/my-products', auth, async (req, res) => {
    try {
        const products = await Product.find({ seller: req.user._id })
            .populate('seller', 'name profileImage userType')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: products
        });
    } catch (error) {
        console.error('Get my products error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('seller', 'name profileImage userType');
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.json({
            success: true,
            data: product
        });
    } catch (error) {
        console.error('Get product by ID error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error fetching product'
        });
    }
});

export default router;