import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';
import User from '../models/User.js';

// Get all conversations for a user
export const getConversations = async (req, res) => {
    try {
        const conversations = await Conversation.find({
            participants: req.user._id
        })
        .populate('participants', 'name profileImage')
        .populate('lastMessage')
        .sort({ updatedAt: -1 });

        // Add unread count for each conversation
        const conversationsWithUnread = await Promise.all(conversations.map(async (conv) => {
            const unreadCount = await Message.countDocuments({
                conversationId: conv._id,
                sender: { $ne: req.user._id },
                read: false
            });
            return {
                ...conv.toObject(),
                unreadCount
            };
        }));

        res.json(conversationsWithUnread);
    } catch (error) {
        console.error('Error getting conversations:', error);
        res.status(500).json({ message: 'Error getting conversations' });
    }
};

// Get messages for a specific conversation
export const getMessages = async (req, res) => {
    try {
        const messages = await Message.find({
            conversationId: req.params.conversationId
        })
        .populate('sender', 'name profileImage')
        .sort({ createdAt: 1 });

        // Mark messages as read
        await Message.updateMany(
            {
                conversationId: req.params.conversationId,
                sender: { $ne: req.user._id },
                read: false
            },
            { read: true }
        );

        res.json(messages);
    } catch (error) {
        console.error('Error getting messages:', error);
        res.status(500).json({ message: 'Error getting messages' });
    }
};

// Send a new message
export const sendMessage = async (req, res) => {
    try {
        const { conversationId, content } = req.body;

        // Create new message
        const message = new Message({
            conversationId,
            sender: req.user._id,
            content
        });

        await message.save();

        // Update conversation's last message
        await Conversation.findByIdAndUpdate(conversationId, {
            lastMessage: message._id
        });

        // Populate sender info
        await message.populate('sender', 'name profileImage');

        res.json(message);
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ message: 'Error sending message' });
    }
};

// Create a new conversation
export const createConversation = async (req, res) => {
    try {
        const { participantId } = req.body;

        // Check if conversation already exists
        const existingConversation = await Conversation.findOne({
            participants: { $all: [req.user._id, participantId] }
        });

        if (existingConversation) {
            return res.json(existingConversation);
        }

        // Create new conversation
        const conversation = new Conversation({
            participants: [req.user._id, participantId]
        });

        await conversation.save();

        // Populate participant info
        await conversation.populate('participants', 'name profileImage');

        res.json(conversation);
    } catch (error) {
        console.error('Error creating conversation:', error);
        res.status(500).json({ message: 'Error creating conversation' });
    }
}; 