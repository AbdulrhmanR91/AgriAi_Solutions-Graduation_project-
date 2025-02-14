import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import process from 'process';

const router = express.Router();

// تسجيل مستخدم جديد
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
     

        // التحقق من وجود المستخدم
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'المستخدم موجود بالفعل' });
        }

        // إنشاء مستخدم جديد
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

        // إنشاء توكن
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
        console.error('خطأ في التسجيل:', error);
        
        // معالجة أخطاء التحقق من صحة البيانات
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

// تسجيل الدخول
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // التحقق من وجود المستخدم
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'user not found' });
        }

        // التحقق من كلمة المرور
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'password wrong' });
        }

        // إنشاء توكن
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
    } catch  {
    
        res.status(500).json({ message: 'خطأ في الخادم' });
    }
});

export default router; 