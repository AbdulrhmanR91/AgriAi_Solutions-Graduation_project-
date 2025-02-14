import { Link, useNavigate } from 'react-router-dom';
import { useFarmer } from '../../../hooks/useFarmer';
import homeimg from "/src/assets/images/farmerhome.jpg";
import disease from '/src/assets/images/disease.png';
import farm from '/src/assets/images/farm.png';
import engineer from '/src/assets/images/engineering.png';
import user from '/src/assets/images/user.png';
import NotificationBadge from '../../common/NotificationBadge';
import { getImageUrl } from '../../../utils/apiService';

const FarmerHomePage = () => {
  const navigate = useNavigate();
  const { farmer, loading } = useFarmer();

  const handleQuickActionClick = (action) => {
    if (action === 'plantDisease') {
      navigate('/farmer/trackplants');
    } else if (action === 'tools') {
      navigate('/farmer/market');
    } else if (action === 'consult') {
      navigate('/farmer/Consult');
    }
  };

  const renderQuickAction = (action, iconSrc, label) => (
    <div 
      className="bg-white shadow-lg rounded-lg p-8 text-center border border-gray-200 cursor-pointer" 
      onClick={() => handleQuickActionClick(action)}
    >
      <div className="mx-auto w-16 h-16 text-white rounded-full">
        <img src={iconSrc} alt={`${label} Icon`} />
      </div>
      <h3 className="font-semibold text-gray-800 mt-6">{label}</h3>
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
    <div className="flex flex-col bg-gray-50 overflow-auto min-h-screen pb-16">
      {/* Header section */}
      <div className="flex justify-between items-center p-8 bg-white text-black shadow-xl">
        <button className="flex items-center space-x-4">
          <Link to="/farmer/profile">
            <div className="w-12 h-12 bg-gray-300 rounded-full">
              <img 
                src={getProfileImage(farmer?.profileImage)}
                alt="User Icon" 
                className="w-full h-full object-cover rounded-full"
              />
            </div>
          </Link>
        </button>
        <span className="text-sm sm:text-base md:text-xlg lg:text-3xl text-green-600 font-bold">
  Welcome To Agri AI Solutions
</span>

        <NotificationBadge userType="farmer" />
      </div>

      {/* Hero section */}
      <div
        className="relative bg-cover bg-center text-white"
        style={{
          backgroundImage: `url(${homeimg})`,
        }}
      >
        <div className="bg-black bg-opacity-50 min-h-[50vh] flex flex-col justify-center items-center px-10 py-20">
          <h1 className="text-5xl font-bold mb-6">Agri AI Solutions</h1>
          <p className="text-xl">
            A platform that connects farmers to nature, tools, and each other.
            Together, we grow.
          </p>
        </div>
      </div>
      

      {/* Quick action buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 px-6 mb-10 mt-4">
        {renderQuickAction('plantDisease', disease, 'Track Plants')}
        {renderQuickAction('tools', farm, 'Market')}
        {renderQuickAction('consult', engineer, 'Consult')}
      </div>
    </div>
  );
};

export default FarmerHomePage;
