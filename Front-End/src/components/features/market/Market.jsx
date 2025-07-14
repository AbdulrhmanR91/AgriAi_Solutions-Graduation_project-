import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
    Heart, 
    ShoppingCart, 
    Plus, 
    Minus, 
    Package, 
    ShoppingBag, 
    MessageCircle, 
    Filter, 
    Search, 
    Grid3X3, 
    List 
} from 'lucide-react';
import { Card, CardContent } from '../../shared/ui/card';
import { Dialog, DialogContent } from '../../shared/ui/dialog';
import StarRating from '../../shared/ui/StarRating';
import ProductReviewModal from './ProductReviewModal';
import { useFarmer } from '../../../hooks/useFarmer';
import useCompany from '../../../hooks/useCompany';
import bell from "/src/assets/images/bell.png";
import user from '/src/assets/images/user.png';
import { getAllProducts, addProduct, addToCart, placeOrder, toggleFavorite, getFavorites } from '../../../utils/apiService';
import toast from 'react-hot-toast';
import { Link, useLocation } from 'react-router-dom';
import BottomNavigation from '../../shared/navigation/BottomNavCompany';
import BottomNavigationFarmer from '../../shared/navigation/Bottom Navigation';

const BASE_URL = 'http://localhost:5000/';

const getImageUrl = (imagePath) => {
    if (!imagePath) return user;
    if (imagePath.startsWith('http')) return imagePath;
    return `${BASE_URL}${imagePath.startsWith('/') ? imagePath.slice(1) : imagePath}`;
};

