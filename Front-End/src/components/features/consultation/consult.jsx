/*
 * NOTE: This file has been replaced by the Chat.jsx component.
 * It's kept for reference purposes but is no longer used in the application.
 * The consultation functionality is now handled directly in the chat interface.
 */

import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Card, CardHeader, CardContent } from '../../shared/ui/card';
import search from "/src/assets/images/search.png";
import user from '/src/assets/images/user.png';
import { useFarmer } from '../../../hooks/useFarmer';
import { getAvailableExperts, searchExperts, createChatRoom, getImageUrl } from '../../../utils/apiService';
import toast from 'react-hot-toast';
import NotificationBadge from '../notifications/NotificationBadge';
import { useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ExpertCard = ({ expert }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleChat = async () => {
        try {
            setLoading(true);
            toast.loading(t('Setting up chat...'));
            
            // Navigate directly to the expert-specific chat route instead
            // This allows the Chat component to handle the room creation logic
            navigate(`/farmer/chat/expert/${expert._id}`);
        } catch (error) {
            console.error('Chat room creation error:', error);
            toast.error(t('Failed to start chat'));
        } finally {
            toast.dismiss();
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                    <img
                        src={expert.profileImage ? getImageUrl(expert.profileImage) : user}
                        alt={expert.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            e.target.src = user;
                            e.target.onerror = null;
                        }}
                    />
                </div>
                <div className="flex-grow">
                    <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium text-lg">{expert.name}</h3>
                        
                        {/* Rating stars */}
                        {expert.expertDetails?.averageRating !== undefined ? (
                            <div className="flex items-center">
                                <span className="flex">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <Star 
                                            key={star} 
                                            size={16} 
                                            className={`${
                                                star <= Math.round(expert.expertDetails.averageRating) 
                                                    ? 'text-yellow-400 fill-yellow-400' 
                                                    : 'text-gray-300'
                                            }`} 
                                        />
                                    ))}
                                </span>
                                <span className="ml-1 text-sm font-medium text-gray-600">
                                    {expert.expertDetails.averageRating.toFixed(1)}
                                    {expert.expertDetails.ratingsCount > 0 && (
                                        <span className="text-xs text-gray-500 ml-1">
                                            ({expert.expertDetails.ratingsCount})
                                        </span>
                                    )}
                                </span>
                            </div>
                        ) : (
                            <span className="text-xs text-gray-500">{t('New Expert')}</span>
                        )}
                    </div>
                    <p className="text-sm text-green-600 mb-1">{expert.expertDetails?.expertAt}</p>
                    <p className="text-sm text-gray-500 mb-3">{expert.expertDetails?.university}</p>
                    <button
                        onClick={handleChat}
                        disabled={loading}
                        className="w-full h-10 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center"
                    >
                        {loading ? t('Starting chat') : t('common.chat')}
                    </button>
                </div>
            </div>
        </div>
    );
};

ExpertCard.propTypes = {
    expert: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        profileImage: PropTypes.string,
        expertDetails: PropTypes.shape({
            expertAt: PropTypes.string,
            university: PropTypes.string
        })
    }).isRequired
};

const Consult = () => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [experts, setExperts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const { farmer, loading: farmerLoading } = useFarmer();

    const loadExperts = async () => {
        try {
            setLoading(true);
            const response = await getAvailableExperts();
            if (response.success && Array.isArray(response.data)) {
                setExperts(response.data);
            } else {
                setExperts([]);
            }
        } catch (error) {
            console.error('Failed to load experts:', error);
            toast.error(t('Failed to load experts'));
            setExperts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadExperts();
    }, []);

    const handleSearch = async (e) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (query.length > 2) {
            try {
                const response = await searchExperts(query);
                if (response.success && Array.isArray(response.data)) {
                    setExperts(response.data);
                } else {
                    setExperts([]);
                }
            } catch (error) {
                console.error('Search experts error:', error);
                setExperts([]);
            }
        } else if (query.length === 0) {
            loadExperts();
        }
    };

    if (loading || farmerLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <header className="sticky top-0 bg-white shadow-sm z-10">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                                <img
                                    src={farmer?.profileImage ? getImageUrl(farmer.profileImage) : user}
                                    alt="Farmer"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.src = user;
                                        e.target.onerror = null;
                                    }}
                                />
                            </div>
                            <h1 className="text-xl font-bold text-green-600">{t('Available Experts')}</h1>
                        </div>
                        <NotificationBadge userType="farmer" />
                    </div>
                </div>
            </header>

            <main className="w-full max-w-4xl px-4 py-6 mx-auto">
                <div className="relative w-full mb-6">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={handleSearch}
                        placeholder={t('Search experts...')}
                        className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-400"
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                        <img src={search} alt="Search Icon" className="w-5 h-5" />
                    </div>
                </div>

                <Card className="w-full">
                    <CardHeader>
                        <h2 className="text-xl font-bold text-center">{t('Available Agricultural Experts')} 👨‍🌾</h2>
                        <p className="text-center text-gray-500 mt-2">
                            {t('experts available', { count: experts.length })}
                        </p>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {experts.length === 0 ? (
                                <div className="col-span-2 flex items-center justify-center py-8 text-gray-500">
                                    {t('No experts available at the moment')}
                                </div>
                            ) : (
                                experts.map((expert) => (
                                    <ExpertCard key={expert._id} expert={expert} />
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
};

export default Consult;