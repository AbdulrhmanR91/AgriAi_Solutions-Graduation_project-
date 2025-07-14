import { useState, useEffect } from 'react';
import { Card, CardContent } from '../../shared/ui/card';
import { Heart, Trash2, Plus, Minus } from 'lucide-react';
import { getFavorites, getCart, toggleFavorite, removeFromCart, placeOrder } from '../../../utils/apiService';
import toast from 'react-hot-toast';
import user from '/src/assets/images/user.png';
import BottomNavigation from './../../shared/navigation/BottomNavCompany';
import { Dialog, DialogContent } from '../../shared/ui/dialog';
import { useTranslation } from 'react-i18next'; // Add this import


// const BASE_URL = 'http://localhost:5000/';
const BASE_URL = 'http://localhost:5000'; // Replace with your actual base URL

const CartCompany = () => {
    const [favorites, setFavorites] = useState([]);
    const { t } = useTranslation(); // Initialize the translation function
    const [cart, setCart] = useState({ items: [] });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('cart');
    const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [orderData, setOrderData] = useState({
        fullName: '',
        phone: '',
        address: '',
        city: '',
        notes: ''
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [favoritesRes, cartRes] = await Promise.all([
                getFavorites(),
                getCart()
            ]);
            
            
            if (favoritesRes?.success && Array.isArray(favoritesRes.data)) {
                setFavorites(favoritesRes.data);
            }

            if (cartRes?.success && cartRes.data) {
                setCart(cartRes.data);
            }
        } catch (error) {
            console.error('Error loading data:', error);
            toast.error(error.message || 'Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveFromCart = async (itemId) => {
        try {
            await removeFromCart(itemId);
            toast.success('Item removed from cart');
            loadData();
        } catch (error) {
            toast.error(error.message || 'Failed to remove item');
        }
    };

    const handleToggleFavorite = async (productId) => {
        try {
            const response = await toggleFavorite(productId);
            if (response.success) {
                loadData();
                toast.success(response.message);
            }
        } catch (error) {
            console.error('Toggle favorite error:', error);
            toast.error(error.message || 'Failed to update favorites');
        }
    };

    const handlePlaceOrder = async () => {
        try {
            setIsProcessing(true);
            const response = await placeOrder();
            if (response.success) {
                toast.success('تم تنفيذ الطلب بنجاح');
                loadData();
            }
        } catch (error) {
            console.error('Error placing order:', error);
            toast.error(error.message || 'فشل في تنفيذ الطلب');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleOrder = async (item) => {
        try {
            if (!orderData.fullName || !orderData.phone || !orderData.address || !orderData.city) {
                toast.error('Please fill in all required fields');
                return;
            }

            const phoneRegex = /^01[0125][0-9]{8}$/;
            if (!phoneRegex.test(orderData.phone)) {
                toast.error('Please enter a valid Egyptian phone number');
                return;
            }

            const formattedOrderData = {
                product: item.product._id,
                seller: item.product.seller._id,
                quantity: quantity,
                totalPrice: item.product.price * quantity,
                shippingDetails: {
                    fullName: orderData.fullName.trim(),
                    phone: orderData.phone.trim(),
                    address: orderData.address.trim(),
                    city: orderData.city.trim(),
                    notes: orderData.notes?.trim() || ''
                }
            };


            const response = await placeOrder(formattedOrderData);
            
            if (response.success) {
                await removeFromCart(item._id);
                toast.success('Order placed successfully');
                setIsOrderDialogOpen(false);
                setOrderData({
                    fullName: '',
                    phone: '',
                    address: '',
                    city: '',
                    notes: ''
                });
                setQuantity(1);
                loadData();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to place order');
        }
    };

    const renderFavorites = () => {
        if (!Array.isArray(favorites) || favorites.length === 0) {
            return <p className="text-gray-500">No favorites yet</p>;
        }

        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {favorites.map(favorite => {
                    const product = favorite.product;
                    if (!product) return null;

                    return (
                        <Card key={favorite._id} className="overflow-hidden">
                            <div className="relative">
                                <img
                                    src={product.image ? `${BASE_URL}${product.image}` : user}
                                    alt={product.name}
                                    className="w-full h-48 object-cover"
                                />
                                <button 
                                    onClick={() => handleToggleFavorite(product._id)}
                                    className="absolute top-2 right-2 p-1.5 rounded-full bg-white shadow-lg"
                                >
                                    <Heart className="w-5 h-5 text-red-500 fill-current" />
                                </button>
                            </div>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <img
                                        src={product.seller.profileImage ? `${BASE_URL}${product.seller.profileImage}` : user}
                                        alt={product.seller.name}
                                        className="w-8 h-8 rounded-full object-cover"
                                    />
                                    <div>
                                        <p className="text-sm font-medium">{product.seller.name}</p>
                                        <p className="text-xs text-gray-500">Seller</p>
                                    </div>
                                </div>

                                <h3 className="font-semibold text-lg">{product.name}</h3>
                                <p className="text-gray-600 mb-2">{product.description}</p>
                                <p className="text-green-600 font-bold mb-4">EGP {product.price}</p>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          );    }

    return (
        <div className="min-h-screen bg-gray-50 p-6 pb-24">
            <div className="max-w-7xl mx-auto">
                {/* Favorites Section */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">My Favorites</h2>
                    {renderFavorites()}
                </div>

                {/* Cart Section */}
                <div className="mb-20">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">My Cart</h2>
                    {!cart?.items || cart.items.length === 0 ? (
                        <p className="text-gray-500">Your cart is empty</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {cart.items.map((item) => {
                                if (!item?.product) return null;
                                
                                const product = item.product;
                                const seller = product.seller || {};
                                
                                return (
                                    <Card key={item._id} className="overflow-hidden">
                                        <div className="relative">
                                            <img
                                                src={product.image ? `${BASE_URL}${product.image}` : user}
                                                alt={product.name || 'Product'}
                                                className="w-full h-48 object-cover"
                                            />
                                            <button 
                                                onClick={() => handleRemoveFromCart(item._id)}
                                                className="absolute top-2 right-2 p-1.5 rounded-full bg-white shadow-lg hover:bg-red-50"
                                            >
                                                <Trash2 className="w-5 h-5 text-red-500" />
                                            </button>
                                        </div>
                                        <CardContent className="p-4">
                                            <div className="flex items-center gap-2 mb-3">
                                                <img
                                                    src={seller.profileImage ? `${BASE_URL}${seller.profileImage}` : user}
                                                    alt={seller.name || 'Seller'}
                                                    className="w-8 h-8 rounded-full object-cover"
                                                />
                                                <div>
                                                    <p className="text-sm font-medium">{seller.name || 'Unknown Seller'}</p>
                                                    <p className="text-xs text-gray-500">Seller</p>
                                                </div>
                                            </div>
                                            
                                            <h3 className="font-semibold text-lg">{product.name || 'Unnamed Product'}</h3>
                                            <p className="text-gray-600 mb-2">{product.description || 'No description available'}</p>
                                            <div className="flex justify-between items-center mb-3">
                                                <p className="text-gray-600">Quantity: {item.quantity || 0}</p>
                                                <p className="text-green-600 font-bold">
                                                    EGP {((product.price || 0) * (item.quantity || 0)).toFixed(2)}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setSelectedItem(item);
                                                    setIsOrderDialogOpen(true);
                                                }}
                                                className="w-full bg-green-500 text-white py-2 px-4 rounded-full hover:bg-green-600"
                                            >
                                                Order Now
                                            </button>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Order Dialog */}
            <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <h2 className="text-lg font-semibold mb-4">Place Order</h2>
                    {selectedItem && (
                        <div className="max-h-[80vh] overflow-y-auto p-4">
                            {/* معلومات البائع */}
                            <div className="flex items-center gap-2 mb-4">
                                <img
                                    src={selectedItem.product.seller?.profileImage ? `${BASE_URL}${selectedItem.product.seller.profileImage}` : user}
                                    alt={selectedItem.product.seller?.name}
                                    className="w-8 h-8 rounded-full object-cover"
                                />
                                <div>
                                    <p className="text-sm font-medium">{selectedItem.product.seller?.name}</p>
                                    <p className="text-xs text-gray-500">Seller</p>
                                </div>
                            </div>

                            {/* معلومات المنتج */}
                            <div className="mb-4">
                                <h3 className="font-semibold text-lg">{selectedItem.product.name}</h3>
                                <p className="text-sm text-gray-500">EGP {selectedItem.product.price}</p>
                            </div>

                            {/* اختيار الكمية */}
                            <div className="flex items-center gap-4 mb-6">
                                <span className="text-gray-600">Quantity:</span>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                                        className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
                                    >
                                        <Minus className="w-4 h-4" />
                                    </button>
                                    <span className="w-12 text-center">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(prev => Math.min(selectedItem.product.quantity, prev + 1))}
                                        className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* نموذج معلومات الشحن */}
                            <div className="space-y-3 mb-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Full Name*</label>
                                    <input
                                        type="text"
                                        value={orderData.fullName}
                                        onChange={(e) => setOrderData(prev => ({ ...prev, fullName: e.target.value }))}
                                        className="w-full p-1.5 text-sm border border-gray-300 rounded-lg"
                                        required
                                        maxLength={50}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Phone Number*</label>
                                    <input
                                        type="tel"
                                        value={orderData.phone}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/\D/g, '');
                                            if (value.length <= 11) {
                                                setOrderData(prev => ({ ...prev, phone: value }));
                                            }
                                        }}
                                        placeholder="01xxxxxxxxx"
                                        className="w-full p-1.5 text-sm border border-gray-300 rounded-lg"
                                        required
                                        pattern="01[0125][0-9]{8}"
                                        title="Please enter a valid Egyptian phone number"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Address*</label>
                                    <input
                                        type="text"
                                        value={orderData.address}
                                        onChange={(e) => setOrderData(prev => ({ ...prev, address: e.target.value }))}
                                        className="w-full p-1.5 text-sm border border-gray-300 rounded-lg"
                                        required
                                        maxLength={100}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">City*</label>
                                    <input
                                        type="text"
                                        value={orderData.city}
                                        onChange={(e) => setOrderData(prev => ({ ...prev, city: e.target.value }))}
                                        className="w-full p-1.5 text-sm border border-gray-300 rounded-lg"
                                        required
                                        maxLength={50}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Notes (Optional)</label>
                                    <textarea
                                        value={orderData.notes}
                                        onChange={(e) => setOrderData(prev => ({ ...prev, notes: e.target.value }))}
                                        className="w-full p-1.5 text-sm border border-gray-300 rounded-lg"
                                        rows="2"
                                        maxLength={200}
                                    />
                                </div>
                            </div>

                            {/* إجمالي السعر */}
                            <div className="mb-6">
                                <p className="text-lg font-semibold">
                                    Total: EGP {(selectedItem.product.price * quantity).toFixed(2)}
                                </p>
                            </div>

                            {/* أزرار التحكم */}
                            <div className="flex justify-end gap-4">
                                <button
                                    onClick={() => {
                                        setIsOrderDialogOpen(false);
                                        setQuantity(1);
                                        setOrderData({
                                            fullName: '',
                                            phone: '',
                                            address: '',
                                            city: '',
                                            notes: ''
                                        });
                                    }}
                                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleOrder(selectedItem)}
                                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                                >
                                    Place Order
                                </button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
    );
};

export default CartCompany;