const Market = () => {
    const location = useLocation();
    const isCompany = location.pathname.includes('/company');
    const { company } = useCompany();
    const { farmer } = useFarmer();
    const { t } = useTranslation();
    
    const [currentUser, setCurrentUser] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isCartDialogOpen, setIsCartDialogOpen] = useState(false);
    const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('all');
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
    const [viewMode, setViewMode] = useState('grid');
    const [sortBy, setSortBy] = useState('newest');
    const [showFilters, setShowFilters] = useState(false);
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

    useEffect(() => {
        if (isCompany && company) {
            setCurrentUser(company);
        } else if (!isCompany && farmer) {
            setCurrentUser(farmer);
        }
    }, [isCompany, company, farmer]);

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
    
        setLoading(true);
    
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
                toast.success(t("Product added successfully"));
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
            setLoading(false);
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
                toast.success(t('common.Market.Added to cart successfully'));
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

            const phoneRegex = /^01[0125][0-9]{8}$/;
            if (!phoneRegex.test(orderData.phone)) {
                toast.error('يرجى إدخال رقم هاتف مصري صحيح');
                return;
            }

            if (product.seller._id === currentUser._id) {
                toast.error(t('common.not allowed'));
                return;
            }

            if (quantity <= 0 || quantity > product.quantity) {
                toast.error(t('common.QuantitityNotcorrect'));
                return;
            }

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
                toast.success(t('common.Order submitted successfully'));
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
            toast.error(t('common.Please login to continue'));
            return;
        }

        if (product.seller._id === currentUser._id) {
            toast.error('common.You cannot buy your own product');
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
            toast.error(t('common.Please login to add to favorites'));
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
        { id: 'all', label: t('common.Market.All'), icon: '📋' },
        { id: 'equipment', label: t('common.Market.Equipment'), icon: '🛠' },
        { id: 'pesticides', label: t('common.Market.pesticides'), icon: '🌱' },
        { id: 'seeds', label: t('common.Market.seeds'), icon: '🌾' },
        { id: 'vegetables', label: t('common.Market.vegitables'), icon: '🌽' },
        { id: 'fruits', label: t('common.Market.Fruits'), icon: '🍎' },
        { id: 'cotton', label: t('common.Market.Cotton'), icon: '🌿' },
    ];

    const filteredProducts = products.filter(product => {
        const productType = product.type?.toLowerCase().trim();
        const searchedCategory = selectedCategory.toLowerCase().trim();
        
        const matchesCategory = 
            selectedCategory === 'all' || 
            productType === searchedCategory ||
            (searchedCategory === 'cotton' && 
             (productType === 'cotton' || productType === 'قطن' || productType.includes('cotton')));
            
        const matchesSearch = product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.description?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesPrice = (!priceRange.min || product.price >= priceRange.min) &&
                           (!priceRange.max || product.price <= priceRange.max);

        return matchesCategory && matchesSearch && matchesPrice;
    });

    // Apply sorting
    const sortedProducts = [...filteredProducts].sort((a, b) => {
        switch (sortBy) {
            case 'price-low':
                return a.price - b.price;
            case 'price-high':
                return b.price - a.price;
            case 'rating':
                return (b.averageRating || 0) - (a.averageRating || 0);
            case 'oldest':
                return new Date(a.createdAt) - new Date(b.createdAt);
            case 'newest':
            default:
                return new Date(b.createdAt) - new Date(a.createdAt);
        }
    });

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">{t('common.Loading products...')}</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
                <div className="text-center bg-white p-8 rounded-xl shadow-md">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-red-500 text-2xl">⚠️</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">{t('Error Loading Products')}</h3>
                    <p className="text-red-500 mb-4">{error}</p>
                    <button 
                        onClick={loadData}
                        className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                        {t('common.retry')}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-20">
            {/* Modern Header */}
            <header className="sticky top-0 bg-white/95 backdrop-blur-md shadow-lg z-20 border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Link to={`/${isCompany ? 'company' : 'farmer'}/profile`} className="flex items-center gap-3 group">
                                <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-green-200 group-hover:ring-green-400 transition-all">
                                    <img
                                        src={currentUser?.profileImage ? getImageUrl(currentUser.profileImage) : user}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.src = user;
                                            e.target.onerror = null;
                                        }}
                                    />
                                </div>
                                <div className="hidden sm:block">
                                    <h2 className="text-lg font-bold text-gray-800">
                                        {t('Market')}
                                    </h2>
                                    <p className="text-xs text-gray-500">{currentUser?.name}</p>
                                </div>
                            </Link>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setIsAddDialogOpen(true)}
                                className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-full hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl transition-all text-sm font-medium"
                            >
                                <Plus className="w-4 h-4" />
                                <span className="hidden sm:inline">{t('farmer.market.add_product')}</span>
                            </button>
                            
                            <Link
                                to={`/${isCompany ? 'company' : 'farmer'}/orders`}
                                className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black px-4 py-2 rounded-full hover:from-yellow-500 hover:to-yellow-600 shadow-lg hover:shadow-xl transition-all text-sm font-medium"
                            >
                                <Package className="w-4 h-4" />
                                <span className="hidden sm:inline">{t('farmer.market.orders')}</span>
                            </Link>
                            
                            <Link 
                                to={`/${isCompany ? 'company' : 'farmer'}/my-products`}
                                className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-full hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all text-sm font-medium"
                            >
                                <ShoppingBag className="w-4 h-4" />
                                <span className="hidden sm:inline">{t('farmer.market.my_products')}</span>
                            </Link>
                            
                            <Link to={`/${isCompany ? 'company' : 'farmer'}/cart`} className="relative p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <ShoppingCart className="w-6 h-6 text-gray-600" />
                                {cart.length > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full px-2 py-0.5 text-xs min-w-[20px] text-center animate-bounce">
                                        {cart.length}
                                    </span>
                                )}
                            </Link>
                            
                            <Link to={`/${isCompany ? 'company' : 'farmer'}/notifications`} className="relative p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <img src={bell} alt={t('common.notifications')} className="w-6 h-6" />
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 py-6">
                {/* Search and Filter Bar */}
                <div className="bg-white rounded-2xl p-6 shadow-lg mb-6 border border-gray-200">
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Search */}
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder={t('farmer.market.search_placeholder')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all"
                            />
                        </div>
                        
                        {/* View Mode and Sort */}
                        <div className="flex items-center gap-3">
                            <div className="flex bg-gray-100 rounded-lg p-1">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 rounded-md transition-colors ${
                                        viewMode === 'grid' 
                                            ? 'bg-white shadow-sm text-green-600' 
                                            : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    <Grid3X3 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 rounded-md transition-colors ${
                                        viewMode === 'list' 
                                            ? 'bg-white shadow-sm text-green-600' 
                                            : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    <List className="w-4 h-4" />
                                </button>
                            </div>
                            
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 bg-white"
                            >
                                <option value="newest">{t('Newest First')}</option>
                                <option value="oldest">{t('Oldest First')}</option>
                                <option value="price-low">{t('Price: Low to High')}</option>
                                <option value="price-high">{t('Price: High to Low')}</option>
                                <option value="rating">{t('Highest Rated')}</option>
                            </select>
                            
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                                    showFilters 
                                        ? 'bg-green-50 border-green-300 text-green-700' 
                                        : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                                <Filter className="w-4 h-4" />
                                <span className="hidden sm:inline">{t('Filters')}</span>
                            </button>
                        </div>
                    </div>
                    
                    {/* Advanced Filters */}
                    {showFilters && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="flex flex-wrap gap-4">
                                <div className="flex items-center gap-2">
                                    <label className="text-sm font-medium text-gray-600">{t('Price Range:')}</label>
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        value={priceRange.min}
                                        onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                                        className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                                    />
                                    <span className="text-gray-400">-</span>
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        value={priceRange.max}
                                        onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                                        className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                                    />
                                    <span className="text-sm text-gray-500">{t('common.EGP')}</span>
                                </div>
                                
                                <button
                                    onClick={() => {
                                        setPriceRange({ min: '', max: '' });
                                        setSearchQuery('');
                                        setSelectedCategory('all');
                                    }}
                                    className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
                                >
                                    {t('Clear Filters')}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Categories */}
                <div className="mb-6">
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                        {categories.map((category) => (
                            <button
                                key={category.id}
                                className={`flex items-center gap-2 px-6 py-3 rounded-full border-2 transition-all whitespace-nowrap font-medium ${
                                    selectedCategory === category.id
                                        ? 'bg-gradient-to-r from-green-500 to-green-600 text-white border-green-500 shadow-lg transform scale-105'
                                        : 'bg-white border-gray-200 text-gray-700 hover:border-green-300 hover:bg-green-50 hover:shadow-md'
                                }`}
                                onClick={() => setSelectedCategory(category.id)}
                            >
                                <span className="text-lg">{category.icon}</span>
                                <span>{category.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Products Display */}
                {sortedProducts.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <ShoppingBag className="w-12 h-12 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">{t('No Products Found')}</h3>
                        <p className="text-gray-500 mb-6">{t('Try adjusting your search or filters')}</p>
                        <button
                            onClick={() => {
                                setSearchQuery('');
                                setSelectedCategory('all');
                                setPriceRange({ min: '', max: '' });
                            }}
                            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                        >
                            {t('Show All Products')}
                        </button>
                    </div>
                ) : (
                    <div className={`grid gap-6 ${
                        viewMode === 'grid' 
                            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                            : 'grid-cols-1'
                    }`}>
                        {sortedProducts.map(product => {
                            if (!product || !product.seller || !product.seller._id) {
                                return null;
                            }

                            return (
                                <Card key={product._id} className={`group overflow-hidden hover:shadow-2xl transition-all duration-300 border-0 shadow-lg bg-white ${
                                    viewMode === 'list' ? 'flex flex-row' : ''
                                }`}>
                                    <div className={`relative overflow-hidden ${
                                        viewMode === 'list' ? 'w-48 h-32' : 'h-48'
                                    }`}>
                                        <img
                                            src={getImageUrl(product.image)}
                                            alt={product.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            onError={(e) => {
                                                e.target.src = user;
                                                e.target.onerror = null;
                                            }}
                                        />
                                        
                                        {/* Hover Overlay */}
                                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                                            <button 
                                                onClick={() => {
                                                    setSelectedProduct(product);
                                                    setIsReviewModalOpen(true);
                                                }}
                                                className="p-3 bg-white/90 rounded-full hover:bg-white transition-colors shadow-lg transform hover:scale-110"
                                                title={t('View Reviews')}
                                            >
                                                <MessageCircle className="w-5 h-5 text-gray-700" />
                                            </button>
                                            <button 
                                                onClick={() => handleToggleFavorite(product._id)}
                                                className="p-3 bg-white/90 rounded-full hover:bg-white transition-colors shadow-lg transform hover:scale-110"
                                                title={t('Add to Favorites')}
                                            >
                                                <Heart 
                                                    className={`w-5 h-5 ${
                                                        favorites.includes(product._id) 
                                                        ? 'text-red-500 fill-current' 
                                                        : 'text-gray-700'
                                                    }`}
                                                />
                                            </button>
                                        </div>

                                        {/* Price Badge */}
                                        <div className="absolute top-3 left-3 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                                            {product.price} {t('common.EGP')}
                                        </div>

                                        {/* Mobile Favorite Button */}
                                        <button 
                                            onClick={() => handleToggleFavorite(product._id)}
                                            className="absolute top-3 right-3 p-2 bg-white/90 rounded-full shadow-lg sm:hidden"
                                        >
                                            <Heart 
                                                className={`w-4 h-4 ${
                                                    favorites.includes(product._id) 
                                                    ? 'text-red-500 fill-current' 
                                                    : 'text-gray-600'
                                                }`}
                                            />
                                        </button>
                                    </div>

                                    <CardContent className={`p-5 space-y-3 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                                        {/* Seller Info */}
                                        <div className="flex items-center gap-2">
                                            <img
                                                src={getImageUrl(product.seller.profileImage)}
                                                alt={product.seller.name}
                                                className="w-6 h-6 rounded-full object-cover ring-2 ring-gray-200"
                                                onError={(e) => {
                                                    e.target.src = user;
                                                    e.target.onerror = null;
                                                }}
                                            />
                                            <span className="text-xs text-gray-500 truncate font-medium">{product.seller.name}</span>
                                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                                {product.sellerType === 'company' ? t('Company') : t('Farmer')}
                                            </span>
                                        </div>

                                        {/* Product Name */}
                                        <h3 className="font-bold text-lg text-gray-800 line-clamp-2 group-hover:text-green-600 transition-colors leading-tight">
                                            {product.name}
                                        </h3>

                                        {/* Rating and Stock */}
                                        <div className="flex items-center justify-between">
                                            <StarRating 
                                                rating={product.averageRating || 0} 
                                                size={16}
                                                showCount={true}
                                                count={product.reviewCount || 0}
                                            />
                                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                                {product.quantity} {t('common.Available')}
                                            </span>
                                        </div>

                                        {/* Description */}
                                        {product.description && (
                                            <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{product.description}</p>
                                        )}

                                        {/* Action Buttons */}
                                        <div className={`grid gap-3 pt-2 ${viewMode === 'list' ? 'grid-cols-1' : 'grid-cols-2'}`}>
                                            <button
                                                onClick={() => {
                                                    if (!currentUser || !product.seller) {
                                                        toast.error(t("Please login to continue"));
                                                        return;
                                                    }
                                                    if (product.seller._id === currentUser._id) {
                                                        toast.error(t("You cannot add your own product to cart"));
                                                        return;
                                                    }
                                                    setSelectedProduct(product);
                                                    setIsCartDialogOpen(true);
                                                }}
                                                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-medium transition-all transform hover:scale-105 ${
                                                    !currentUser || !product.seller || product.seller._id === currentUser._id
                                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                    : 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-black hover:from-yellow-500 hover:to-yellow-600 shadow-lg hover:shadow-xl'
                                                }`}
                                                disabled={!currentUser || !product.seller || product.seller._id === currentUser._id}
                                            >
                                                <ShoppingCart className="w-4 h-4" />
                                                <span>{viewMode === 'list' ? t('farmer.market.add_to_cart') : t('Add to Cart')}</span>
                                            </button>
                                            <button
                                                onClick={() => handleOpenOrderDialog(product)}
                                                className="bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-4 rounded-xl hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl transition-all text-sm font-medium transform hover:scale-105"
                                            >
                                                {viewMode === 'list' ? t('farmer.market.order_now') : t('Buy Now')}
                                            </button>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </main>

            {/* Product Review Modal */}
            <ProductReviewModal
                isOpen={isReviewModalOpen}
                onClose={() => setIsReviewModalOpen(false)}
                product={selectedProduct}
                currentUser={currentUser}
            />

            {/* Add Product Dialog */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 -m-6 mb-6 rounded-t-2xl">
                        <h2 className="text-2xl font-bold text-gray-800">{t('common.Market.Add New Product')}</h2>
                        <p className="text-gray-600 mt-1">{t('Fill in the details to list your product')}</p>
                    </div>
                    
                    <form onSubmit={handleAddProduct} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block mb-2 text-sm font-semibold text-gray-700">{t('common.Market.Product Name*')}</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all"
                                    placeholder={t('Enter product name')}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-semibold text-gray-700">{t('common.Market.Category*')}</label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                                    className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all"
                                    required
                                >
                                    <option value="">{t('common.Market.Select category')}</option>
                                    <option value="equipment">{t('common.Market.Equipment')}</option>
                                    <option value="pesticides">{t('common.Market.pesticides')}</option>
                                    <option value="seeds">{t('common.Market.seeds')}</option>
                                    <option value="vegetables">{t('common.Market.vegitables')}</option>
                                    <option value="fruits">{t('common.Market.Fruits')}</option>
                                    <option value="cotton">{t('common.Market.Cotton')}</option>
                                </select>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block mb-2 text-sm font-semibold text-gray-700">{t('common.Market.Price (EGP)*')}</label>
                                <input
                                    type="number"
                                    value={formData.price}
                                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                                    className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all"
                                    placeholder="0.00"
                                    min="0"
                                    step="0.01"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-semibold text-gray-700">{t('common.Market.Quantity*')}</label>
                                <input
                                    type="number"
                                    value={formData.quantity}
                                    onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                                    className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all"
                                    placeholder="0"
                                    min="1"
                                    required
                                />
                            </div>
                        </div>
                        
                        <div>
                            <label className="block mb-2 text-sm font-semibold text-gray-700">{t('common.Market.Description')}</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all resize-none"
                                rows="4"
                                placeholder={t('Describe your product...')}
                            />
                        </div>
                        
                        <div>
                            <label className="block mb-2 text-sm font-semibold text-gray-700">{t('common.Market.Product Image')}</label>
                            <div className="relative">
                                <input
                                    id="product-image"
                                    type="file"
                                    onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.files[0] }))}
                                    className="opacity-0 absolute z-10 w-full h-full cursor-pointer"
                                    accept="image/*"
                                />
                                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-green-400 transition-colors">
                                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Plus className="w-6 h-6 text-gray-400" />
                                    </div>
                                    <p className="text-gray-600 font-medium">
                                        {formData.image ? formData.image.name : t('Click to upload image')}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">{t('PNG, JPG up to 10MB')}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex gap-4 pt-4">
                            <button
                                type="button"
                                onClick={() => setIsAddDialogOpen(false)}
                                className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                            >
                                {t('common.Cancel')}
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-medium hover:from-green-600 hover:to-green-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        {t('Adding...')}
                                    </>
                                ) : (
                                    <>
                                        <Plus className="w-5 h-5" />
                                        {t("common.Market.Add Product")}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Add to Cart Dialog */}
            <Dialog
                open={isCartDialogOpen}
                onOpenChange={() => {
                    setIsCartDialogOpen(false);
                    setQuantity(1);
                }}
            >
                <DialogContent className="sm:max-w-[400px]">
                    {selectedProduct && (
                        <div className="space-y-6">
                            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 -m-6 mb-6 rounded-t-2xl">
                                <h2 className="text-xl font-bold text-gray-800">{t('Add to Cart')}</h2>
                                <p className="text-gray-600 mt-1">{t('Choose quantity and add to cart')}</p>
                            </div>
                            
                            {/* Product Info */}
                            <div className="flex items-center gap-4">
                                <img
                                    src={getImageUrl(selectedProduct.image)}
                                    alt={selectedProduct.name}
                                    className="w-16 h-16 rounded-xl object-cover"
                                    onError={(e) => {
                                        e.target.src = user;
                                        e.target.onerror = null;
                                    }}
                                />
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-800">{selectedProduct.name}</h3>
                                    <p className="text-green-600 font-bold">{selectedProduct.price} {t('common.EGP')}</p>
                                </div>
                            </div>

                            {/* Quantity Selector */}
                            <div className="bg-gray-50 rounded-xl p-4">
                                <label className="block text-sm font-medium text-gray-700 mb-3">{t('common.Market.Quantity')}</label>
                                <div className="flex items-center justify-center gap-4">
                                    <button
                                        onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                                        className="w-10 h-10 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center hover:border-gray-300 transition-colors"
                                    >
                                        <Minus className="w-4 h-4" />
                                    </button>
                                    <span className="w-16 text-center text-xl font-bold">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(prev => Math.min(selectedProduct.quantity, prev + 1))}
                                        className="w-10 h-10 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center hover:border-gray-300 transition-colors"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Total Price */}
                            <div className="bg-green-50 rounded-xl p-4 text-center">
                                <p className="text-sm text-gray-600 mb-1">{t('Total Price')}</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {(selectedProduct.price * quantity).toFixed(2)} {t('common.EGP')}
                                </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setIsCartDialogOpen(false);
                                        setQuantity(1);
                                    }}
                                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                                >
                                    {t('common.Cancel')}
                                </button>
                                <button
                                    onClick={handleAddToCart}
                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black rounded-xl font-medium hover:from-yellow-500 hover:to-yellow-600 transition-all flex items-center justify-center gap-2"
                                >
                                    <ShoppingCart className="w-4 h-4" />
                                    {t('common.Market.Add to Cart')}
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
                <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                    {selectedProduct && (
                        <div className="space-y-6">
                            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 -m-6 mb-6 rounded-t-2xl">
                                <h2 className="text-2xl font-bold text-gray-800">{t('common.Market.Place Order')}</h2>
                                <p className="text-gray-600 mt-1">{t('Complete your order details')}</p>
                            </div>

                            {/* Product Summary */}
                            <div className="bg-gray-50 rounded-xl p-4">
                                <div className="flex items-center gap-4 mb-4">
                                    <img
                                        src={getImageUrl(selectedProduct.image)}
                                        alt={selectedProduct.name}
                                        className="w-16 h-16 rounded-xl object-cover"
                                        onError={(e) => {
                                            e.target.src = user;
                                            e.target.onerror = null;
                                        }}
                                    />
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-800">{selectedProduct.name}</h3>
                                        <p className="text-green-600 font-bold">{selectedProduct.price} {t('common.EGP')}</p>
                                    </div>
                                </div>

                                {/* Quantity Selector */}
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-700 font-medium">{t('common.Market.Quantity')}</span>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                                            className="w-8 h-8 rounded-full bg-white border flex items-center justify-center"
                                        >
                                            <Minus className="w-4 h-4" />
                                        </button>
                                        <span className="w-12 text-center font-bold">{quantity}</span>
                                        <button
                                            onClick={() => setQuantity(prev => Math.min(selectedProduct.quantity, prev + 1))}
                                            className="w-8 h-8 rounded-full bg-white border flex items-center justify-center"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-gray-200 text-center">
                                    <p className="text-lg font-bold text-gray-800">
                                        {t('Total')}: {(selectedProduct.price * quantity).toFixed(2)} {t('common.EGP')}
                                    </p>
                                </div>
                            </div>

                            {/* Shipping Form */}
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                handlePlaceOrder(selectedProduct);
                            }} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">{t('common.Full Name*')}</label>
                                        <input
                                            type="text"
                                            value={orderData.fullName}
                                            onChange={(e) => setOrderData(prev => ({ ...prev, fullName: e.target.value }))}
                                            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all"
                                            required
                                            maxLength={50}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">{t('common.Phone Number*')}</label>
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
                                            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all"
                                            required
                                            pattern="01[0125][0-9]{8}"
                                            title={t("common.Please enter a valid Egyptian phone number")}
                                        />
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">{t('common.Address*')}</label>
                                    <input
                                        type="text"
                                        value={orderData.address}
                                        onChange={(e) => setOrderData(prev => ({ ...prev, address: e.target.value }))}
                                        className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all"
                                        required
                                        maxLength={100}
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">{t('common.City*')}</label>
                                    <input
                                        type="text"
                                        value={orderData.city}
                                        onChange={(e) => setOrderData(prev => ({ ...prev, city: e.target.value }))}
                                        className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all"
                                        required
                                        maxLength={50}
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">{t('common.Notes (Optional)')}</label>
                                    <textarea
                                        value={orderData.notes}
                                        onChange={(e) => setOrderData(prev => ({ ...prev, notes: e.target.value }))}
                                        className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all resize-none"
                                        rows="3"
                                        maxLength={200}
                                        placeholder={t('Any special instructions...')}
                                    />
                                </div>
                                
                                <div className="flex gap-4 pt-4">
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
                                        className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                                    >
                                        {t('common.Cancel')}
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isPlacingOrder}
                                        className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-medium hover:from-green-600 hover:to-green-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                                    >
                                        {isPlacingOrder ? (
                                            <>
                                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
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
                                                {t('common.Placing Order...')}
                                            </>
                                        ) : (
                                            <>
                                                <ShoppingBag className="w-5 h-5" />
                                                {t('common.Place Order')}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Bottom Navigation */}
            {isCompany ? (
                <BottomNavigation onTabChange={() => {}} currentUser={company} />
            ) : (
                <BottomNavigationFarmer currentUser={farmer} />
            )}
        </div>
    );
};

export default Market;
