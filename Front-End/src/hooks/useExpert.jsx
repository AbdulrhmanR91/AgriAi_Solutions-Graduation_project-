import { createContext, useContext, useState, useEffect } from 'react';
import { getExpertProfile } from '../utils/apiService';

const ExpertContext = createContext();

export const ExpertProvider = ({ children }) => {
    const [expert, setExpert] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchExpertData = async () => {
            try {
                const data = await getExpertProfile();
                setExpert(data);
                setError(null);
            } catch (err) {
                setError(err.message);
                console.error('Error fetching expert data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchExpertData();
    }, []);

    const updateExpertData = (newData) => {
        setExpert(prevData => ({
            ...prevData,
            ...newData
        }));
    };

    return (
        <ExpertContext.Provider value={{ expert, loading, error, updateExpertData }}>
            {children}
        </ExpertContext.Provider>
    );
};

export const useExpert = () => {
    const context = useContext(ExpertContext);
    if (!context) {
        throw new Error('useExpert must be used within an ExpertProvider');
    }
    return context;
}; 