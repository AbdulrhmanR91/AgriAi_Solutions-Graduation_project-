import jwt from 'jsonwebtoken';
import asyncHandler from './async.js';
import { ErrorResponse } from '../utils/errorResponse.js';
import Admin from '../models/Admin.js';
import process from 'process';
import { logger } from '../utils/logger.js';

// Protect admin routes
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  // Make sure token exists
  if (!token) {
    logger.warn('Admin authentication attempt without token', {
      path: req.path,
      ip: req.ip || req.connection?.remoteAddress
    });
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if admin exists
    req.admin = await Admin.findById(decoded.id);
    
    if (!req.admin) {
      logger.warn('Admin token valid but admin not found', {
        decodedId: decoded.id,
        path: req.path
      });
      return next(new ErrorResponse('Not authorized to access this route', 401));
    }
    
    logger.debug('Admin authenticated', {
      adminId: req.admin._id,
      role: req.admin.role,
      path: req.path
    });
    
    next();
  } catch (err) {
    logger.warn('Admin authentication failed', {
      error: err.message,
      path: req.path,
      ip: req.ip || req.connection?.remoteAddress
    });
    return next(new ErrorResponse('Not authorized to access this route', 401, err));
  }
});

// Grant access to specific roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.admin.role)) {
      logger.warn('Unauthorized admin role access attempt', {
        adminId: req.admin._id,
        role: req.admin.role,
        requiredRoles: roles,
        path: req.path
      });
      return next(
        new ErrorResponse(
          `Admin role ${req.admin.role} is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};
