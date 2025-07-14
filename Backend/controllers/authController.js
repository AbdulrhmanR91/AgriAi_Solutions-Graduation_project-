import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { logger } from '../utils/logger.js';
import dotenv from 'dotenv';
import process from 'process';

dotenv.config();

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Log login attempt with limited info for security
        logger.info('Login attempt', {
            email: email ? `${email.substring(0, 3)}***` : 'not provided',
            passwordProvided: !!password,
            ip: req.ip
        });

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide both email and password'
            });
        }

        // Find user by email - case insensitive search
        const user = await User.findOne({ 
            email: { $regex: new RegExp(`^${email}$`, 'i') }
        }).select('+password');
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check if account is blocked
        if (user.blocked) {
            return res.status(403).json({
                success: false,
                message: 'This account has been blocked'
            });
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Generate JWT token with longer expiry for remember me
        const expiresIn = req.body.rememberMe ? '30d' : '7d';
        const token = jwt.sign(
            { userId: user._id, userType: user.userType },
            process.env.JWT_SECRET,
            { expiresIn }
        );

        // Create user response object without password
        const userResponse = {
            _id: user._id,
            name: user.name,
            email: user.email,
            userType: user.userType,
            phone: user.phone,
            profileImage: user.profileImage
        };

        // Add type-specific details
        if (user.userType === 'farmer' && user.farmDetails) {
            userResponse.farmDetails = user.farmDetails;
        } else if (user.userType === 'expert' && user.expertDetails) {
            userResponse.expertDetails = user.expertDetails;
        } else if (user.userType === 'company' && user.companyDetails) {
            userResponse.companyDetails = user.companyDetails;
        }

        // Send response
        res.status(200).json({
            success: true,
            token,
            user: userResponse
        });

    } catch (error) {
        logger.error('Login error:', {
            message: error.message,
            stack: error.stack
        });
        
        res.status(500).json({
            success: false,
            message: 'Server error during login',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
    try {
        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'البريد الإلكتروني مسجل مسبقاً'
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

        // إضافة تفاصيل حسب نوع المستخدم
        if (req.body.userType === 'farmer') {
            userData.farmDetails = {
                farmName: req.body.farmDetails?.farmName,
                farmLocation: req.body.farmDetails?.farmLocation,
                farmSize: req.body.farmDetails?.farmSize,
                crops: req.body.farmDetails?.crops
            };
        }

        if (req.body.userType === 'expert') {
            const details = req.body.expertDetails || {};
            userData.expertDetails = {
                expertAt: details.expertAt || '',
                university: details.university || '',
                college: details.college || '',
                services: Array.isArray(details.services)
                    ? details.services
                    : typeof details.services === 'string'
                        ? details.services.split(',').map(s => s.trim()).filter(Boolean)
                        : []
            };
        }

        if (req.body.userType === 'company') {
            userData.companyDetails = {
                companyName: req.body.companyDetails?.companyName,
                businessAddress: req.body.companyDetails?.businessAddress,
                tradeLicenseNumber: req.body.companyDetails?.tradeLicenseNumber,
                taxRegistrationNumber: req.body.companyDetails?.taxRegistrationNumber,
                location: req.body.companyDetails?.location
            };
        }

        const user = new User(userData);
        await user.save();
        
        // Create token
        const token = jwt.sign(
            { userId: user._id, userType: user.userType },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        // Remove password from response
        const userResponse = user.toObject();
        delete userResponse.password;
        
        res.status(201).json({ 
            success: true,
            user: userResponse, 
            token 
        });
    } catch (error) {
        logger.error('Registration error:', error);
        res.status(400).json({ 
            success: false,
            message: error.code === 11000 
                ? 'هذا البريد الإلكتروني مسجل مسبقاً' 
                : error.message 
        });
    }
};

// Add refresh token endpoint
export const refreshToken = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ 
                success: false,
                message: 'No token provided' 
            });
        }

        // Verify the current token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Find user to ensure they still exist
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({ 
                success: false,
                message: 'User not found' 
            });
        }

        // Check if user is blocked
        if (user.blocked) {
            return res.status(403).json({
                success: false,
                message: 'Account has been blocked'
            });
        }
        
        // Generate new token with same expiry as original
        const originalExp = decoded.exp;
        const currentTime = Math.floor(Date.now() / 1000);
        const timeLeft = originalExp - currentTime;
        
        // If token expires in less than 1 hour, give it a fresh 7 days
        const expiresIn = timeLeft < 3600 ? '7d' : Math.max(timeLeft, 24 * 60 * 60);
        
        const newToken = jwt.sign(
            { userId: decoded.userId, userType: decoded.userType },
            process.env.JWT_SECRET,
            { expiresIn: typeof expiresIn === 'string' ? expiresIn : `${expiresIn}s` }
        );

        res.json({ 
            success: true,
            token: newToken 
        });
    } catch (error) {
        logger.error('Error refreshing token:', error);
        res.status(401).json({ 
            success: false,
            message: 'Invalid token' 
        });
    }
};