import PropTypes from 'prop-types';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getExpertProfile, getImageUrl } from '../../../utils/apiService';
import disease from '/src/assets/images/disease.png';
import home from '/src/assets/images/home.png';
import box from '/src/assets/images/box.png';
import job from '/src/assets/images/company.png';
import chat from '/src/assets/images/conversation.png';
import { useExpert } from '../../../hooks/useExpert.jsx';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import '../../../styles/expert-dashboard.css';

const BottomNavigationE = ({ onTabChange }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { expert } = useExpert();
  const [activeTab, setActiveTab] = useState('');
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        await getExpertProfile();
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
      case '/expert/orders':
        setActiveTab('orders');
        break;
      case '/expert':
        setActiveTab('home');
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
      case 'orders':
        navigate('/expert/orders');
        break;
        case 'home':
        navigate('/expert');
        break;
      case 'jobs':
        navigate('/expert/jobs');
        break;
      case 'chat':
        navigate('/expert/chat');
        break;
      default:
        break;
    }
  };

  // Function to render a bottom navigation button - enhanced for responsiveness
  const renderBottomNavButton = (tab, iconSrc, label, isProfile = false) => {
    const isActive = activeTab === tab;
    
    return (
      <button
        className={`expert-nav-item ${isActive ? 'active' : ''}`}
        onClick={() => handleTabChange(tab)}
      >
        <div className="expert-nav-icon-container">
          {isProfile ? (
            <div className="expert-profile-container w-full h-full">
              <img
                src={iconSrc}
                alt={`${t(label)} Icon`}
                className="expert-nav-icon w-full h-full object-cover"
              />
            </div>
          ) : (
            <img
              src={iconSrc}
              alt={`${t(label)} Icon`}
              className="expert-nav-icon"
            />
          )}
        </div>
        <span className={`expert-nav-label ${
          isActive ? 'text-green-600' : 'text-gray-600'
        }`}>
          {t(label)}
        </span>
      </button>
    );
  };

  const getProfileImage = (imagePath) => {
    return imagePath ? getImageUrl(imagePath) : '/default-avatar.png';
  };

  // Function to toggle language
  const toggleLanguage = () => {
    const newLanguage = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLanguage);
    localStorage.setItem('preferredLanguage', newLanguage);
  };

  return (
    <>
      {/* Enhanced bottom navigation with modern styling */}
      <nav className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-green-50 via-white to-emerald-50 shadow-xl border-t border-green-100 z-[100] backdrop-blur-lg">
        <div className="max-w-screen-lg mx-auto grid grid-cols-7 gap-x-1 py-3 px-2">
          {renderBottomNavButton('profile', getProfileImage(expert?.profileImage), 'expert.common.profile', true)}
          {renderBottomNavButton('trackplants', disease, 'expert.common.track_plants')}
          {renderBottomNavButton('orders', box, 'expert.common.orders')}
          {renderBottomNavButton('home', home, 'expert.common.home')}
          {renderBottomNavButton('jobs', job, 'expert.common.jobs')}
          
          {/* Enhanced Chat button */}
          <button 
            className={`expert-nav-item ${
              location.pathname.includes('/expert/chat') ? 'active text-green-600' : 'text-gray-500'
            }`} 
            onClick={() => navigate('/expert/chat')}
          >
            <div className="expert-nav-icon-container">
              <img
                src={chat}
                alt={t('expert.common.chat')}
                className="expert-nav-icon"
              />
            </div>
            <span className={`expert-nav-label ${
              location.pathname.includes('/expert/chat') ? 'text-green-600' : 'text-gray-600'
            }`}>
              {t('expert.common.chat')}
            </span>
          </button>
          
          {/* Enhanced Language switcher */}
          <button 
            onClick={toggleLanguage}
            className="expert-nav-item bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl"
          >
            <div className="expert-nav-icon-container">
              <Globe className="w-full h-full text-green-600 transition-transform duration-300 hover:rotate-180" />
            </div>
            <span className="expert-nav-label text-green-600 font-medium">
              {i18n.language === 'ar' ? 'EN' : 'عربي'}
            </span>
          </button>
        </div>
      </nav>
    </>
  );
};

BottomNavigationE.propTypes = {
  onTabChange: PropTypes.func
};

export default BottomNavigationE;
