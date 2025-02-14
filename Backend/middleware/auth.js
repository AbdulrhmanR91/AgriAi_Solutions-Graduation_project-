/* eslint-env node */
import jwt from 'jsonwebtoken';
import process from 'process';
import User from '../models/User.js';

const auth = async (req, res, next) => {
    try {
        // التحقق من وجود التوكن
        const token = req.header('Authorization')?.replace('Bearer ', '');
        console.log('التوكن المستلم:', token);
        
        if (!token) {
            console.log('لم يتم توفير التوكن');
            return res.status(401).json({
                success: false,
                message: 'يرجى تسجيل الدخول'
            });
        }

        // التحقق من صحة التوكن
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('بيانات التوكن:', decoded);
        } catch (jwtError) {
            console.error('خطأ في التحقق من التوكن:', jwtError);
            return res.status(401).json({
                success: false,
                message: 'جلسة منتهية - يرجى تسجيل الدخول مرة أخرى'
            });
        }

        // جلب بيانات المستخدم
        const user = await User.findById(decoded.userId || decoded.id);
        console.log('بيانات المستخدم:', user ? {
            id: user._id,
            name: user.name,
            userType: user.userType
        } : 'المستخدم غير موجود');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'المستخدم غير موجود - يرجى تسجيل الدخول مرة أخرى'
            });
        }

        // حفظ بيانات المستخدم في الطلب
        req.user = user;
        next();
    } catch (error) {
        console.error('خطأ في المصادقة:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في المصادقة',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export default auth;
