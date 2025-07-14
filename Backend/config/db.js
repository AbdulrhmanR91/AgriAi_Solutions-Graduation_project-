/* eslint-env node */
import mongoose from 'mongoose';
import process from 'process';
import { ErrorResponse } from '../utils/errorResponse.js';

/**
 * Connect to MongoDB with enhanced security and error handling
 * @returns {Promise<mongoose.Connection>} Mongoose connection
 */
const connectDB = async () => {
    try {
        // Only log connection attempts in development
        if (process.env.NODE_ENV === 'development') {
            console.log('Attempting to connect to MongoDB...');
            // Enable detailed debugging in development
            mongoose.set('debug', true);
        }
        
        // Check if MongoDB URI is set
        if (!process.env.MONGODB_URI) {
            throw new ErrorResponse('MongoDB URI is not defined in environment variables', 500);
        }
        
        // Enhanced MongoDB connection options
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 10000, // Increased timeout
            family: 4,
            // Additional security & performance settings
            autoIndex: process.env.NODE_ENV === 'development', // Don't build indexes in production
            maxPoolSize: 10, // Maintain up to 10 socket connections
            minPoolSize: 5, // Maintain at least 5 socket connections
            connectTimeoutMS: 30000, // Increase connection timeout
            socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        });
        
        // Set up connection error handlers
        mongoose.connection.on('error', (err) => {
            console.error(`MongoDB connection error: ${err}`);
            // Don't crash the application, let it attempt to reconnect
        });
        
        mongoose.connection.on('disconnected', () => {
            console.warn('MongoDB disconnected, attempting to reconnect...');
        });
        
        mongoose.connection.on('reconnected', () => {
            console.info('MongoDB reconnected successfully');
        });
        
        // Success message (masked in production)
        if (process.env.NODE_ENV === 'production') {
            console.log(`MongoDB Connected: Connection established`);
        } else {
            console.log(`MongoDB Connected: ${conn.connection.host}`);
        }
        
        return conn;
    } catch (error) {
        console.error('MongoDB connection critical error:', error);
        
        // In production, don't exit the app but throw an error
        if (process.env.NODE_ENV === 'production') {
            throw new ErrorResponse('Database connection failed', 500);
        }
        
        // In development, exit so we can fix it immediately
        process.exit(1);
    }
};

export default connectDB;
