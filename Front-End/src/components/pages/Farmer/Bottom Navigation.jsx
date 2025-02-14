import { Link, useLocation } from 'react-router-dom';
import { useFarmer } from '../../../hooks/useFarmer';
import { getImageUrl } from '../../../utils/apiService';

import home from '/src/assets/images/home.png';
import wheat from '/src/assets/images/wheat.png';
import user from '/src/assets/images/user.png';
import market from '/src/assets/images/market.png';
import conversation from '/src/assets/images/conversation.png';

const BottomNavigationFarmer = () => {
    const location = useLocation();
    const { farmer } = useFarmer();

    const getProfileImage = (imagePath) => {
        if (!imagePath) return user;
        return getImageUrl(imagePath);
    };

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50"> {/* Lower z-index */}
            <div className="grid grid-cols-5 gap-1">
                <Link to="/farmer/profile" className="flex flex-col items-center py-2">
                    <div className="w-6 h-6 rounded-full overflow-hidden">
                        <img 
                            src={getProfileImage(farmer?.profileImage)} 
                            alt="Profile" 
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <span className="text-xs mt-1 text-gray-600">Profile</span>
                </Link>

                <Link to="/farmer/trackplants" className="flex flex-col items-center py-2">
                    <div className="w-6 h-6">
                        <img src={wheat} alt="Track Plants" className="w-full h-full" />
                    </div>
                    <span className="text-xs mt-1 text-gray-600">Track Plants</span>
                </Link>

                <Link to="/farmer/home" className="flex flex-col items-center py-2">
                    <div className="w-6 h-6">
                        <img src={home} alt="Home" className="w-full h-full" />
                    </div>
                    <span className={`text-xs mt-1 ${location.pathname === '/farmer/home' ? 'text-green-600' : 'text-gray-600'}`}>Home</span>
                    {location.pathname === '/farmer/home' && <div className="h-1 w-8 bg-green-600 absolute bottom-0"></div>}
                </Link>

                <Link to="/farmer/market" className="flex flex-col items-center py-2">
                    <div className="w-6 h-6">
                        <img src={market} alt="Market" className="w-full h-full" />
                    </div>
                    <span className="text-xs mt-1 text-gray-600">Market</span>
                </Link>

                <Link to="/farmer/consult" className="flex flex-col items-center py-2">
                    <div className="w-6 h-6">
                        <img src={conversation} alt="Consult" className="w-full h-full" />
                    </div>
                    <span className="text-xs mt-1 text-gray-600">Consult</span>
                </Link>
            </div>
        </nav>
    );
};

export default BottomNavigationFarmer;