import ConsultOrder from '../models/ConsultOrder.js';
import Rating from '../models/Rating.js';
import User from '../models/User.js';
import Notification from '../models/notificationModel.js';
import ChatRoom from '../models/ChatRoom.js';

// Get completed consultations for a farmer or expert
export const getCompletedConsultations = async (req, res) => {
    try {
        let userId;
        let field;
        
        if (req.user.userType === 'farmer') {
            userId = req.user.id;
            field = 'farmer';
        } else if (req.user.userType === 'expert') {
            userId = req.user.id;
            field = 'expert';
        } else {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized user type'
            });
        }
        
        // Find completed consult orders for this user
        const query = {};
        query[field] = userId;
        query.status = 'completed';
        
        const completedOrders = await ConsultOrder.find(query)
            .populate('farmer', 'name profileImage')
            .populate('expert', 'name profileImage expertDetails')
            .sort('-updatedAt'); // Most recently completed first
        
        // Check which ones have been rated
        const ratedOrderIds = new Set();
        
        for (const order of completedOrders) {
            const rating = await Rating.findOne({
                expert: order.expert._id,
                farmer: order.farmer._id,
                consultOrder: order._id
            });
            
            if (rating) {
                ratedOrderIds.add(order._id.toString());
            }
        }
        
        // Add isRated flag to each order
        const ordersWithRatingStatus = completedOrders.map(order => ({
            ...order.toObject(),
            isRated: ratedOrderIds.has(order._id.toString())
        }));
        
        return res.status(200).json({
            success: true,
            data: ordersWithRatingStatus
        });
    } catch (error) {
        console.error('Error fetching completed consultations:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Error fetching completed consultations'
        });
    }
};

// Get consultation associated with a chat room
export const getRoomConsultation = async (req, res) => {
    try {
        const { roomId } = req.params;
        
        if (!roomId) {
            return res.status(400).json({
                success: false,
                message: 'Room ID is required'
            });
        }
        
        // Find the chat room's participants to identify the expert and farmer
        const chatRoom = await ChatRoom.findById(roomId)
            .populate('user1 user2');
        
        if (!chatRoom) {
            return res.status(404).json({
                success: false,
                message: 'Chat room not found'
            });
        }
        
        // Determine which user is the farmer and which is the expert
        let expertId, farmerId;
        
        if (chatRoom.user1.userType === 'expert' && chatRoom.user2.userType === 'farmer') {
            expertId = chatRoom.user1._id;
            farmerId = chatRoom.user2._id;
        } else if (chatRoom.user1.userType === 'farmer' && chatRoom.user2.userType === 'expert') {
            farmerId = chatRoom.user1._id;
            expertId = chatRoom.user2._id;
        } else {
            return res.status(400).json({
                success: false,
                message: 'Chat room does not contain an expert and farmer'
            });
        }
          // Find the most recent consultation between these users (any status)
        const allConsultations = await ConsultOrder.find({
            expert: expertId,
            farmer: farmerId
        })
        .sort('-updatedAt')
        .limit(2); // Get latest 2 to compare
        
        // Find the most recent completed consultation
        const completedConsultations = allConsultations.filter(c => c.status === 'completed');
        
        // If there's no completed consultation, or if there's a more recent non-completed consultation
        if (completedConsultations.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No completed consultations found'
            });
        }
        
        const latestConsultation = allConsultations[0]; // Most recent consultation (any status)
        const latestCompletedConsultation = completedConsultations[0]; // Most recent completed consultation
        
        // If the most recent consultation is not completed (e.g., rejected), don't show completion status
        if (latestConsultation._id.toString() !== latestCompletedConsultation._id.toString()) {
            return res.status(404).json({
                success: false,
                message: 'Most recent consultation is not completed'
            });
        }
        
        const consultation = latestCompletedConsultation;
        
        // Check if this specific consultation has been rated by this farmer
        const rating = await Rating.findOne({
            consultOrder: consultation._id,
            farmer: farmerId, // Make sure it's this specific farmer who rated
            expert: expertId
        });
        
        return res.status(200).json({
            success: true,
            data: {
                consultation,
                isRated: !!rating
            }
        });
    } catch (error) {
        console.error('Error fetching room consultation:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Error fetching room consultation'
        });
    }
};

// For expert: get their ratings
export const getExpertRatings = async (req, res) => {
    try {
        const expertId = req.user.id;
        
        const ratings = await Rating.find({
            expert: expertId
        })
        .populate('farmer', 'name profileImage')
        .sort('-createdAt'); // Most recent first
        
        // Calculate average rating
        const totalRatings = ratings.length;
        const ratingSum = ratings.reduce((sum, rating) => sum + rating.rating, 0);
        const averageRating = totalRatings > 0 ? (ratingSum / totalRatings).toFixed(1) : 0;
        
        return res.status(200).json({
            success: true,
            data: {
                ratings,
                stats: {
                    totalRatings,
                    averageRating
                }
            }
        });
    } catch (error) {
        console.error('Error fetching expert ratings:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Error fetching expert ratings'
        });
    }
};