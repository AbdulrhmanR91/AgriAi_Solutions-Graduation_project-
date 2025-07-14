import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // Add this import
import { Mail, Phone, MapPin, LogOut, Wheat, Plus, Camera } from 'lucide-react';
import PropTypes from 'prop-types';
import harvester from '/src/assets/images/harvester.png';
import { getFarmerProfile, addNewFarm, uploadProfileImage, getImageUrl } from '../../../utils/apiService';
import { useFarmer } from '../../../hooks/useFarmer';
import toast from 'react-hot-toast';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import config from '../../../config/config';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { storage } from '../../../utils/storage';
import { logout as authLogout } from '../../../utils/auth';

// تعريف أيقونة الموقع
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow
});
const LocationPicker = ({ onLocationSelect }) => {
    useMapEvents({
        click(e) {
            const { lat, lng } = e.latlng;
            onLocationSelect({ lat, lng });
        },
    });
    return null;
};

LocationPicker.propTypes = {
    onLocationSelect: PropTypes.func.isRequired,
};

// دالة تحويل الإحداثيات إلى عنوان تفصيلي
const getAddressFromCoordinates = async (lat, lng) => {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
            { signal: controller.signal }
        );
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // تجميع العنوان بالإنجليزية
        const address = [];
        const details = data.address;
        
        if (details.road) address.push(details.road);
        if (details.suburb) address.push(details.suburb);
        if (details.city || details.town || details.village) {
            address.push(details.city || details.town || details.village);
        }
        if (details.state) address.push(details.state);
        if (details.country) address.push(details.country);
        
        // دمج العنوان مع الإحداثيات
        const coordinates = `(${lat.toFixed(6)}, ${lng.toFixed(6)})`;
        const addressText = address.length > 0 ? address.join(', ') : 'Unknown location';
        
        return `${addressText} ${coordinates}`;
    } catch (error) {
        console.error('Error getting address:', error);
        // Return coordinates as fallback
        return `Location (${lat.toFixed(6)}, ${lng.toFixed(6)})`;
    }
};

