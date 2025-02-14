import CompanyProvider from './CompanyProvider';
import FarmerProvider from './FarmerProvider';
import PropTypes from 'prop-types';

const CombinedProvider = ({ children }) => {
  return (
    <CompanyProvider>
      <FarmerProvider>
        {children}
      </FarmerProvider>
    </CompanyProvider>
  );
};

CombinedProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default CombinedProvider;
