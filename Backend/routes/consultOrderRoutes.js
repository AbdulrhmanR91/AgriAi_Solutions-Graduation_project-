import express from 'express';
import auth from '../middleware/auth.js';
import ConsultOrder from '../models/ConsultOrder.js';
import Notification from '../models/notificationModel.js';

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

        await Notification.create({
            recipient: order.farmer,
            from: req.user.id,
            type: 'consultOrder',
            message: `Your consultation request has been ${status}`,
            order: order._id
        });

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



export default router;