import { Link, useNavigate } from 'react-router-dom';
import harvester from '/src/assets/images/harvester.png';
import bell from "/src/assets/images/bell.png";
import homeimg from "/src/assets/images/homefimg.jpg";
import search from "/src/assets/images/search.png";
import disease from '/src/assets/images/disease.png';
import farm from '/src/assets/images/farm.png';
import engineer from '/src/assets/images/engineering.png';

const FarmerHomePage = () => {
  const navigate = useNavigate();

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
  <div className="bg-white shadow-lg rounded-lg p-8 text-center border border-gray-200 cursor-pointer" 
  onClick={() => handleQuickActionClick(action)} > <div className="mx-auto w-16 h-16 text-white rounded-full"> 
  <img src={iconSrc} alt={`${label} Icon`} />
   </div> <h3 className="font-semibold text-gray-800 mt-6">{label}</h3>
   </div> );

  return (
    <div className="flex flex-col bg-gray-50 overflow-auto min-h-screen pb-16">
      {/* Header section */}
      <div className="flex justify-between items-center p-8 bg-white text-black shadow-xl">
        <button className="flex items-center space-x-4">
          <Link to="/farmer/profile">
            <div className="w-12 h-12 bg-gray-300 rounded-full">
              <img src={harvester} alt="user Icon" />
            </div>
          </Link>
          <span className="text-2xl text-green-600 font-bold">Welcome Abdulrhman</span>
        </button>
        <button className="relative">
          <Link to="/farmer/notifications">
            <div className="w-10 h-10 rounded-full">
              <img src={bell} alt="notification Icon" />
            </div>
          </Link>
          <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full px-2 py-0.5 text-sm">3</span>
        </button>
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

      {/* Search bar */}
      <div className="flex justify-center my-10 px-6">
        <div className="relative w-full max-w-3xl">
          <input 
            type="text" 
            placeholder="Search for Products, Services, Or Experts..."
            className="w-full px-6 py-4 pl-14 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-400 text-lg"
          />
          <div className="absolute left-6 top-1/2 -translate-y-1/2">
            <img src={search} alt="Search Icon" className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Quick action buttons */}
<div className="grid grid-cols-1 sm:grid-cols-3 gap-8 px-6 mb-10">
  {renderQuickAction('plantDisease', disease, 'Plant Disease')}
  {renderQuickAction('tools', farm, 'Tools')}
  {renderQuickAction('consult', engineer, 'Consult')}
</div>

    </div>
  );
};

export default FarmerHomePage;
