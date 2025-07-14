import { useState, useEffect } from 'react';
import { getAdminStats, getPlantAnalysisStats } from '../../../utils/apiService';
import { toast } from 'react-hot-toast';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { User, ShoppingBag, MessageCircle, Package } from 'lucide-react';
import PropTypes from 'prop-types';
import { Card, CardContent, CardHeader } from '../../../components/shared/ui/card';
import { BarChart, Bar, XAxis, YAxis, LineChart, Line } from 'recharts';
import { useTranslation } from 'react-i18next';

const Dashboard = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    users: { farmers: 0, experts: 0, companies: 0, total: 0 },
    orders: { total: 0, revenue: 0 },
    consultations: { total: 0 },
    products: { total: 0 },
    analyses: { total: 0 },
    recent: { users: [], orders: [] }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const response = await getAdminStats();
        if (response.success) {
          setStats(response.data);
        }
      } catch (error) {
        toast.error('Failed to load dashboard statistics');
        console.error('Error loading stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
    // Refresh every 5 minutes
    const interval = setInterval(loadStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // User type distribution chart data
  const userTypeData = [
    { name: 'Farmers', value: stats.users.farmers, color: '#4ade80' },
    { name: 'Experts', value: stats.users.experts, color: '#60a5fa' },
    { name: 'Companies', value: stats.users.companies, color: '#f97316' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">{t('common.admin_dashboard')}</h1>
      <PlantAnalysisStats />
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">        <StatCard 
          title={t('common.total_users')} 
          value={stats.users.total} 
          icon={<User className="w-6 h-6" />}
          color="bg-blue-500"
          details={`${t('Admin.DetailsFarmers', { count: stats.users.farmers })}, ${t('Admin.DetailsExperts', { count: stats.users.experts })}, ${t('Admin.DetailsCompanies', { count: stats.users.companies })}`}
        />
        <StatCard 
          title={t('common.orders')} 
          value={stats.orders.total} 
          icon={<ShoppingBag className="w-6 h-6" />}
          color="bg-green-500"
          details={`${t('Admin.DetailsRevenue', { amount: stats.orders.revenue.toFixed(2) })}`}
        />
        <StatCard 
          title={t('common.consultations')} 
          value={stats.consultations.total} 
          icon={<MessageCircle className="w-6 h-6" />}
          color="bg-yellow-500"
        />
        <StatCard 
          title={t('common.products')} 
          value={stats.products.total} 
          icon={<Package className="w-6 h-6" />}
          color="bg-purple-500"
          details={`${t('Admin.DetailsAnalyses', { count: stats.analyses.total })}`}
        />
      </div>

      {/* User Distribution Chart */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h2 className="text-lg font-semibold mb-4">{t('common.user_type_distribution')}</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={userTypeData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({name, value}) => `${name}: ${value}`}
              >
                {userTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-white rounded-lg shadow p-4">          <h2 className="text-lg font-semibold mb-4">{t('common.recent_users')}</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">{t('common.name')}</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">{t('common.email')}</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">{t('common.type')}</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">{t('common.joined')}</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent.users.map(user => (
                  <tr key={user._id} className="border-t">
                    <td className="px-4 py-2 text-sm">{user.name}</td>
                    <td className="px-4 py-2 text-sm">{user.email}</td>
                    <td className="px-4 py-2 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        user.userType === 'farmer' ? 'bg-green-100 text-green-800' :
                        user.userType === 'expert' ? 'bg-blue-100 text-blue-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {user.userType}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-sm">{new Date(user.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow p-4">          <h2 className="text-lg font-semibold mb-4">{t('common.recent_orders')}</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">{t('common.id')}</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">{t('common.buyer')}</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">{t('common.status')}</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">{t('common.price')}</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent.orders.map(order => (
                  <tr key={order._id} className="border-t">
                    <td className="px-4 py-2 text-sm">{order._id.slice(-6)}</td>
                    <td className="px-4 py-2 text-sm">{order.buyer?.name || 'Unknown'}</td>
                    <td className="px-4 py-2 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-sm">${order.totalPrice.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, icon, color, details }) => (
  <div className="bg-white rounded-lg shadow p-4 relative overflow-hidden">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <h3 className="text-2xl font-bold">{value}</h3>
        {details && <p className="text-xs text-gray-500 mt-1">{details}</p>}
      </div>
      <div className={`${color} p-3 rounded-lg text-white`}>
        {icon}
      </div>
    </div>
  </div>
);

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  icon: PropTypes.element.isRequired,
  color: PropTypes.string.isRequired,
  details: PropTypes.string
};

export const PlantAnalysisStats = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setError(null);
        setLoading(true);
        const data = await getPlantAnalysisStats();
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
        setError(error.message);
        toast.error(error.message || 'Failed to load statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 bg-red-50 rounded-lg">
        <p className="text-red-600">Failed to load statistics: {error}</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-lg">
        <p className="text-gray-600">No statistics available</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      {/* Total Analyses Card */}
      <Card>        <CardHeader className="pb-2">
          <h3 className="text-lg font-semibold">{t('common.total_plant_analyses')}</h3>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-green-600">
            {stats?.totalCount[0]?.count || 0}
          </p>
        </CardContent>
      </Card>

      {/* Condition Distribution */}
      <Card>        <CardHeader className="pb-2">
          <h3 className="text-lg font-semibold">{t('common.common_conditions')}</h3>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats?.byCondition || []}>
              <XAxis dataKey="_id" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#22c55e" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Severity Distribution */}
      <Card>
        <CardHeader className="pb-2">
          <h3 className="text-lg font-semibold">Severity Distribution</h3>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats?.bySeverity || []}>
              <XAxis dataKey="_id" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#eab308" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Daily Trends */}
      <Card>
        <CardHeader className="pb-2">
          <h3 className="text-lg font-semibold">Analysis Trends</h3>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={stats?.dailyTrends || []}>
              <XAxis dataKey="_id" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#22c55e" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;