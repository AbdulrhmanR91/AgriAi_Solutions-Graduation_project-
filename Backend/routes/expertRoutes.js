import { Router } from 'express';
import auth from '../middleware/auth.js';
import User from '../models/User.js';
import Rating from '../models/Rating.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        const uploadDir = './uploads/profiles';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function(req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'expert-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB max file size
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG, PNG and JPG are allowed.'));
        }
    }
});

router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.findOne({
            _id: req.user.id,
            userType: 'expert'
        }).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Expert not found'
            });
        }

        const formattedExpert = {
            name: user.name,
            email: user.email,
            phone: user.phone,
            location: user.location || '',
            expertDetails: {
                expertAt: user.expertDetails?.expertAt || '',
                university: user.expertDetails?.university || '',
                college: user.expertDetails?.college || '',
                services: user.expertDetails?.services || []
            },
            profileImage: user.profileImage || ''
        };

        res.json({
            success: true,
            data: formattedExpert
        });
    } catch (error) {
        console.error('Error in getExpertProfile:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

router.put('/profile', auth, async (req, res) => {
    try {
        const updates = req.body;
        console.log('Received updates:', updates);
        
        const updatedUser = await User.findOneAndUpdate(
            { 
                _id: req.user.id,
                userType: 'expert'
            },
            updates,
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: 'Expert not found'
            });
        }

        const formattedExpert = {
            name: updatedUser.name,
            email: updatedUser.email,
            phone: updatedUser.phone,
            location: updatedUser.location || '',
            expertDetails: {
                expertAt: updatedUser.expertDetails?.expertAt || '',
                university: updatedUser.expertDetails?.university || '',
                college: updatedUser.expertDetails?.college || '',
                services: updatedUser.expertDetails?.services || []
            },
            profileImage: updatedUser.profileImage || ''
        };

        res.json({
            success: true,
            data: formattedExpert
        });
    } catch (error) {
        console.error('Error updating expert:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update profile',
            error: error.message
        });
    }
});

router.get('/available', auth, async (req, res) => {
    try {
        const experts = await User.find({ userType: 'expert' })
            .select('name profileImage expertDetails phone')
            .sort({ createdAt: -1 });

        const formattedExperts = experts.map(expert => ({
            _id: expert._id, 
            name: expert.name,
            profileImage: expert.profileImage,
            expertDetails: expert.expertDetails,
            phone: expert.phone
        }));

        res.json({
            success: true,
            data: formattedExperts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to get experts'
        });
    }
});

router.get('/search', auth, async (req, res) => {
    try {
        const { query } = req.query;
        
        const experts = await User.find({
            userType: 'expert',
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { 'expertDetails.expertAt': { $regex: query, $options: 'i' } },
                { 'expertDetails.university': { $regex: query, $options: 'i' } }
            ]
        })
        .select('name profileImage expertDetails phone')
        .limit(10);

        const formattedExperts = experts.map(expert => ({
            _id: expert._id, 
            name: expert.name,
            profileImage: expert.profileImage,
            expertDetails: expert.expertDetails,
            phone: expert.phone
        }));

        res.json({
            success: true,
            data: formattedExperts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Search failed'
        });
    }
});

router.post('/profile/image', auth, upload.single('profileImage'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No image file provided'
            });
        }

        const imageUrl = `/uploads/profiles/${req.file.filename}`;
        
        const updatedUser = await User.findOneAndUpdate(
            { 
                _id: req.user.id,
                userType: 'expert'
            },
            { profileImage: imageUrl },
            { new: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: 'Expert not found'
            });
        }

        res.json({
            success: true,
            data: {
                profileImage: updatedUser.profileImage
            },
            message: 'Profile image updated successfully'
        });
    } catch (error) {
        console.error('Profile image upload error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to upload profile image'
        });
    }
});

// Get expert reviews by ID for farmers to view (public endpoint)
router.get('/:expertId/public-reviews', async (req, res) => {
    try {
        const { expertId } = req.params;
        
        // Verify expert exists
        const expert = await User.findOne({
            _id: expertId,
            userType: 'expert'
        }).select('name expertDetails');
        
        if (!expert) {
            return res.status(404).json({
                success: false,
                message: 'Expert not found'
            });
        }
        
        // Get ratings with farmer details
        const ratings = await Rating.find({ expert: expertId })
            .populate('farmer', 'name')
            .sort({ createdAt: -1 })
            .limit(20); // Limit to latest 20 reviews
        
        const reviews = ratings.map(rating => ({
            _id: rating._id,
            rating: rating.rating,
            feedback: rating.feedback || '',
            farmerName: rating.farmer?.name || 'Anonymous',
            createdAt: rating.createdAt,
            updatedAt: rating.updatedAt
        }));
        
        return res.status(200).json({
            success: true,
            data: reviews,
            expertInfo: {
                name: expert.name,
                averageRating: expert.expertDetails?.averageRating || 0,
                totalReviews: expert.expertDetails?.totalReviews || 0
            }
        });
        
    } catch (error) {
        console.error('Error fetching expert public reviews:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch expert reviews'
        });
    }
});

// Get all farmers for visit management (expert only)
router.get('/farmers', auth, async (req, res) => {
    try {
        // Verify user is an expert
        const user = await User.findById(req.user.id);
        if (!user || user.userType !== 'expert') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Experts only.'
            });
        }

        const farmers = await User.find({ userType: 'farmer' })
            .select('name email phone profileImage')
            .lean();

        res.json({
            success: true,
            data: farmers
        });
    } catch (error) {
        console.error('Error fetching farmers for expert:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

export default router;