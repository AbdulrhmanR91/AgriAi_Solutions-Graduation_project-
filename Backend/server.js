/* eslint-env node */
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import process from 'process';
import fs from 'fs';
// Import logger
import { logger } from './utils/logger.js';

import authRoutes from './routes/auth.js';
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
import farmerVisitRoutes from './routes/farmerVisitRoutes.js';
import plantAnalysisRoutes from './routes/plantAnalysisRoutes.js';
// Import admin routes
import adminRoutes from './routes/admin.js';
import messageRoutes from './routes/messageRoutes.js';
import chatRoutes from './routes/chatRoutes.js'; // Ensure this import exists
import productReviewRoutes from './routes/productReviewRoutes.js';
import weatherRoutes from './routes/weatherRoutes.js';

const app = express();
dotenv.config();

if (!process.env.JWT_SECRET) {
  logger.error('JWT_SECRET is not set in your environment!');
  process.exit(1);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors({
    origin: [
        'http://localhost:5173',
        'https://dark-gennifer-abdulrhman-5d081501.koyeb.app',
        'https://agriai-ten.vercel.app'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
    exposedHeaders: ['Content-Range', 'X-Content-Range']
}));

// Request logging middleware
app.use((req, res, next) => {
    const start = Date.now();
    
    // Once the request is processed
    res.on('finish', () => {
        const responseTime = Date.now() - start;
        logger.request(req, res, responseTime);
    });
    
    next();
});

// Security headers
app.use((req, res, next) => {
    // Helps prevent XSS attacks
    res.setHeader('X-XSS-Protection', '1; mode=block');
    // Helps prevent MIME-type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');
    // Helps prevent clickjacking
    res.setHeader('X-Frame-Options', 'DENY');
    // Controls how much information the browser includes with referers
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    // Enable CORS for all responses
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    next();
});

// Request body parsing with size limits
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
const productsDir = path.join(uploadsDir, 'products');
if (!fs.existsSync(uploadsDir)){
    fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(productsDir)){
    fs.mkdirSync(productsDir, { recursive: true });
}

app.use('/uploads', (req, res, next) => {
    const fileExt = path.extname(req.url).toLowerCase();
    const allowedExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    
    if (req.url.includes('..') || !allowedExts.includes(fileExt)) {
        return res.status(403).send('Access denied');
    }
    
    if (process.env.NODE_ENV === 'development') {
        console.log('Static file request:', req.url);
    }
    next();
}, express.static(path.join(__dirname, 'uploads'), {
    maxAge: '1d',
    index: false, 
    dotfiles: 'deny' 
}));

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
app.use('/api/farmer-visits', farmerVisitRoutes);
console.log('✓ Farmer visit routes registered at /api/farmer-visits');
app.use('/api/plant-analyses', plantAnalysisRoutes);
// Register admin routes
app.use('/api/admin', adminRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/chat', chatRoutes); // Ensure this line exists
app.use('/api/products', productReviewRoutes); // Product reviews routes
app.use('/api/weather', weatherRoutes); // Weather routes

// Check if all chat route endpoints are properly defined
console.log('Registered chat routes:', chatRoutes.stack?.map(r => r.route?.path) || 'Routes not available');

// Verify API path for chat routes
app.use('/api/chat', chatRoutes); 

// Add a specific debug route for testing chat endpoints
app.get('/api/test-chat-routes', (req, res) => {
  res.json({ 
    message: 'Chat routes check', 
    availableRoutes: chatRoutes.stack?.map(r => ({
      path: r.route?.path,
      methods: r.route?.methods
    })) || 'Routes not available'
  });
});

app.get('/', (req, res) => {
    res.json({ message: 'Server is running!' });
});

app.use((err, req, res, next) => {
    if (err instanceof mongoose.Error) {
        // Log Mongoose errors with structured metadata
        logger.error('Mongoose error', {
            name: err.name,
            message: err.message,
            code: err.code,
            path: req.path,
            method: req.method,
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

// Error handlers
app.use((err, req, res, next) => {
  // Log error with structured metadata
  logger.error('Server error', {
    name: err.name,
    message: err.message,
    path: req.path,
    method: req.method,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
  
  // Always send JSON response for errors
  return res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? {
      type: err.name,
      message: err.message,
      stack: err.stack
    } : undefined
  });
});

// 404 handler should be last
app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: `Path not found: ${req.originalUrl}`
  });
});

const PORT = process.env.PORT || 5000; // Fixed back to port 5000
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.set('debug', process.env.NODE_ENV === 'development');

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000
})
.then(() => {
    logger.info('Connected to MongoDB');
    app.listen(PORT, () => {
        logger.info(`Server is running on port ${PORT}`);
    });
})
.catch((error) => {
    logger.error('MongoDB connection error', {
        name: error.name,
        message: error.message,
        code: error.code,
        stack: error.stack
    });
    process.exit(1);
});

export default app;
