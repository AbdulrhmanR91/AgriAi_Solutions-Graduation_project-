/* eslint-env node */
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import process from 'process';
import fs from 'fs';

// استيراد الراوترز
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import favoriteRoutes from './routes/favoriteRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import expertRoutes from './routes/expertRoutes.js';
import consultOrderRoutes from './routes/consultOrderRoutes.js';
import companyRoutes from './routes/companyRoutes.js';
import farmerRoutes from './routes/farmerRoutes.js';

// تهيئة التطبيق
const app = express();
dotenv.config();

// الحصول على المسار الحالي
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// إعدادات CORS
app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:5000',
        'https://agriai-7iig.vercel.app'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposedHeaders: ['Content-Range', 'X-Content-Range']
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
const productsDir = path.join(uploadsDir, 'products');
if (!fs.existsSync(uploadsDir)){
    fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(productsDir)){
    fs.mkdirSync(productsDir, { recursive: true });
}

// تكوين المجلد الثابت للملفات المرفوعة
app.use('/uploads', (req, res, next) => {
    console.log('Static file request:', req.url);
    next();
}, express.static(path.join(__dirname, 'uploads')));
app.get('/api/test-cors', (req, res) => {
    res.json({ message: 'CORS is working' });
});

// تسجيل الراوترز
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/experts', expertRoutes);
app.use('/api/consult-orders', consultOrderRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/farmers', farmerRoutes);


// راوتر للتحقق من حالة الخادم
app.get('/', (req, res) => {
    res.json({ message: 'Server is running!' });
});

// معالجة أخطاء Mongoose
app.use((err, req, res, next) => {
    if (err instanceof mongoose.Error) {
        console.error('Mongoose error:', {
            name: err.name,
            message: err.message,
            code: err.code,
            errors: err.errors
        });
        return res.status(400).json({
            success: false,
            message: 'خطأ في البيانات',
            error: process.env.NODE_ENV === 'development' ? {
                type: err.name,
                message: err.message,
                code: err.code,
                errors: err.errors
            } : undefined
        });
    }
    next(err);
});

// معالجة الأخطاء العامة
app.use((err, req, res, next) => {
    console.error('Server error:', {
        name: err.name,
        message: err.message,
        stack: err.stack,
        code: err.code
    });

    // التحقق من نوع الخطأ
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: 'خطأ في التحقق من البيانات',
            errors: Object.values(err.errors).map(e => e.message)
        });
    }

    if (err.name === 'CastError') {
        return res.status(400).json({
            success: false,
            message: 'معرف غير صالح',
            field: err.path
        });
    }

    // الأخطاء العامة
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'خطأ في الخادم',
        error: process.env.NODE_ENV === 'development' ? {
            type: err.name,
            message: err.message,
            stack: err.stack,
            code: err.code
        } : undefined
    });
});

// معالجة المسارات غير الموجودة
app.use((req, res) => {
    console.log('404 - المسار غير موجود:', req.originalUrl);
    res.status(404).json({
        success: false,
        message: `المسار غير موجود: ${req.originalUrl}`
    });
});

// الاتصال بقاعدة البيانات وتشغيل الخادم
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

// إعدادات Mongoose
mongoose.set('debug', process.env.NODE_ENV === 'development');

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000
})
.then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
})
.catch((error) => {
    console.error('MongoDB connection error:', {
        name: error.name,
        message: error.message,
        code: error.code
    });
    process.exit(1);
});

export default app;
