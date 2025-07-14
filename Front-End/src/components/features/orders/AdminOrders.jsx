import { useState, useEffect } from 'react';
import { getAdminOrders } from '../../../utils/apiService';
import toast from 'react-hot-toast';
import { Search, Filter, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
};

const AdminOrders = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    loadOrders();
  }, [currentPage, statusFilter, dateFilter, searchQuery]); // Added searchQuery to dependencies

  const loadOrders = async () => {
    try {
      setLoading(true);
      
      let queryParams = `page=${currentPage}&limit=10`;
      if (statusFilter) queryParams += `&status=${statusFilter}`;
      if (searchQuery) queryParams += `&search=${searchQuery}`;
      if (dateFilter) queryParams += `&date=${dateFilter}`;
      
      const response = await getAdminOrders(queryParams);
      
      if (response.success) {
        setOrders(response.data || []);
        
        // Calculate total pages
        if (response.pagination && response.total) {
          const totalPages = Math.ceil(response.total / 10);
          setTotalPages(totalPages);
        } else {
          setTotalPages(1);
        }
      } else {
        toast.error(t('Admin.FailedToLoadOrders'));
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error(error.message || t('Admin.FailedToLoadOrders'));
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page
    loadOrders();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">{t('Admin.OrderTransactions')}</h1>
      
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-400`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('Admin.SearchOrdersPlaceholder')}
              className={`w-full ${isRTL ? 'pr-10 pl-20' : 'pl-10 pr-20'} py-2 border border-gray-300 rounded-lg`}
            />
            <button
              type="submit"
              className={`absolute ${isRTL ? 'left-2' : 'right-2'} top-1/2 transform -translate-y-1/2 px-3 py-1 bg-green-500 text-white rounded`}
            >
              {t('Admin.Search')}
            </button>
          </div>
        </form>
        
        <div className="flex items-center gap-2">
          <Filter className="text-gray-400" size={18} />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1); // Reset to first page
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">{t('Admin.AllStatuses')}</option>
            <option value="pending">{t('Admin.Pending')}</option>
            <option value="processing">{t('Admin.Processing')}</option>
            <option value="shipped">{t('Admin.Shipped')}</option>
            <option value="delivered">{t('Admin.Delivered')}</option>
            <option value="cancelled">{t('Admin.Cancelled')}</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="text-gray-400" size={18} />
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => {
              setDateFilter(e.target.value);
              setCurrentPage(1); // Reset to first page
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>
      </div>
      
      {/* Orders Table */}
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500">{t('Admin.NoOrdersFound')}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">{t('Admin.OrderID')}</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">{t('Admin.Product')}</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">{t('Admin.Buyer')}</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">{t('Admin.BuyerContact')}</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">{t('Admin.Seller')}</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">{t('Admin.Total')}</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">{t('Admin.Date')}</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">{t('Admin.Status')}</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">{t('Admin.ShippingInfo')}</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order._id} className="border-t border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm">{order._id}</td>
                  <td className="py-3 px-4 text-sm">{order.product?.name || t('Admin.NotSpecified')}</td>
                  <td className="py-3 px-4 text-sm">{order.buyer?.name || t('Admin.NotSpecified')}</td>
                  <td className="py-3 px-4 text-sm">
                    <div>
                      <div>{order.buyer?.email}</div>
                      <div>{order.buyer?.phone}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm">{order.seller?.name || t('Admin.NotSpecified')}</td>
                  <td className="py-3 px-4 text-sm font-medium">{t('common.EGP')} {order.totalPrice}</td>
                  <td className="py-3 px-4 text-sm">{formatDate(order.createdAt)}</td>
                  <td className="py-3 px-4 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
                      {t(`Admin.${order.status.charAt(0).toUpperCase() + order.status.slice(1)}`)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm">
                    <button
                      onClick={() => {
                        if (order.shippingDetails) {
                          toast.success(
                            <div>
                              <p><strong>{t('Admin.ShippingDetailsName')}:</strong> {order.shippingDetails.fullName}</p>
                              <p><strong>{t('Admin.ShippingDetailsPhone')}:</strong> {order.shippingDetails.phone}</p>
                              <p><strong>{t('Admin.ShippingDetailsAddress')}:</strong> {order.shippingDetails.address}</p>
                              <p><strong>{t('Admin.ShippingDetailsCity')}:</strong> {order.shippingDetails.city}</p>
                              {order.shippingDetails.notes && <p><strong>{t('Admin.ShippingDetailsNotes')}:</strong> {order.shippingDetails.notes}</p>}
                            </div>,
                            { duration: 5000 }
                          );
                        } else {
                          toast.error(t('Admin.NoShippingDetailsAvailable'));
                        }
                      }}
                      className="text-blue-500 hover:text-blue-700 underline"
                    >
                      {t('Admin.ViewDetails')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Pagination */}
      {!loading && orders.length > 0 && (
        <div className="flex justify-center mt-6">
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50"
            >
              {t('Admin.Previous')}
            </button>
            <span className="px-3 py-1 border border-gray-300 rounded bg-gray-100">
              {currentPage} {t('Admin.of')} {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50"
            >
              {t('Admin.Next')}
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium mb-2">{t('Admin.AdminOrderManagementNoticeTitle')}</h3>
        <p className="text-gray-600">
          {t('Admin.AdminOrderManagementNoticeMessage')}
        </p>
      </div>
    </div>
  );
};

export default AdminOrders;
