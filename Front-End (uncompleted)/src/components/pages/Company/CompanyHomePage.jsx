import { Link, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import BottomNavigation from './BottomNavCompany';
import { useState } from 'react';
const CompanyHomePage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('home');
  // Dashboard stat card component

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



  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header section */}
      <div className="flex justify-between items-center p-6 bg-white text-black">
        <button className="flex items-center space-x-3">
          <Link to="/company/profile">
            <div className="w-10 h-10 bg-white rounded-full">
              <img src="/src/assets/images/company.png" alt="user Icon" />
            </div>
          </Link>
          <span className="text-xl text-black-600 font-bold">Welcome,</span> 
          <p className="text-xl text-green-600 font-bold">Delta Agricultural Co.</p>
        </button>
        <button className="relative">
          <Link to="/company/notifications">
            <div className="w-8 h-8 rounded-full">
              <img src="/src/assets/images/bell.png" alt="notification Icon" />
            </div>
          </Link>
          <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full px-2 py-0.5 text-xs">3</span>
        </button>
      </div>

      {/* Hero section */}
      <div
  className="relative bg-cover bg-center text-white"
  style={{
    backgroundImage: `url('./src/assets/images/companyhomepagebg.jpg')`,
  }}
>
  <div className="bg-black bg-opacity-50">
    <div className="container mx-auto px-6 py-36 text-center">
      <h1 className="text-6xl font-bold mb-4">Agri AI Solutions</h1>
      <p className="text-xl mt-4">
        A platform that connects your company to farmers, nature, and
        technology. Together, we innovate and grow.
      </p>
    </div>
  </div>
</div>

      {/* Search bar */}
      <div className="flex justify-center my-6 px-4">
        <div className="relative w-full max-w-xl">
          <input 
            type="text" 
            placeholder="Search for Products, Services, Or Experts..."
            className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            <img src="/src/assets/images/search.png" alt="Search Icon" className="w-5 h-5" />
          </div>
        </div>
      </div>

        {/* Dashboard Grid */}
        <div className="px-4 mb-6">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <StatCard 
            icon="/src/assets/images/cargo.png"
            label="New Orders"
            value="12"
          />
          <StatCard 
            icon="/src/assets/images/handshake.png"
            label="Active Clients"
            value="45"
          />
          <StatCard 
            icon="/src/assets/images/conversation.png"
            label="Consultations"
            value="8"
          />
          <StatCard 
            icon="/src/assets/images/salary.png"
            label="Revenue"
            value="EGP 25K"
          />
        </div>

               {/* Action Buttons */}
               <div className="space-y-6 px-4">
          {/* Add Products Button */}
          <button 
            onClick={() => navigate('/company/market')}
            className="w-full h-16 bg-green-500 text-white text-xl font-medium rounded-full shadow-lg flex items-center justify-between px-8 relative overflow-hidden"
            style={{
              backgroundColor: '#4CD964',
              boxShadow: '0 8px 16px rgba(76, 217, 100, 0.2)'
            }}
          >
            <span className="ml-4">Add Products</span>
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <span className="text-green-500 text-2xl font-bold">+</span>
            </div>
          </button>
          
          {/* View Orders Button */}
          <button 
            onClick={() => navigate('/view-orders')}
            className="w-full h-16 bg-white text-green-500 text-xl font-medium rounded-full shadow-lg flex items-center justify-between px-8"
            style={{
              boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)'
            }}
          >
            <span className="ml-4">View Orders</span>
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
              <img 
                src="/src/assets/images/analytics.png" 
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
