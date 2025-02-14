import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { getFarmerProfile } from '../utils/apiService';
import { FarmerContext } from './FarmerContext';

const FarmerProvider = ({ children }) => {
    const [farmer, setFarmer] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    const user = JSON.parse(storedUser);
                    if (user.userType === 'farmer') {
                        setFarmer(user);
                        return;
                    }
                }

                const data = await getFarmerProfile();
                if (data) {
                    setFarmer(data);
                }
            } catch (error) {
                console.error('Error loading profile:', error);
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, []);

    const updateFarmerData = (newData) => {
        setFarmer(prevData => ({ ...prevData, ...newData }));
    };

    return (
        <FarmerContext.Provider value={{ farmer, loading, updateFarmerData }}>
            {children}
        </FarmerContext.Provider>
    );
};

FarmerProvider.propTypes = {
    children: PropTypes.node.isRequired
};

export default FarmerProvider; 