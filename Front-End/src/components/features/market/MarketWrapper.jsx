import FarmerProvider from '../../../context/FarmerProvider';
import CompanyProvider from '../../../context/CompanyProvider';
import Market from './Market';
import config from '../../../config/config';

const MarketWrapper = () => {
    const userType = localStorage.getItem(config.STORAGE_KEYS.USER_TYPE);

    if (userType === 'company') {
        return (
            <CompanyProvider>
                <Market />
            </CompanyProvider>
        );
    }
    
    return (
        <FarmerProvider>
            <Market />
        </FarmerProvider>
    );
};

export default MarketWrapper;