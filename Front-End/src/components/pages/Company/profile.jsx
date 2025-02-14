import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Phone, MapPin, LogOut, Camera, Building2, FileText } from 'lucide-react';
import companyimg from '/src/assets/images/company.png';
import { uploadProfileImage, getImageUrl } from '../../../utils/apiService';
import toast from 'react-hot-toast';
import BottomNavigation from './BottomNavCompany';
import useCompany from '../../../hooks/useCompany';

const CompanyProfile = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { company, updateCompanyData, loadProfile } = useCompany();
    const [activeTab, setActiveTab] = useState('profile');

    useEffect(() => {
        const loadData = async () => {
            try {
                const response = await loadProfile();
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/login');
        }
    };

    const handleImageUpload = async (event) => {
        try {
            const file = event.target.files[0];
            if (!file) return;

            const formData = new FormData();
            formData.append('profileImage', file);

            const response = await uploadProfileImage(formData);
            
            if (response.data?.imageUrl) {
                const updatedCompany = {
                    ...company,
                    profileImage: response.data.imageUrl
                };
                updateCompanyData(updatedCompany);

                const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
                const updatedUser = {
                    ...storedUser,
                    profileImage: response.data.imageUrl
                };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                
                toast.success('تم تحديث صورة الشركة بنجاح');
                // Reload the page after successful image upload
                window.location.reload();
            }
        } catch (error) {
            toast.error(error.message || 'فشل في تحديث صورة الشركة');
        }
    };

    if (loading)
        return 
            <div className="min-h-screen flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
         </div>;
    if (error) return (
        <div className="min-h-screen bg-green-50 flex flex-col items-center justify-center p-4">
            <div className="text-red-500 text-center mb-4">{error}</div>
            <button
                onClick={() => {
                    setError(null);
                    setLoading(true);
                    loadProfile();
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
                Try Again
            </button>
        </div>
    );
    if (!company) return null;

    return (
        <div className="min-h-screen bg-green-50 p-6  pb-24">
            <div className="max-w-4xl mx-auto">
                {/* Profile Header */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                            <img
    src={`${company.profileImage ? getImageUrl(company.profileImage) : companyimg}?t=${new Date().getTime()}`}
    alt="Company Logo"
    className="w-16 sm:w-24 h-16 sm:h-24 rounded-full object-cover border-4 border-green-500"
/>

                                <label className="absolute bottom-0 right-0 bg-green-600 rounded-full p-2 cursor-pointer hover:bg-green-700 transition-colors">
                                    <Camera className="w-4 h-4 text-white" />
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                    />
                                </label>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800">{company.name}</h1>
                                <p className="text-gray-600">Company</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 text-red-500 hover:text-red-600"
                        >
                            <LogOut className="w-5 h-5" />
                            Logout
                        </button>
                    </div>
                </div>

                {/* Contact Information */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Mail className="w-5 h-5 text-green-600" />
                            <span>{company.email}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Phone className="w-5 h-5 text-green-600" />
                            <span>{company.phone}</span>
                        </div>
                       
                    </div>
                </div>

                {/* Company Details */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Company Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-medium text-gray-800 mb-2 flex items-center gap-2">
                                    <Building2 className="w-5 h-5 text-green-600" />
                                    Company Name
                                </h3>
                                <p className="text-gray-600">{company.companyDetails?.companyName || 'Not specified'}</p>
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-gray-800 mb-2 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-green-600" />
                                    Trade License Number
                                </h3>
                                <p className="text-gray-600">{company.companyDetails?.tradeLicenseNumber || 'Not specified'}</p>
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-gray-800 mb-2 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-green-600" />
                                    Tax Registration Number
                                </h3>
                                <p className="text-gray-600">{company.companyDetails?.taxRegistrationNumber || 'Not specified'}</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-medium text-gray-800 mb-2 flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-green-600" />
                                    Business Address
                                </h3>
                                <p className="text-gray-600">{company.companyDetails?.businessAddress || 'Not specified'}</p>
                            </div>
                            <div>
                               
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
    );
};

export default CompanyProfile;