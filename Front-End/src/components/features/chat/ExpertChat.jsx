import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getChatRooms, getChatMessages, sendChatMessage, getImageUrl } from '../../../utils/apiService';
import userIcon from "/src/assets/images/user.png";
import { Menu, ArrowLeft, Send, Home, MessageCircle, Leaf, User, Clock, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import ChatImage from './ChatImage';

const ExpertChat = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { roomId: urlRoomId } = useParams();
    const [chatRooms, setChatRooms] = useState([]);
    const [roomId, setRoomId] = useState(urlRoomId || null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null);
    const [showSidebar, setShowSidebar] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        const fetchChatRooms = async () => {
            try {
                setLoading(true);
                const rooms = await getChatRooms('expert');
                console.log('Expert Chat Rooms:', rooms.data);
                
                if (!rooms.data || !Array.isArray(rooms.data)) {
                    throw new Error('Invalid chat rooms data');
                }
                
                setChatRooms(rooms.data);
                
                // If we have a roomId from URL, use it
                if (urlRoomId) {
                    setRoomId(urlRoomId);
                }
                // Otherwise, select the first room if available
                else if (rooms.data.length > 0) {
                    setRoomId(rooms.data[0]._id);
                    navigate(`/expert/chat/${rooms.data[0]._id}`, { replace: true });
                }
            } catch (error) {
                console.error('Error fetching chat rooms:', error);
                setError(t('expert.chat.failed_to_load_chats'));
                toast.error(t('expert.chat.failed_to_load_chats'));
            } finally {
                setLoading(false);
            }
        };

        fetchChatRooms();
        // Refresh chat rooms every minute
        const interval = setInterval(fetchChatRooms, 60000);
        return () => clearInterval(interval);
    }, [urlRoomId, navigate, t]);

    useEffect(() => {
        if (!roomId) return;
        const fetchMessages = async () => {
            try {
                const res = await getChatMessages(roomId);
                setMessages(res.data || []);
            } catch (error) {
                console.error('Error fetching messages:', error);
                toast.error(t('expert.chat.failed_to_load_messages'));
            }
        };
        fetchMessages();
        // Poll for new messages every 3 seconds
        const interval = setInterval(fetchMessages, 3000);
        return () => clearInterval(interval);
    }, [roomId, t]);

    const handleSend = async (e) => {
        e.preventDefault();
        if ((!input.trim() && !selectedImage) || !roomId) return;
        
        const hasImage = !!selectedImage;
        
        try {
            if (hasImage) {
                // Only set uploading state for image messages
                setIsUploading(true);
                // Send a message with image
                await sendChatMessage(roomId, input.trim() || 'صورة', false, 'all', selectedImage);
                setSelectedImage(null);
                // Reset file input
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            } else {
                // Regular text message - use separate sending state
                setIsSending(true);
                await sendChatMessage(roomId, input);
            }
            
            setInput('');
            const res = await getChatMessages(roomId);
            setMessages(res.data || []);
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error(t('expert.chat.failed_to_send'));
        } finally {
            // Reset appropriate loading state
            if (hasImage) {
                setIsUploading(false);
            } else {
                setIsSending(false);
            }
        }
    };
    
    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!validTypes.includes(file.type)) {
            toast.error(t('common.image_format_error'));
            return;
        }
        
        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            toast.error(t('common.image_too_large'));
            return;
        }
        
        setSelectedImage(file);
    };

    const handleRoomSelect = (id) => {
        setRoomId(id);
        setMessages([]); // Clear messages when changing rooms
        navigate(`/expert/chat/${id}`); // Update URL when selecting a room
        setShowSidebar(false);
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Sidebar component for both mobile and desktop
    const SidebarContent = () => (
        <>
            <div className="p-6 font-bold text-xl border-b flex items-center justify-between bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg">
                <div className="flex items-center gap-3">
                    <MessageCircle size={24} className="text-green-100" />
                    <span>{t('expert.chat.conversations')}</span>
                </div>
                {/* Back button for mobile */}
                <button 
                    className="md:hidden p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition-all duration-200"
                    onClick={() => setShowSidebar(false)}
                >
                    <ArrowLeft size={20} />
                </button>
            </div>
            {chatRooms.length === 0 && !loading ? (
                <div className="p-8 text-center">
                    <div className="bg-green-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                        <MessageCircle size={32} className="text-green-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">{t('expert.chat.no_conversations_yet')}</h3>
                    <p className="text-sm text-gray-500">{t('expert.chat.farmers_will_appear')}</p>
                </div>
            ) : (
                <div className="overflow-y-auto">
                    {chatRooms.map((room) => {
                        // Get the farmer info from the room
                        const farmer = room.user || { name: t('expert.chat.unknown_farmer') };
                        const farmerName = farmer.name || t('expert.chat.unknown_farmer');
                        const farmerImage = farmer.profileImage;
                        const lastMessage = room.lastMessage || t('expert.chat.no_messages');
                        const lastMessageTime = room.updatedAt ? new Date(room.updatedAt).toLocaleDateString() : '';
                        
                        return (
                            <div
                                key={room._id}
                                onClick={() => handleRoomSelect(room._id)}
                                className={`p-4 m-2 rounded-xl cursor-pointer transition-all duration-300 border ${
                                    roomId === room._id 
                                        ? 'bg-gradient-to-r from-green-100 to-emerald-50 border-green-300 shadow-md transform scale-[1.02]' 
                                        : 'bg-white hover:bg-green-50 border-gray-100 hover:border-green-200 hover:shadow-md'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <img
                                            src={getImageUrl(farmerImage) || userIcon}
                                            alt={farmerName}
                                            className="w-12 h-12 rounded-full object-cover border-2 border-green-200 shadow-sm"
                                        />
                                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className="font-semibold text-gray-800 truncate">{farmerName}</h4>
                                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                                <Clock size={12} />
                                                <span>{lastMessageTime}</span>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-600 truncate">
                                            {lastMessage}
                                        </p>
                                        <div className="flex items-center gap-1 mt-1">
                                            <User size={12} className="text-green-500" />
                                            <span className="text-xs text-green-600 font-medium">{t('expert.chat.farmer')}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </>
    );

    // Determine current chat participant (farmer)
    const currentRoom = roomId ? chatRooms.find(room => room._id === roomId) : null;
    const farmer = currentRoom?.user || { name: t('expert.chat.select_conversation') };

    if (loading && chatRooms.length === 0) {
        return (
            <div className="h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
                <div className="text-center p-8 bg-white rounded-2xl shadow-xl border border-green-100">
                    <div className="relative mb-6">
                        <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <MessageCircle size={24} className="text-green-500" />
                        </div>
                    </div>
                    <h3 className="text-xl font-semibold text-green-800 mb-2">{t('expert.chat.loading_conversations')}</h3>
                    <p className="text-green-600">جاري تحميل المحادثات...</p>
                </div>
            </div>
        );
    }

    if (error && chatRooms.length === 0) {
        return (
            <div className="h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-pink-50 to-rose-50">
                <div className="text-center p-8 bg-white rounded-2xl shadow-xl border border-red-100 max-w-md">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="text-red-500 text-3xl">⚠️</span>
                    </div>
                    <h2 className="text-2xl font-bold text-red-600 mb-3">{t('expert.chat.error_occurred')}</h2>
                    <p className="text-gray-600 mb-6 leading-relaxed">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                    >
                        {t('expert.chat.try_again')}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col md:flex-row h-screen bg-gray-50">
            {/* Sidebar - hidden by default on mobile, toggle with state */}
            <div className={`${showSidebar ? 'fixed inset-0 z-50 bg-white' : 'hidden'} md:block md:static md:z-auto md:w-1/3 lg:w-1/4 bg-white border-r border-gray-200 overflow-y-auto shadow-lg`}>
                <SidebarContent />
            </div>

            {/* Chat Area */}
            <div className={`flex-1 flex flex-col ${showSidebar ? 'hidden' : 'flex'} md:flex bg-white`}>
                {/* Header */}
                <div className="p-4 md:p-6 bg-white border-b border-gray-200 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-4">
                        {/* Toggle sidebar button on mobile */}
                        <button 
                            className="md:hidden p-3 rounded-full hover:bg-green-50 transition-all duration-200 border border-green-200"
                            onClick={() => setShowSidebar(true)}
                        >
                            <Menu size={20} className="text-green-600" />
                        </button>
                        
                        {farmer && (
                            <>
                                <div className="relative">
                                    <img
                                        src={getImageUrl(farmer.profileImage) || userIcon}
                                        alt={farmer.name}
                                        className="w-12 h-12 md:w-14 md:h-14 rounded-full object-cover border-2 border-green-300 shadow-md"
                                    />
                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
                                </div>
                                <div>
                                    <h2 className="font-bold text-lg md:text-xl text-gray-800 truncate max-w-[150px] md:max-w-none">
                                        {farmer.name || t('expert.chat.select_conversation')}
                                    </h2>
                                    <div className="flex items-center gap-2 text-sm text-green-600">
                                        <Leaf size={14} />
                                        <span>{farmer.location || t('expert.chat.farmer')}</span>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                    
                    {/* Home button */}
                    <button 
                        onClick={() => navigate('/expert')}
                        className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl flex items-center gap-2 hover:from-green-600 hover:to-emerald-600 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-[1.02]"
                    >
                        <Home size={16} />
                        <span className="hidden sm:inline font-medium">{t('common.home')}</span>
                    </button>
                </div>

                {/* Messages area with empty state */}
                <div className="flex-1 overflow-y-auto p-4 pb-20 md:p-6 bg-gradient-to-br from-gray-50 to-green-50">
                    {!roomId && (
                        <div className="h-full flex items-center justify-center">
                            <div className="text-center p-8 max-w-md">
                                <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                                    <Leaf size={40} className="text-green-500" />
                                </div>
                                <h3 className="text-2xl font-bold text-green-800 mb-3">{t('expert.chat.welcome_to_expert_chat')}</h3>
                                <p className="text-gray-600 leading-relaxed">{t('expert.chat.select_conversation_to_start')}</p>
                            </div>
                        </div>
                    )}

                    {roomId && messages.length === 0 && (
                        <div className="h-full flex items-center justify-center">
                            <div className="text-center p-8 max-w-md">
                                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                                    <MessageCircle size={40} className="text-blue-500" />
                                </div>
                                <h3 className="text-2xl font-bold text-green-800 mb-3">{t('expert.chat.start_conversation')}</h3>
                                <p className="text-gray-600 leading-relaxed">{t('expert.chat.be_first_to_message')}</p>
                            </div>
                        </div>
                    )}

                    {messages.map((msg, idx) => {
                        // Handle system messages first
                        if (msg.isSystem) {
                            return (
                                <div key={msg._id || idx} className="flex justify-center my-4">
                                    <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-100 rounded-xl p-3 max-w-[90%] md:max-w-[70%] shadow-sm">
                                        <p className="text-gray-700 text-sm md:text-base text-center">{msg.content}</p>
                                    </div>
                                </div>
                            );
                        }

                        // For experts, messages where isMine=true are the expert's messages
                        // and messages where isMine=false are the farmer's messages
                        const isExpertMessage = msg.isMine;
                        
                        return (
                            <div
                                key={msg._id || idx}
                                className={`mb-4 flex ${isExpertMessage ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`flex items-end gap-2 max-w-[80%] md:max-w-[70%] ${isExpertMessage ? 'flex-row-reverse' : 'flex-row'}`}>
                                    {!isExpertMessage && (
                                        <img
                                            src={getImageUrl(farmer?.profileImage) || userIcon}
                                            alt="Farmer"
                                            className="w-8 h-8 rounded-full object-cover border border-green-200 flex-shrink-0"
                                        />
                                    )}
                                    <div
                                        className={`px-4 py-3 rounded-2xl shadow-md ${
                                            isExpertMessage 
                                                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-br-sm' 
                                                : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm'
                                        }`}
                                        style={{ pointerEvents: 'auto' }}
                                    >
                                        {msg.messageType === 'image' && msg.imageUrl ? (
                                            <ChatImage 
                                                imageUrl={msg.imageUrl}
                                                getImageUrl={getImageUrl}
                                                message={msg}
                                            />
                                        ) : null}
                                        {/* Only show text content if it's not an image message or if image failed to load */}
                                        {msg.messageType !== 'image' && (
                                            <p className="leading-relaxed">{msg.content}</p>
                                        )}
                                        {/* Show placeholder for broken image messages */}
                                        {msg.messageType === 'image' && !msg.imageUrl && (
                                            <div className="mb-2 image-message">
                                                <div className="max-w-full rounded-lg max-h-[300px] bg-gray-100 border border-gray-300 p-4 text-center text-gray-500">
                                                    <p>🖼️ صورة غير متاحة</p>
                                                    <p className="text-xs">فشل في تحميل الصورة</p>
                                                </div>
                                            </div>
                                        )}
                                        <div className={`flex items-center gap-1 text-xs mt-2 ${isExpertMessage ? 'text-green-100 justify-end' : 'text-gray-500'}`}>
                                            <Clock size={12} />
                                            <span>{new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                            {isExpertMessage && <CheckCircle2 size={12} className="text-green-200" />}
                                        </div>
                                    </div>
                                    {isExpertMessage && (
                                        <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                            E
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input - Keep at bottom but position properly */}
                {roomId && (
                    <form onSubmit={handleSend} className="p-4 md:p-6 bg-white border-t border-gray-200 flex flex-col gap-3 sticky bottom-0 z-10 shadow-lg">
                        {selectedImage && (
                            <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg border border-green-200">
                                <div className="relative">
                                    <img 
                                        src={URL.createObjectURL(selectedImage)} 
                                        alt="Selected" 
                                        className="h-16 w-16 object-cover rounded-md" 
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => setSelectedImage(null)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 w-5 h-5 flex items-center justify-center text-xs"
                                    >
                                        ×
                                    </button>
                                </div>
                                <span className="text-sm text-gray-700">
                                    {selectedImage.name.length > 25 
                                        ? selectedImage.name.substring(0, 22) + '...' 
                                        : selectedImage.name}
                                </span>
                            </div>
                        )}
                        
                        <div className="flex gap-3">
                            <input
                                className="flex-1 border-2 border-green-200 rounded-xl px-4 py-3 text-sm md:text-base focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all duration-200 bg-gray-50 focus:bg-white"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder={selectedImage ? 'أضف وصف للصورة (اختياري)' : t('expert.chat.type_your_message')}
                            />
                            
                            {/* Image upload button */}
                            <button 
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white p-3 rounded-xl text-sm md:text-base transition-all duration-300 font-semibold shadow-md hover:shadow-lg transform hover:scale-[1.02]" 
                                title="إرسال صورة"
                                disabled={isUploading}
                            >
                                {isUploading ? (
                                    <div className="w-5 h-5 border-t-2 border-white border-solid rounded-full animate-spin"></div>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                                )}
                                <input 
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/jpg,image/png" 
                                    onChange={handleImageSelect}
                                    className="hidden" 
                                />
                            </button>
                            
                            <button 
                                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-3 rounded-xl text-sm md:text-base transition-all duration-300 font-semibold shadow-md hover:shadow-lg transform hover:scale-[1.02] flex items-center gap-2" 
                                type="submit"
                                disabled={(!input.trim() && !selectedImage) || isUploading || isSending}
                            >
                                {isSending ? (
                                    <div className="w-4 h-4 border-t-2 border-white border-solid rounded-full animate-spin"></div>
                                ) : isUploading ? (
                                    <div className="w-5 h-5 border-t-2 border-white border-solid rounded-full animate-spin"></div>
                                ) : (
                                    <Send size={16} />
                                )}
                                <span className="hidden sm:inline">{t('expert.chat.send')}</span>
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ExpertChat;
