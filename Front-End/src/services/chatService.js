import axios from 'axios';
import config from '../config/config';

const API_URL = config.API_URL;

const chatService = {
    getConversations: async () => {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/messages/conversations`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    getMessages: async (conversationId) => {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/messages/${conversationId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    sendMessage: async (conversationId, content) => {
        const token = localStorage.getItem('token');
        const response = await axios.post(`${API_URL}/messages`, {
            conversationId,
            content
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    }
};

export default chatService; 