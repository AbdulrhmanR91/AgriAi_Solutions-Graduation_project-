import express from 'express';
import  protect  from '../middleware/authMiddleware.js';
import { 
    createRoom, 
    getRooms, 
    getMessages, 
    sendMessage,
    rateExpert, // Add this new controller
} from '../controllers/chatController.js';
import ChatRoom from '../models/ChatRoom.js';
import User from '../models/User.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Diagnostic middleware for ALL requests to messages endpoint
const requestDiagnostic = (req, res, next) => {
    if (req.method === 'POST') {
        console.log('🔥 POST REQUEST TO MESSAGES ENDPOINT 🔥');
        console.log('=== Request Diagnostic ===');
        console.log('Path:', req.path);
        console.log('Method:', req.method);
        console.log('Content-Type:', req.get('Content-Type'));
        console.log('Content-Length:', req.get('Content-Length'));
        console.log('Has req.file:', !!req.file);
        console.log('Has req.files:', !!req.files);
        console.log('Body keys:', Object.keys(req.body || {}));
        console.log('Body messageType:', req.body?.messageType);
        console.log('Raw body:', req.body);
        console.log('Headers:', req.headers);
        console.log('========================');
    }
    next();
};

// Chat room routes
router.post('/rooms', protect, createRoom);
router.get('/rooms', protect, getRooms);
router.get('/rooms/:roomId/messages', protect, getMessages);
router.post('/rooms/:roomId/messages', protect, requestDiagnostic, upload.single('image'), sendMessage);
router.post('/rooms/:roomId/rate', protect, rateExpert); // Add new rating route

// Add this route to handle expert ratings if not already present
router.post('/rooms/:roomId/rate', protect, async (req, res) => {
  try {
    const { roomId } = req.params;
    const { rating, feedback } = req.body;
    const userId = req.user.id;

    console.log(`Rating request received for room ${roomId}:`, { rating, feedback, userId });
    
    // Find the chat room
    const chatRoom = await ChatRoom.findById(roomId);
    
    if (!chatRoom) {
      console.log(`Chat room not found: ${roomId}`);
      return res.status(404).json({ success: false, message: 'Chat room not found' });
    }
    
    // Verify the user is part of this chat room
    if (chatRoom.farmer.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Not authorized to rate this chat' });
    }
    
    // Check if already rated
    if (chatRoom.isRated) {
      return res.status(400).json({ success: false, message: 'This chat has already been rated' });
    }
    
    // Update the chat room with rating info
    chatRoom.rating = rating;
    chatRoom.feedback = feedback || '';
    chatRoom.isRated = true;
    chatRoom.ratedAt = Date.now();
    
    await chatRoom.save();
    
    console.log(`Room ${roomId} successfully rated with ${rating} stars`);
    
    // Update expert's average rating
    const expert = await User.findById(chatRoom.expert);
    if (!expert || expert.userType !== 'expert') {
      return res.status(404).json({ success: false, message: 'Expert not found' });
    }
    
    // Calculate new average
    if (!expert.expertDetails) {
      expert.expertDetails = {};
    }
    
    const currentRatings = expert.expertDetails.ratingsCount || 0;
    const currentAverage = expert.expertDetails.averageRating || 0;
    
    // Calculate the new average
    const newRatingsCount = currentRatings + 1;
    const newAverage = ((currentAverage * currentRatings) + rating) / newRatingsCount;
    
    expert.expertDetails.ratingsCount = newRatingsCount;
    expert.expertDetails.averageRating = newAverage;
    
    await expert.save();
    
    return res.json({ 
      success: true, 
      message: 'Rating submitted successfully',
      data: {
        rating,
        expertNewRating: newAverage,
        expertRatingsCount: newRatingsCount
      }
    });
  } catch (error) {
    console.error('Error submitting rating:', error);
    return res.status(500).json({ success: false, message: 'Failed to submit rating' });
  }
});

export default router;
