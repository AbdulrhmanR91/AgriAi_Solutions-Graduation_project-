import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getChatRooms, getChatMessages, sendChatMessage, createChatRoom, getAvailableExperts, getImageUrl, rateExpert, createConsultOrder, getRoomConsultation } from '../../../utils/apiService';
import userIcon from '/src/assets/images/user.png';
import { Star, Menu, ArrowLeft, Send, MessageCircle, Home, Plus, Search, UserPlus, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import ChatImage from './ChatImage';
import './Chat.css';

const FarmerChat = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { roomId: urlRoomId } = useParams(); 
    const [chatRooms, setChatRooms] = useState([]);
    const [suggestedExperts, setSuggestedExperts] = useState([]);
    const [roomId, setRoomId] = useState(urlRoomId || null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null);
    const [showRating, setShowRating] = useState(false);
    const [ratingValue, setRatingValue] = useState(5);
    const [feedback, setFeedback] = useState('');
    const [isSubmittingRating, setIsSubmittingRating] = useState(false);
    const [showSidebar, setShowSidebar] = useState(false);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showConsultModal, setShowConsultModal] = useState(false);
    const [consultProblem, setConsultProblem] = useState('');
    const [isSubmittingConsult, setIsSubmittingConsult] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const fileInputRef = useRef(null);
    const [consultationStatus, setConsultationStatus] = useState({
        isCompleted: false,
        isRated: false,
        consultOrderId: null
    });

    useEffect(() => {
        const fetchChatRooms = async () => {
            try {
                setLoading(true);
                const rooms = await getChatRooms();
                console.log('Chat Rooms data:', rooms.data);
                
                if (!rooms.data || !Array.isArray(rooms.data)) {
                    throw new Error('Invalid chat rooms data');
                }
                
                setChatRooms(rooms.data);
                
                // Check if urlRoomId is actually an expert ID (24 character hex string)
                if (urlRoomId && urlRoomId.length === 24 && /^[0-9a-fA-F]{24}$/.test(urlRoomId)) {
                    // Check if it's an existing room ID first
                    const existingRoom = rooms.data.find(room => room._id === urlRoomId);
                    
                    if (existingRoom) {
                        // It's a valid room ID
                        setRoomId(urlRoomId);
                    } else {
                        // It might be an expert ID, try to find existing room with this expert
                        const expertRoom = rooms.data.find(room => 
                            (room.expert && room.expert._id === urlRoomId) || 
                            (room.user && room.user._id === urlRoomId)
                        );
                        
                        if (expertRoom) {
                            // Found existing room with this expert
                            setRoomId(expertRoom._id);
                            navigate(`/farmer/chat/${expertRoom._id}`, { replace: true });
                        } else {
                            // Try to create new room with this expert ID
                            try {
                                toast.loading('Connecting with expert...');
                                const response = await createChatRoom(urlRoomId);
                                toast.dismiss();
                                
                                if (response && response.success) {
                                    const newRoomId = response.data._id;
                                    setRoomId(newRoomId);
                                    navigate(`/farmer/chat/${newRoomId}`, { replace: true });
                                    
                                    // Refresh rooms list
                                    const updatedRooms = await getChatRooms();
                                    setChatRooms(updatedRooms.data || []);
                                } else {
                                    toast.error('Could not connect with expert');
                                    // Fall back to first available room
                                    if (rooms.data.length > 0) {
                                        setRoomId(rooms.data[0]._id);
                                        navigate(`/farmer/chat/${rooms.data[0]._id}`, { replace: true });
                                    }
                                }
                            } catch (error) {
                                toast.dismiss();
                                console.error('Failed to create chat room:', error);
                                toast.error('Could not connect with expert');
                                // Fall back to first available room
                                if (rooms.data.length > 0) {
                                    setRoomId(rooms.data[0]._id);
                                    navigate(`/farmer/chat/${rooms.data[0]._id}`, { replace: true });
                                }
                            }
                        }
                    }
                } else if (rooms.data.length > 0 && !urlRoomId) {
                    // No roomId provided, select first room
                    setRoomId(rooms.data[0]._id);
                    navigate(`/farmer/chat/${rooms.data[0]._id}`, { replace: true });
                }
            } catch (error) {
                console.error('Error fetching chat rooms:', error);
                toast.error('Failed to load chat rooms');
            } finally {
                setLoading(false);
            }
        };

        const fetchSuggestedExperts = async () => {
            try {
                const response = await getAvailableExperts();
                setSuggestedExperts(response.data || []);
            } catch (error) {
                console.error('Error fetching suggested experts:', error);
            }
        };

        fetchChatRooms();
        fetchSuggestedExperts();
        // Refresh chat rooms every minute
        const interval = setInterval(fetchChatRooms, 60000);
        return () => clearInterval(interval);
    }, [urlRoomId, navigate]);

    useEffect(() => {
        if (!roomId) return;
        const fetchMessages = async () => {
            try {
                const res = await getChatMessages(roomId);
                console.log('Fetched messages:', res.data); // Debug log
                
                // Log image messages specifically
                const imageMessages = res.data?.filter(msg => msg.messageType === 'image') || [];
                if (imageMessages.length > 0) {
                    console.log('Image messages found:', imageMessages);
                }
                
                setMessages(res.data || []);
            } catch (error) {
                console.error('Error fetching messages:', error);
            }
        };
        fetchMessages();
        const interval = setInterval(fetchMessages, 3000);
        return () => clearInterval(interval);
    }, [roomId]);

    // Fetch consultation status for the current room
    useEffect(() => {
        if (!roomId) return;
        
        // Track if a rating is pending to prevent overriding local state
        let isRatingPending = false;
        
        const fetchConsultationStatus = async () => {
            try {
                // Skip fetching if we're in the process of submitting a rating
                if (isSubmittingRating || isRatingPending) {
                    console.log('Rating in progress, skipping consultation status update');
                    return;
                }
                
                const res = await getRoomConsultation(roomId);
                if (res.success) {
                    // Use a functional update to ensure we don't lose local state changes
                    setConsultationStatus(prevStatus => {
                        // If the UI already shows rated as true, don't override it with backend data
                        // This ensures if the user just rated, we don't flip back to unrated state
                        if (prevStatus.isRated === true && res.data.isRated === false) {
                            console.log('Preserving locally updated rating status (rated=true)');
                            return {
                                ...prevStatus,
                                isCompleted: res.data.consultation.status === 'completed',
                                consultOrderId: res.data.consultation._id
                            };
                        }
                        
                        // Otherwise, use the data from the server
                        return {
                            isCompleted: res.data.consultation.status === 'completed',
                            isRated: res.data.isRated,
                            consultOrderId: res.data.consultation._id
                        };
                    });
                }
            } catch (err) {
                // If no completed consultation is found, that's okay
                console.log('No completed consultation found for this room:', err.message);
                setConsultationStatus({
                    isCompleted: false,
                    isRated: false,
                    consultOrderId: null
                });
            }
        };
        
        // Initial fetch
        fetchConsultationStatus();
        
        // Watch for rating modal state changes
        const unratedToRatedObserver = () => {
            if (showRating) {
                isRatingPending = true;
            } else {
                // If modal was closed, wait a bit before allowing status updates again
                if (isRatingPending) {
                    setTimeout(() => {
                        isRatingPending = false;
                    }, 5000); // Wait 5 seconds after rating modal closes
                }
            }
        };
        
        // Track rating modal state
        unratedToRatedObserver();
        
        // Set up periodic checks
        const statusInterval = setInterval(fetchConsultationStatus, 10000); // Check every 10 seconds
        
        return () => clearInterval(statusInterval);
    }, [roomId, isSubmittingRating, showRating]);

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
            toast.error('فشل في إرسال الرسالة');
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
            toast.error('يرجى اختيار صورة بصيغة JPG أو PNG فقط');
            return;
        }
        
        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('حجم الصورة كبير جدًا. الحد الأقصى هو 5 ميجابايت');
            return;
        }
        
        setSelectedImage(file);
    };

    const handleRoomSelect = (id) => {
        setRoomId(id);
        setMessages([]);
        navigate(`/farmer/chat/${id}`);
        setShowSidebar(false);
    };

    const handleStartChat = async (expertId) => {
        try {
            toast.loading(t('farmer.chat.Starting chat'));
            const room = await createChatRoom(expertId);
            toast.dismiss();
            
            if (room.success) {
                const newRoomId = room.data._id;
                setRoomId(newRoomId);
                navigate(`/farmer/chat/${newRoomId}`);
                
                const updatedRooms = await getChatRooms();
                setChatRooms(updatedRooms.data || []);
                setShowSidebar(false);
            } else {
                toast.error(room.message || 'Failed to create chat room');
            }
        } catch (error) {
            toast.dismiss();
            console.error('Error starting chat:', error);
            toast.error('Could not create chat room');
        }
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendConsultRequest = async () => {
        if (!consultProblem.trim()) {
            toast.error('يرجى وصف المشكلة');
            return;
        }

        const currentRoom = roomId ? chatRooms.find(room => room._id === roomId) : null;
        
        if (!currentRoom) {
            toast.error('لم يتم العثور على غرفة المحادثة');
            return;
        }

        // In a farmer chat, the other user (stored in user field) should be an expert
        const otherUser = currentRoom.user; // This is the other participant in the chat
        
        console.log('Chat room data for consultation:', currentRoom);
        console.log('Other user (potential expert) data:', otherUser);
        
        if (!otherUser) {
            toast.error('لا يوجد خبير محدد');
            return;
        }
        
        // Check if the other user is an expert (userType === 'expert')
        if (otherUser.userType !== 'expert') {
            console.log('User is not an expert. User type:', otherUser.userType);
            toast.error('المستخدم ليس خبيرًا');
            return;
        }
        
        const expert = otherUser; // The expert is the other user in the chat

        try {
            setIsSubmittingConsult(true);
            const consultData = {
                expertId: expert._id,  // Changed from expert to expertId to match backend expectations
                problem: consultProblem.trim()
            };

            console.log('Sending consultation request with data:', consultData);
            const response = await createConsultOrder(consultData);
            
            if (response.success) {
                toast.success('تم إرسال طلب الاستشارة بنجاح');
                setShowConsultModal(false);
                setConsultProblem('');
                
                // Send a system message to the chat
                await sendChatMessage(roomId, `📋 تم إرسال طلب استشارة: "${consultProblem.trim()}"`);
                
                // Refresh messages
                const res = await getChatMessages(roomId);
                setMessages(res.data || []);
            } else {
                toast.error(response.message || 'فشل في إرسال طلب الاستشارة');
            }
        } catch (error) {
            console.error('Error sending consultation request:', error);
            toast.error(error.message || 'فشل في إرسال طلب الاستشارة');
        } finally {
            setIsSubmittingConsult(false);
        }
    };

    const handleSubmitRating = async () => {
        if (!roomId || !currentRoom) {
            toast.error('No chat room selected');
            return;
        }
        
        try {
            setIsSubmittingRating(true);
            console.log('Submitting rating:', { roomId, rating: ratingValue, feedback });
            
            const response = await rateExpert(roomId, ratingValue, feedback);
            
            // Immediately update consultation status to show as rated (fixes UI bug)
            setConsultationStatus(prevStatus => ({
                ...prevStatus,
                isRated: true
            }));
            
            // Hide the rating modal immediately
            setShowRating(false);
            
            // Show success message with expert info if available
            const expertName = response.data?.expertName || '';
            toast.success(
                <div className="flex items-center">
                    <div className="bg-green-100 p-1 rounded-full mr-2">
                        <Star className="w-4 h-4 text-green-600 fill-green-500" />
                    </div>
                    <div>
                        <p className="font-medium">تم تقييم الخبير بنجاح</p>
                        <p className="text-sm text-gray-600">{expertName ? `شكراً لتقييمك ${expertName}` : 'سنستخدم تقييمك لتحسين الخدمة'}</p>
                    </div>
                </div>,
                {
                    duration: 5000,
                    position: 'top-center',
                    style: {
                        background: 'linear-gradient(to right, #f0fdf4, #ecfdf5)',
                        color: '#065f46',
                        border: '1px solid #10b981',
                    }
                }
            );

            // Send automatic completion message to the chat as system messages
            try {
                // Create a more personalized message that includes the rating
                const participantName = currentRoom?.user?.name || 'الخبير';
                const ratingStars = '⭐'.repeat(ratingValue);
                const completionMessage = `🎉 شكراً لتقييمك ${ratingStars}! تمت الاستشارة مع ${participantName} بنجاح، نتمنى لك يوماً سعيداً ونأمل أن تكون قد استفدت من خدمتنا.`;
                
                // Send as system message that is only visible to the farmer
                await sendChatMessage(roomId, completionMessage, true, 'farmer');
                console.log(`Sending system completion message in chat with ${participantName}, rating: ${ratingValue} (visible to farmer only)`);
                
                // Send another message after a short delay to guide the farmer
                setTimeout(async () => {
                    try {
                        await sendChatMessage(roomId, "يمكنك الآن بدء استشارة جديدة مع خبير آخر أو مواصلة التحدث مع الخبراء السابقين. نحن متواجدون دائماً لمساعدتك! 👨‍🌾🌱", true, 'farmer');
                    } catch (error) {
                        console.error('Error sending follow-up message:', error);
                    }
                }, 500);
            } catch (msgError) {
                console.error('Error sending completion message:', msgError);
            }
            
            // Update all related data to ensure UI consistency
            try {
                // Step 1: Update chat room data
                const roomsResponse = await getChatRooms();
                const updatedRooms = roomsResponse.data || [];
                setChatRooms(updatedRooms);
                
                // Step 2: Update suggested experts
                const expertsResponse = await getAvailableExperts();
                setSuggestedExperts(expertsResponse.data || []);
                
                // Step 3: Update messages to show the automatic message
                const messagesResponse = await getChatMessages(roomId);
                setMessages(messagesResponse.data || []);
                
                // Force scroll to bottom to show the new message
                setTimeout(() => {
                    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
                }, 300);
                
                // Log the rating update
                const chatParticipantName = currentRoom.expert?.name || currentRoom.user?.name || 'Chat participant';
                console.log(`Chat with ${chatParticipantName} is now rated. UI updated.`);
            } catch (updateError) {
                console.error('Error updating UI data after rating:', updateError);
                // Even if refreshing data fails, we've already updated the consultation status
                // so the UI should still show the correct state
            }
        } catch (error) {
            console.error('Error submitting rating:', error);
            toast.error('فشل في إرسال التقييم. حاول مرة أخرى.');
        } finally {
            setIsSubmittingRating(false);
        }
    };

    // Sidebar component for both mobile and desktop
    const SidebarContent = () => {
        const filteredChatRooms = chatRooms.filter(room => {
            const participant = room.expert || room.user;
            const participantName = participant?.name || 'Unknown';
            return participantName.toLowerCase().includes(searchQuery.toLowerCase());
        });

        const filteredExperts = suggestedExperts.filter(expert => {
            const expertName = expert.name || 'Unknown Expert';
            return expertName.toLowerCase().includes(searchQuery.toLowerCase());
        });

        return (
            <div className="h-full flex flex-col bg-gradient-to-b from-green-50 to-white">
                {/* Header */}
                <div className="p-4 border-b border-green-100 bg-white shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-green-800 flex items-center gap-2">
                            <MessageCircle className="w-6 h-6 text-green-600" />
                            {t('farmer.chat.Chats')}
                        </h2>
                        <button 
                            className="md:hidden p-2 rounded-full hover:bg-green-100 transition-colors"
                            onClick={() => setShowSidebar(false)}
                        >
                            <ArrowLeft size={20} className="text-green-600" />
                        </button>
                    </div>
                    
                    {                    /* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder={t('farmer.chat.Search conversations')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="search-input w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-sm"
                        />
                    </div>
                </div>

                {/* Chat Rooms List */}
                <div className="flex-1 overflow-y-auto">
                    {filteredChatRooms.length > 0 && (
                        <div className="p-3">
                            <h3 className="text-sm font-semibold text-gray-600 mb-3 px-2 uppercase tracking-wider">
                                {t('farmer.chat.Recent Chats')}
                            </h3>
                            <div className="space-y-1">
                                {filteredChatRooms.map((room) => {
                                    const chatParticipant = room.expert || room.user;
                                    const participantName = chatParticipant?.name || 'Unknown';
                                    const participantImage = chatParticipant?.profileImage;
                                    const isActive = roomId === room._id;
                                    
                                    return (
                                        <div
                                            key={room._id}
                                            onClick={() => handleRoomSelect(room._id)}
                                            className={`chat-room-hover p-3 cursor-pointer rounded-xl transition-all duration-200 hover:shadow-md group ${
                                                isActive 
                                                    ? 'chat-room-active text-white shadow-lg transform scale-[1.02]' 
                                                    : 'bg-white hover:bg-green-50 border border-gray-100'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="relative">
                                                    <img
                                                        src={getImageUrl(participantImage) || userIcon}
                                                        alt={participantName}
                                                        className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                                                    />
                                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className={`font-semibold truncate ${isActive ? 'text-white' : 'text-gray-900'}`}>
                                                        {participantName}
                                                    </p>
                                                    <p className={`text-sm truncate ${isActive ? 'text-green-100' : 'text-gray-500'}`}>
                                                        {room.lastMessage || t('farmer.chat.No messages yet')}
                                                    </p>
                                                </div>
                                                <div className="flex flex-col items-end gap-1">
                                                    <span className={`text-xs ${isActive ? 'text-green-100' : 'text-gray-400'}`}>
                                                        12:30 PM
                                                    </span>
                                                    {!isActive && (
                                                        <div className="w-2 h-2 bg-green-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Suggested Experts */}
                    {filteredExperts.length > 0 && (
                        <div className="p-3 border-t border-green-100">
                            <div className="flex items-center justify-between mb-3 px-2">
                                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">
                                    {t('farmer.chat.Suggested Experts')}
                                </h3>
                                <Plus className="w-4 h-4 text-green-600" />
                            </div>
                            <div className="space-y-1">
                                {filteredExperts.map((expert) => (
                                    <div
                                        key={expert._id}
                                        onClick={() => handleStartChat(expert._id)}
                                        className="p-3 cursor-pointer rounded-xl bg-white hover:bg-gradient-to-r hover:from-green-50 hover:to-blue-50 border border-gray-100 hover:border-green-200 transition-all duration-200 hover:shadow-md group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="relative">
                                                <img
                                                    src={getImageUrl(expert.profileImage) || userIcon}
                                                    alt={expert.name || 'Expert'}
                                                    className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 group-hover:border-green-300 transition-colors"
                                                />
                                                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-400 rounded-full border-2 border-white"></div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-gray-900 truncate">
                                                    {expert.name || 'Unknown Expert'}
                                                </p>
                                                <p className="text-sm text-gray-500 truncate">
                                                    {expert.expertDetails?.expertAt || 'Expert'}
                                                </p>
                                            </div>
                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                <MessageCircle className="w-4 h-4 text-green-600" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {filteredChatRooms.length === 0 && filteredExperts.length === 0 && searchQuery && (
                        <div className="p-8 text-center">
                            <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">{t('farmer.chat.No results found')}</p>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // Determine current chat participant (expert or user)
    const currentRoom = roomId ? chatRooms.find(room => room._id === roomId) : null;
    // For a farmer, the chat participant is always the other user in the room (which should be an expert)
    const chatParticipant = currentRoom?.user || null;

    useEffect(() => {
        if (currentRoom) {
            console.log("Current room state:", {
                roomId: currentRoom._id,
                hasUser: !!currentRoom.user,
                userId: currentRoom.user?._id,
                userName: currentRoom.user?.name,
                userType: currentRoom.user?.userType,
                otherUserInfo: currentRoom.user,
                hasExpert: !!currentRoom.expert,
                expertId: currentRoom.expert?._id, 
                isRated: !!currentRoom.isRated
            });
            
            // Log the exact structure of the room for debugging
            console.log("Full room structure:", JSON.stringify(currentRoom));
        }
    }, [currentRoom]);
    
    // Add debugging for consultation status changes
    useEffect(() => {
        console.log("Consultation status updated:", {
            isCompleted: consultationStatus.isCompleted,
            isRated: consultationStatus.isRated,
            consultOrderId: consultationStatus.consultOrderId,
            showRatingUI: consultationStatus.isCompleted && !consultationStatus.isRated,
            showCompletedUI: consultationStatus.isCompleted && consultationStatus.isRated
        });
    }, [consultationStatus]);

    if (loading && chatRooms.length === 0) {
        return (
            <div className="h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
                <div className="text-center p-8 bg-white rounded-2xl shadow-2xl max-w-md mx-4">
                    <div className="relative mb-6">
                        <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto"></div>
                        <MessageCircle className="w-8 h-8 text-green-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <h3 className="text-xl font-bold text-green-800 mb-2">{t('farmer.chat.Loading chat interface')}</h3>
                    <p className="text-gray-600">جاري تحضير المحادثات...</p>
                    <div className="mt-4 flex justify-center space-x-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col md:flex-row h-screen bg-gray-50">
            {/* Sidebar - Enhanced with better styling */}
            <div className={`${showSidebar ? 'fixed inset-0 z-50 bg-white' : 'hidden'} md:block md:static md:z-auto md:w-1/3 lg:w-1/4 border-r border-gray-200 shadow-lg md:shadow-none overflow-y-auto`}>
                <SidebarContent />
            </div>

            {/* Main Chat Area */}
            <div className={`flex-1 flex flex-col ${showSidebar ? 'hidden' : 'flex'} md:flex bg-white`}>
                {/* Enhanced Header */}
                <div className="p-4 bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {/* Mobile menu button */}
                            <button 
                                className="md:hidden p-2 rounded-full hover:bg-green-500 transition-colors"
                                onClick={() => setShowSidebar(true)}
                            >
                                <Menu size={20} />
                            </button>
                            
                            {chatParticipant && (
                                <>
                                    <div className="relative">
                                        <img
                                            src={chatParticipant?.profileImage ? getImageUrl(chatParticipant.profileImage) : userIcon}
                                            alt={chatParticipant?.name || 'Chat participant'}
                                            className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border-2 border-white shadow-md"
                                        />
                                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
                                    </div>
                                    <div>
                                        <p className="font-bold text-lg">
                                            {chatParticipant?.name || 'خبير زراعي'}
                                        </p>
                                        <p className="text-green-100 text-sm">متاح الآن</p>
                                    </div>
                                </>
                            )}
                            
                            {!chatParticipant && (
                                <div className="flex items-center gap-3">
                                    <MessageCircle className="w-8 h-8" />
                                    <div>
                                        <p className="font-bold text-lg">المحادثات الزراعية</p>
                                        <p className="text-green-100 text-sm">اختر خبير للبدء</p>
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                            {/* Home button */}
                            <button 
                                onClick={() => navigate('/farmer/home')}
                                className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                                title={t('common.home')}
                            >
                                <Home size={20} />
                            </button>
                        
                        </div>
                    </div>
                </div>

                {/* Messages Area - Enhanced */}
                <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-white">
                    {!roomId && (
                        <div className="h-full flex items-center justify-center p-6">
                            <div className="text-center max-w-md">
                                <div className="bg-gradient-to-br from-green-400 to-green-600 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                                    <MessageCircle className="w-12 h-12 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-800 mb-3">مرحباً بك في المحادثات الزراعية</h3>
                                <p className="text-gray-600 mb-6">اختر خبيراً من القائمة الجانبية لبدء محادثة جديدة والحصول على المساعدة الزراعية</p>
                                <button 
                                    onClick={() => setShowSidebar(true)}
                                    className="md:hidden bg-green-600 text-white px-6 py-3 rounded-full font-medium hover:bg-green-700 transition-colors"
                                >
                                    عرض قائمة الخبراء
                                </button>
                            </div>
                        </div>
                    )}

                    {roomId && messages.length === 0 && (
                        <div className="h-full flex items-center justify-center p-6">
                            <div className="text-center max-w-md">
                                <div className="bg-gradient-to-br from-blue-400 to-blue-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                                    <MessageCircle className="w-10 h-10 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-3">ابدأ المحادثة الآن</h3>
                                <p className="text-gray-600">اكتب رسالتك الأولى للخبير واحصل على المساعدة الزراعية التي تحتاجها</p>
                            </div>
                        </div>
                    )}

                    {                    /* Messages */}
                    <div className="p-4 space-y-4 chat-messages">
                        {messages.map((msg, idx) => (
                            <div
                                key={msg._id || idx}
                                className={msg.isSystem 
                                    ? "flex justify-center message-system my-6" 
                                    : `flex ${msg.isMine ? 'justify-end message-mine' : 'justify-start message-other'}`
                                }
                            >
                                {msg.isSystem ? (
                                    // System message styling
                                    <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-100 rounded-xl p-3 max-w-[90%] md:max-w-[70%] shadow-sm">
                                        <p className="text-gray-700 text-sm md:text-base">{msg.content}</p>
                                    </div>
                                ) : (
                                    // Regular user message styling
                                    <div className={`flex items-end gap-2 max-w-[80%] md:max-w-[70%] ${msg.isMine ? 'flex-row-reverse' : 'flex-row'}`}>
                                        {!msg.isMine && (
                                            <img
                                                src={chatParticipant?.profileImage ? getImageUrl(chatParticipant.profileImage) : userIcon}
                                                alt="Expert"
                                                className="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
                                            />
                                        )}
                                        <div
                                            className={`message-bubble px-4 py-3 rounded-2xl shadow-sm ${
                                                msg.isMine 
                                                    ? 'message-bubble-mine text-white rounded-br-sm' 
                                                    : 'message-bubble-other text-gray-800 border border-gray-200 rounded-bl-sm'
                                            }`}
                                        >
                                            {/* Debug logging for image messages */}
                                            {msg.messageType === 'image' && console.log('Rendering image message:', {
                                                messageType: msg.messageType,
                                                imageUrl: msg.imageUrl,
                                                content: msg.content,
                                                fullImageUrl: msg.imageUrl ? getImageUrl(msg.imageUrl) : null
                                            })}
                                            
                                            {msg.messageType === 'image' && msg.imageUrl ? (
                                                <ChatImage 
                                                    imageUrl={msg.imageUrl}
                                                    getImageUrl={getImageUrl}
                                                    message={msg}
                                                />
                                            ) : null}
                                            
                                            {/* Show text content for regular messages */}
                                            {msg.messageType !== 'image' && (
                                                <p className="text-sm md:text-base leading-relaxed">{msg.content}</p>
                                            )}
                                            
                                            {/* Show placeholder for broken image messages */}
                                            {msg.messageType === 'image' && !msg.imageUrl && (
                                                <div className="mb-2 image-message">
                                                    <div className="max-w-full rounded-lg max-h-[300px] bg-gray-100 border border-gray-300 p-4 text-center text-gray-500">
                                                        <p>🖼️ صورة غير متاحة</p>
                                                        <p className="text-xs">خطأ في تحميل الصورة</p>
                                                        {msg.content && msg.content !== 'صورة' && (
                                                            <p className="text-sm mt-2 text-gray-700">{msg.content}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                            <div className={`text-xs mt-2 flex items-center gap-1 message-status ${
                                                msg.isMine ? 'text-green-100 justify-end' : 'text-gray-500'
                                            }`}>
                                                <span>{new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                                {msg.isMine && (
                                                    <div className="flex message-sent">
                                                        <div className="w-1 h-1 bg-current rounded-full"></div>
                                                        <div className="w-1 h-1 bg-current rounded-full ml-0.5"></div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                        
                        {/* Rating prompt after completed consultation */}
                        {roomId && consultationStatus.isCompleted && !consultationStatus.isRated && (
                            <div className="flex justify-center my-6">
                                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 md:p-6 shadow-md max-w-lg w-full">
                                    <div className="flex items-center mb-4">
                                        <div className="bg-green-100 p-2 rounded-full">
                                            <CheckCircle className="w-6 h-6 text-green-600" />
                                        </div>
                                        <h3 className="ml-3 text-lg font-semibold text-gray-800">تم إكمال الاستشارة!</h3>
                                    </div>
                                    
                                    <p className="text-gray-600 mb-4">
                                        قام الخبير بوضع علامة اكتمال على هذه الاستشارة. 
                                        كيف كانت تجربتك؟ تقييمك يساعدنا على تحسين الخدمة.
                                        <br />
                                        <span className="text-sm text-blue-600 mt-2 block">💡 ملاحظة: كل استشارة يمكن تقييمها مرة واحدة فقط</span>
                                    </p>
                                    
                                    <button 
                                        onClick={() => setShowRating(true)}
                                        className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-3 rounded-lg flex items-center justify-center gap-2 font-medium transition-all duration-300 shadow-md hover:shadow-lg"
                                    >
                                        <Star className="w-5 h-5" />
                                        تقييم الخبير
                                    </button>
                                </div>
                            </div>
                        )}
                        
                        {/* Completed and rated consultation notice - only show if no new messages after system rating messages and no recent rejection */}
                        {roomId && consultationStatus.isCompleted && consultationStatus.isRated && 
                         messages.length > 0 && 
                         // Check if the last 2 messages were the system completion messages
                         !messages.slice(-1).some(msg => !msg.isSystem && msg.sender !== null) &&
                         // Don't show if there's a recent rejection message
                         !messages.slice(-5).some(msg => msg.isSystem && msg.content.includes('تم رفض طلب الاستشارة')) && (
                            <div className="flex justify-center my-6">
                                <div className="bg-gradient-to-r from-blue-50 via-green-50 to-emerald-50 border border-emerald-200 rounded-xl p-4 md:p-6 shadow-lg max-w-lg w-full animate-fade-in rating-success-message">
                                    <div className="flex items-center mb-4">
                                        <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-2 rounded-full shadow-sm">
                                            <CheckCircle className="w-6 h-6 text-white" />
                                        </div>
                                        <h3 className="mr-3 text-lg font-bold text-emerald-700">تم إكمال الاستشارة وتقييمها!</h3>
                                    </div>
                                    
                                    <p className="text-gray-700 mb-4">
                                        شكراً لتقييمك! تم تقييم هذه الاستشارة مسبقاً. 
                                        يمكنك الآن:
                                    </p>
                                    
                                    <div className="space-y-2 mb-5">
                                        <div className="flex items-center text-gray-700">
                                            <div className="bg-blue-100 p-1 rounded-full mr-2">
                                                <MessageCircle size={14} className="text-blue-600" />
                                            </div>
                                            <span>متابعة المحادثة مع نفس الخبير</span>
                                        </div>
                                        <div className="flex items-center text-gray-700">
                                            <div className="bg-green-100 p-1 rounded-full mr-2">
                                                <UserPlus size={14} className="text-green-600" />
                                            </div>
                                            <span>بدء استشارة جديدة مع خبير آخر</span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex justify-center gap-3 mt-4">
                                        <button 
                                            onClick={() => setShowSidebar(true)}
                                            className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-5 py-2.5 rounded-lg shadow hover:shadow-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-300 flex items-center gap-2"
                                        >
                                            <UserPlus size={16} />
                                            استشارة خبير آخر
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {                /* Enhanced Input Area */}
                {roomId && (
                    <div className="p-4 md:p-6 bg-white border-t border-gray-200 sticky bottom-0 z-10 shadow-lg">
                        <form onSubmit={handleSend} className="flex flex-col gap-3">
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
                                    placeholder={selectedImage ? 'أضف وصف للصورة (اختياري)' : t('farmer.chat.Type your message')}
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
                                
                                {/* Consult Button */}
                                <button 
                                    type="button"
                                    onClick={() => setShowConsultModal(true)}
                                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-3 rounded-xl text-sm md:text-base transition-all duration-300 font-semibold shadow-md hover:shadow-lg transform hover:scale-[1.02] flex items-center gap-2" 
                                    title={t('farmer.chat.request_consultation')}
                                >
                                    <UserPlus size={16} />
                                    <span className="hidden sm:inline">{t('farmer.chat.consult')}</span>
                                </button>

                                <button 
                                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-3 rounded-xl text-sm md:text-base transition-all duration-300 font-semibold shadow-md hover:shadow-lg transform hover:scale-[1.02] flex items-center gap-2" 
                                    type="submit"
                                    disabled={(!input.trim() && !selectedImage) || isUploading || isSending}
                                >
                                    {isSending ? (
                                        <div className="w-4 h-4 border-t-2 border-white border-solid rounded-full animate-spin"></div>
                                    ) : (
                                        <Send size={16} />
                                    )}
                                    <span className="hidden sm:inline">{t('farmer.chat.Send')}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Consultation Request Modal */}
                {showConsultModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-t-2xl">
                                <h3 className="text-xl font-bold">{t('farmer.chat.request_consultation')}</h3>
                                <p className="text-blue-100 mt-1">{t('farmer.chat.describe_your_problem')}</p>
                            </div>
                            
                            <div className="p-6">
                                <div className="mb-4">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        {t('farmer.chat.problem_description')}
                                    </label>
                                    <textarea
                                        value={consultProblem}
                                        onChange={(e) => setConsultProblem(e.target.value)}
                                        placeholder={t('farmer.chat.describe_problem_placeholder')}
                                        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 resize-none"
                                        rows="4"
                                        maxLength={500}
                                    />
                                    <div className="text-xs text-gray-500 mt-1">
                                        {consultProblem.length}/500 {t('farmer.chat.characters')}
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowConsultModal(false);
                                            setConsultProblem('');
                                        }}
                                        className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                                    >
                                        {t('common.cancel')}
                                    </button>
                                    <button
                                        onClick={handleSendConsultRequest}
                                        disabled={!consultProblem.trim() || isSubmittingConsult}
                                        className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {isSubmittingConsult ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                {t('farmer.chat.sending')}
                                            </>
                                        ) : (
                                            <>
                                                <UserPlus size={16} />
                                                {t('farmer.chat.send_request')}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Enhanced Rating Modal */}
                {showRating && (
                    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl transform transition-all animate-in fade-in duration-300">
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Star className="w-8 h-8 text-white fill-current" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">{t('farmer.chat.Rate your experience')}</h3>
                                <p className="text-gray-600 text-sm">
                                    {t('farmer.chat.how_was_your_experience')}
                                </p>
                            </div>
                            
                            <div className="flex justify-center mb-6 gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRatingValue(star)}
                                        className={`transition-all duration-200 hover:scale-110 ${ratingValue >= star ? 'transform scale-110' : ''}`}
                                    >
                                        <Star 
                                            className={`w-10 h-10 transition-colors duration-200 ${
                                                ratingValue >= star 
                                                    ? 'fill-yellow-400 text-yellow-400' 
                                                    : 'text-gray-300 hover:text-yellow-300'
                                            }`}
                                        />
                                    </button>
                                ))}
                            </div>
                            
                            <div className="mb-6">
                                <label className="block text-sm font-medium mb-3 text-gray-700">{t('farmer.chat.Feedback (optional)')}</label>
                                <textarea
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    className="w-full border-2 border-gray-200 rounded-xl p-4 min-h-[100px] text-sm md:text-base focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none resize-none transition-colors"
                                    placeholder={t('farmer.chat.Your feedback here...')}
                                    dir="rtl"
                                ></textarea>
                            </div>
                            
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowRating(false)}
                                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                                >
                                    {t('common.Cancel')}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSubmitRating}
                                    disabled={isSubmittingRating}
                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 disabled:opacity-50 transition-all duration-200 shadow-lg font-medium flex items-center justify-center gap-2"
                                >
                                    {isSubmittingRating ? (
                                        <>
                                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            {t('farmer.chat.Submitting...')}
                                        </>
                                    ) : (
                                        <>{t('farmer.chat.Submit Rating')}</>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FarmerChat;
