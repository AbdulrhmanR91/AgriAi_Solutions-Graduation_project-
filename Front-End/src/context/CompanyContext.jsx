import { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const CompanyContext = createContext(null);

export const CompanyProvider = ({ children }) => {
    const [company, setCompany] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const checkCompany = async () => {
            try {
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    const user = JSON.parse(storedUser);
                    if (user.role === 'company') {
                        setCompany(user);
                    }
                }
            } catch (error) {
                console.error('Error checking company:', error);
            } finally {
                setLoading(false);
            }
        };

        checkCompany();
    }, []);

    const value = {
        company,
        setCompany,
        loading
    };

    return (
        <CompanyContext.Provider value={value}>
            {children}
        </CompanyContext.Provider>
    );
};
