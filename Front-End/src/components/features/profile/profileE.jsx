import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Phone, Briefcase, GraduationCap, Award, LogOut, Camera, Star } from 'lucide-react';
import { getExpertProfile, uploadProfileImage, getImageUrl, getExpertRatings } from '../../../utils/apiService';
import toast from 'react-hot-toast';
import user from '/src/assets/images/user.png';
import { useTranslation } from 'react-i18next';
import { storage } from '../../../utils/storage';

export default function ExpertProfile() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [expert, setExpert] = useState(null);
    const [error, setError] = useState(null);
    const [profileImage, setProfileImage] = useState(null);
    const [ratings, setRatings] = useState({
        ratings: [],
        stats: {
            totalRatings: 0,
            averageRating: 0
        }
    });

    const loadExpertProfile = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getExpertProfile();
            
            if (!data) {
                throw new Error(t('expert.profile.no_data'));
            }

            console.log("Expert profile data:", data); // Debug log to check data
            
            // Ensure profile image is properly processed
            const processedProfileImage = data.profileImage ? getImageUrl(data.profileImage) : user;
            setProfileImage(processedProfileImage);
            
            setExpert({
                name: data.name || '',
                email: data.email || '',
                phone: data.phone || '',
                profileImage: data.profileImage || '',
                contact: {
                    email: data.email || '',
                    phone: data.phone || '',
                    address: data.location || ''
                },
                expertDetails: {
                    expertAt: data.expertDetails?.expertAt || '',
                    university: data.expertDetails?.university || '',
                    college: data.expertDetails?.college || '',
                    services: Array.isArray(data.expertDetails?.services) 
                        ? data.expertDetails.services 
                        : []
                },
            });
            
            setError(null);
        } catch (error) {
            console.error('Error loading profile:', error);
            setError(error.message || t('expert.profile.failed_load_profile'));
            // Don't navigate away on error, just show the error message
        } finally {
            setLoading(false);
        }
    }, [t]);
    
    const loadExpertRatings = useCallback(async () => {
        try {
            const response = await getExpertRatings();
            if (response.success) {
                setRatings(response.data);
                console.log("Expert ratings:", response.data);
            }
        } catch (error) {
            console.error("Error loading expert ratings:", error);
            // Don't show toast here, as this is a secondary feature
        }
    }, []);

    useEffect(() => {
        // Stay on the page and just display the profile if possible
        const session = storage.getSession();
    
        if (!session || !session.token) {
            navigate("/login");
            return;
        }
        
        try {
            // Check user type but don't immediately redirect
            if (session.userData?.userType !== "expert") {
                console.warn("User is not an expert");
                // Continue anyway to avoid redirect loops
            }
            
            // Load expert profile and ratings
            loadExpertProfile();
            loadExpertRatings();
        } catch (e) {
            console.error("Error accessing session data:", e);
            // Don't immediately redirect, try to load profile anyway
            loadExpertProfile();
            loadExpertRatings();
        }
    }, [navigate, loadExpertProfile, loadExpertRatings]);

    const handleLogout = () => {
        if (window.confirm(t('expert.profile.confirm_logout'))) {
            storage.clearSession();
            navigate('/login');
        }
    };

    const handleImageUpload = async (event) => {
        try {
            const file = event.target.files[0];
            if (!file) return;

            setLoading(true);

            console.log("Uploading image:", file.name, file.type, file.size);
            const response = await uploadProfileImage(file); // Pass the file directly
            console.log("Upload response:", response);
            
            if (response.success) {
                const imageUrl = response.imageUrl;
                console.log("New image URL:", imageUrl);
                
                // Update local state
                setExpert(prev => ({
                    ...prev,
                    profileImage: imageUrl
                }));
                
                // Update profile image with proper URL formatting
                setProfileImage(getImageUrl(imageUrl));
                
                // Update stored user data using the correct storage keys
                const session = storage.getSession();
                if (session && session.userData) {
                    session.userData.profileImage = imageUrl;
                    storage.setSession(session.token, session.userData, session.rememberMe);
                }
                
                toast.success(t('expert.profile.image_updated'));
                
                // Reload the profile to ensure consistency
                await loadExpertProfile();
            } else {
                throw new Error(response.message || t('expert.profile.image_update_failed'));
            }
        } catch (error) {
            console.error('Image upload error:', error);
            toast.error(error.message || t('expert.profile.image_update_failed'));
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          );
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
                <div className="text-red-500 text-xl mb-4">{error}</div>
                <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                    {t('common.retry')}
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 pb-20">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-r from-green-600 to-green-700 text-white">
                <div className="absolute inset-0 bg-black opacity-10"></div>
                <div className="relative max-w-6xl mx-auto px-4 py-12">
                    <div className="text-center">
                        <div className="relative inline-block">
                            <div className="relative">
                                <img
                                    src={profileImage || user}
                                    alt={t('expert.profile.profile_image')}
                                    className="rounded-full w-24 sm:w-32 md:w-40 h-24 sm:h-32 md:h-40 object-cover border-6 border-white shadow-2xl mx-auto ring-4 ring-green-200"
                                    onError={(e) => {
                                        console.error("Image failed to load:", e.target.src);
                                        e.target.src = user;
                                        e.target.onerror = null;
                                    }}
                                />
                                <label className="absolute bottom-2 right-2 p-3 bg-white text-green-600 rounded-full hover:bg-green-50 cursor-pointer shadow-lg transition-all duration-200 hover:scale-110">
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/jpeg,image/png,image/jpg"
                                        onChange={handleImageUpload}
                                    />
                                    <Camera className="w-5 h-5" />
                                </label>
                            </div>
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-bold mt-6 mb-2">{expert?.name || t('expert.common.expert')}</h1>
                        <p className="text-green-100 text-lg font-medium mb-4">{expert?.expertDetails?.expertAt || t('expert.common.expert')}</p>
                        <div className="flex justify-center items-center space-x-6 text-sm">
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                                <span>متاح للاستشارة</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-8 pb-24">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Sidebar - Quick Actions */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Quick Actions Card */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            
                           
                            <div className="space-y-3">
                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left px-4 py-3 bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex items-center"
                                >
                                    <LogOut className="w-4 h-4 text-red-600 mr-3" />
                                    <span className="text-gray-700">{t('common.logout')}</span>
                                </button>
                            </div>
                        </div>

                        {/* Statistics Card */}
                        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
                            <h3 className="text-lg font-semibold mb-4">إحصائياتي</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-green-100">الاستشارات</span>
                                    <span className="text-2xl font-bold">12</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-green-100">التقييم</span>
                                    <div className="flex items-center">
                                        <span className="text-2xl font-bold mr-1">4.8</span>
                                        <Award className="w-5 h-5 text-yellow-300" />
                                    </div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-green-100">سنوات الخبرة</span>
                                    <span className="text-2xl font-bold">5+</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:col-span-2 space-y-6">
                    
                    {/* Contact Information */}
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
                            <h2 className="text-xl font-semibold text-white flex items-center">
                                <Mail className="w-5 h-5 mr-2" />
                                {t('expert.profile.contact_information')}
                            </h2>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-4">
                                        <Mail className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">البريد الإلكتروني</p>
                                        <p className="font-medium text-gray-900">{expert.contact.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                                        <Phone className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">رقم الهاتف</p>
                                        <p className="font-medium text-gray-900">{expert.contact.phone}</p>
                                    </div>
                                </div>
                                {expert.contact.address && (
                                    <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                                            <Award className="w-5 h-5 text-purple-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">العنوان</p>
                                            <p className="font-medium text-gray-900">{expert.contact.address}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Professional Details */}
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
                            <h2 className="text-xl font-semibold text-white flex items-center">
                                <Briefcase className="w-5 h-5 mr-2" />
                                {t('expert.profile.professional_details')}
                            </h2>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-4">
                                        <Briefcase className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">التخصص</p>
                                        <p className="font-medium text-gray-900">{expert.expertDetails.expertAt}</p>
                                    </div>
                                </div>
                                <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                                        <GraduationCap className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">الجامعة</p>
                                        <p className="font-medium text-gray-900">{expert.expertDetails.university}</p>
                                    </div>
                                </div>
                                <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                                        <Award className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">الكلية</p>
                                        <p className="font-medium text-gray-900">{expert.expertDetails.college}</p>
                                    </div>
                                </div>
                                {expert.expertDetails.services && expert.expertDetails.services.length > 0 && (
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <p className="text-sm text-gray-500 mb-3">الخدمات المقدمة</p>
                                        <div className="flex flex-wrap gap-2">
                                            {expert.expertDetails.services.map((service, index) => (
                                                <span 
                                                    key={index}
                                                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                                                >
                                                    {service}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Ratings and Reviews Section */}
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden mt-6">
                        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 px-6 py-4">
                            <h2 className="text-xl font-semibold text-white flex items-center">
                                <Star className="w-5 h-5 mr-2" />
                                التقييمات والمراجعات
                            </h2>
                        </div>
                        <div className="p-6">
                            {/* Rating Summary */}
                            <div className="bg-yellow-50 rounded-lg p-4 mb-6">
                                <div className="flex items-center">
                                    <div className="text-3xl font-bold text-yellow-600 mr-3">
                                        {ratings.stats.averageRating || "0.0"}
                                    </div>
                                    <div className="flex">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star 
                                                key={star} 
                                                className={`w-5 h-5 ${parseFloat(ratings.stats.averageRating) >= star 
                                                    ? 'text-yellow-400 fill-yellow-400' 
                                                    : 'text-gray-300'}`} 
                                            />
                                        ))}
                                    </div>
                                    <div className="text-gray-500 text-sm ml-3">
                                        ({ratings.stats.totalRatings || 0} تقييم)
                                    </div>
                                </div>
                            </div>

                            {/* Individual Ratings */}
                            {ratings.ratings && ratings.ratings.length > 0 ? (
                                <div className="space-y-4">
                                    {ratings.ratings.map((rating, index) => (
                                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                                            <div className="flex justify-between items-center mb-2">
                                                <div className="flex items-center">
                                                    <img 
                                                        src={rating.farmer.profileImage ? getImageUrl(rating.farmer.profileImage) : user} 
                                                        alt={rating.farmer.name} 
                                                        className="w-10 h-10 rounded-full mr-3 object-cover"
                                                    />
                                                    <span className="font-medium">{rating.farmer.name}</span>
                                                </div>
                                                <div className="flex">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <Star 
                                                            key={star} 
                                                            className={`w-4 h-4 ${rating.rating >= star 
                                                                ? 'text-yellow-400 fill-yellow-400' 
                                                                : 'text-gray-300'}`} 
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                            {rating.feedback && (
                                                <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded mt-2">
                                                    {rating.feedback}
                                                </p>
                                            )}
                                            <div className="text-gray-400 text-xs mt-2">
                                                {new Date(rating.createdAt).toLocaleDateString('ar-EG')}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-6">
                                    <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500">لا توجد تقييمات حتى الآن</p>
                                </div>
                            )}
                        </div>
                    </div>
                    </div>
                </div>
            </div>
        </div>
    );
}