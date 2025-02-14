import { createContext, useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { storage } from '../utils/storage';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(() => storage.get('user'));

    const updateUser = (newUserData) => {
        try {
            const updatedUser = typeof newUserData === 'function' 
                ? newUserData(user)
                : newUserData;
            
            setUser(updatedUser);
            storage.set('user', updatedUser);
        } catch (error) {
            console.error('Error updating user:', error);
            setUser(null);
            storage.remove('user');
        }
    };

    return (
        <UserContext.Provider value={{ user, updateUser }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};

UserProvider.propTypes = {
    children: PropTypes.node.isRequired
};