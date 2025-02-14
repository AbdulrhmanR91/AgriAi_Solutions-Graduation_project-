import { Link, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { getExpertProfile, getExpertOrders } from '../../../utils/apiService';
import NotificationBadge from '../../common/NotificationBadge';
import recom from '/src/assets/images/recom.jpg';
import disease from "/src/assets/images/disease.png";
import hand from "/src/assets/images/handshake.png";
import salary from "/src/assets/images/salary.png";
import analytics from "/src/assets/images/analytics.png";
import user from "/src/assets/images/user.png";

const ExperthomePage = () => {
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
    
    const BASE_URL = 'https://dark-gennifer-abdulrhman-5d081501.koyeb.app';
    const getImageUrl = (imagePath) => {
        if (!imagePath) return user;
        if (imagePath.startsWith('http')) return imagePath;
        return `${BASE_URL}${imagePath}`;
    };



  // تحميل بيانات الخبير
  useEffect(() => {
    const loadData = async () => {
      try {
        const [profileData, ordersData] = await Promise.all([
          getExpertProfile(),
          getExpertOrders()
        ]);
        const data = await getExpertProfile();

        
        setExpert({
          ...profileData,
          profileImage: getImageUrl(profileData.profileImage)
        });
        setProfileImage(getImageUrl(data.profileImage));

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
    <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-100">
      <div className="flex flex-col items-center space-y-2">
        <div className="w-12 h-12">
          <img src={icon} alt={`${label} Icon`} className="w-full h-full object-contain" />
        </div>
        <h3 className="text-gray-800 font-medium text-sm">{label}</h3>
        <p className="text-green-500 font-semibold">{value}</p>
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
          <Link to="/expert/profile">
            <div className="w-10 h-10 bg-white rounded-full overflow-hidden">
              <img 
                src={profileImage || user}
                alt="Expert Profile" 
                className="w-full h-full object-cover"
                onError={(e) => {
                    e.target.src = user;
                    e.target.onerror = null;
                }}
              />
            </div>
          </Link>
          <span className="text-xl text-black-600 font-bold">Welcome,</span> 
          <p className="text-xl text-green-600 font-bold">Eng.{expert?.name || 'User'}</p>
        </button>
        <button className="relative">
          <NotificationBadge userType="expert" />
        </button>
      </div>

      {/* Hero section */}
      <div className="relative bg-cover bg-center text-white" style={{ backgroundImage: `url(${recom})` }}>
        <div className="bg-black bg-opacity-50">
          <div className="container mx-auto px-6 py-36 text-center">
            <h1 className="text-6xl font-bold mb-4">Agri AI Solutions</h1>
            <p className="text-xl mt-4">
            A platform for agricultural engineers that unites technology and nature. Together, we provide you with job opportunities, innovate, and grow
            </p>
          </div>
        </div>
      </div>
      <div className="flex justify-center my-6 px-4">
        </div>
     

   {/* Dashboard Grid */}
   <div className="px-4 mb-24 pb-24">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <StatCard 
            icon={disease}
            label="Pending Orders"
            value={dashboardStats.pendingOrders}
          />
          <StatCard 
            icon={hand}
            label="Active Orders"
            value={dashboardStats.acceptedOrders}
          />
          <StatCard 
            icon={salary}
            label="Completed"
            value={dashboardStats.completedOrders}
          />
        </div>

       {/* Action Buttons */}
        <div className="space-y-6 px-4">
          <button 
            onClick={() => navigate('/expert/jobs')}
            className="w-full h-16 bg-green-500 text-white text-xl font-medium rounded-full shadow-lg flex items-center justify-between px-8"
            style={{
              backgroundColor: '#4CD964',
              boxShadow: '0 8px 16px rgba(76, 217, 100, 0.2)'
            }}
          >
            <span className="ml-4">Find New Opportunities</span>
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <span className="text-green-500 text-2xl font-bold">+</span>
            </div>
          </button>
          
          <button 
            onClick={() => navigate('/expert/orders')}
            className="w-full h-16 bg-white text-green-500 text-xl font-medium rounded-full shadow-lg flex items-center justify-between px-8"
          >
            <span className="ml-4">View Orders</span>
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
              <img src={analytics} alt="View Orders" className="w-6 h-6" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExperthomePage;