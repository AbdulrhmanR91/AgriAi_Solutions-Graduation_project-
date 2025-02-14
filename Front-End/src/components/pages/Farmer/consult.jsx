import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Card, CardHeader, CardContent } from '../ui/card';
import { Dialog, DialogContent } from '../ui/dialog';
import search from "/src/assets/images/search.png";
import user from '/src/assets/images/user.png';
import { useFarmer } from '../../../hooks/useFarmer';
import { getAvailableExperts, searchExperts, createConsultOrder, getImageUrl } from '../../../utils/apiService';
import toast from 'react-hot-toast';
import NotificationBadge from '../../common/NotificationBadge';

const OrderModal = ({ isOpen, onClose, onSubmit, loading }) => (
    <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
            <form onSubmit={onSubmit} className="space-y-4">
                <h3 className="text-lg font-bold">Request Consultation</h3>
                <textarea
                    name="problem"
                    placeholder="Describe your problem..."
                    className="w-full h-32 p-2 border rounded-md"
                    required
                />
                <div className="flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-100 rounded-md"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-green-500 text-white rounded-md disabled:bg-green-300"
                    >
                        {loading ? 'Sending...' : 'Send Request'}
                    </button>
                </div>
            </form>
        </DialogContent>
    </Dialog>
);

OrderModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    loading: PropTypes.bool.isRequired
};

const ExpertCard = ({ expert }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isOrdering, setIsOrdering] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const problem = e.target.problem.value;
        
        try {
            setIsOrdering(true);
            await createConsultOrder({ 
                expertId: expert._id,
                problem 
            });
            toast.success('Consultation request sent successfully');
            setIsModalOpen(false);
        } catch (error) {
            console.error('Consultation request error:', error);
            toast.error('Failed to send request');
        } finally {
            setIsOrdering(false);
        }
    };

    return (
        <>
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
                    <h3 className="font-medium text-lg mb-1">{expert.name}</h3>
                    <p className="text-sm text-green-600 mb-1">{expert.expertDetails?.expertAt}</p>
                    <p className="text-sm text-gray-500 mb-3">{expert.expertDetails?.university}</p>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="w-full h-10 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center"
                    >
                        Request Consultation
                    </button>
                </div>
            </div>

            <OrderModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmit}
                loading={isOrdering}
            />
        </div>
        </>
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
            toast.error('فشل في تحميل قائمة الخبراء');
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
                            <h1 className="text-xl font-bold text-green-600">Available Experts</h1>
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
                        placeholder="Search experts..."
                        className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-400"
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                        <img src={search} alt="Search Icon" className="w-5 h-5" />
                    </div>
                </div>

                <Card className="w-full">
                    <CardHeader>
                        <h2 className="text-xl font-bold text-center">Available Agricultural Experts 👨‍🌾</h2>
                        <p className="text-center text-gray-500 mt-2">
                            {experts.length} experts available
                        </p>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {experts.length === 0 ? (
                                <div className="col-span-2 flex items-center justify-center py-8 text-gray-500">
                                    No experts available at the moment
                                </div>
                            ) : (
                                experts.map((expert) => (
                                    <ExpertCard
                                        key={expert._id}
                                        expert={expert}
                                    />
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