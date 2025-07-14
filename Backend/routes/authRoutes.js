import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import process from 'process';
import { refreshToken } from '../controllers/authController.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

router.post('/register', async (req, res) => {
    try {
        const { 
            name, 
            email, 
            password, 
            phone, 
            userType, 
            farmDetails, 
            expertDetails,
            companyDetails
        } = req.body;
     
        if (!name || !email || !password || !userType) {
            return res.status(400).json({ 
                success: false,
                message: 'يرجى توفير جميع البيانات المطلوبة' 
            });
        }
        
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ 
                success: false,
                message: 'يرجى إدخال بريد إلكتروني صحيح' 
            });
        }
        
        if (password.length < 8) {
            return res.status(400).json({ 
                success: false,
                message: 'يجب أن تكون كلمة المرور 8 أحرف على الأقل' 
            });
        }
        
        const allowedUserTypes = ['farmer', 'expert', 'company'];
        if (!allowedUserTypes.includes(userType)) {
            return res.status(400).json({ 
                success: false,
                message: 'نوع المستخدم غير صالح' 
            });
        }

        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ 
                success: false,
                message: 'المستخدم موجود بالفعل' 
            });
        }
        
        if (phone) {
            user = await User.findOne({ phone });
            if (user) {
                return res.status(400).json({ 
                    success: false,
                    message: 'رقم الهاتف مستخدم بالفعل' 
                });
            }
        }

        user = new User({
            name,
            email,
            password,
            phone,
            userType,
            ...(userType === 'farmer' && { farmDetails }),
            ...(userType === 'expert' && { expertDetails }),
            ...(userType === 'company' && { 
                companyDetails: {
                    companyName: companyDetails?.companyName || name,
                    businessAddress: companyDetails?.businessAddress || '',
                    tradeLicenseNumber: companyDetails?.tradeLicenseNumber || '',
                    taxRegistrationNumber: companyDetails?.taxRegistrationNumber || ''
                }
            })
        });

        await user.save();

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                userType: user.userType,
                phone: user.phone,
                profileImage: user.profileImage,
                ...(userType === 'farmer' && { farmDetails: user.farmDetails }),
                ...(userType === 'expert' && { expertDetails: user.expertDetails }),
                ...(userType === 'company' && { companyDetails: user.companyDetails })
            }
        });
    } catch (error) {
        logger.error('Registration error', {
            name: error.name,
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
        
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                message: 'خطأ في التحقق من البيانات',
                errors
            });
        }

        res.status(500).json({ 
            message: 'خطأ في الخادم',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Normalize the email by trimming any whitespace
        const normalizedEmail = email ? email.trim() : '';

        logger.info('Login attempt', { 
            email: normalizedEmail ? normalizedEmail.substring(0, 3) + '***' : 'not provided', 
            passwordProvided: !!password,
            ip: req.ip || req.connection?.remoteAddress
        });

        if (!normalizedEmail || !password) {
            return res.status(400).json({ message: 'Email/phone and password are required' });
        }

        // Check if the provided credential is email or phone
        let user;
        if (normalizedEmail.includes('@')) {
            // Login with email - use case insensitive query
            console.log('Attempting login with email:', normalizedEmail);
            const emailRegex = new RegExp(`^${normalizedEmail.replace(/[-\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i');
            user = await User.findOne({ email: emailRegex }).select('+password');
        } else {
            // Login with phone number (with more robust matching)
            console.log('Attempting login with phone:', normalizedEmail);
            user = await User.findOne({ phone: normalizedEmail }).select('+password');
            
            if (!user) {
                // Try with country code if not found directly
                console.log('Trying with regex phone match');
                const phoneRegex = new RegExp(normalizedEmail + '$');
                user = await User.findOne({ phone: phoneRegex }).select('+password');
            }
        }

        if (!user) {
            console.log('User not found for login');
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        console.log('User found, comparing password');
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log('Password does not match');
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        console.log('Login successful for user:', user._id);
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                userType: user.userType,
                phone: user.phone,
                profileImage: user.profileImage,
                ...(user.userType === 'farmer' && { farmDetails: user.farmDetails }),
                ...(user.userType === 'expert' && { expertDetails: user.expertDetails }),
                ...(user.userType === 'company' && { companyDetails: user.companyDetails })
            }
        });
    } catch (error) {
        console.error('Login error details:', error);
        res.status(500).json({ 
            message: 'Authentication failed', 
            error: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
        });
    }
});

router.post('/refresh-token', refreshToken);

export default router;