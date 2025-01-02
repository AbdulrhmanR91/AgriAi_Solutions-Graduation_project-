/* eslint-env node */
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import process from 'process';
import connectDB from './config/db.js';
import userRoutes from './routes/userRoutes.js';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();

// Middleware
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://agriai-nu.vercel.app', 'https://agriai.vercel.app']
        : '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// تكوين مجلد الملفات المرفوعة
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// اتصال بقاعدة البيانات
connectDB();

mongoose.connection.on('connected', () => {
    console.log('Mongoose connected to DB');
});

mongoose.connection.on('error', (err) => {
    console.log('Mongoose connection error: ' + err);
});

// المسارات
app.use('/api/users', userRoutes);

// مسار اختبار بسيط
app.get('/', (req, res) => {
    res.send('Server is running!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
