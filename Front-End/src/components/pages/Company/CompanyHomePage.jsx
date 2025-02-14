import { Link, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import BottomNavigation from './BottomNavCompany';
import { useState, useEffect } from 'react';
import company from "/src/assets/images/company.png";
import NotificationBadge from '../../common/NotificationBadge';
import companyh from '/src/assets/images/companyhomepagebg.jpg';
import cargo from "/src/assets/images/cargo.png";
import hand from '/src/assets/images/handshake.png';
import salary from '/src/assets/images/salary.png';
import analytics from '/src/assets/images/analytics.png';
import { getUserProfile, getCompanyOrders } from '../../../utils/apiService';
import toast from 'react-hot-toast';

const BASE_URL = 'https://dark-gennifer-abdulrhman-5d081501.koyeb.app';

const CompanyHomePage = () => {
  const navigate = useNavigate();
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
    } catch (error) {
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
    return `${BASE_URL}${imagePath}`;
  };

  const StatCard = ({ icon, label, value }) => (
    <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-100">
      <div className="flex flex-col items-center space-y-2">
        <div className="w-12 h-12">
          <img src={icon} alt={`${label} Icon`} className="w-full h-full object-contain" />
        </div>
        <h3 className="text-gray-800 font-medium text-sm">{label}</h3>
        <p className="text-green-500 font-semibold">
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
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header section */}
      <div className="flex justify-between items-center p-6 bg-white text-black">
        <button className="flex items-center space-x-3">
          <Link to="/company/profile">
            <div className="w-10 h-10 bg-white rounded-full overflow-hidden">
              <img 
                src={getImageUrl(companyData?.profileImage)} 
                alt="Company Logo" 
                className="w-full h-full object-cover"
              />
            </div>
          </Link>
          <span className="text-xl text-black-600 font-bold">Welcome,</span> 
          <p className="text-xl text-green-600 font-bold">{companyData?.name || 'Company'}</p>
        </button>
        <NotificationBadge userType="company" />
      </div>

      {/* Hero section */}
      <div className="relative bg-cover bg-center text-white" style={{ backgroundImage: `url(${companyh})` }}>
        <div className="bg-black bg-opacity-50">
          <div className="container mx-auto px-6 py-36 text-center">
            <h1 className="text-6xl font-bold mb-4">Agri AI Solutions</h1>
            <p className="text-xl mt-4">
              A platform that connects your company to farmers, nature, and technology. Together, we innovate and grow.
            </p>
            {companyData?.companyDetails?.description && (
              <p className="text-lg mt-4 bg-black bg-opacity-50 p-4 rounded-lg">
                {companyData.companyDetails.description}
              </p>
            )}
          </div>
        </div>
      </div>

      

      {/* Dashboard Grid */}
      <div className="px-4 mb-6 mt-6">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <StatCard 
            icon={cargo}
            label="New Orders"
            value={dashboardStats.newOrders}
          />
          <StatCard 
            icon={hand}
            label="Active Clients"
            value={dashboardStats.activeClients}
          />
          <StatCard 
            icon={salary}
            label="Revenue"
            value={dashboardStats.revenue}
          />
        </div>

        {/* Action Buttons */}
        <div className="space-y-6 px-4">
          <button 
            onClick={() => navigate('/company/market')}
            className="w-full h-16 bg-green-500 text-white text-xl font-medium rounded-full shadow-lg flex items-center justify-between px-8 relative overflow-hidden hover:bg-green-600 transition-colors"
          >
            <span className="ml-4">Add Products</span>
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <span className="text-green-500 text-2xl font-bold">+</span>
            </div>
          </button>
          
          <button 
            onClick={() => navigate('/company/orders')}
            className="w-full h-16 bg-white text-green-500 text-xl font-medium rounded-full shadow-lg flex items-center justify-between px-8 hover:bg-gray-50 transition-colors"
          >
            <span className="ml-4">View Orders</span>
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
              <img 
                src={analytics}
                alt="View Orders" 
                className="w-6 h-6"
              />
            </div>
          </button>
        </div>
      </div>
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default CompanyHomePage;