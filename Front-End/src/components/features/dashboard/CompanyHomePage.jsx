import { Link, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import BottomNavigationCompany from '../../shared/navigation/BottomNavCompany';
import { useState, useEffect } from 'react';
import company from "/src/assets/images/company.png";
import NotificationBadge from '../../features/notifications/NotificationBadge';
import companyh from '/src/assets/images/companyhomepagebg.jpg';
import cargo from "/src/assets/images/cargo.png";
import hand from '/src/assets/images/handshake.png';
import salary from '/src/assets/images/salary.png';
import analytics from '/src/assets/images/analytics.png';
import { getUserProfile, getCompanyOrders } from '../../../utils/apiService';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import '../../../styles/company-dashboard.css';
import '../../../styles/company-bottom-nav.css';

const BASE_URL = 'http://localhost:5000/';

const CompanyHomePage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(); // Add useTranslation hook
  const [activeTab, setActiveTab] = useState('home');
  const [companyData, setCompanyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState({
    newOrders: 0,
    activeClients: 0,
    revenue: 0
  });

  useEffect(() => {
    loadCompanyData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadCompanyData = async () => {
    try {
      setLoading(true);
      
      // جلب معلومات الملف الشخصي
      const profileResponse = await getUserProfile();
      if (profileResponse) {
        setCompanyData(profileResponse);
      }

      // جلب الطلبات وتحديث الإحصائيات
      await updateDashboardStats();

    } catch (error) {
      console.error('فشل في تحميل بيانات الشركة:', error);
      toast.error('فشل في تحميل بيانات الشركة');
    } finally {
      setLoading(false);
    }
  };

  const updateDashboardStats = async () => {
    try {
      const ordersResponse = await getCompanyOrders();
      if (ordersResponse.data) {
        const orders = ordersResponse.data;
        // حساب الإحصائيات
        const stats = {
          newOrders: orders.filter(order => order.status === 'pending' || order.status === 'processing').length,
          activeClients: [...new Set(orders.filter(order => order.buyer).map(order => order.buyer._id))].length,
          revenue: orders
            .filter(order => order.status === 'delivered')
            .reduce((sum, order) => sum + (Number(order.totalPrice) || 0), 0)
        };
        setDashboardStats(stats);
      }
    } catch (err) {
      console.error('Failed to update dashboard stats:', err);
      setDashboardStats({
        newOrders: 0,
        activeClients: 0,
        revenue: 0
      });
    }
  };

  // تحديث الإحصائيات كل 5 دقائق
  useEffect(() => {
    const interval = setInterval(updateDashboardStats, 300000); // 5 minutes
    return () => clearInterval(interval);
  }, []);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return company;
    if (imagePath.startsWith('http')) return imagePath;
    
    // Remove any leading slash from imagePath to prevent double slashes
    const normalizedPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
    return `${BASE_URL}${normalizedPath}`;
  };

  const StatCard = ({ icon, label, value }) => (
    <div className="company-stat-card company-slide-up group">
      <div className="flex flex-col items-center space-y-3">
        <div className="company-stat-icon group-hover:scale-110 transition-transform duration-300">
          <img src={icon} alt={`${label} Icon`} className="w-full h-full object-contain filter drop-shadow-lg" />
        </div>
        <h3 className="text-gray-800 font-semibold text-sm text-center leading-tight group-hover:text-green-700 transition-colors duration-300">{label}</h3>
        <p className="text-green-600 font-bold text-xl group-hover:scale-105 transition-transform duration-300">
          {label === 'Revenue' ? `EGP ${value.toLocaleString()}` : value}
        </p>
      </div>
    </div>
  );

  StatCard.propTypes = {
    icon: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );  }

  return (
    <div className="flex flex-col bg-gradient-to-br from-green-50 via-emerald-25 to-lime-50 overflow-auto min-h-screen pb-24">
      {/* Enhanced Header section with glass morphism */}
      <div className="flex justify-between items-center p-6 company-glass-effect text-black shadow-lg border-b border-white/20 company-slide-up">
        <Link to="/company/profile" className="group">
          <div className="relative w-14 h-14 rounded-full ring-4 ring-green-100 group-hover:ring-green-200 transition-all duration-300">
            <img 
              src={getImageUrl(companyData?.profileImage)} 
              alt="Company Logo" 
              className="w-full h-full object-cover rounded-full shadow-lg"
            />
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-green-400/20 to-emerald-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
        </Link>
        
        <div className="text-center">
          <span className="text-lg font-bold company-gradient-text tracking-wide">
            {t('common.welcome')}
          </span>
          <p className="text-sm text-green-600 font-semibold">{companyData?.name || t('common.user')}</p>
          <div className="w-20 h-1 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full mx-auto mt-1"></div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <NotificationBadge userType="company" />
          </div>
        </div>
      </div>

      {/* Enhanced Hero section with parallax effect */}
      <div className="relative bg-cover bg-center text-white overflow-hidden" style={{ backgroundImage: `url(${companyh})` }}>
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-green-900/40 to-emerald-900/50"></div>
        <div className="relative min-h-[45vh] flex flex-col justify-center items-center px-8 py-20">
          <div className="text-center max-w-4xl company-slide-up">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              {t('common.appTitle')}
            </h1>
            <p className="text-xl mb-6 leading-relaxed">
              {t('company.subtitle')}
            </p>
            {companyData?.companyDetails?.description && (
              <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <p className="text-lg text-white/90">
                  {companyData.companyDetails.description}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Dashboard Grid with better spacing */}
      <div className="px-6 -mt-8 relative z-10">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="expert-slide-up-delay-1">
          <StatCard 
            icon={cargo}
            label={t('company.newOrders')}
            value={dashboardStats.newOrders}
          />
                    </div>
          <div className="expert-slide-up-delay-2">
          <StatCard 
            icon={hand}
            label={t('company.activeClients')}
            value={dashboardStats.activeClients}
          />
          </div>
          <div className="expert-slide-up-delay-3">
          <StatCard 
            icon={salary}
            label={t('company.revenue')}
            value={dashboardStats.revenue}
          />
          </div>
        </div>

        {/* Enhanced Action Buttons with modern design */}
        <div className="space-y-6 px-2 pb-8">
          <button 
            onClick={() => navigate('/company/market')}
            className="w-full h-16 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xl font-medium rounded-3xl shadow-xl flex items-center justify-between px-8 hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
          >
            <span className="ml-4 company-text-shadow">{t("company.addProducts")}</span>
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <span className="text-white text-2xl font-bold">+</span>
            </div>
          </button>
          
          <button 
            onClick={() => navigate('/company/orders')}
            className="w-full h-16 bg-white text-green-600 text-xl font-medium rounded-3xl shadow-xl border-2 border-green-200 flex items-center justify-between px-8 hover:bg-green-50 hover:border-green-300 hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
          >
            <span className="ml-4 company-text-shadow">{t("company.viewOrders")}</span>
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
              <img 
                src={analytics}
                alt="View Orders" 
                className="w-6 h-6 filter brightness-0 invert"
              />
            </div>
          </button>
        </div>
      </div>
      <BottomNavigationCompany activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default CompanyHomePage;