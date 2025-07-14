import { useState, useEffect } from 'react';
import { Card, CardContent } from '../../shared/ui/card';
import { Heart, Trash2 , Plus, Minus} from 'lucide-react';
import { useFarmer } from '../../../context/FarmerContext';
import { getFavorites, getCart, toggleFavorite, removeFromCart, placeOrder } from '../../../utils/apiService';
import toast from 'react-hot-toast';
import user from '/src/assets/images/user.png';
import { Dialog, DialogContent } from '../../shared/ui/dialog';
import { useTranslation } from 'react-i18next';
const BASE_URL = 'http://localhost:5000/';

const CartPage = () => {
    const { farmer } = useFarmer();
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [cart, setCart] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [quantity, setQuantity] = useState(1);
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);

   
   

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
            loadData(); // إعادة تحميل البيانات
        } catch (error) {
            toast.error(error.message || 'Failed to remove item');
        }
    };


    const handleOpenOrderDialog = (product) => {
        if (!product) return;
        
        if (!farmer) {
            toast.error('Please login to continue');
            return;
        }

        if (product.seller._id === farmer._id) {
            toast.error('You cannot buy your own product');
            return;
        }
        
        setSelectedProduct(product);
        setIsOrderDialogOpen(true);
        setOrderData({
            fullName: farmer.name || '',  // Pre-fill with farmer's data if available
            phone: '',  // Remove auto-filling of phone
            address: farmer.address || '',
            city: farmer.city || '',
            notes: ''
        });
    };

    const handlePlaceOrder = async (product) => {
        try {
            if (!farmer) {
                toast.error('يرجى تسجيل الدخول للمتابعة');
                return;
            }

      

            if (!orderData.fullName || !orderData.phone || !orderData.address || !orderData.city) {
                toast.error('يرجى ملء جميع الحقول المطلوبة');
                return;
            }

            // Set loading state
            setIsPlacingOrder(true);

            // التحقق من رقم الهاتف
            const phoneRegex = /^01[0125][0-9]{8}$/;
            if (!phoneRegex.test(orderData.phone)) {
                toast.error('يرجى إدخال رقم هاتف مصري صحيح');
                return;
            }

            // التحقق من أن المشتري ليس هو البائع
            if (product.seller._id === farmer._id) {
                toast.error('لا يمكنك شراء منتجاتك');
                return;
            }

            // التحقق من الكمية
            if (quantity <= 0 || quantity > product.quantity) {
                toast.error('الكمية غير صحيحة');
                return;
            }

            // حساب السعر الإجمالي
            const totalPrice = product.price * quantity;

            const formattedOrderData = {
                product: product._id,
                seller: product.seller._id,
                buyer: farmer._id, // Use farmer instead of currentUser
                quantity: quantity,
                totalPrice: totalPrice,
                status: 'pending',
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
                // Find the cart item for this product
                const cartItem = cart.items.find(item => item.product._id === product._id);
                if (cartItem) {
                    // Remove the item from cart
                    await handleRemoveFromCart(cartItem._id);
                }
                
                toast.success('Order submitted successfully');
                setIsOrderDialogOpen(false);
                setOrderData({
                    fullName: '',
                    phone: '',
                    address: '',
                    city: '',
                    notes: ''
                });
                setQuantity(1);
                await loadData(); // Refresh cart data
            }
        } catch (error) {
    
            
            const errorMessage = error.response?.data?.errors?.[0] || 
                               error.response?.data?.message || 
                               'An error occurred while submitting the order';
            toast.error(errorMessage);
        } finally {
            setIsPlacingOrder(false);
        }
    };

    const handleToggleFavorite = async (productId) => {
        try {
            const response = await toggleFavorite(productId);
            if (response.success) {
                loadData(); // إعادة تحميل البيانات
                toast.success(response.message);
            }
        } catch (error) {
            console.error('Toggle favorite error:', error);
            toast.error(error.message || 'Failed to update favorites');
        }
    };

 

    const renderFavorites = () => {

        if (!Array.isArray(favorites) || favorites.length === 0) {
            return <p className="text-gray-500">{t('common.No favorites yet')}</p>;
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
                                        <p className="text-xs text-gray-500">{t('common.Market.seller')}</p>
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
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('common.My Favorites')}</h2>
                    {renderFavorites()}
                </div>

                {/* Cart Section */}
                <div className="mb-20">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('common.My Cart')}</h2>
                    
                    {!cart?.items || cart.items.length === 0 ? (
                        <p className="text-gray-500">{t('common.Your cart is empty')}</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {cart.items.map((item) => (
                                
                                <Card key={item._id} className="overflow-hidden">
                                    <div className="relative">
                                        <img
                                            src={item.product.image ? `${BASE_URL}${item.product.image}` : user}
                                            alt={item.product.name}
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
                                                src={item.product.seller.profileImage ? `${BASE_URL}${item.product.seller.profileImage}` : user}
                                                alt={item.product.seller.name}
                                                className="w-8 h-8 rounded-full object-cover"
                                            />
                                            <div>
                                                <p className="text-sm font-medium">{item.product.seller.name}</p>
                                                <p className="text-xs text-gray-500">{t('common.Market.seller')}</p>
                                            </div>
                                        </div>
                                        
                                        <h3 className="font-semibold text-lg">{item.product.name}</h3>
                                        <p className="text-gray-600 mb-2">{item.product.description}</p>
                                        <div className="flex justify-between items-center mb-3">n
                                            <p className="text-gray-600">Quantity: {item.quantity}</p>
                                            <p className="text-green-600 font-bold">
                                                EGP {(item.product.price * item.quantity).toFixed(2)}
                                            </p>
                                        </div>
                                        <div className="flex justify-between items-center mt-4">
                                        
                                            <button
                                                onClick={() => handleOpenOrderDialog(item.product)}
                                                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                                            >
                                                <span>{t('common.Order Now')}</span>
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-5 w-5"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
 {/* Order Dialog */}
 <Dialog
                open={isOrderDialogOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        setIsOrderDialogOpen(false);
                        setQuantity(1);
                        setOrderData({
                            fullName: '',
                            phone: '',
                            address: '',
                            city: '',
                            notes: ''
                        });
                    }
                }}
            >

                <DialogContent className="sm:max-w-[500px]">
                <h2 className="text-lg font-semibold mb-4">Place Order</h2>
            {selectedProduct && (
                <div className="max-h-[80vh] overflow-y-auto p-4">
                    {/* معلومات البائع */}
                    <div className="flex items-center gap-2 mb-4">
                        <img
                            src={selectedProduct.seller.profileImage ? `${BASE_URL}${selectedProduct.seller.profileImage}` : user}
                            alt={selectedProduct.seller.name}
                            className="w-8 h-8 rounded-full object-cover"
                        />
                        <div>
                            <p className="text-sm font-medium">{selectedProduct.seller.name}</p>
                            <p className="text-xs text-gray-500">Seller</p>
                        </div>
                    </div>

                    {/* معلومات المنتج */}
                    <div className="mb-4">
                        <h3 className="font-semibold text-lg">{selectedProduct.name}</h3>
                        <p className="text-sm text-gray-500">EGP {selectedProduct.price}</p>
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
                                onClick={() => setQuantity(prev => prev + 1)}
                                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* نموذج معلومات الشحن */}
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        handlePlaceOrder(selectedProduct);
                    }} className="space-y-3 mb-4">
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
                        <div className="flex justify-end gap-4">
                            <button
                                type="button"
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
                                type="submit"
                                disabled={isPlacingOrder}
                                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-green-300 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isPlacingOrder ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                            <circle 
                                                className="opacity-25" 
                                                cx="12" 
                                                cy="12" 
                                                r="10" 
                                                stroke="currentColor" 
                                                strokeWidth="4"
                                            />
                                            <path 
                                                className="opacity-75" 
                                                fill="currentColor" 
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                            />
                                        </svg>
                                        <span>Placing Order...</span>
                                    </>
                                ) : (
                                    'Place Order'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}
            </DialogContent>
        </Dialog>
        </div>
    );
};

export default CartPage;