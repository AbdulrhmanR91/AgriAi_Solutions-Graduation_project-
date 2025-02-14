import { useContext } from 'react';
import { FarmerContext } from '../context/FarmerContext';

export const useFarmer = () => {
    const context = useContext(FarmerContext);
    if (!context) {
        throw new Error('useFarmer must be used within a FarmerProvider');
    }
    return context;
}; 