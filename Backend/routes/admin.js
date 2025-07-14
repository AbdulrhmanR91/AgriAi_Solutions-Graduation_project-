import express from 'express';
import { login, getMe } from '../controllers/adminAuth.js';
import { getDashboardStats } from '../controllers/adminDashboard.js';
import { protect } from '../middleware/adminAuth.js';
import * as adminUsers from '../controllers/adminUsers.js';
import * as adminOrders from '../controllers/adminOrders.js';
import * as adminProducts from '../controllers/adminProducts.js';

const router = express.Router();

// Auth routes
router.post('/login', login);
router.get('/me', protect, getMe);

// Dashboard routes
router.get('/stats', protect, getDashboardStats);

// User management routes
router.get('/users', protect, adminUsers.getUsers);
router.get('/users/:id', protect, adminUsers.getUser);
router.put('/users/:id', protect, adminUsers.updateUser);
router.put('/users/:id/block', protect, adminUsers.toggleBlockUser);
router.delete('/users/:id', protect, adminUsers.deleteUser);

// Order management routes
router.get('/orders', protect, adminOrders.getOrders);
router.get('/orders/:id', protect, adminOrders.getOrder);
router.put('/orders/:id', protect, adminOrders.updateOrder);
router.delete('/orders/:id', protect, adminOrders.deleteOrder);

// Product management routes
router.get('/products', protect, adminProducts.getProducts);
router.get('/products/:id', protect, adminProducts.getProduct);
router.put('/products/:id', protect, adminProducts.updateProduct);
router.delete('/products/:id', protect, adminProducts.deleteProduct);

export default router;
