import mongoose from 'mongoose';
import ChatRoom from '../models/ChatRoom.js';
import Message from '../models/Message.js';
import User from '../models/User.js';
import Rating from '../models/Rating.js'; // Import Rating model
import Notification from '../models/notificationModel.js'; // Import Notification model

// Create a new chat room
export const createRoom = async (req, res) => {
    try {
        const { expertId, farmerId } = req.body;
        let userId1, userId2;
        
        console.log('Create room request body:', req.body);
        console.log('User creating room:', req.user.userType);
        
        // Determine if this is an expert creating a room with a farmer
        // or a farmer creating a room with an expert
        if (req.user.userType === 'expert' && farmerId) {
            // Expert creating room with farmer
            console.log('Expert creating a chat room with farmer:', farmerId);
            const farmer = await User.findOne({ _id: farmerId, userType: 'farmer' });
            if (!farmer) {
                return res.status(404).json({ success: false, message: 'Farmer not found' });
            }
            
            userId1 = req.user._id;
            userId2 = farmerId;
        } else if (req.user.userType === 'farmer' && expertId) {
            // Farmer creating room with expert
            console.log('Farmer creating a chat room with expert:', expertId);
            const expert = await User.findOne({ _id: expertId, userType: 'expert' });
            if (!expert) {
                return res.status(404).json({ success: false, message: 'Expert not found' });
            }
            
            userId1 = req.user._id;
            userId2 = expertId;
        } else {
            return res.status(400).json({ 
                success: false, 
                message: 'Either expertId (for farmers) or farmerId (for experts) is required' 
            });
        }
        
        // Check if a chat room already exists between these users
        const existingRoom = await ChatRoom.findOne({
            $or: [
                { user1: userId1, user2: userId2 },
                { user1: userId2, user2: userId1 }
            ]
        });
        
        if (existingRoom) {
            return res.status(200).json({ 
                success: true, 
                message: 'Chat room found', 
                data: existingRoom 
            });
        }
        
        // Create a new room
        const newRoom = await ChatRoom.create({
            user1: userId1,
            user2: userId2,
            lastMessage: 'New conversation started'
        });

        // Populate the expert's data
        const populatedRoom = await ChatRoom.findById(newRoom._id)
            .populate({
                path: 'user1 user2',
                select: 'name profileImage userType expertDetails' // Ensure expert details are included
            });

        return res.status(201).json({ 
            success: true, 
            message: 'Chat room created', 
            data: populatedRoom 
        });
        
    } catch (error) {
        console.error('Create chat room error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Get all chat rooms for a user
export const getRooms = async (req, res) => {
    try {
        // Find all rooms where the user is either user1 or user2
        const rooms = await ChatRoom.find({
            $or: [
                { user1: req.user._id },
                { user2: req.user._id }
            ]
        })
        .populate({
            path: 'user1 user2',
            select: 'name profileImage userType expertDetails' // Ensure expert details are included
        })
        .sort({ updatedAt: -1 });
        
        // For each room, get the last visible message for this user and set the "user" field to be the other user
        const formattedRooms = await Promise.all(rooms.map(async (room) => {
            const otherUser = String(room.user1._id) === String(req.user._id) ? room.user2 : room.user1;
            
            // Get the last message visible to this user
            const userType = req.user.userType;
            const lastVisibleMessage = await Message.findOne({
                roomId: room._id,
                $or: [
                    { visibleTo: { $in: ['all'] } },
                    { visibleTo: { $in: [userType] } }
                ]
            }).sort({ createdAt: -1 });
            
            const lastMessage = lastVisibleMessage 
                ? (lastVisibleMessage.content.length > 30 
                    ? lastVisibleMessage.content.substring(0, 30) + '...' 
                    : lastVisibleMessage.content)
                : 'No messages yet';
            
            return {
                _id: room._id,
                user: otherUser,
                lastMessage: lastMessage,
                updatedAt: room.updatedAt,
                createdAt: room.createdAt,
                isRated: room.isRated
            };
        }));
        
        return res.status(200).json({
            success: true,
            data: formattedRooms
        });
        
    } catch (error) {
        console.error('Get chat rooms error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Get messages for a specific room
export const getMessages = async (req, res) => {
    try {
        const { roomId } = req.params;
        
        // Validate roomId
        if (!mongoose.Types.ObjectId.isValid(roomId)) {
            return res.status(400).json({ success: false, message: 'Invalid room ID' });
        }
        
        // Check if room exists and user is a participant
        const room = await ChatRoom.findOne({
            _id: roomId,
            $or: [
                { user1: req.user._id },
                { user2: req.user._id }
            ]
        });
        
        if (!room) {
            return res.status(404).json({ success: false, message: 'Chat room not found or access denied' });
        }
        
        // Filter messages based on user type (farmer or expert)
        const userType = req.user.userType;
        const messages = await Message.find({
            roomId,
            $or: [
                { visibleTo: { $in: ['all'] } },
                { visibleTo: { $in: [userType] } }
            ]
        }).sort({ createdAt: 1 });
        
        // Add isMine flag to each message and include image-related fields
        const formattedMessages = messages.map(msg => ({
            _id: msg._id,
            content: msg.content,
            sender: msg.sender,
            createdAt: msg.createdAt,
            isMine: msg.sender && String(msg.sender) === String(req.user._id),
            isSystem: Boolean(msg.isSystem),
            messageType: msg.messageType,
            imageUrl: msg.imageUrl,
            imageName: msg.imageName
        }));
        
        return res.status(200).json({
            success: true,
            data: formattedMessages
        });
        
    } catch (error) {
        console.error('Get messages error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Send a message in a room
export const sendMessage = async (req, res) => {
    console.log('🚀 SENDMESSAGE FUNCTION CALLED 🚀');
    console.log('Request method:', req.method);
    console.log('Request path:', req.path);
    console.log('User:', req.user ? req.user._id : 'No user');
    
    try {
        const { roomId } = req.params;
        const { content, isSystem, visibleTo, messageType } = req.body;
        
        // Debug logging
        console.log('SendMessage - Request body:', req.body);
        console.log('SendMessage - Request files:', req.files);
        console.log('SendMessage - Request file:', req.file);
        console.log('SendMessage - Request headers:', req.headers);
        console.log('SendMessage - isSystem type and value:', typeof isSystem, isSystem);
        console.log('SendMessage - File info:', req.file ? {
            filename: req.file.filename,
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
            path: req.file.path
        } : 'No file');
        
        // Properly parse isSystem - handle string "false" from FormData
        const isSystemMessage = isSystem === true || isSystem === 'true';
        console.log('SendMessage - isSystem parsed:', { original: isSystem, parsed: isSystemMessage });
        
        // Handle image messages - Enhanced with fallback logic
        let imageUrl = null;
        let imageName = null;
        let messageContent = content;
        let msgType = messageType || 'text';
        
        // Debug: Check if file exists and log details
        console.log('SendMessage - req.file check:', {
            hasFile: !!req.file,
            file: req.file ? {
                filename: req.file.filename,
                originalname: req.file.originalname,
                path: req.file.path,
                size: req.file.size
            } : null,
            messageType,
            hasFiles: !!req.files,
            contentType: req.get('Content-Type'),
            bodyMessageType: req.body.messageType
        });
        
        if (req.file) {
            // Image uploaded via multer
            imageUrl = `/uploads/chat/${req.file.filename}`;
            imageName = req.file.originalname;
            msgType = 'image';
            messageContent = messageContent || 'صورة';
            console.log('SendMessage - Image processed via req.file:', { 
                imageUrl, 
                imageName, 
                msgType,
                fileExists: !!req.file,
                filename: req.file.filename 
            });
        } else if (messageType === 'image' && req.get('Content-Type') && req.get('Content-Type').includes('multipart/form-data')) {
            // FALLBACK: If messageType is image and Content-Type is multipart, but req.file is missing
            console.error('SendMessage - FALLBACK: messageType is image, multipart detected, but no req.file!');
            console.log('SendMessage - This indicates multer middleware issue');
            
            // For now, create a placeholder to prevent app crash
            msgType = 'text';
            messageContent = messageContent || 'صورة (خطأ في معالجة الملف)';
        } else if (messageType === 'image') {
            // If messageType is image but no file and no multipart, this indicates an issue
            console.error('SendMessage - messageType is image but no req.file found!');
            console.log('SendMessage - Request details:', {
                headers: req.headers,
                contentType: req.get('Content-Type'),
                hasFiles: !!req.files,
                bodyKeys: Object.keys(req.body || {}),
                messageType: req.body.messageType
            });
            
            // Force message type to text to prevent issues
            msgType = 'text';
            messageContent = messageContent || 'صورة (خطأ في الرفع)';
        } else {
            console.log('SendMessage - No file in request, msgType will be:', msgType);
        }
        
        if (!messageContent || !messageContent.trim()) {
            return res.status(400).json({ success: false, message: 'Message content is required' });
        }
        
        // Check if room exists and user is a participant
        const room = await ChatRoom.findOne({
            _id: roomId,
            $or: [
                { user1: req.user._id },
                { user2: req.user._id }
            ]
        });
        
        if (!room) {
            return res.status(404).json({ success: false, message: 'Chat room not found or access denied' });
        }
        
        // Determine message visibility
        let messageVisibility = ['all']; // Default visibility
        
        // If visibleTo is explicitly provided in the request
        if (visibleTo) {
            // Convert to array if it's a string
            if (typeof visibleTo === 'string') {
                messageVisibility = [visibleTo];
            } 
            // If it's already an array
            else if (Array.isArray(visibleTo)) {
                messageVisibility = visibleTo;
            }
            
            // Validate values
            const validValues = ['farmer', 'expert', 'all'];
            if (!messageVisibility.every(value => validValues.includes(value))) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Invalid visibleTo value. Must be "farmer", "expert", or "all"' 
                });
            }
        }
        
        // For system messages related to rating completion, they should only be visible to farmers
        if (isSystemMessage && (
            messageContent.includes('شكراً لتقييمك') || 
            messageContent.includes('يمكنك الآن بدء استشارة جديدة') ||
            messageContent.includes('⭐') && messageContent.includes('تمت الاستشارة')
        )) {
            messageVisibility = ['farmer'];
            console.log('Setting rating message to be visible only to farmer:', messageContent);
        }
        
        // Create the message - if isSystemMessage is true, we'll use null for sender
        const message = await Message.create({
            roomId,
            sender: isSystemMessage ? null : req.user._id,
            isSystem: isSystemMessage,
            visibleTo: messageVisibility,
            content: messageContent,
            messageType: msgType,
            imageUrl: imageUrl,
            imageName: imageName
        });
        
        console.log('SendMessage - Created message:', {
            _id: message._id,
            content: message.content,
            messageType: message.messageType,
            imageUrl: message.imageUrl,
            imageName: message.imageName
        });
        
        // Debugging: Log the saved message details
        console.log('SendMessage - Saved message to database:', {
            _id: message._id,
            content: message.content,
            messageType: message.messageType,
            imageUrl: message.imageUrl,
            imageName: message.imageName
        });
        
        // Only update the last message in the room if the message is visible to all users
        // Don't update with farmer-only system messages (like rating completion messages)
        if (messageVisibility.includes('all') || messageVisibility.includes('expert')) {
            const lastMessageText = msgType === 'image' ? '📷 صورة' : messageContent;
            await ChatRoom.findByIdAndUpdate(roomId, {
                lastMessage: lastMessageText.length > 30 ? lastMessageText.substring(0, 30) + '...' : lastMessageText,
                updatedAt: new Date()
            });
        }
        
        return res.status(201).json({
            success: true,
            data: {
                _id: message._id,
                content: message.content,
                sender: message.sender,
                createdAt: message.createdAt,
                isMine: !isSystemMessage && message.sender ? String(message.sender) === String(req.user._id) : false,
                isSystem: isSystemMessage,
                messageType: message.messageType,
                imageUrl: message.imageUrl,
                imageName: message.imageName
            }
        });
        
    } catch (error) {
        console.error('Send message error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Delete a message
export const deleteMessage = async (req, res) => {
    try {
        const { roomId, messageId } = req.params;
        
        // Check if room exists and user is a participant
        const room = await ChatRoom.findOne({
            _id: roomId,
            $or: [
                { user1: req.user._id },
                { user2: req.user._id }
            ]
        });
        
        if (!room) {
            return res.status(404).json({ success: false, message: 'Chat room not found or access denied' });
        }
        
        // Find the message
        const message = await Message.findOne({
            _id: messageId,
            roomId
        });
        
        if (!message) {
            return res.status(404).json({ success: false, message: 'Message not found' });
        }
        
        // Check if user is the sender of the message
        if (String(message.sender) !== String(req.user._id)) {
            return res.status(403).json({ success: false, message: 'You can only delete your own messages' });
        }
        
        // Delete the message
        await Message.findByIdAndDelete(messageId);
        
        // Update the last message in the room if deleted message was the last one
        const lastMessage = await Message.findOne({ roomId }).sort({ createdAt: -1 });
        if (lastMessage) {
            await ChatRoom.findByIdAndUpdate(roomId, {
                lastMessage: lastMessage.content.length > 30 
                    ? lastMessage.content.substring(0, 30) + '...' 
                    : lastMessage.content
            });
        } else {
            await ChatRoom.findByIdAndUpdate(roomId, {
                lastMessage: 'No messages'
            });
        }
        
        return res.status(200).json({
            success: true,
            message: 'Message deleted successfully'
        });
        
    } catch (error) {
        console.error('Delete message error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Rate expert in a chat room
export const rateExpert = async (req, res) => {
    try {
        const { roomId } = req.params;
        const { rating, feedback } = req.body;
        
        console.log('Rating request received:', { roomId, rating, feedback });
        
        // Validate rating
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be between 1 and 5'
            });
        }

        // Find the chat room
        const room = await ChatRoom.findOne({
            _id: roomId,
            $or: [
                { user1: req.user._id },
                { user2: req.user._id }
            ]
        }).populate('user1 user2');
        
        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Chat room not found or you are not authorized to rate'
            });
        }
        
        // Make sure the user is a farmer and is rating an expert
        if (req.user.userType !== 'farmer') {
            return res.status(403).json({
                success: false,
                message: 'Only farmers can rate experts'
            });
        }
        
        // Determine who the expert is (user1 or user2)
        const expert = String(room.user1._id) === String(req.user._id) ? room.user2 : room.user1;
        
        // Verify the other participant is an expert
        if (expert.userType !== 'expert') {
            return res.status(400).json({
                success: false,
                message: 'You can only rate experts'
            });
        }
        
        // Find associated consultation order (the most recent completed one)
        const consultOrder = await mongoose.model('ConsultOrder').findOne({
            farmer: req.user._id,
            expert: expert._id,
            status: 'completed'
        }).sort('-updatedAt');
        
        if (!consultOrder) {
            return res.status(400).json({
                success: false,
                message: 'No completed consultation found to rate'
            });
        }
        
        // Check if this specific consultation has already been rated
        let existingRating = await Rating.findOne({
            consultOrder: consultOrder._id,
            farmer: req.user._id,
            expert: expert._id
        });
        
        if (existingRating) {
            return res.status(400).json({
                success: false,
                message: 'This consultation has already been rated'
            });
        }
        
        // Create rating data
        const ratingData = {
            farmer: req.user._id,
            expert: expert._id,
            rating,
            feedback: feedback || '',
            roomId,
            consultOrder: consultOrder._id
        };
        
        // Create new rating
        await Rating.create(ratingData);
        
        // Update expert's average rating and review counts
        const expertRatings = await Rating.find({
            expert: expert._id
        });
        
        const ratingSum = expertRatings.reduce((sum, item) => sum + item.rating, 0);
        const averageRating = expertRatings.length > 0 ? ratingSum / expertRatings.length : 0;
        const totalReviews = expertRatings.length;
        
        // Update the expert model with the new statistics
        await User.findByIdAndUpdate(expert._id, {
            'expertDetails.averageRating': averageRating,
            'expertDetails.totalReviews': totalReviews,
            'expertDetails.ratingsCount': totalReviews
        });
        
        // Mark the room as rated
        room.isRated = true;
        await room.save();
        
        // Create a notification for the expert about the new rating with a custom message based on rating value
        let ratingMessage = `You've received a new ${rating}-star rating from ${req.user.name || 'a farmer'}`;
        
        // Add feedback to message if provided
        if (feedback && feedback.trim()) {
            ratingMessage += `: "${feedback.length > 50 ? feedback.substring(0, 50) + '...' : feedback}"`;
        }
        
        // Create and send the notification
        const notification = await Notification.create({
            recipient: expert._id,
            from: req.user._id,
            type: 'rating',
            message: ratingMessage,
            metadata: {
                rating: rating,
                consultOrder: ratingData.consultOrder || null,
                roomId: roomId, // Include roomId for context
                farmerName: req.user.name || 'A farmer',
                feedback: feedback || '',
                timestamp: new Date()
            }
        });
        
        // Emit the notification to the expert via WebSocket if available
        if (req.io) {
            req.io.to(`user:${expert._id}`).emit('notification', {
                type: 'rating',
                message: ratingMessage,
                metadata: {
                    rating,
                    roomId,
                    consultOrder: ratingData.consultOrder || null,
                    farmerName: req.user.name || 'A farmer',
                    timestamp: new Date()
                }
            });
            console.log('Rating notification emitted to expert:', expert._id);
        } else {
            console.log('WebSocket not available, notification saved to DB only');
        }
        
        console.log(`Expert ${expert.name} rating updated:`, {
            averageRating: averageRating.toFixed(2),
            totalReviews,
            latestRating: rating
        });
        
        return res.status(200).json({
            success: true,
            message: 'Expert rated successfully',
            data: {
                averageRating: parseFloat(averageRating.toFixed(2)),
                totalReviews,
                expertName: expert.name
            }
        });
        
    } catch (error) {
        console.error('Rate expert error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to rate expert'
        });
    }
};
