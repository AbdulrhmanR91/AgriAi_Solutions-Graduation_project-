import { FarmerProvider } from '../../../context/FarmerProvider';
import { CompanyProvider } from '../../../context/company';
import Market from './Market';

const MarketWrapper = () => {
    const userType = localStorage.getItem('userType');

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