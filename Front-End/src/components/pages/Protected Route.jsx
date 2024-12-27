import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  const userType = localStorage.getItem('userType');

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Check if user is trying to access the correct route type
  const currentPath = window.location.pathname;
  const isCorrectPath = currentPath.includes(`/${userType}`);

  if (!isCorrectPath) {
    // Redirect to the correct home page based on user type
    return <Navigate to={`/${userType}`} />;
  }

  return children;
};
ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ProtectedRoute;  