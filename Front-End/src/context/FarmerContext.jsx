import { createContext, useState, useEffect, useContext } from 'react';
import { getFarmerProfile } from '../utils/apiService';
import PropTypes from 'prop-types';

const FarmerContext = createContext();

const FarmerProvider = ({ children }) => {
    const [farmer, setFarmer] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadProfile = async () => {
        try {
            const data = await getFarmerProfile();
            setFarmer(data);
        } catch (error) {
            console.error('Error loading profile:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProfile();
    }, []);

    const updateFarmerData = (newData) => {
        setFarmer(prevData => ({ ...prevData, ...newData }));
    };

    return (
        <FarmerContext.Provider value={{ farmer, loading, updateFarmerData, loadProfile }}>
            {children}
        </FarmerContext.Provider>
    );
};

FarmerProvider.propTypes = {
    children: PropTypes.node.isRequired
};

// Custom hook
export const useFarmer = () => {
    const context = useContext(FarmerContext);
    
    if (!context) {
        throw new Error('useFarmer must be used within a FarmerProvider');
    }
    
    return context;
};

export { FarmerContext };
export default FarmerProvider;