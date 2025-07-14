import { Link, useNavigate } from 'react-router-dom';
import { useFarmer } from '../../../hooks/useFarmer';
import { useTranslation } from 'react-i18next'; // Add this import
import homeimg from "/src/assets/images/farmerhome.jpg";
import disease from '/src/assets/images/disease.png';
import farm from '/src/assets/images/farm.png';
import engineer from '/src/assets/images/engineering.png';
import user from '/src/assets/images/user.png';
import NotificationBadge from '../../features/notifications/NotificationBadge';
import { getImageUrl } from '../../../utils/apiService';
import { MessageCircle } from 'lucide-react';
import '../../../styles/farmer-home.css';

const FarmerHomePage = () => {
  const navigate = useNavigate();
  const { farmer, loading } = useFarmer();
  const { t } = useTranslation(); // Add useTranslation hook

  const handleQuickActionClick = (action) => {
    if (action === 'plantDisease') {
      navigate('/farmer/trackplants');
    } else if (action === 'tools') {
      navigate('/farmer/market');
    
    } else if (action === 'chat') {
      navigate('/farmer/chat');
    }
  };

  const renderQuickAction = (action, iconSrc, label, delay) => (
    <div className={`group relative slide-up-delay-${delay}`}>
      <div 
        className="action-card bg-white/90 backdrop-blur-sm shadow-xl rounded-3xl p-8 text-center border border-white/30 cursor-pointer transform transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:bg-white group-hover:-translate-y-2 ripple" 
        onClick={() => handleQuickActionClick(action)}
      >
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-emerald-50/50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        <div className="relative z-10">
          <div className="mx-auto w-20 h-20 mb-6 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl transform rotate-6 group-hover:rotate-12 transition-transform duration-500 pulse-glow"></div>
            <div className="relative bg-white rounded-2xl p-4 shadow-lg group-hover:shadow-xl transition-shadow duration-500">
              <img 
                src={iconSrc} 
                alt={`${label} Icon`} 
                className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110 icon-bounce"
              />
            </div>
          </div>
          
          <h3 className="font-bold text-lg text-gray-800 group-hover:text-green-700 transition-colors duration-300 mb-2">
            {label}
          </h3>
          
          <div className="w-12 h-1 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full mx-auto opacity-0 group-hover:opacity-100 transform scale-x-0 group-hover:scale-x-100 transition-all duration-500"></div>
        </div>
        
        {/* Subtle glow effect */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-green-400/10 to-emerald-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      </div>
    </div>
  );

  const getProfileImage = (imagePath) => {
    if (!imagePath) return user;
    return getImageUrl(imagePath);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );  }

  return (
    <div className="flex flex-col bg-gradient-to-br from-green-50 via-emerald-25 to-teal-50 overflow-auto min-h-screen pb-24 custom-scrollbar">
      {/* Header section with glass morphism effect */}
      <div className="flex justify-between items-center p-6 glass-effect text-black shadow-lg border-b border-white/20 slide-up">
        <Link to="/farmer/profile" className="group">
          <div className="relative w-14 h-14 rounded-full ring-4 ring-green-100 group-hover:ring-green-200 transition-all duration-300 morph-button">
            <img 
              src={getProfileImage(farmer?.profileImage)}
              alt={t('common.profile')}
              className="w-full h-full object-cover rounded-full shadow-lg"
            />
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-green-400/20 to-emerald-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
        </Link>
        
        <div className="text-center">
          <span className="text-lg sm:text-xl md:text-2xl lg:text-3xl gradient-text font-bold tracking-wide">
            {t('farmer.home.welcome')}
          </span>
          <div className="w-20 h-1 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full mx-auto mt-1"></div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <NotificationBadge userType="farmer" />
          </div>
          <button 
            onClick={() => navigate('/farmer/chat')} 
            className="p-3 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 text-green-600 hover:from-green-200 hover:to-emerald-200 hover:scale-110 focus:outline-none transition-all duration-300 shadow-lg hover:shadow-xl morph-button"
          >
            <MessageCircle className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Hero section with enhanced design */}
      <div className="relative overflow-hidden">
        <div
          className="relative bg-cover bg-center text-white"
          style={{
            backgroundImage: `url(${homeimg})`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-green-900/40 to-emerald-900/50"></div>
          <div className="relative min-h-[55vh] flex flex-col justify-center items-center px-8 py-24">
            <div className="text-center max-w-4xl slide-up">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 leading-tight">
                <span className="bg-gradient-to-r from-white via-green-100 to-emerald-100 bg-clip-text text-transparent">
                  {t('farmer.home.slogan')}
                </span>
              </h1>
              <div className="w-32 h-1 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full mx-auto mb-6"></div>
            </div>
          </div>
          
          {/* Floating particles effect */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="floating-particle absolute top-1/4 left-1/4 w-2 h-2 bg-green-300/30 rounded-full"></div>
            <div className="floating-particle absolute top-1/3 right-1/3 w-1 h-1 bg-emerald-300/40 rounded-full"></div>
            <div className="floating-particle absolute bottom-1/4 left-1/3 w-3 h-3 bg-teal-300/20 rounded-full"></div>
            <div className="floating-particle absolute top-1/2 right-1/4 w-2 h-2 bg-green-400/25 rounded-full"></div>
            <div className="floating-particle absolute bottom-1/3 right-1/2 w-1 h-1 bg-emerald-400/30 rounded-full"></div>
          </div>
        </div>
      </div>
      
      {/* Quick action buttons with modern card design */}
      <div className="px-6 -mt-16 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {renderQuickAction('plantDisease', disease, t('farmer.home.track_plants'), 1)}
          {renderQuickAction('tools', farm, t('farmer.home.market'), 2)}
          {renderQuickAction('chat', engineer, t('farmer.home.chat'), 3)}
        </div>
      </div>

      {/* Additional decorative section */}
      <div className="mt-16 px-6">
        <div className="max-w-4xl mx-auto text-center slide-up-delay-3">
          <div className="glass-effect rounded-3xl p-8 shadow-xl border border-white/30">
            <h2 className="text-2xl font-bold gradient-text mb-4">
              {t('farmer.home.explore_tech')}
            </h2>
            <p className="text-gray-600 leading-relaxed">
              {t('farmer.home.explore_tech_description')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmerHomePage;
