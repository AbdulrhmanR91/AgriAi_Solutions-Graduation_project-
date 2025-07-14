import { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import BottomNavigation from '../../components/shared/navigation/Bottom Navigation';
import { getFarmerProfile } from '../../utils/apiService';

const FarmerLayout = () => {
    const [farmer, setFarmer] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        const loadProfile = async () => {
            try {
                const data = await getFarmerProfile();
                setFarmer(data);
            } catch (error) {
                console.error('Error loading profile:', error);
                if (error.message.includes('unauthorized')) {
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };
        loadProfile();
    }, [navigate]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          );    }

    return (
        <>
            <div className="pt-16"> {/* Add padding-top to account for fixed TopNav */}
                <Outlet context={farmer} />
            </div>
            <BottomNavigation user={farmer} />
        </>
    );
};

export default FarmerLayout;