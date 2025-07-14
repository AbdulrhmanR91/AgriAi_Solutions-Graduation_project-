/* eslint-env node */
import jwt from 'jsonwebtoken';
import process from 'process';
import User from '../models/User.js';
import { logger } from '../utils/logger.js';

export const protect = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            logger.warn('Authentication attempt without token', { 
                path: req.path, 
                ip: req.ip || req.connection?.remoteAddress
            });
            return res.status(401).json({
                success: false,
                message: 'Please login to access this resource'
            });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
            logger.debug('Token verified successfully', { userId: decoded.userId || decoded.id });
        } catch (jwtError) {
            logger.warn('Token verification failed', { 
                error: jwtError.message,
                path: req.path,
                ip: req.ip || req.connection?.remoteAddress
            });
            return res.status(401).json({
                success: false,
                message: 'Session expired - please login again'
            });
        }

        const user = await User.findById(decoded.userId || decoded.id);
        if (user) {
            logger.debug('User authenticated', { 
                userId: user._id,
                userType: user.userType,
                path: req.path
            });
        } else {
            logger.warn('Authentication with valid token but user not found', {
                decodedId: decoded.userId || decoded.id,
                path: req.path
            });
        }

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found - please login again'
            });
        }

        // Check if user is blocked
        if (user.blocked) {
            return res.status(403).json({
                success: false,
                message: 'Account has been blocked'
            });
        }

        req.user = user;
        next();
    } catch (error) {
        logger.error('Authentication error', {
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
            path: req.path
        });
        res.status(500).json({
            success: false,
            message: 'Authentication error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// We'll keep default export for backward compatibility
export default protect;

export const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'Authentication token missing' 
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = { id: decoded.userId || decoded.id };
      next();
    } catch (jwtError) {
      logger.warn('JWT verification failed', {
        error: jwtError.message,
        path: req.path,
        ip: req.ip || req.connection?.remoteAddress
      });
      return res.status(401).json({ 
        success: false,
        message: 'Invalid or expired token' 
      });
    }
  } catch (error) {
    logger.error('Auth middleware error', {
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      path: req.path
    });
    return res.status(500).json({ 
      success: false,
      message: 'Server authentication error' 
    });
  }
};
