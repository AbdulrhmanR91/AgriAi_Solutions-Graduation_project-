import { createContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { getCompanyProfile } from '../utils/apiService';

export const CompanyContext = createContext(null);

const CompanyProvider = ({ children }) => {
    const [company, setCompany] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadProfile = async () => {
        try {
            setLoading(true);
            const response = await getCompanyProfile();
          
            const data = response;

            
            setCompany(data);
            return data;
        } catch (error) {
            console.error('Error loading company profile:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProfile();
    }, []);

    const updateCompanyData = (newData) => {
        setCompany(prevData => {
            const updatedData = { ...prevData, ...newData };
            return updatedData;
        });
    };

    return (
        <CompanyContext.Provider value={{ company, loading, updateCompanyData, loadProfile }}>
            {children}
        </CompanyContext.Provider>
    );
};

CompanyProvider.propTypes = {
    children: PropTypes.node.isRequired
};

export default CompanyProvider;