const FarmerProfile = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [farmer, setFarmer] = useState(null);
    const { updateFarmerData } = useFarmer();
    const [showAddFarmModal, setShowAddFarmModal] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [locationAddress, setLocationAddress] = useState('');
    const { t } = useTranslation(); // Add useTranslation hook
    const [newFarmData, setNewFarmData] = useState({
        farmName: '',
        farmLocation: '',
        farmSize: '',
        mainCrops: ''
    });
    const [isUploading, setIsUploading] = useState(false);
    const [profileImage, setProfileImage] = useState(harvester);

    const handleLocationSelect = async (location) => {
        setSelectedLocation(location);
        const address = await getAddressFromCoordinates(location.lat, location.lng);
        setLocationAddress(address);
    };

    const loadFarmerProfile = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getFarmerProfile();
            
            // تحويل المواقع إلى عناوين
            let farms = Array.isArray(data.farms) ? 
                [...(data.farmDetails ? [data.farmDetails] : []), ...data.farms] : 
                data.farmDetails ? [data.farmDetails] : [];

            // تحويل إحداثيات كل مزرعة إلى عنوان
            for (let farm of farms) {
                if (farm.farmLocation) {
                    const [lat, lng] = farm.farmLocation.split(',').map(coord => parseFloat(coord.trim()));
                    if (!isNaN(lat) && !isNaN(lng)) {
                        farm.farmLocationText = await getAddressFromCoordinates(lat, lng);
                    }
                }
            }
            
            setFarmer({
                ...data,
                name: data.name,
                contact: {
                    email: data.email,
                    phone: data.phone,
                    location: data.location || ''
                },
                farms
            });
            setError(null);
        } catch (error) {
            console.error('Error loading profile:', error);
            setError(error.message);
            if (error.message.includes('unauthorized')) {
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        loadFarmerProfile();
    }, [loadFarmerProfile]);

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to logout?')) {
            authLogout(); // Use the auth utility function instead of just clearing storage
        }
    };

    const handleProfileImageUpload = async (e) => {
        try {
            const file = e.target.files[0];
            if (!file) return;
            
            setIsUploading(true);
            const response = await uploadProfileImage(file);
            toast.success('Profile photo updated successfully');
            
            // Refresh user data to ensure we have the latest profile image
            const userData = await getFarmerProfile();
            
            // Update local state with the new image URL
            setProfileImage(getImageUrl(response.imageUrl));
            
            // Force refresh of components that might be using the profile image
            // This is important to update UI components that use the image
            setIsUploading(false);
        } catch (error) {
            console.error('Error uploading profile image:', error);
            toast.error('Failed to update profile photo');
            setIsUploading(false);
        }
    };

    const handleAddFarm = async (e) => {
        e.preventDefault();
        try {
            if (!selectedLocation) {
                toast.error(t('registration.selectLocation'));
                return;
            }

            const mainCrops = newFarmData.mainCrops
                .split(',')
                .map(crop => crop.trim())
                .filter(crop => crop.length > 0);

            const farmData = {
                ...newFarmData,
                farmLocation: `${selectedLocation.lat},${selectedLocation.lng}`,
                farmLocationText: locationAddress,
                farmSize: parseFloat(newFarmData.farmSize),
                mainCrops
            };

            await addNewFarm(farmData);
            toast.success(t('registration.registrationSuccess'));
            setShowAddFarmModal(false);
            setSelectedLocation(null);
            setLocationAddress('');
            loadFarmerProfile();
        } catch (error) {
            toast.error(error.message || t('common.error'));
        }
    };

    if (loading) {
        return (
          <div className="min-h-screen flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        );
      }
          if (error) return (
        <div className="min-h-screen bg-green-50 flex flex-col items-center justify-center p-4">
            <div className="text-red-500 text-center mb-4">{error}</div>
            <button
                onClick={() => {
                    setError(null);
                    setLoading(true);
                    loadFarmerProfile();
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
                Try Again
            </button>
        </div>
    );
    if (!farmer) return null;

    return (
        <div className="min-h-screen bg-green-50 p-6 mt-16 pb-24">
            <div className="max-w-4xl mx-auto">
               {/* Profile Header */}
                <div className="bg-white rounded-xl shadow-lg p-3 mb-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 sm:gap-4">
                            <div className="relative">
                                <img
                                    src={farmer.profileImage ? getImageUrl(farmer.profileImage) : harvester}
                                    alt={t('common.profile')}
                                    className="w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-full object-cover border-2 sm:border-4 border-green-500"
                                />
                                <label className="absolute bottom-0 right-0 bg-green-600 rounded-full p-1.5 sm:p-2 cursor-pointer hover:bg-green-700 transition-colors">
                                    <Camera className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleProfileImageUpload}
                                    />
                                </label>
                            </div>
                            <div>
                                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">{farmer.name}</h1>
                                <p className="text-sm sm:text-base text-gray-600">{t('common.profile')}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-1 sm:gap-2 text-red-500 hover:text-red-600 text-sm sm:text-base"
                        >
                            <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                            {t('common.logout')}
                        </button>
                    </div>
                </div>
                
                {/* Contact Information */}
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                        <h2 className="text-xl font-semibold mb-4">{t('farmer.profile.contact_info')}</h2>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Mail className="w-5 h-5 text-green-600" />
                                <span>{farmer.contact.email}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone className="w-5 h-5 text-green-600" />
                                <span>{farmer.contact.phone}</span>
                            </div>
                        </div>
                    </div>

                    {/* Farms Section */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold">{t('farmer.profile.my_farms')}</h2>
                            <button
                                onClick={() => setShowAddFarmModal(true)}
                                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                            >
                                <Plus className="w-5 h-5" />
                                {t('farmer.profile.add_new_farm')}
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {farmer?.farms?.map((farm, index) => (
                                <div key={index} className="bg-green-50 rounded-lg p-6 border border-green-200">
                                    <h3 className="text-lg font-semibold text-green-800 mb-4">{farm.farmName}</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-green-600" />
                                            <span className="text-gray-700">{farm.farmLocationText || farm.farmLocation}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Wheat className="w-4 h-4 text-green-600" />
                                            <span className="text-gray-700">{farm.farmSize} {t('farmer.profile.acres')}</span>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 mb-2">{t('farmer.profile.main_crops')}:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {farm.mainCrops?.map((crop, cropIndex) => (
                                                    <span
                                                        key={cropIndex}
                                                        className="bg-green-200 text-green-800 px-3 py-1 rounded-full text-sm"
                                                    >
                                                        {crop}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Add Farm Modal */}
                {showAddFarmModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 overflow-hidden">
                        <div className="flex min-h-screen items-center justify-center p-2 sm:p-4 pb-20">
                            <div className="bg-white rounded-xl w-full max-w-3xl max-h-[85vh] flex flex-col my-2">
                                <div className="p-3 sm:p-6 border-b">
                                    <h2 className="text-xl sm:text-2xl font-bold">{t('farmer.profile.add_new_farm')}</h2>
                                </div>
                                
                                <div className="overflow-y-auto flex-1 p-3 sm:p-6">
                                    <form onSubmit={handleAddFarm} className="space-y-3 sm:space-y-4">
                                        <div className="grid grid-cols-1 gap-4 sm:gap-6">
                                            <div className="space-y-3 sm:space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        {t('farmer.profile.farm_name')}
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={newFarmData.farmName}
                                                        onChange={(e) => setNewFarmData({ ...newFarmData, farmName: e.target.value })}
                                                        className="w-full px-3 sm:px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                                                        required
                                                        minLength={2}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        {t('farmer.profile.farm_size')} ({t('farmer.profile.acres')})
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={newFarmData.farmSize}
                                                        onChange={(e) => setNewFarmData({ ...newFarmData, farmSize: e.target.value })}
                                                        className="w-full px-3 sm:px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                                                        required
                                                        min="0"
                                                        step="0.1"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        {t('farmer.profile.main_crops')} (comma separated)
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={newFarmData.mainCrops}
                                                        onChange={(e) => setNewFarmData({ ...newFarmData, mainCrops: e.target.value })}
                                                        className="w-full px-3 sm:px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                                                        required
                                                        placeholder="wheat, corn, rice"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    {t('farmer.profile.select_location')}
                                                </label>
                                                <div className="h-[200px] sm:h-[300px] rounded-lg overflow-hidden border border-gray-300">
                                                    <MapContainer
                                                        center={[30.0444, 31.2357]}
                                                        zoom={6}
                                                        style={{ height: '100%', width: '100%' }}
                                                    >
                                                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                                        <LocationPicker onLocationSelect={handleLocationSelect} />
                                                        {selectedLocation && (
                                                            <Marker position={[selectedLocation.lat, selectedLocation.lng]} />
                                                        )}
                                                    </MapContainer>
                                                </div>
                                                {locationAddress && (
                                                    <p className="text-xs sm:text-sm text-green-600 mt-2">
                                                        Selected location: {locationAddress}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </form>
                                </div>

                                <div className="border-t p-3 sm:p-6">
                                    <div className="flex justify-end gap-2 sm:gap-4">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowAddFarmModal(false);
                                                setSelectedLocation(null);
                                            }}
                                            className="px-3 sm:px-4 py-2 text-gray-600 hover:text-gray-800"
                                        >
                                            {t('farmer.order_form.cancel')}
                                        </button>
                                        <button
                                            type="submit"
                                            onClick={handleAddFarm}
                                            className="px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                        >
                                            {t('farmer.profile.add_new_farm')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FarmerProfile;