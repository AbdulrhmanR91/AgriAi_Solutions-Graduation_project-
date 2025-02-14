import { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Phone, User } from 'lucide-react';
import {getExpertProfile, getExpertOrders, updateConsultOrderStatus } from '../../../utils/apiService';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import user from '/src/assets/images/user.png'; // صورة افتراضية

const BASE_URL = 'https://dark-gennifer-abdulrhman-5d081501.koyeb.app';
const getImageUrl = (imagePath) => {
  if (!imagePath) return user; // صورة افتراضية
  if (imagePath.startsWith('http')) return imagePath;
  return `${BASE_URL}${imagePath}`;
};

const ConsultationsPage = () => {
  const [status, setStatus] = useState('all');
  const [orders, setOrders] = useState([]);
  const [expert, setExpert] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [expertData, ordersData] = await Promise.all([
          getExpertProfile(),
          getExpertOrders()
        ]);
        setExpert({
          ...expertData,
          profileImage: getImageUrl(expertData.profileImage),
        });
        setOrders(ordersData || []);
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Failed to load orders');
        if (error.response?.status === 401) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const response = await updateConsultOrderStatus(orderId, newStatus);
      if (response.success) {
        setOrders(orders.map(order =>
          order._id === orderId ? { ...order, status: newStatus } : order
        ));
        toast.success(`Consultation ${newStatus} successfully`);
      }
    } catch (error) {
      console.error('Error updating consultation status:', error);
      toast.error(error.message || 'Failed to update consultation status');
    }
  };

  const filtered = status === 'all'
    ? orders
    : orders.filter(order => order.status === status);

  const getStatusColor = (status) => ({
    pending: 'bg-yellow-100 text-yellow-800',
    accepted: 'bg-blue-100 text-blue-800',
    rejected: 'bg-red-100 text-red-800',
    completed: 'bg-green-100 text-green-800'
  }[status] || 'bg-gray-100 text-gray-800');

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="sticky top-0 bg-white shadow-sm z-10 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full overflow-hidden">
              <img
                src={getImageUrl(expert?.profileImage)}
                alt="Expert Profile"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = user; // صورة افتراضية
                  e.target.onerror = null;
                }}
              />
            </div>
            <h1 className="text-xl font-bold text-green-600">Consultation Orders</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {['all', 'pending', 'accepted', 'rejected', 'completed'].map((statusType) => (
            <button
              key={statusType}
              onClick={() => setStatus(statusType)}
              className={`px-4 py-2 rounded-full ${
                status === statusType ? 'bg-green-500 text-white' : 'bg-white border border-gray-200'
              }`}
            >
              {statusType.charAt(0).toUpperCase() + statusType.slice(1)}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {filtered.map((order) => (
            <Card key={order._id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-semibold text-lg">Consultation Request</h3>
                  <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>

                <div className="space-y-3 text-gray-600">
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    <span>{order.farmer.name}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Phone className="w-5 h-5" />
                    <a href={`tel:${order.farmer.phone}`} className="text-green-600">
                      {order.farmer.phone}
                    </a>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm">Problem: {order.problem}</p>
                  </div>

                  {order.status === 'pending' && (
                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => handleStatusUpdate(order._id, 'accepted')}
                        className="flex-1 bg-green-500 text-white py-2 rounded-lg"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(order._id, 'rejected')}
                        className="flex-1 bg-red-500 text-white py-2 rounded-lg"
                      >
                        Reject
                      </button>
                    </div>
                  )}

                  {order.status === 'accepted' && (
                    <button
                      onClick={() => handleStatusUpdate(order._id, 'completed')}
                      className="w-full bg-blue-500 text-white py-2 rounded-lg mt-4"
                    >
                      Mark as Completed
                    </button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default ConsultationsPage;