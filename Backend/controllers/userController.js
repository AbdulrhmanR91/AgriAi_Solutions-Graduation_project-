/* eslint-env node */
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import process from 'process';

// تسجيل مستخدم جديد
export const registerUser = async (req, res) => {
    try {
        console.log('Received body:', req.body);
        
        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
            return res.status(400).json({
                error: 'البريد الإلكتروني مسجل مسبقاً'
            });
        }

        // تجهيز بيانات المستخدم
        const userData = {
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            phone: req.body.phone,
            userType: req.body.userType
        };

        // إضافة تفاصيل المزرعة إذا كان نوع المستخدم مزارع
        if (req.body.userType === 'farmer') {
            userData.farmDetails = {
                farmName: req.body.farmDetails.farmName,
                farmLocation: req.body.farmDetails.farmLocation,
                farmSize: req.body.farmDetails.farmSize,
                crops: req.body.farmDetails.crops
            };
        }

        console.log('Creating user with data:', userData);

        const user = new User(userData);
        await user.save();
        
        // تنسيق البيانات المُرجعة
        const userResponse = {
            name: user.name,
            email: user.email,
            phone: user.phone,
            userType: user.userType,
            farmDetails: user.farmDetails,
            _id: user._id
        };
        
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
        
        res.status(201).json({ 
            user: userResponse, 
            token 
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(400).json({ 
            error: error.code === 11000 
                ? 'هذا البريد الإلكتروني مسجل مسبقاً' 
                : error.message 
        });
    }
};

// تسجيل الدخول
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        
        if (!user) {
            throw new Error('Invalid login credentials');
        }
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error('Invalid login credentials');
        }
        
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
        res.send({ user, token });
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
}; 