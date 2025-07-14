import { useNavigate, Link, Outlet } from 'react-router-dom';
import { useState } from 'react';
import { 
  Home, Users, FileText, 
  LogOut, Menu, X, User,
  Globe
} from 'lucide-react';
import PropTypes from 'prop-types';
import logo from '/src/assets/images/logor2.png';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const [activeMenu, setActiveMenu] = useState('dashboard');
  
  const handleLogout = () => {
    if (window.confirm(t('Admin.ConfirmBlockAction', { action: t('Admin.Logout').toLowerCase() }))) {
      localStorage.removeItem('adminToken');
      navigate('/admin/login');
    }
  };

  const menuItems = [
    { id: 'dashboard', label: t('Admin.Dashboard'), icon: <Home size={20} />, path: '/admin/dashboard' },
    { id: 'users', label: t('Admin.Users'), icon: <Users size={20} />, path: '/admin/users' },
    { id: 'orders', label: t('Admin.Orders'), icon: <FileText size={20} />, path: '/admin/orders' },
  ];

  // Function to toggle language
  const toggleLanguage = () => {
    const newLanguage = isRTL ? 'en' : 'ar';
    i18n.changeLanguage(newLanguage);
    localStorage.setItem('preferredLanguage', newLanguage);
  };
  
  // Effect to handle RTL direction when language is Arabic
  useEffect(() => {
    // Set document direction based on language
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    
    // Add/remove RTL class on the document body for additional styling
    if (isRTL) {
      document.body.classList.add('rtl');
    } else {
      document.body.classList.remove('rtl');
    }
  }, [i18n.language, isRTL]);

  return (
    <div className={`fixed inset-y-0 ${isRTL ? 'right-0' : 'left-0'} z-50 w-64 bg-green-800 text-white transform ${
      isOpen 
        ? 'translate-x-0' 
        : isRTL ? 'translate-x-full' : '-translate-x-full'
      } transition-transform duration-300 md:translate-x-0`}>
      <div className="flex items-center justify-between p-4 border-b border-green-700">
        <div className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-2`}>
          <img src={logo} alt="AgriAI Solutions" className="h-8" />
          <span className="font-bold text-xl">{t('Admin.Admin Panel')}</span>
        </div>
        <button onClick={toggleSidebar} className="md:hidden">
          <X size={24} />
        </button>
      </div>
      <div className="p-4">
        <nav className="space-y-2">
          {menuItems.map(item => (
            <Link
              key={item.id}
              to={item.path}
              className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-3 p-3 rounded-lg transition-colors ${
                activeMenu === item.id ? 'bg-green-700 text-white' : 'text-gray-300 hover:bg-green-700 hover:text-white'
              }`}
              onClick={() => setActiveMenu(item.id)}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
          
          {/* Language Switcher - updated to match nav item style */}
          <button
            onClick={toggleLanguage}
            className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-3 p-3 rounded-lg transition-colors w-full text-gray-300 hover:bg-green-700 hover:text-white`}
          >
            <Globe size={20} />
            <span>{isRTL ? 'English' : 'العربية'}</span>
          </button>
          
          {/* Logout button */}
          <button
            onClick={handleLogout}
            className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-3 text-red-400 hover:bg-red-900 hover:text-white w-full p-3 rounded-lg transition-colors mt-4`}
          >
            <LogOut size={20} />
            <span>{t('Admin.Logout')}</span>
          </button>
        </nav>
      </div>
    </div>
  );
};

const Header = ({ toggleSidebar }) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  
  return (
    <header className="bg-white shadow-sm p-4 flex justify-between items-center">
      <div className="flex items-center">
        <button onClick={toggleSidebar} className={`md:hidden ${isRTL ? 'ml-4' : 'mr-4'}`}>
          <Menu size={24} />
        </button>
        <h1 className="text-xl font-semibold text-gray-800">{t('Admin.Dashboard')}</h1>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative">
          <button className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-2 hover:bg-gray-100 transition-colors p-2 rounded-lg`}>
            <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center">
              <User size={16} />
            </div>
            <span className="text-sm font-medium">{t('Admin.Admin')}</span>
          </button>
        </div>
      </div>
    </header>
  );
};

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Define classes for the main content area
  // Base classes
  // Removed overflow-auto from here; it's better on the <main> tag for content like charts.
  let mainContentClasses = 'flex-1 transition-all duration-300'; 
  
  // Desktop margin (md screens and up)
  mainContentClasses += isRTL ? ' md:mr-64' : ' md:ml-64';

  // Mobile margin (screens smaller than md)
  // Apply only if sidebar is closed (otherwise it overlays)
  if (!sidebarOpen) {
    mainContentClasses += isRTL ? ' mr-0' : ' ml-0';
  } else {
    // When sidebar is open on mobile, content doesn't need specific margin here
    // as sidebar overlays. Ensure no conflicting mobile margins.
    // For example, if 'ml-0' or 'mr-0' were default, clear them or ensure they are not applied.
    // In this case, not adding ml-0/mr-0 is sufficient.
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      
      <div className={mainContentClasses.trim()}>
        <Header toggleSidebar={toggleSidebar} />
        {/* Added w-full and overflow-x-auto to main for better chart/content overflow handling */}
        <main className="p-4 md:p-8 w-full overflow-x-auto">
          {/* Ensure Outlet key is present to force re-mount on language change */}
          <Outlet key={i18n.language} />
        </main>
      </div>
      
      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" 
          onClick={toggleSidebar}
        />
      )}
    </div>
  );
};

Sidebar.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  toggleSidebar: PropTypes.func.isRequired
};

Header.propTypes = {
  toggleSidebar: PropTypes.func.isRequired
};

export default AdminLayout;
