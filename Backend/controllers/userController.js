/* eslint-env node */
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import process from 'process';

// تسجيل مستخدم جديد
export const registerUser = async (req, res) => {
    try {
        // التحقق من وجود البريد الإلكتروني
        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
            return res.status(400).json({
                error: 'Email already registered. Please use a different email or try logging in.'
            });
        }

        // إنشاء مستخدم جديد
        const userData = {
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            phone: req.body.phone,
            userType: req.body.userType
        };

        // إضافة تفاصيل الشركة إذا كان نوع المستخدم شركة
        if (req.body.userType === 'company') {
            userData.companyDetails = {
                companyName: req.body.companyDetails.companyName,
                businessAddress: req.body.companyDetails.businessAddress,
                governorate: req.body.companyDetails.governorate,
                tradeLicenseNumber: req.body.companyDetails.tradeLicenseNumber,
                taxRegistrationNumber: req.body.companyDetails.taxRegistrationNumber,
                location: req.body.companyDetails.location
            };
        }

        const user = new User(userData);
        await user.save();
        
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
        res.status(201).send({ user, token });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(400).send({ 
            error: error.code === 11000 
                ? 'This email is already registered' 
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