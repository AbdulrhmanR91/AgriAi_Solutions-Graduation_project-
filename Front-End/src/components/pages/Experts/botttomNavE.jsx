import PropTypes from 'prop-types';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getExpertProfile } from '../../../utils/apiService';
import disease from '/src/assets/images/disease.png';
import home from '/src/assets/images/home.png';
import box from '/src/assets/images/box.png';
import job from '/src/assets/images/company.png';

const BottomNavigationE = ({ onTabChange }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('');
  const [profileImage, setProfileImage] = useState('');

  const BASE_URL = 'https://dark-gennifer-abdulrhman-5d081501.koyeb.app';
  const getImageUrl = (imagePath) => {
    if (imagePath.startsWith('http')) return imagePath;
    return `${BASE_URL}${imagePath}`;
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await getExpertProfile();
        setProfileImage(getImageUrl(profile.profileImage));
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      }
    };

    fetchProfile();
  }, []);

  // Update active tab based on current route  
  useEffect(() => {
    const path = location.pathname;
    switch (path) {
      case '/expert/profile':
        setActiveTab('profile');
        break;
      case '/expert/trackplants':
        setActiveTab('trackplants');
        break;
      case '/expert':
        setActiveTab('home');
        break;
      case '/expert/orders':
        setActiveTab('orders');
        break;
      case '/expert/jobs':
        setActiveTab('jobs');
        break;
      default:
        setActiveTab('');
        break;
    }
  }, [location]);

  // Function to handle both tab change and navigation
  const handleTabChange = (tab) => {
    if (tab === 'notification') {
      setActiveTab(''); // No active tab for notification
    } else {
      setActiveTab(tab); // Update active tab state
    }
    onTabChange?.(tab); // Notify parent component of tab change if handler exists
    
    // Perform navigation with correct paths
    switch (tab) {
      case 'profile':
        navigate('/expert/profile');
        break;
      case 'trackplants':
        navigate('/expert/trackplants');
        break;
      case 'home':
        navigate('/expert');
        break;
      case 'orders':
        navigate('/expert/orders');
        break;
      case 'jobs':
        navigate('/expert/jobs');
        break;
      default:
        break;
    }
  };

  // Function to render a bottom navigation button
  const renderBottomNavButton = (tab, iconSrc, label, isProfile = false) => (
    <button
      className={`flex flex-col items-center ${activeTab === tab ? 'text-green-600' : 'text-gray-500'}`}
      onClick={() => handleTabChange(tab)}
    >
      <img
        src={iconSrc}
        alt={`${label} Icon`}
        className={`${
          isProfile ? 'w-7 h-7 rounded-full object-cover' : 'w-7 h-7'
        }`} // فقط الصورة الشخصية ستكون دائرية
      />
      <span className="text-xs mt-1">{label}</span>
      {activeTab === tab && (
        <div className="h-1 w-8 bg-green-500 mt-1 rounded-full"></div>
      )}
    </button>
  );

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t z-10">
      <div className="mx-auto grid grid-cols-5 py-4 px-2">
        {renderBottomNavButton('profile', profileImage , 'Profile', true)}  {/* تعيين خاصية isProfile إلى true لتفعيل الشكل الدائري */}
        {renderBottomNavButton('trackplants', disease, 'Track Plants')}
        {renderBottomNavButton('home', home, 'Home')}
        {renderBottomNavButton('orders', box, 'Orders')}
        {renderBottomNavButton('jobs', job, 'Jobs')}
      </div>
    </nav>
  );
};


BottomNavigationE.propTypes = {
  onTabChange: PropTypes.func
};

export default BottomNavigationE;
