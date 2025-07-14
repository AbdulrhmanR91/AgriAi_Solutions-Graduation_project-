import { Link, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { getExpertProfile, getExpertOrders, getImageUrl } from '../../../utils/apiService';
import NotificationBadge from '../../features/notifications/NotificationBadge';
import recom from '/src/assets/images/recom.jpg';
import disease from "/src/assets/images/disease.png";
import hand from "/src/assets/images/handshake.png";
import salary from "/src/assets/images/salary.png";
import analytics from "/src/assets/images/analytics.png";
import user from "/src/assets/images/user.png";
import { useTranslation } from 'react-i18next';
import { MessageCircle } from 'lucide-react';
import '../../../styles/expert-dashboard.css';

const ExperthomePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [expert, setExpert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState({
    pendingOrders: 0,
    acceptedOrders: 0,
    completedOrders: 0,
    totalRevenue: 0
  });
  const [profileImage, setProfileImage] = useState('');

  // Load expert data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [profileData, ordersData] = await Promise.all([
          getExpertProfile(),
          getExpertOrders()
        ]);

        setExpert({
          ...profileData,
          profileImage: getImageUrl(profileData.profileImage)
        });
        setProfileImage(getImageUrl(profileData.profileImage));

        // Calculate dashboard statistics
        const stats = {
          pendingOrders: ordersData.filter(order => order.status === 'pending').length,
          acceptedOrders: ordersData.filter(order => order.status === 'accepted').length,
          completedOrders: ordersData.filter(order => order.status === 'completed').length,
          totalOrders: ordersData.length
        };

        setDashboardStats(stats);
      } catch (error) {
        console.error('Error loading data:', error);
        if (error.response?.status === 401) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate]);


  const StatCard = ({ icon, label, value }) => (
    <div className="expert-stat-card group">
      <div className="expert-stat-icon">
        <img src={icon} alt={`${label} Icon`} />
      </div>
      <h3 className="text-gray-800 font-semibold text-sm mb-2 text-center">{t(label)}</h3>
      <p className="text-green-600 font-bold text-xl text-center">{value}</p>
      
      {/* Decorative elements */}
      <div className="absolute top-4 right-4 w-2 h-2 bg-green-400/30 rounded-full"></div>
      <div className="absolute bottom-4 left-4 w-1 h-1 bg-emerald-400/40 rounded-full"></div>
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
    );
  }

  return (
    <div className="flex flex-col bg-gradient-to-br from-green-50 via-emerald-25 to-lime-50 overflow-auto min-h-screen pb-16">
      {/* Header section with glass morphism effect */}
      <div className="flex justify-between items-center p-6 expert-glass-effect text-black shadow-lg border-b border-white/20 expert-slide-up">
        <Link to="/expert/profile" className="group">
          <div className="relative w-14 h-14 rounded-full ring-4 ring-green-100 group-hover:ring-green-200 transition-all duration-300">
            <img 
              src={profileImage || user}
              alt={t('expert.common.profile')} 
              className="w-full h-full object-cover rounded-full shadow-lg"
              onError={(e) => {
                  e.target.src = user;
                  e.target.onerror = null;
              }}
            />
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-green-400/20 to-emerald-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
        </Link>
        
        <div className="text-center">
          <span className="text-lg font-bold expert-gradient-text tracking-wide">
            {t('expert.home.welcome')}
          </span>
          <p className="text-sm text-green-600 font-semibold">{expert?.name || t('common.user')}</p>
          <div className="w-20 h-1 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full mx-auto mt-1"></div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <NotificationBadge userType="expert" />
          </div>
          <button 
            onClick={() => navigate('/expert/chat')} 
            className="p-3 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 text-green-600 hover:from-green-200 hover:to-emerald-200 hover:scale-110 focus:outline-none transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <MessageCircle className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      {/* Hero section with enhanced design */}
      <div className="relative overflow-hidden">
        <div className="relative bg-cover bg-center text-white" style={{ backgroundImage: `url(${recom})` }}>
          <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-green-900/40 to-emerald-900/50"></div>
          <div className="relative min-h-[50vh] flex flex-col justify-center items-center px-8 py-20">
            <div className="text-center max-w-4xl expert-slide-up">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                <span className="bg-gradient-to-r from-white via-green-100 to-emerald-100 bg-clip-text text-transparent">
                  {t('common.appTitle')}
                </span>
              </h1>
              <div className="w-32 h-1 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full mx-auto mb-6"></div>
              <p className="text-xl text-green-100 font-light leading-relaxed">
                {t('expert.home.subtitle')}
              </p>
            </div>
          </div>
          
          {/* Floating particles effect */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="expert-floating-particle absolute top-1/4 left-1/4 w-2 h-2 bg-green-300/30 rounded-full"></div>
            <div className="expert-floating-particle absolute top-1/3 right-1/3 w-1 h-1 bg-emerald-300/40 rounded-full"></div>
            <div className="expert-floating-particle absolute bottom-1/4 left-1/3 w-3 h-3 bg-lime-300/20 rounded-full"></div>
          </div>
        </div>
      </div>
     
      {/* Dashboard Grid with enhanced cards */}
      <div className="px-6 -mt-8 relative z-10">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="expert-slide-up-delay-1">
            <StatCard 
              icon={disease}
              label="expert.home.pending_orders"
              value={dashboardStats.pendingOrders}
            />
          </div>
          <div className="expert-slide-up-delay-2">
            <StatCard 
              icon={hand}
              label="expert.home.active_orders"
              value={dashboardStats.acceptedOrders}
            />
          </div>
          <div className="expert-slide-up-delay-3">
            <StatCard 
              icon={salary}
              label="expert.home.completed"
              value={dashboardStats.completedOrders}
            />
          </div>
        </div>

        {/* Action Buttons with modern design */}
        <div className="space-y-6 px-4 mt-8">
          <button 
            onClick={() => navigate('/expert/jobs')}
            className="w-full h-16 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xl font-medium rounded-3xl shadow-xl flex items-center justify-between px-8 hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
          >
            <span className="ml-4">{t('expert.home.find_opportunities')}</span>
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <span className="text-white text-2xl font-bold">+</span>
            </div>
          </button>
          
          <button 
            onClick={() => navigate('/expert/orders')}
            className="w-full h-16 bg-white/90 backdrop-blur-sm text-green-600 text-xl font-medium rounded-3xl shadow-xl flex items-center justify-between px-8 border border-green-200 hover:bg-white hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
          >
            <span className="ml-4">{t('expert.home.view_orders')}</span>
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
              <img src={analytics} alt={t('expert.home.view_orders')} className="w-6 h-6 filter brightness-0 invert" />
            </div>
          </button>
        </div>

        {/* Additional decorative section */}
        <div className="mt-12 mb-8">
          <div className="max-w-4xl mx-auto text-center expert-slide-up-delay-3">
            <div className="expert-glass-effect rounded-3xl p-8 shadow-xl border border-white/30">
              <h2 className="text-2xl font-bold expert-gradient-text mb-4">
               {t('expert.home.share_expertise')}
              </h2>
              <p className="text-gray-600 leading-relaxed">
                {t('expert.home.share_expertise_description')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExperthomePage;