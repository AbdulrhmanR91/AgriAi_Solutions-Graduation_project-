import { useState, useEffect } from 'react';
import { Card, CardContent } from '../../shared/ui/card';
import { Edit, Trash2 } from 'lucide-react';
import Dialog from '../../shared/ui/dialog';
import { getMyProducts, updateProduct, deleteProduct } from '../../../utils/apiService';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import user from '/src/assets/images/user.png';
import { useTranslation } from 'react-i18next';
import ProductsLoading from './ProductsLoading';
import './products.css';
const BASE_URL = 'http://localhost:5000/';

const getImageUrl = (imagePath) => {
    if (!imagePath) {
        console.log('No image path provided, using default');
        return user;
    }
    
    // If it's already a complete URL, return as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        console.log('Using complete URL:', imagePath);
        return imagePath;
    }
    
    // Handle relative paths from uploads folder
    let cleanPath = imagePath;
    if (cleanPath.startsWith('/')) {
        cleanPath = cleanPath.slice(1);
    }
    
    // Ensure the path starts with uploads/ if it doesn't already
    if (!cleanPath.startsWith('uploads/')) {
        cleanPath = `uploads/${cleanPath}`;
    }
    
    const fullUrl = `${BASE_URL}${cleanPath}`;
    console.log('Generated image URL:', fullUrl);
    return fullUrl;
};

const MyProducts = () => {
    const [products, setProducts] = useState([]);
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [formData, setFormData] = useState({
        name: '',
        type: '',
        price: '',
        quantity: '',
        description: '',
        image: null
    });

    // Filter and sort products
    const filteredProducts = products
        .filter(product => {
            const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                 product.description?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = selectedCategory === '' || product.type === selectedCategory;
            return matchesSearch && matchesCategory;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'price-low':
                    return a.price - b.price;
                case 'price-high':
                    return b.price - a.price;
                case 'quantity':
                    return b.quantity - a.quantity;
                default:
                    return 0;
            }
        });

    useEffect(() => {
        const loadData = async () => {
            try {
                const response = await getMyProducts();
                if (response.success && response.data) {
                    setProducts(response.data);
                } else {
                    toast.error(t('common.failed_to_load_products'));
                }
            } catch (error) {
                console.error('Load products error:', error);
                toast.error(error.message || t('common.failed_to_load_products'));
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [t]);

    const loadMyProducts = async () => {
        try {
            const response = await getMyProducts();
            if (response.success && response.data) {
                setProducts(response.data);
            } else {
                toast.error(t('common.failed_to_load_products'));
            }
        } catch (error) {
            console.error('Load products error:', error);
            toast.error(error.message || t('common.failed_to_load_products'));
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (product) => {
        setSelectedProduct(product);
        setFormData({
            name: product.name,
            type: product.type,
            price: product.price,
            quantity: product.quantity,
            description: product.description || '',
            image: null
        });
        setIsEditDialogOpen(true);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            if (!formData.name || !formData.type || !formData.price || !formData.quantity) {
                toast.error(t('common.please_fill_required_fields'));
                return;
            }

            const price = Number(formData.price);
            const quantity = Number(formData.quantity);

            if (isNaN(price) || price < 0) {
                toast.error(t('common.please_enter_valid_price'));
                return;
            }

            if (isNaN(quantity) || quantity < 0) {
                toast.error(t('common.please_enter_valid_quantity'));
                return;
            }

            const updateData = new FormData();
            updateData.append('name', formData.name.trim());
            updateData.append('type', formData.type);
            updateData.append('price', price);
            updateData.append('quantity', quantity);
            updateData.append('description', formData.description?.trim() || '');

            if (formData.image instanceof File) {
                console.log('Appending image file:', formData.image);
                updateData.append('image', formData.image);
            }

            console.log('Sending update request for product:', selectedProduct._id);
            const response = await updateProduct(selectedProduct._id, updateData);
            
            if (response.success) {
                console.log('Product updated successfully:', response.data);
                toast.success(t('common.product_updated_successfully'));
                setIsEditDialogOpen(false);
                await loadMyProducts();
            } else {
                toast.error(response.message || t('common.failed_to_update_product'));
            }
        } catch (error) {
            console.error('Update product error:', error);
            toast.error(error.message || t('common.failed_to_update_product'));
        }
    };

    const handleDelete = async (productId) => {
         if (window.confirm(t('common.confirm_delete_product'))) {
            try {
                await deleteProduct(productId);
                toast.success(t('common.product_deleted_successfully'));
                loadMyProducts();
            } catch (error) {
                toast.error(error.message || t('common.failed_to_delete_product'));
            }
        }
    };

    if (loading) {
        return <ProductsLoading />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 pb-20">
            {/* Header Section */}
            <header className="sticky top-0 bg-white/95 backdrop-blur-sm shadow-sm z-10 border-b border-green-100">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-lg">م</span>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                                    {t('common.Market.My Products')}
                                </h1>
                                <p className="text-sm text-gray-500">إدارة وتحديث منتجاتك</p>
                            </div>
                        </div>
                        <Link
                            to="/farmer/market"
                            className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                            </svg>
                            {t('common.Back to Market')}
                        </Link>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8">
                {products.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="max-w-md mx-auto">
                            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">{t('common.No products found')}</h3>
                            <p className="text-gray-500 mb-6">لم تقم بإضافة أي منتجات بعد</p>
                            <Link
                                to="/farmer/market"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                إضافة منتج جديد
                            </Link>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Stats Section */}
                        <div className="mb-8">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                            <span className="text-sm font-medium text-gray-600">إجمالي المنتجات</span>
                                        </div>
                                        <span className="text-2xl font-bold text-gray-800">{products.length}</span>
                                        <span className="text-sm text-gray-500">({filteredProducts.length} معروض)</span>
                                    </div>
                                    <Link
                                        to="/farmer/market"
                                        className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1"
                                    >
                                        إضافة منتج جديد
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                    </Link>
                                </div>

                                {/* Search and Filter Controls */}
                                <div className="flex flex-col md:flex-row gap-4">
                                    {/* Search Bar */}
                                    <div className="flex-1">
                                        <div className="relative">
                                            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                            <input
                                                type="text"
                                                placeholder="البحث في المنتجات..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>

                                    {/* Category Filter */}
                                    <div>
                                        <select
                                            value={selectedCategory}
                                            onChange={(e) => setSelectedCategory(e.target.value)}
                                            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        >
                                            <option value="">كل الفئات</option>
                                            <option value="equipment">{t('common.Market.Equipment')}</option>
                                            <option value="pesticides">{t('common.Market.pesticides')}</option>
                                            <option value="seeds">{t('common.Market.seeds')}</option>
                                            <option value="vegetables">{t('common.Market.vegitables')}</option>
                                            <option value="fruits">{t('common.Market.Fruits')}</option>
                                            <option value="cotton">{t('common.Market.Cotton')}</option>
                                        </select>
                                    </div>

                                    {/* Sort Options */}
                                    <div>
                                        <select
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value)}
                                            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        >
                                            <option value="name">ترتيب حسب الاسم</option>
                                            <option value="price-low">السعر: من الأقل للأعلى</option>
                                            <option value="price-high">السعر: من الأعلى للأقل</option>
                                            <option value="quantity">الكمية</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Products Grid */}
                        {filteredProducts.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="max-w-md mx-auto">
                                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-800 mb-2">لا توجد منتجات</h3>
                                    <p className="text-gray-500 mb-6">
                                        {searchTerm || selectedCategory 
                                            ? "لا توجد منتجات تطابق البحث الحالي" 
                                            : "لم تقم بإضافة أي منتجات بعد"
                                        }
                                    </p>
                                    {(searchTerm || selectedCategory) ? (
                                        <button
                                            onClick={() => {
                                                setSearchTerm('');
                                                setSelectedCategory('');
                                            }}
                                            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                            </svg>
                                            إعادة تعيين البحث
                                        </button>
                                    ) : (
                                        <Link
                                            to="/farmer/market"
                                            className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                            إضافة منتج جديد
                                        </Link>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filteredProducts.map((product) => (
                                    <Card key={product._id} className="product-card group overflow-hidden hover:shadow-xl transition-all duration-300 border-0 shadow-lg hover:-translate-y-1">
                                        <div className="relative w-full h-52 overflow-hidden">
                                            <img
                                                src={getImageUrl(product.image)}
                                                alt={product.name}
                                                className="product-image w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                onError={(e) => {
                                                    console.log('Image failed to load:', product.image);
                                                    e.target.src = user;
                                                    e.target.onerror = null;
                                                }}
                                                onLoad={() => console.log('Image loaded successfully:', product.image)}
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                            
                                            {/* Action Buttons */}
                                            <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                <button
                                                    onClick={() => handleEdit(product)}
                                                    className="action-button p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-blue-50 transition-colors"
                                                    title="تعديل المنتج"
                                                >
                                                    <Edit className="w-4 h-4 text-blue-600" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(product._id)}
                                                    className="action-button p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-red-50 transition-colors"
                                                    title="حذف المنتج"
                                                >
                                                    <Trash2 className="w-4 h-4 text-red-600" />
                                                </button>
                                            </div>

                                            {/* Category Badge */}
                                            <div className="absolute bottom-3 left-3">
                                                <span className="category-badge px-3 py-1 bg-white/90 backdrop-blur-sm text-xs font-medium text-gray-700 rounded-full">
                                                    {t(`common.Market.${product.type}`) || product.type}
                                                </span>
                                            </div>
                                        </div>

                                        <CardContent className="p-5">
                                            <div className="space-y-3">
                                                <div>
                                                    <h3 className="font-bold text-lg text-gray-800 line-clamp-1">{product.name}</h3>
                                                    {product.description && (
                                                        <p className="text-sm text-gray-600 line-clamp-2 mt-1">{product.description}</p>
                                                    )}
                                                </div>
                                                
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-2xl font-bold text-green-600">{product.price}</span>
                                                        <span className="text-sm text-gray-500 font-medium">{t('common.EGP')}</span>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xs text-gray-500">الكمية المتاحة</p>
                                                        <p className="text-sm font-semibold text-gray-700">{product.quantity}</p>
                                                    </div>
                                                </div>

                                                <div className="flex gap-2 pt-2">
                                                    <button
                                                        onClick={() => handleEdit(product)}
                                                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium text-sm"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                        {t('common.Edit')}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(product._id)}
                                                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium text-sm"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                        {t('common.Delete')}
                                                    </button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </main>

            {/* Edit Dialog */}
            <Dialog
                open={isEditDialogOpen}
                onClose={() => setIsEditDialogOpen(false)}
                title={t('common.Market.Edit Product')}
            >
                <form onSubmit={handleUpdate} className="space-y-6 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block mb-2 text-sm font-semibold text-gray-700">
                                {t('common.Market.Product Name*')}
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                required
                            />
                        </div>
                        
                        <div>
                            <label className="block mb-2 text-sm font-semibold text-gray-700">
                                {t('common.Market.Category*')}
                            </label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                        
                        <div>
                            <label className="block mb-2 text-sm font-semibold text-gray-700">
                                {t('common.Market.Price (EGP)*')}
                            </label>
                            <input
                                type="number"
                                value={formData.price}
                                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                required
                                min="0"
                                step="0.01"
                            />
                        </div>
                        
                        <div className="md:col-span-2">
                            <label className="block mb-2 text-sm font-semibold text-gray-700">
                                {t('common.Market.Quantity*')}
                            </label>
                            <input
                                type="number"
                                value={formData.quantity}
                                onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                required
                                min="0"
                            />
                        </div>
                        
                        <div className="md:col-span-2">
                            <label className="block mb-2 text-sm font-semibold text-gray-700">
                                {t('common.Market.Description')}
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                rows="4"
                                placeholder="أدخل وصف المنتج..."
                            />
                        </div>
                        
                        <div className="md:col-span-2">
                            <label className="block mb-2 text-sm font-semibold text-gray-700">
                                {t('common.Market.Product Image')}
                            </label>
                            <div className="relative">
                                <input
                                    id="product-image-edit"
                                    type="file"
                                    onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.files[0] }))}
                                    className="opacity-0 absolute z-10 w-full h-full cursor-pointer"
                                    accept="image/*"
                                />
                                <div className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg bg-gray-50">
                                    <label htmlFor="product-image-edit" className="px-4 py-2 bg-green-500 text-white rounded cursor-pointer hover:bg-green-600 transition-colors">
                                        {t('common.Choose File')}
                                    </label>
                                    <span className="text-sm text-gray-600 flex-1">
                                        {formData.image ? formData.image.name : t('common.No file chosen')}
                                    </span>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">يُفضل استخدام صورة بجودة عالية وحجم لا يزيد عن 5MB</p>
                        </div>
                    </div>
                    
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => setIsEditDialogOpen(false)}
                            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                        >
                            {t('common.Cancel')}
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 font-medium shadow-lg"
                        >
                            {t('common.Market.Update Product')}
                        </button>
                    </div>
                </form>
            </Dialog>
        </div>
    );
};

export default MyProducts;