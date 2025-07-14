import { Link, useLocation } from 'react-router-dom';
import useCompany from '../../../hooks/useCompany';
import { getImageUrl } from '../../../utils/apiService';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import home from '/src/assets/images/home.png';
import wheat from '/src/assets/images/box.png';
import user from '/src/assets/images/user.png';
import market from '/src/assets/images/market.png';
import conversation from '/src/assets/images/conversation.png';
import { Globe } from 'lucide-react';
import '../../../styles/company-bottom-nav.css';

const BottomNavigationCompany = () => {
    const { t, i18n } = useTranslation();
    
    // Function to toggle language
    const toggleLanguage = () => {
        const newLanguage = i18n.language === 'ar' ? 'en' : 'ar';
        i18n.changeLanguage(newLanguage);
        localStorage.setItem('preferredLanguage', newLanguage);
    };

    return (
        <nav className="bottom-nav fixed bottom-0 left-0 right-0 z-50 px-2 py-2 safe-area-pb">
            <div className="flex justify-around items-end max-w-md mx-auto">
                <NavItem 
                    to="/company/profile" 
                    icon={user} 
                    label={t('common.profile')} 
                />
                
                <NavItem 
                    to="/company/my-products" 
                    icon={wheat} 
                    label={t('common.products')} 
                />
                
                <NavItem 
                    to="/company" 
                    icon={home} 
                    label={t('common.home')} 
                    isHome={true}
                />
                
                <NavItem 
                    to="/company/market" 
                    icon={market} 
                    label={t('common.market')} 
                />
                
                <NavItem 
                    to="/company/orders" 
                    icon={conversation} 
                    label={t('common.orders')} 
                />
                
                <NavItem 
                    onClick={toggleLanguage}
                    label={i18n.language === 'ar' ? 'EN' : 'عربي'}
                    isLanguage={true}
                />
            </div>
        </nav>
    );
};

// PropTypes for NavItem component
const NavItem = ({ to, icon, label, isHome = false, onClick, isLanguage = false }) => {
    const location = useLocation();
    const { company } = useCompany();
    
    const isActive = (path) => location.pathname === path;
    const getProfileImage = (imagePath) => {
        if (!imagePath) return user;
        return getImageUrl(imagePath);
    };
    
    const active = isHome ? isActive('/company/home') || isActive('/company') : (to ? isActive(to) : false);
  
  if (isLanguage) {
    return (
      <button 
        onClick={onClick} 
        className="nav-item language-switcher flex flex-col items-center py-2 px-2 rounded-2xl m-1"
      >
        <div className="nav-icon-container w-6 h-6 flex items-center justify-center">
          <Globe className="w-4 h-4 text-gray-600 globe-icon transition-colors duration-300" />
        </div>
        <span className="nav-label text-[9px] mt-1 text-gray-600">
          {label}
        </span>
      </button>
    );
  }

  if (isHome) {
    return (
      <Link to={to} className="flex flex-col items-center py-2 px-2">
        <div className={`home-fab ${active ? 'active' : ''}`}>
          <img src={icon} alt={label} className="nav-icon" />
        </div>
        <span className={`nav-label text-[9px] mt-2 font-medium ${
          active ? 'text-green-600' : 'text-gray-600'
        }`}>
          {label}
        </span>
      </Link>
    );
  }

    const content = (
        <>
            <div className="nav-icon-container w-6 h-6 flex items-center justify-center">
                {to === '/company/profile' ? (
                    <div className="profile-container w-6 h-6 rounded-full overflow-hidden">
                        <img 
                            src={getProfileImage(company?.profileImage)} 
                            alt={label} 
                            className="nav-icon w-full h-full object-cover"
                        />
                    </div>
                ) : (
                    <img src={icon} alt={label} className="nav-icon w-full h-full object-contain" />
                )}
            </div>
            <span className={`nav-label text-[9px] mt-1 ${
                active ? 'text-green-600' : 'text-gray-600'
            }`}>
                {label}
            </span>
        </>
    );

  return (
    <Link 
      to={to} 
      className={`nav-item flex flex-col items-center py-2 px-2 rounded-2xl m-1 relative ${
        active ? 'active' : ''
      }`}
    >
      {content}
    </Link>
  );
};

NavItem.propTypes = {
    to: PropTypes.string,
    icon: PropTypes.string,
    label: PropTypes.string.isRequired,
    isHome: PropTypes.bool,
    onClick: PropTypes.func,
    isLanguage: PropTypes.bool,
};

export default BottomNavigationCompany;
