import { useState, useEffect, useCallback } from 'react';
import { getSellerOrders, getMyOrders, updateOrderStatus } from '../../../utils/apiService';
import toast from 'react-hot-toast';
import user from '/src/assets/images/user.png';
import BottomNavigation from '../../shared/navigation/BottomNavCompany';
import { useTranslation } from 'react-i18next';

const BASE_URL = 'http://localhost:5000/';

const OrdersCompany = () => {
    const [orders, setOrders] = useState([]);
    const { t } = useTranslation();
    const [myOrders, setMyOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('received');
    const [activeTabNav, setActiveTabNav] = useState('orders');

    const loadOrders = useCallback(async () => {
        try {
            setLoading(true);
            
            if (activeTab === 'received') {
                const response = await getSellerOrders();
                if (response.success) {
                    setOrders(response.data || []);
                }
            } else {
                const response = await getMyOrders();
                if (response.success) {
                    setMyOrders(response.data || []);
                }
            }
        } catch (error) {
            console.error('Load orders error:', error);
            toast.error(error.message || 'Failed to load orders');
        } finally {
            setLoading(false);
        }
    }, [activeTab]);

    useEffect(() => {
        loadOrders();
    }, [loadOrders]);

    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            const response = await updateOrderStatus(orderId, newStatus);
            if (response.success) {
                toast.success(t('company.orders.status_updated'));
                setOrders(prevOrders => 
                    prevOrders.map(order => 
                        order._id === orderId 
                            ? { ...order, status: newStatus }
                            : order
                    )
                );
            }
        } catch (error) {
            toast.error(error.message || 'Failed to update order status');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          );    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <header className="sticky top-0 bg-white shadow-sm z-10">
                <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-800">{t('company.orders.title')}</h1>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
                <div className="flex gap-2 sm:gap-4 mb-4 sm:mb-6">
                    <button
                        onClick={() => setActiveTab('received')}
                        className={`px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base rounded-lg ${
                            activeTab === 'received'
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        {t('company.orders.orders_received')}
                    </button>
                    <button
                        onClick={() => setActiveTab('placed')}
                        className={`px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base rounded-lg ${
                            activeTab === 'placed'
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        {t('company.orders.orders_placed')}
                    </button>
                </div>

                {activeTab === 'received' ? (
                    orders.length === 0 ? (
                        <p className="text-gray-500">{t('company.orders.no_orders_received')}</p>
                    ) : (
                        <div className="grid gap-4">
                            {orders.map(order => (
                                <div key={order._id} className="bg-white rounded-lg shadow-sm p-3 sm:p-4">
                                    <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                                        <div className="flex items-center gap-2 w-full sm:w-auto">
                                            <img
                                                src={order.buyer?.profileImage ? `${BASE_URL}${order.buyer.profileImage}` : user}
                                                alt={order.buyer?.name || 'Buyer'}
                                                className="w-6 sm:w-10 h-6 sm:h-10 rounded-full object-cover"
                                            />
                                            <div>
                                                <p className="font-medium text-sm sm:text-base">{order.buyer?.name || 'Unknown Buyer'}</p>
                                                <p className="text-xs sm:text-sm text-gray-500">{t('company.orders.buyer')}</p>
                                            </div>
                                        </div>

                                        <div className="flex-1 w-full">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={order.product?.image ? `${BASE_URL}${order.product.image}` : user}
                                                    alt={order.product?.name || 'Product'}
                                                    className="w-12 sm:w-16 h-12 sm:h-16 rounded-lg object-cover"
                                                />
                                                <div>
                                                    <h3 className="font-semibold text-sm sm:text-base">{order.product?.name || 'Product Unavailable'}</h3>
                                                    <p className="text-xs sm:text-sm text-gray-600">
                                                        {t('company.orders.quantity')} {order.quantity}
                                                    </p>
                                                    <p className="text-xs sm:text-sm font-medium text-green-600">
                                                    {order.totalPrice}    {t('company.orders.EGP')} 
                                                    </p>
                                                </div>
                                            </div>

                                            {order.shippingDetails && (
                                                <div className="mt-3 text-xs sm:text-sm text-gray-600 grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2">
                                                    <p>{t('company.orders.address')} {order.shippingDetails.address || 'N/A'}</p>
                                                    <p>{t('company.orders.city')} {order.shippingDetails.city || 'N/A'}</p>
                                                    <p>{t('company.orders.phone')} {order.shippingDetails.phone || 'N/A'}</p>
                                                    {order.shippingDetails.notes && (
                                                        <p className="col-span-full">{t('company.orders.notes')}{order.shippingDetails.notes}</p>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div className="text-right w-full sm:w-auto flex flex-col items-end">
                                            <select
                                                value={order.status || t('company.orders.pending')}
                                                onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                                                className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium w-full sm:w-auto ${
                                                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                                                    order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                                                    order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}
                                            >
                                                <option value="pending">{t('company.orders.pending')}</option>
                                                <option value="processing">{t('company.orders.processing')}</option>
                                                <option value="shipped">{t('company.orders.Shipped')}</option>
                                                <option value="delivered">{t('company.orders.Delivered')}</option>
                                                <option value="cancelled">{t('company.orders.Cancelled')}</option>
                                            </select>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                ) : (
                    myOrders.length === 0 ? (
                        <p className="text-gray-500">{t('company.orders.You haven&apos;t placed any orders yet')}</p>
                    ) : (
                        <div className="grid gap-4">
                            {myOrders.map(order => (
                                <div key={order._id} className="bg-white rounded-lg shadow-sm p-3 sm:p-4">
                                    <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                                        <div className="flex items-center gap-2 w-full sm:w-auto">
                                            <img
                                                src={order.seller?.profileImage ? `${BASE_URL}${order.seller.profileImage}` : user}
                                                alt={order.seller?.name || 'Seller'}
                                                className="w-6 sm:w-10 h-6 sm:h-10 rounded-full object-cover"
                                            />
                                            <div>
                                                <p className="font-medium text-sm sm:text-base">{order.seller?.name || 'Unknown Seller'}</p>
                                                <p className="text-xs sm:text-sm text-gray-500">{t('company.orders.Seller')}</p>
                                            </div>
                                        </div>

                                        <div className="flex-1 w-full">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={order.product?.image ? `${BASE_URL}${order.product.image}` : user}
                                                    alt={order.product?.name || 'Product'}
                                                    className="w-12 sm:w-16 h-12 sm:h-16 rounded-lg object-cover"
                                                />
                                                <div>
                                                    <h3 className="font-semibold text-sm sm:text-base">{order.product?.name || 'Product Unavailable'}</h3>
                                                    <p className="text-xs sm:text-sm text-gray-600">
                                                       {t('company.orders.quantity')} {order.quantity}
                                                    </p>
                                                    <p className="text-xs sm:text-sm font-medium text-green-600">
                                                        {t('company.orders.EGP')} {order.totalPrice}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="text-right w-full sm:w-auto flex flex-col items-end">
                                            <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                                                order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                                                order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                                                order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                                'bg-red-100 text-red-800'
                                            }`}>
                                                {order.status}
                                            </span>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                )}
            </div>

            <BottomNavigation activeTab={activeTabNav} onTabChange={setActiveTabNav} />
        </div>
    );
};

export default OrdersCompany;