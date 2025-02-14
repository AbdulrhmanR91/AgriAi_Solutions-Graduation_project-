import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userType = user.userType;

  if (!token) {
    return <Navigate to="/login" />;
  }

  // التحقق من أن المستخدم يحاول الوصول إلى المسار الصحيح
  const currentPath = window.location.pathname;
  const isCorrectPath = currentPath.includes(`/${userType}`);

  if (!isCorrectPath && userType) {
    // إعادة التوجيه إلى الصفحة الرئيسية المناسبة حسب نوع المستخدم
    return <Navigate to={`/${userType}`} />;
  }

  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ProtectedRoute;  