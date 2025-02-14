import { Router } from 'express';
import auth from '../middleware/auth.js';
import User from '../models/User.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

// إعداد multer لتحميل الصور
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

// الحصول على بيانات الخبير من جدول users
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

        // تنسيق البيانات قبل إرسالها
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

// تحديث بيانات الخبير في جدول users
router.put('/profile', auth, async (req, res) => {
    try {
        const updates = req.body;
        console.log('Received updates:', updates);
        
        // تحديث البيانات في جدول users
        const updatedUser = await User.findOneAndUpdate(
            { 
                _id: req.user.id,
                userType: 'expert'
            },
            { 
                $set: {
                    // تحديث البيانات الأساسية
                    email: updates.email,
                    phone: updates.phone,
                    location: updates.location,
                    // تحديث بيانات الخبير
                    'expertDetails.expertAt': updates.expertAt || updates.expertDetails?.expertAt,
                    'expertDetails.university': updates.university || updates.expertDetails?.university,
                    'expertDetails.college': updates.college || updates.expertDetails?.college,
                    'expertDetails.services': updates.services || updates.expertDetails?.services
                }
            },
            { 
                new: true, 
                runValidators: true 
            }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: 'Expert not found'
            });
        }

        // تنسيق البيانات قبل إرسالها
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

// جلب قائمة الخبراء المتاحين
router.get('/available', auth, async (req, res) => {
    try {
        const experts = await User.find({ userType: 'expert' })
            .select('name profileImage expertDetails phone')
            .sort({ createdAt: -1 });

        const formattedExperts = experts.map(expert => ({
            _id: expert._id, // Change from id to _id
            name: expert.name,
            profileImage: expert.profileImage,
            expertDetails: expert.expertDetails,
            phone: expert.phone
        }));

        res.json({
            success: true,
            data: formattedExperts
        });
    } catch  {
        res.status(500).json({
            success: false,
            message: 'Failed to get experts'
        });
    }
});

// البحث عن خبراء
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
        .sort({ createdAt: -1 });

        const formattedExperts = experts.map(expert => ({
            id: expert._id,
            name: expert.name,
            profileImage: expert.profileImage,
            specialization: expert.expertDetails?.expertAt || '',
            university: expert.expertDetails?.university || '',
            phone: expert.phone
        }));

        res.json({
            success: true,
            data: formattedExperts
        });
    } catch (error) {
        console.error('Error searching experts:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to search experts'
        });
    }
});

// إضافة مسار تحميل الصورة
router.post('/upload-image', auth, upload.single('profileImage'), async (req, res) => {
    try {
        console.log('Upload request received:', { file: req.file }); // Debug log

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No image file provided'
            });
        }

        const uploadDir = './uploads/profiles';
        if(!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Expert not found'
            });
        }

        // Delete old profile image if exists
        if (user.profileImage) {
            try {
                const oldImagePath = path.join(process.cwd(), user.profileImage);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            } catch (err) {
                console.error('Error deleting old image:', err);
            }
        }

        // Update user profile with new image path
        const imagePath = `/uploads/profiles/${req.file.filename}`;
        user.profileImage = imagePath;
        await user.save();

        console.log('Profile image updated:', imagePath); // Debug log

        res.json({
            success: true,
            imageUrl: imagePath,
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

export default router;