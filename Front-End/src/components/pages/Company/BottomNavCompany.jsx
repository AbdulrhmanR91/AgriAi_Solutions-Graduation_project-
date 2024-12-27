import PropTypes from 'prop-types';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState, useMemo } from 'react';
import profileIcon from '/src/assets/images/company.png';
import marketIcon from '/src/assets/images/market.png';
import homeIcon from '/src/assets/images/home.png';
import box from '/src/assets/images/box.png';

const BottomNavigation = ({ onTabChange }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('');

  // Navigation items configuration
  const navigationItems = useMemo(() => [
    {
      tab: 'profile',
      icon: profileIcon,
      label: 'Profile',
      path: '/company/profile'
    },
    {
      tab: 'market',
      icon: marketIcon,
      label: 'Market',
      path: '/company/market'
    },
    {
      tab: 'home',
      icon: homeIcon,
      label: 'Home',
      path: '/company'
    },
    {
      tab: 'orders',
      icon: box,
      label: 'Orders',
      path: '/company/orders'
    }
  ], []);

  // Update active tab based on current route
  useEffect(() => {
    const currentPath = location.pathname;
    const matchingItem = navigationItems.find(item => item.path === currentPath);
    if (matchingItem) {
      setActiveTab(matchingItem.tab);
      onTabChange(matchingItem.tab);
    }
  }, [location, navigationItems, onTabChange]);

  // Handle navigation and tab change
  const handleNavigation = (item) => {
    setActiveTab(item.tab);
    onTabChange(item.tab);
    navigate(item.path);
  };

  // Render nav button with consistent styling
  const renderNavButton = (item) => (
    <button
      key={item.tab}
      className={`flex flex-col items-center justify-center ${
        activeTab === item.tab ? 'text-green-600' : 'text-gray-500'
      }`}
      onClick={() => handleNavigation(item)}
    >
      <img 
        src={item.icon} 
        alt={`${item.label} Icon`} 
        className="w-6 h-6 mb-1"
      />
      <span className="text-xs">{item.label}</span>
      {activeTab === item.tab && (
        <div className="h-1 w-8 bg-green-500 mt-1 rounded-full" />
      )}
    </button>
  );

  return (
    <>
    <div className="pb-20" />
    <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200">
      <div className="max-w-screen-xl mx-auto grid grid-cols-4 py-4 px-4">
        {navigationItems.map(item => renderNavButton(item))}
      </div>
    </nav>

    </>
  );
};

BottomNavigation.propTypes = {
  onTabChange: PropTypes.func.isRequired,
};

export default BottomNavigation;