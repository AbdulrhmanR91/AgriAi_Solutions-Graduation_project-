import { useState, useEffect, useCallback } from 'react';
import { getSellerOrders, getMyOrders, updateOrderStatus } from '../../../utils/apiService';
import toast from 'react-hot-toast';
import user from '/src/assets/images/user.png';

const BASE_URL = 'https://dark-gennifer-abdulrhman-5d081501.koyeb.app';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [myOrders, setMyOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('received'); // 'received' or 'placed'

    const loadOrders = useCallback(async () => {
        try {
            setLoading(true);
            
            // جلب الطلبات حسب نوعها
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

    // التحميل الأولي
    useEffect(() => {
        loadOrders();
    }, [loadOrders]);

    // تحميل الطلبات عند تغيير التبويب
    useEffect(() => {
        loadOrders();
    }, [activeTab, loadOrders]);

    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            const response = await updateOrderStatus(orderId, newStatus);
            
            if (response.success) {
                toast.success('Order status updated successfully');
                // تحديث الطلب في الحالة المحلية
                setOrders(prevOrders => 
                    prevOrders.map(order => 
                        order._id === orderId 
                            ? { ...order, status: newStatus }
                            : order
                    )
                );
            } else {
                throw new Error(response.message || 'Failed to update status');
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
        );
      }
      
    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 pb-24 ">
            <div className="max-w-7xl mx-auto mb-16"> {/* Added mb-16 */}
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">Orders</h1>

                {/* Tabs */}
                <div className="flex gap-2 sm:gap-4 mb-4 sm:mb-6 ">
                    <button
                        onClick={() => setActiveTab('received')}
                        className={`px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base rounded-lg ${
                            activeTab === 'received'
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        Orders Received
                    </button>
                    <button
                        onClick={() => setActiveTab('placed')}
                        className={`px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base rounded-lg ${
                            activeTab === 'placed'
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 '
                        }`}
                    >
                        Orders Placed
                    </button>
                </div>

                {/* عرض الطلبات حسب التبويب النشط */}
                {activeTab === 'received' ? (
                    orders.length === 0 ? (
                        <p className="text-gray-500">No orders received yet</p>
                    ) : (
                        <div className="grid gap-4 ">
                            {orders.map(order => (
                                <div key={order._id} className="bg-white rounded-lg shadow-sm p-3 sm:p-4">
                                    <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                                        {/* معلومات المشتري */}
                                        <div className="flex items-center gap-2 w-full sm:w-auto">
                                            <img
                                                src={order.buyer?.profileImage ? 
                                                    order.buyer.profileImage.startsWith('http') ? 
                                                    order.buyer.profileImage : 
                                                    `${BASE_URL}${order.buyer.profileImage}` 
                                                    : user}
                                                alt={order.buyer?.name || 'Buyer'}
                                                className="w-6 sm:w-10 h-6 sm:h-10 rounded-full object-cover"
                                            />
                                            <div>
                                                <p className="font-medium text-sm sm:text-base">{order.buyer?.name || 'Unknown Buyer'}</p>
                                                <p className="text-xs sm:text-sm text-gray-500">Buyer</p>
                                            </div>
                                        </div>

                                        {/* معلومات المنتج */}
                                        <div className="flex-1 w-full">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={order.product?.image ? 
                                                        order.product.image.startsWith('http') ? 
                                                        order.product.image : 
                                                        `${BASE_URL}${order.product.image}` 
                                                        : user}
                                                    alt={order.product?.name || 'Product'}
                                                    className="w-12 sm:w-16 h-12 sm:h-16 rounded-lg object-cover"
                                                />
                                                <div>
                                                    <h3 className="font-semibold text-sm sm:text-base">{order.product?.name || 'Product Unavailable'}</h3>
                                                    <p className="text-xs sm:text-sm text-gray-600">
                                                        Quantity: {order.quantity}
                                                    </p>
                                                    <p className="text-xs sm:text-sm font-medium text-green-600">
                                                        EGP {order.totalPrice}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* معلومات الشحن */}
                                            {order.shippingDetails && (
                                                <div className="mt-3 text-xs sm:text-sm text-gray-600 grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2">
                                                    <p>Address: {order.shippingDetails.address || 'N/A'}</p>
                                                    <p>City: {order.shippingDetails.city || 'N/A'}</p>
                                                    <p>Phone: {order.shippingDetails.phone || 'N/A'}</p>
                                                    {order.shippingDetails.notes && (
                                                        <p className="col-span-full">Notes: {order.shippingDetails.notes}</p>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* حالة الطلب */}
                                        <div className="text-right w-full sm:w-auto flex flex-col items-end">
                                            <select
                                                value={order.status || 'pending'}
                                                onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                                                className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium w-full sm:w-auto ${
                                                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                                                    order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                                                    order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="processing">Processing</option>
                                                <option value="shipped">Shipped</option>
                                                <option value="delivered">Delivered</option>
                                                <option value="cancelled">Cancelled</option>
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
                        <p className="text-gray-500">You haven&apos;t placed any orders yet</p>
                    ) : (
                        <div className="grid gap-4">
                            {myOrders.map(order => (
                                <div key={order._id} className="bg-white rounded-lg shadow-sm p-3 sm:p-4">
                                    <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                                        {/* معلومات البائع */}
                                        <div className="flex items-center gap-2 w-full sm:w-auto">
                                            <img
                                                src={order.seller?.profileImage ? 
                                                    order.seller.profileImage.startsWith('http') ? 
                                                    order.seller.profileImage : 
                                                    `${BASE_URL}${order.seller.profileImage}` 
                                                    : user}
                                                alt={order.seller?.name || 'Seller'}
                                                className="w-6 sm:w-10 h-6 sm:h-10 rounded-full object-cover"
                                            />
                                            <div>
                                                <p className="font-medium text-sm sm:text-base">{order.seller?.name || 'Unknown Seller'}</p>
                                                <p className="text-xs sm:text-sm text-gray-500">Seller</p>
                                            </div>
                                        </div>

                                        {/* معلومات المنتج */}
                                        <div className="flex-1 w-full ">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={order.product?.image ? 
                                                        order.product.image.startsWith('http') ? 
                                                        order.product.image : 
                                                        `${BASE_URL}${order.product.image}` 
                                                        : user}
                                                    alt={order.product?.name || 'Product'}
                                                    className="w-12 sm:w-16 h-12 sm:h-16 rounded-lg object-cover"
                                                />
                                                <div>
                                                    <h3 className="font-semibold text-sm sm:text-base">{order.product?.name || 'Product Unavailable'}</h3>
                                                    <p className="text-xs sm:text-sm text-gray-600">
                                                        Quantity: {order.quantity}
                                                    </p>
                                                    <p className="text-xs sm:text-sm font-medium text-green-600">
                                                        EGP {order.totalPrice}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* حالة الطلب */}
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
                                            <p className="text-xs text-gray-500 mt-1 ">
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
        </div>
    );
};

export default Orders;