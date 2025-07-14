import express from 'express';
import auth from '../middleware/auth.js';
import ConsultOrder from '../models/ConsultOrder.js';
import Notification from '../models/notificationModel.js';
import User from '../models/User.js';
import { getCompletedConsultations, getRoomConsultation, getExpertRatings } from '../controllers/consultOrderController.js';

const router = express.Router();

router.post('/', auth, async (req, res) => {
    try {
        const { expertId, problem } = req.body;
        
        if (!expertId || !problem) {
            return res.status(400).json({
                success: false,
                message: 'Expert ID and problem are required'
            });
        }

        const order = await ConsultOrder.create({
            farmer: req.user.id,
            expert: expertId,
            problem
        });

      // Create notification
      await Notification.create({
        recipient: expertId,
        from: req.user.id,
        type: 'consultOrder',
        message: `New consultation request: ${problem.substring(0, 50)}...`,
        order: order._id
    });

        res.status(201).json({ success: true, data: order });
    } catch (error) {
        console.error('Create consult order error:', error);
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
});


router.get('/expert', auth, async (req, res) => {
    try {
        const orders = await ConsultOrder.find({ expert: req.user.id })
            .populate('farmer', 'name profileImage phone')
            .sort('-createdAt');

        res.json({
            success: true,
            data: orders
        });
    } catch (error) {
        console.error('Get expert orders error:', error);
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
});


router.patch('/:orderId', auth, async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        const order = await ConsultOrder.findById(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Consultation order not found'
            });
        }

        // Verify expert ownership
        if (order.expert.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this order'
            });
        }

        order.status = status;
        await order.save();

        // Get expert name for better notification
        const expert = await User.findById(req.user.id);
        const expertName = expert ? expert.name : 'The expert';
        
        // Create appropriate notification message based on status
        let notificationMessage = '';
        let notificationType = 'consultOrder';
        
        if (status === 'completed') {
            notificationMessage = `Your consultation has been marked as completed by ${expertName}. Please rate your experience.`;
            notificationType = 'consultCompleted';
        } else if (status === 'accepted') {
            notificationMessage = `Your consultation request has been accepted by ${expertName}.`;
        } else if (status === 'rejected') {
            notificationMessage = `Your consultation request has been rejected by ${expertName}.`;
        } else {
            notificationMessage = `Your consultation status has been updated to ${status} by ${expertName}.`;
        }
        
        await Notification.create({
            recipient: order.farmer,
            from: req.user.id,
            type: notificationType,
            message: notificationMessage,
            order: order._id,
            status: status, // Add status to notification to differentiate completed ones
            metadata: status === 'completed' ? {
                showRatingPrompt: true,
                expertId: req.user.id,
                consultOrder: order._id,
                status: status // Add status to make it easier to filter notifications
            } : undefined
        });

        // If the status is 'rejected', send a system message to the farmer in the chat
        if (status === 'rejected') {
            try {
                // Find the chat room between the expert and farmer
                const ChatRoom = await import('../models/ChatRoom.js').then(module => module.default);
                const Message = await import('../models/Message.js').then(module => module.default);
                
                const chatRoom = await ChatRoom.findOne({
                    $or: [
                        { user1: req.user.id, user2: order.farmer },
                        { user1: order.farmer, user2: req.user.id }
                    ]
                });

                if (chatRoom) {
                    // Send a system message to the farmer
                    const rejectionMessage = `لقد تم رفض طلب الاستشارة الخاص بك من قبل الخبير ${expertName}. يمكنك إرسال طلب استشارة جديد أو التواصل مع خبير آخر.`;
                    
                    await Message.create({
                        roomId: chatRoom._id,
                        sender: null, // System message
                        isSystem: true,
                        visibleTo: ['farmer'], // Only visible to farmer
                        content: rejectionMessage
                    });

                    console.log('System rejection message sent to farmer in chat room:', chatRoom._id);
                } else {
                    console.log('No chat room found between expert and farmer for rejection message');
                }
            } catch (error) {
                console.error('Error sending rejection system message:', error);
                // Don't fail the main request if this fails
            }
        }

        res.json({
            success: true,
            data: order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});



// Get completed consultations for the current user (farmer or expert)
router.get('/completed', auth, getCompletedConsultations);

// Get consultation associated with a chat room
router.get('/room/:roomId', auth, getRoomConsultation);

// Get expert's own ratings
router.get('/expert/ratings', auth, getExpertRatings);

export default router;