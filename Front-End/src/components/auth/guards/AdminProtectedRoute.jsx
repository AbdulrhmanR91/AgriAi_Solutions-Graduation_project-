import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';

const AdminProtectedRoute = ({ children }) => {
  const adminToken = localStorage.getItem('adminToken');
  
  if (!adminToken) {
    // If no admin token, redirect to admin login
    return <Navigate to="/admin/login" replace />;
  }
  
  return children;
};

AdminProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired
};

export default AdminProtectedRoute;
