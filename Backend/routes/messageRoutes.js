import express from 'express';
import { getConversations, getMessages, sendMessage, createConversation } from '../controllers/messageController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get all conversations for the authenticated user
router.get('/conversations', getConversations);

// Get messages for a specific conversation
router.get('/:conversationId', getMessages);

// Send a new message
router.post('/', sendMessage);

// Create a new conversation
router.post('/conversations', createConversation);

export default router; 