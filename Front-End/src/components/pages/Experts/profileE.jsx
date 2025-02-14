import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Phone, Edit2, Star, LogOut, Award, BookOpen } from 'lucide-react';
import { getExpertProfile, updateExpertProfile, uploadProfileImage } from '../../../utils/apiService';
import { useUser } from '../../../context/UserContext';
import toast from 'react-hot-toast';
import user from '/src/assets/images/user.png';

const ExpertProfile = () => {
    const navigate = useNavigate();
    const { updateUser } = useUser();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expert, setExpert] = useState(null);
    const [isEditing, setIsEditing] = useState({
        contact: false,
        expertDetails: false,
    });
    const [profileImage, setProfileImage] = useState('');
    
    const BASE_URL = 'https://dark-gennifer-abdulrhman-5d081501.koyeb.app';
    const getImageUrl = (imagePath) => {
        if (!imagePath) return user;
        if (imagePath.startsWith('http')) return imagePath;
        return `${BASE_URL}${imagePath}`;
    };

    const loadExpertProfile = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getExpertProfile();
            
            if (!data) {
                throw new Error('No data received from server');
            }

            setExpert({
                name: data.name || '',
                email: data.email || '',
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
                profileImage: getImageUrl(data.profileImage)
            });
            setProfileImage(getImageUrl(data.profileImage));
            setError(null);
        } catch (error) {
            console.error('Error loading profile:', error);
            setError(error.message || 'Failed to load profile');
            if (error.response?.status === 401) {
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const user = JSON.parse(localStorage.getItem("user")); // الحصول على الكائن user
    
        if (!token || !user) {
          navigate("/login");
          return;
        }
    
        // التحقق من نوع المستخدم
        if (user.userType !== "expert") {
          navigate("/expert"); // أو أي صفحة أخرى تناسب المستخدم
          return;
        }
    
        loadExpertProfile();
      }, [navigate, loadExpertProfile]);

    const handleSave = async (section) => {
        try {
            setLoading(true);
            let updates = {};

            if (section === 'contact') {
                updates = {
                    email: expert.contact.email,
                    phone: expert.contact.phone,
                    location: expert.contact.address
                };
            } else if (section === 'expertDetails') {
                updates = {
                    expertDetails: {
                    expertAt: expert.expertDetails.expertAt,
                    university: expert.expertDetails.university,
                    college: expert.expertDetails.college,
                    services: expert.expertDetails.services
                    }
                };
            }

            const response = await updateExpertProfile(updates);
            if (response.success) {
                toast.success('Profile updated successfully');
                setIsEditing({ ...isEditing, [section]: false });
                await loadExpertProfile();
            } else {
                throw new Error(response.message || 'Failed to update profile');
            }
        } catch (error) {
            toast.error(error.message || 'Failed to update profile');
            console.error('Error updating profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('token');
            localStorage.removeItem('userType');
            navigate('/login');
        }
    };

    const handleImageUpload = async (event) => {
        try {
            const file = event.target.files[0];
            if (!file) return;

            setLoading(true);
            const formData = new FormData();
            formData.append('profileImage', file);

            const response = await uploadProfileImage(formData);
            
            if (response.success) {
                const imageUrl = response.imageUrl;
                
                // تحديث الحالة المحلية
                setExpert(prev => ({
                    ...prev,
                    profileImage: getImageUrl(imageUrl)
                }));

                // تحديث سياق المستخدم
                updateUser(currentUser => ({
                    ...currentUser,
                    profileImage: imageUrl
                }));
                
                toast.success('تم تحديث صورة الملف الشخصي بنجاح');
                
                // إعادة تحميل بيانات الملف الشخصي
                await loadExpertProfile();
            } else {
                throw new Error(response.message || 'فشل في تحديث الصورة');
            }
        } catch (error) {
            console.error('Image upload error:', error);
            toast.error(error.message || 'فشل في تحديث صورة الملف الشخصي');
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
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="p-8 pb-24">
                <div className="max-w-3xl mx-auto">
                    {/* Profile Header */}
                    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                        <div className="text-center">
                            <div className="relative inline-block">
                                <img
                                    src={profileImage || user}
                                    alt="Expert profile"
                                    className="rounded-full w-20 sm:w-32 h-20 sm:h-32 object-cover border-4 border-white shadow-lg mx-auto"
                                    onError={(e) => {
                                        e.target.src = user;
                                        e.target.onerror = null;
                                    }}
                                />
                                <label className="absolute bottom-0 right-0 p-2 bg-green-600 rounded-full text-white hover:bg-green-700 cursor-pointer">
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/jpeg,image/png,image/jpg"
                                        onChange={handleImageUpload}
                                    />
                                    <Edit2 className="w-4 h-4" />
                                </label>
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 mt-4">{expert.name}</h1>
                            <p className="text-green-600 font-medium">{expert.expertDetails.expertAt}</p>
                        </div>
                    </div>

                    
                    {/* Contact Information */}
                    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">Contact Information</h2>
                           
                        </div>
                        {isEditing.contact ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={expert.contact.email}
                                        onChange={(e) => setExpert({
                                            ...expert,
                                            contact: { ...expert.contact, email: e.target.value }
                                        })}
                                        className="w-full p-2 border rounded focus:border-green-500 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                    <input
                                        type="tel"
                                        value={expert.contact.phone}
                                        onChange={(e) => setExpert({
                                            ...expert,
                                            contact: { ...expert.contact, phone: e.target.value }
                                        })}
                                        className="w-full p-2 border rounded focus:border-green-500 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                    <input
                                        type="text"
                                        value={expert.contact.address}
                                        onChange={(e) => setExpert({
                                            ...expert,
                                            contact: { ...expert.contact, address: e.target.value }
                                        })}
                                        className="w-full p-2 border rounded focus:border-green-500 focus:outline-none"
                                    />
                                </div>
                                <button
                                    onClick={() => handleSave('contact')}
                                    className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                                >
                                    Save Changes
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <Mail className="w-5 h-5 text-green-600" />
                                    <span>{expert.contact.email}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Phone className="w-5 h-5 text-green-600" />
                                    <span>{expert.contact.phone}</span>
                                </div>
                                
                            </div>
                        )}
                    </div>

                    {/* Professional Details */}
                    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">Professional Details</h2>
                            
                        </div>
                        {isEditing.expertDetails ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                                    <input
                                        type="text"
                                        value={expert.expertDetails.expertAt}
                                        onChange={(e) => setExpert({
                                            ...expert,
                                            expertDetails: { ...expert.expertDetails, expertAt: e.target.value }
                                        })}
                                        className="w-full p-2 border rounded focus:border-green-500 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">University</label>
                                    <input
                                        type="text"
                                        value={expert.expertDetails.university}
                                        onChange={(e) => setExpert({
                                            ...expert,
                                            expertDetails: { ...expert.expertDetails, university: e.target.value }
                                        })}
                                        className="w-full p-2 border rounded focus:border-green-500 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">College</label>
                                    <input
                                        type="text"
                                        value={expert.expertDetails.college}
                                        onChange={(e) => setExpert({
                                            ...expert,
                                            expertDetails: { ...expert.expertDetails, college: e.target.value }
                                        })}
                                        className="w-full p-2 border rounded focus:border-green-500 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Services</label>
                                    <textarea
                                        value={expert.expertDetails.services.join(', ')}
                                        onChange={(e) => setExpert({
                                            ...expert,
                                            expertDetails: {
                                                ...expert.expertDetails,
                                                services: e.target.value.split(',').map(s => s.trim())
                                            }
                                        })}
                                        className="w-full p-2 border rounded focus:border-green-500 focus:outline-none"
                                        rows="3"
                                    />
                                </div>
                                <button
                                    onClick={() => handleSave('expertDetails')}
                                    className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                                >
                                    Save Changes
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <Star className="w-5 h-5 text-green-600" />
                                    <div>
                                        <span className="font-medium">Specialization:</span>
                                        <span className="ml-2">{expert.expertDetails.expertAt}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Award className="w-5 h-5 text-green-600" />
                                    <div>
                                        <span className="font-medium">University:</span>
                                        <span className="ml-2">{expert.expertDetails.university}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <BookOpen className="w-5 h-5 text-green-600" />
                                    <div>
                                        <span className="font-medium">College:</span>
                                        <span className="ml-2">{expert.expertDetails.college}</span>
                                    </div>
                                </div>
                                <div>
                                    <div className="font-medium mb-2">Services:</div>
                                    <div className="flex flex-wrap gap-2">
                                        {expert.expertDetails.services.map((service, index) => (
                                            <span
                                                key={index}
                                                className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
                                            >
                                                {service}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Logout Button */}
                    <div className="flex justify-center">
                        <button
                            onClick={handleLogout}
                            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                        >
                            <LogOut className="w-4 h-4" />
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExpertProfile;