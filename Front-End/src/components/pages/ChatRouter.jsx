import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { getUserRole } from '../../utils/auth';
import toast from 'react-hot-toast';

const ChatRouter = () => {
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();
  const { roomId } = useParams(); // Get roomId from URL parameters

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        // Get the user role from your authentication system
        const role = await getUserRole();
        setUserRole(role);
      } catch (error) {
        console.error('Error determining user role:', error);
        toast.error('Could not determine your user role. Please log in again.');
        // Redirect to login if we can't determine role
        navigate('/login', { replace: true });
      } finally {
        setLoading(false);
      }
    };

    checkUserRole();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-green-800">Loading chat interface...</p>
        </div>
      </div>
    );
  }

  // Redirect based on user role
  if (userRole === 'farmer') {
    const targetPath = roomId ? `/farmer/chat/${roomId}` : '/farmer/chat';
    return <Navigate to={targetPath} replace />;
  } else if (userRole === 'expert') {
    const targetPath = roomId ? `/expert/chat/${roomId}` : '/expert/chat';
    return <Navigate to={targetPath} replace />;
  } else {
    // If role is not recognized, redirect to login
    toast.error('Please log in to access the chat');
    return <Navigate to="/login" replace />;
  }
};

export default ChatRouter;
