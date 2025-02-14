import { useState, useEffect } from 'react';
import { Heart, ShoppingCart, Plus, Minus, Package, ShoppingBag } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Dialog, DialogContent } from '../ui/dialog';
import { useFarmer } from '../../../hooks/useFarmer';
import useCompany from '../../../hooks/useCompany';
import bell from "/src/assets/images/bell.png";
import search from "/src/assets/images/search.png";
import user from '/src/assets/images/user.png';
import { getAllProducts, addProduct, addToCart, placeOrder, toggleFavorite, getFavorites } from '../../../utils/apiService';
import toast from 'react-hot-toast';
import { Link, useLocation } from 'react-router-dom';
import BottomNavigation from './../Company/BottomNavCompany';
import BottomNavigationFarmer from './Bottom Navigation';

const BASE_URL = 'https://dark-gennifer-abdulrhman-5d081501.koyeb.app';

const Market = () => {
    const location = useLocation();
    const isCompany = location.pathname.includes('/company');
    const { company } = useCompany();
    const { farmer } = useFarmer();
 
    
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
    
        
        if (isCompany && company) {
    
            setCurrentUser(company);
        } else if (!isCompany && farmer) {
        
            setCurrentUser(farmer);
        }
    }, [isCompany, company, farmer]);

    useEffect(() => {
    }, [currentUser]);

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isCartDialogOpen, setIsCartDialogOpen] = useState(false);
    const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [cart] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [quantity, setQuantity] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        type: '',
        price: '',
        quantity: '',
        description: '',
        image: null
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [orderData, setOrderData] = useState({
        fullName: '',
        phone: '',
        address: '',
        city: '',
        notes: ''
    });
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);

    const loadData = async () => {
        try {
            setLoading(true);
            const [productsResponse, favoritesResponse] = await Promise.all([
                getAllProducts(),
                getFavorites()
            ]);
            
            if (productsResponse.success) {
                setProducts(productsResponse.data);
            }
            
            if (favoritesResponse.success) {
                setFavorites(favoritesResponse.data.map(fav => fav._id));
            }
            
            setError(null);
        } catch (error) {
            console.error('Error loading data:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleAddProduct = async (e) => {
        e.preventDefault();
        
        if (!currentUser) {
          toast.error("Please login to add products");
          return;
        }
      
        if (!formData.name || !formData.type || !formData.price || !formData.quantity) {
          toast.error("Please fill all required fields");
          return;
        }
      
        const price = Number(formData.price);
        const quantity = Number(formData.quantity);
      
        if (isNaN(price) || price <= 0) {
          toast.error("Please enter a valid price");
          return;
        }
      
        if (isNaN(quantity) || quantity <= 0) {
          toast.error("Please enter a valid quantity");
          return;
        }
      
        setLoading(true); // Start loader
      
        try {
          const productFormData = new FormData();
      
          productFormData.append("name", formData.name.trim());
          productFormData.append("type", formData.type);
          productFormData.append("price", price);
          productFormData.append("quantity", quantity);
          productFormData.append("seller", currentUser._id);
          productFormData.append("sellerType", isCompany ? "company" : "farmer");
      
          if (formData.description) {
            productFormData.append("description", formData.description.trim());
          }
      
          if (formData.image) {
            productFormData.append("image", formData.image);
          }
      
          const response = await addProduct(productFormData);
          if (response.success) {
            toast.success("Product added successfully");
            setIsAddDialogOpen(false);
            loadData();
            setFormData({
              name: "",
              type: "",
              price: "",
              quantity: "",
              description: "",
              image: null,
            });
          }
        } catch (error) {
          toast.error(error.message || "Failed to add product");
        } finally {
          setLoading(false); // Stop loader
        }
      };
      
    const handleAddToCart = async () => {
        if (!currentUser) {
            toast.error('Please login to add to cart');
            return;
        }

        if (!selectedProduct || !quantity) {
            toast.error('Please select a product and quantity');
            return;
        }

        try {
            const response = await addToCart(selectedProduct._id, quantity);
            if (response.success) {
                toast.success('Added to cart successfully');
                setIsCartDialogOpen(false);
                setQuantity(1);
            }
        } catch (error) {
            toast.error(error.message || 'Failed to add to cart');
        }
    };
    const handlePlaceOrder = async (product) => {
        try {
            if (!currentUser) {
                toast.error('يرجى تسجيل الدخول للمتابعة');
                return;
            }

      

            if (!orderData.fullName || !orderData.phone || !orderData.address || !orderData.city) {
                toast.error('يرجى ملء جميع الحقول المطلوبة');
                return;
            }

            // التحقق من رقم الهاتف
            const phoneRegex = /^01[0125][0-9]{8}$/;
            if (!phoneRegex.test(orderData.phone)) {
                toast.error('يرجى إدخال رقم هاتف مصري صحيح');
                return;
            }

            // التحقق من أن المشتري ليس هو البائع
            if (product.seller._id === currentUser._id) {
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
                buyer: currentUser._id,
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

            setIsPlacingOrder(true);

            const response = await placeOrder(formattedOrderData);
            
            if (response.success) {
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
    const handleOpenOrderDialog = (product) => {
        if (!product) {
            return;
        }
        
        if (!currentUser) {
            toast.error('Please login to continue');
            return;
        }

        if (product.seller._id === currentUser._id) {
            toast.error('You cannot buy your own product');
            return;
        }
        
        setSelectedProduct(product);
        setIsOrderDialogOpen(true);
        setOrderData({
            fullName: '',
            phone: '',
            address: '',
            city: '',
            notes: ''
        });
    };

    const handleToggleFavorite = async (productId) => {
        if (!currentUser) {
            toast.error('Please login to add to favorites');
            return;
        }

        try {
            const response = await toggleFavorite(productId);
            if (response.success) {
                if (favorites.includes(productId)) {
                    setFavorites(favorites.filter(id => id !== productId));
                } else {
                    setFavorites([...favorites, productId]);
                }
                toast.success(response.message);
            }
        } catch (error) {
            toast.error(error.message || 'Failed to toggle favorite');
        }
    };

    const categories = [
        { id: 'all', label: 'All', icon: '📋' },
        { id: 'equipment', label: 'Equipment', icon: '🛠' },
        { id: 'pesticides', label: 'pesticides', icon: '🌱' },
        { id: 'seeds', label: 'seeds', icon: '🌾' },
        { id: 'vegetables', label: 'Vegetables', icon: '🌽' },
        { id: 'fruits', label: 'Fruits', icon: '🍎' },
        { id: 'cotton', label: 'Cotton', icon: '🌿' },
    ];

    const filteredProducts = products.filter(product => {
        const matchesCategory = selectedCategory === 'All' || 
            product.type?.toLowerCase() === selectedCategory.toLowerCase();

        const matchesSearch = product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.description?.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesCategory && matchesSearch;
    });

    if (loading) {
        return (
          <div className="min-h-screen flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        );
      }
      

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <p className="text-red-500 mb-4">{error}</p>
                <button 
                    onClick={loadData}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <header className="sticky top-0 bg-white shadow-sm z-10">
                <div className="max-w-7xl mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Link to={`/${isCompany ? 'company' : 'farmer'}/profile`} className="flex items-center space-x-3">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden">
                                    <img
                                        src={currentUser?.profileImage 
                                            ? `${BASE_URL}${currentUser.profileImage}`
                                            : user}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <span className="text-sm sm:text-xl text-green-600 font-bold hidden sm:inline">
                                    {currentUser ? `Welcome ${currentUser.name}` : 'Welcome'}
                                </span>
                            </Link>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-3">
                            <button
                                onClick={() => setIsAddDialogOpen(true)}
                                className="text-xs sm:text-sm bg-green-500 text-white px-2 sm:px-4 py-1.5 sm:py-2 rounded-full hover:bg-green-600 flex items-center gap-1"
                            >
                                <Plus className="w-4 h-4" />
                                <span className="hidden sm:inline">Add Product</span>
                            </button>
                            <Link
                                to={`/${isCompany ? 'company' : 'farmer'}/orders`}
                                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-yellow-400 text-black rounded-full hover:bg-yellow-500 text-xs sm:text-sm"
                            >
                                <Package className="w-4 h-4" />
                                <span className="hidden sm:inline">Orders</span>
                            </Link>
                            <Link 
                                to={`/${isCompany ? 'company' : 'farmer'}/my-products`}
                                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 text-xs sm:text-sm"
                            >
                                <ShoppingBag className="w-4 h-4" />
                                <span className="hidden sm:inline">My Products</span>
                            </Link>
                            <Link to={`/${isCompany ? 'company' : 'farmer'}/cart`} className="relative p-1.5 sm:p-2 hover:bg-gray-100 rounded-full">
                                <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
                                {cart.length > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full px-1.5 py-0.5 text-xs min-w-[18px] text-center">
                                        {cart.length}
                                    </span>
                                )}
                            </Link>
                            <Link to={`/${isCompany ? 'company' : 'farmer'}/notifications`} className="relative p-1.5 sm:p-2 hover:bg-gray-100 rounded-full">
                                <img src={bell} alt="Notifications" className="w-5 h-5 sm:w-6 sm:h-6" />
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 py-6">
                {/* Search Bar */}
                <div className="relative w-full mb-6">
                    <input
                        type="text"
                        placeholder="Search for Plants , Seeds , Fertilizers..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-400"
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                        <img src={search} alt="Search" className="w-5 h-5" />
                    </div>
                </div>

                {/* Categories */}
                <div className="mb-6 -mx-4 px-4 overflow-x-auto">
                    <div className="flex space-x-2 min-w-max pb-2">
                        {categories.map((category) => (
                    <button
                                key={category.id}
                                className={`px-4 py-2 rounded-full border transition-colors
                                    ${selectedCategory === category.label
                                        ? 'bg-green-500 text-white border-green-500'
                                        : 'border-gray-200 hover:bg-gray-50'
                                    }`}
                                onClick={() => setSelectedCategory(category.label)}
                            >
                                {category.icon} {category.label}
                    </button>
                        ))}
                    </div>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredProducts.map(product => {
                        if (!product || !product.seller || !product.seller._id) {
                            return null;
                        }

                        return (
                        <Card key={product._id} className="overflow-hidden">
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
                                    <Heart 
                                        className={`w-5 h-5 ${
                                            favorites.includes(product._id) 
                                            ? 'text-red-500 fill-current' 
                                            : 'text-gray-400'
                                        }`} 
                                    />
                                </button>
                            </div>
                            <CardContent className="p-4">
                                {/* معلومات البائع */}
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

                                {/* معلومات المنتج */}
                                    <h3 className="font-semibold text-lg">{product.name}</h3>
                                <p className="text-gray-600 mb-2">{product.description}</p>
                                <p className="text-green-600 font-bold mb-4">EGP {product.price}</p>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => {
                                            if (!currentUser || !product.seller) {
                                                toast.error("يرجى تسجيل الدخول للمتابعة");
                                                return;
                                            }
                                            if (product.seller._id === currentUser._id) {
                                                toast.error("لا يمكنك إضافة منتجك الخاص إلى السلة");
                                                return;
                                            }
                                            setSelectedProduct(product);
                                            setIsCartDialogOpen(true);
                                        }}
                                        className={`flex items-center justify-center gap-2 py-2 px-4 rounded-full ${
                                            !currentUser || !product.seller || product.seller._id === currentUser._id
                                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                            : 'bg-yellow-400 text-black hover:bg-yellow-500'
                                            }`}
                                            disabled={!currentUser || !product.seller || product.seller._id === currentUser._id}
                                        >
                                        <ShoppingCart className="w-4 h-4" />
                                        Add to Cart
                                    </button>
                                    <button
                                        onClick={() => handleOpenOrderDialog(product)}
                                        className="bg-green-500 text-white py-2 px-4 rounded-full hover:bg-green-600"
                                    >
                                        Order Now
                                    </button>
                                </div>
                            </CardContent>
                        </Card>
                        );
                    })}
                </div>
            </main>

            {/* Add Product Dialog */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <h2 className="text-lg font-semibold mb-4">Add New Product</h2>
                    <div className="max-h-[80vh] overflow-y-auto">
                <form onSubmit={handleAddProduct} className="space-y-4">
                    <div>
                        <label className="block mb-2 text-sm font-medium">Product Name*</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full p-2 border border-gray-300 rounded-lg"
                            required
                        />
                    </div>
                    <div>
                        <label className="block mb-2 text-sm font-medium">Category*</label>
                        <select
                            value={formData.type}
                            onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                            className="w-full p-2 border border-gray-300 rounded-lg"
                            required
                        >
                            <option value="">Select category</option>
                            <option value="Equipment">Equipment</option>
                            <option value="Pesticides">Pesticides</option>
                            <option value="Seeds">Seeds</option>
                            <option value="Vegetables">Vegetables</option>
                            <option value="Fruits">Fruits</option>
                            <option value="Cotton">Cotton</option>
                        </select>
                    </div>
                    <div>
                        <label className="block mb-2 text-sm font-medium">Price (EGP)*</label>
                        <input
                            type="number"
                            value={formData.price}
                            onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                            className="w-full p-2 border border-gray-300 rounded-lg"
                            required
                        />
                    </div>
                    <div>
                        <label className="block mb-2 text-sm font-medium">Quantity*</label>
                        <input
                            type="number"
                            value={formData.quantity}
                            onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                            className="w-full p-2 border border-gray-300 rounded-lg"
                            required
                        />
                    </div>
                    <div>
                        <label className="block mb-2 text-sm font-medium">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            className="w-full p-2 border border-gray-300 rounded-lg"
                            rows="3"
                        />
                    </div>
                    <div>
                        <label className="block mb-2 text-sm font-medium">Product Image</label>
                        <input
                            type="file"
                            onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.files[0] }))}
                            className="w-full p-2 border border-gray-300 rounded-lg"
                            accept="image/*"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => setIsAddDialogOpen(false)}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                        >
                            Cancel
                        </button>
                        <button
              type="submit"
              className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg flex justify-center items-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                "Add Product"
              )}
            </button>
                    </div>
                </form>
                </div>
                </DialogContent>
            </Dialog>

            {/* Add to Cart Dialog */}
            <Dialog
                open={isCartDialogOpen}
                onClose={() => {
                    setIsCartDialogOpen(false);
                    setQuantity(1);
                }}
                title="Add to Cart"
            >
                <DialogContent>
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
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => {
                                    setIsCartDialogOpen(false);
                                    setQuantity(1);
                                }}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleAddToCart(selectedProduct)}
                                className="px-4 py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500"
                            >
                                Add to Cart
                            </button>
                        </div>
                    </div>
                )}
                </DialogContent>
            </Dialog>

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

            {/* Bottom Navigation */}
            {isCompany?(
                <BottomNavigation onTabChange={() => {}}
                currentUser= {company}/>
            ) : (
                <BottomNavigationFarmer
                currentUser ={farmer}/>
            )}
        </div>
    );
};

export default Market;