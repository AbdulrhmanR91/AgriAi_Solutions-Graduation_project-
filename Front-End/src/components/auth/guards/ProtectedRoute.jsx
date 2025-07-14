import { Navigate, useLocation } from 'react-router-dom';
import { storage } from '../../../utils/storage';
import { useMemo } from 'react';
import PropTypes from 'prop-types';

const ProtectedRoute = ({ children }) => {
    const location = useLocation();
    
    // Use useMemo to prevent unnecessary re-renders
    const authCheck = useMemo(() => {
        const session = storage.getSession();
        return {
            isAuthenticated: !!session,
            user: session?.userData
        };
    }, [location.pathname]); // Only recalculate when pathname changes

    if (!authCheck.isAuthenticated) {
        // Store the attempted location for redirect after login
        return (
            <Navigate 
                to="/login" 
                state={{ from: location }} 
                replace 
            />
        );
    }

    return children;
};
ProtectedRoute.propTypes = {
    children: PropTypes.node.isRequired
};

export default ProtectedRoute;
