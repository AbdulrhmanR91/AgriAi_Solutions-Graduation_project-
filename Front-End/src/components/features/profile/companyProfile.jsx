import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Phone, MapPin, LogOut, Camera, Building2, FileText } from 'lucide-react';
import companyimg from '/src/assets/images/company.png';
import { uploadProfileImage, getImageUrl } from '../../../utils/apiService';
import toast from 'react-hot-toast';
import BottomNavigation from '../../shared/navigation/BottomNavCompany';
import useCompany from '../../../hooks/useCompany';
import { useTranslation } from 'react-i18next'; // Add this import
import config from '../../../config/config';
import { storage } from '../../../utils/storage';

const CompanyProfile = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { company, updateCompanyData, loadProfile } = useCompany();
    const [activeTab, setActiveTab] = useState('profile');

    useEffect(() => {
        const loadData = async () => {
            try {
                await loadProfile();
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [loadProfile]);

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to logout?')) {
            storage.clearSession();
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

                const storedUser = JSON.parse(localStorage.getItem(config.STORAGE_KEYS.USER_INFO) || '{}');
                const updatedUser = {
                    ...storedUser,
                    profileImage: response.data.imageUrl
                };
                localStorage.setItem(config.STORAGE_KEYS.USER_INFO, JSON.stringify(updatedUser));
                
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
    src={company.profileImage ? getImageUrl(company.profileImage) : companyimg}
    alt="Company Logo"
    className="w-16 sm:w-24 h-16 sm:h-24 rounded-full object-cover border-4 border-green-500"
    onError={(e) => {
        e.target.src = companyimg;
        e.target.onerror = null;
    }}
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
                                <p className="text-gray-600">{t('company.company')}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 text-red-500 hover:text-red-600"
                        >
                            <LogOut className="w-5 h-5" />
                            {t('common.logout')}
                        </button>
                    </div>
                </div>

                {/* Contact Information */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">{t('company.profile.contact_info')}</h2>
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
                    <h2 className="text-xl font-semibold mb-4">{t('company.profile.business_details')}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-medium text-gray-800 mb-2 flex items-center gap-2">
                                    <Building2 className="w-5 h-5 text-green-600" />
                                    {t('company.profile.company_name')}
                                </h3>
                                <p className="text-gray-600">{company.companyDetails?.companyName || 'Not specified'}</p>
                            </div>
                                                        <div>
                                <h3 className="text-lg font-medium text-gray-800 mb-2 flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-green-600" />
                                    {t('company.profile.business_address')}
                                </h3>
                                <p className="text-gray-600">{company.companyDetails?.businessAddress || 'Not specified'}</p>
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-gray-800 mb-2 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-green-600" />
                                    {t('company.profile.trade_license_number')}
                                </h3>
                                <p className="text-gray-600">{company.companyDetails?.tradeLicenseNumber || 'Not specified'}</p>
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-gray-800 mb-2 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-green-600" />
                                    {t('company.profile.tax_registration_number')}
                                </h3>
                                <p className="text-gray-600">{company.companyDetails?.taxRegistrationNumber || 'Not specified'}</p>
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