import { useState, useEffect } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { Card, CardContent } from '../../shared/ui/card';
import Dialog from '../../shared/ui/dialog';
import { Link } from 'react-router-dom';
import { getMyProducts, deleteProduct, updateProduct } from '../../../utils/apiService';
import toast from 'react-hot-toast';
import user from '/src/assets/images/user.png';
import BottomNavigation from '../../shared/navigation/BottomNavCompany';
import { useTranslation } from 'react-i18next'; // Add this import
import './products.css'; // إضافة ملف الـ CSS

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

const MyProductcompany = () => {
    const [products, setProducts] = useState([]);
    const { t } = useTranslation(); // Initialize the translation function
    const [loading, setLoading] = useState(true);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        type: '',
        price: '',
        quantity: '',
        description: '',
        image: null
    });
    const [activeTab, setActiveTab] = useState('home');

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            setLoading(true);
            const response = await getMyProducts();
            if (response.success) {
                setProducts(response.data || []);
            }
        } catch (error) {
            toast.error('Failed to load products');
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

    const handleDelete = async (productId) => {
        if (window.confirm(t('common.Are you sure you want to delete this product?'))) {
            try {
                const response = await deleteProduct(productId);
                if (response.success) {
                    toast.success(t('common.Product deleted successfully'));
                    loadProducts();
                }
            } catch (error) {
                toast.error('Failed to delete product');
            }
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            if (!formData.name || !formData.type || !formData.price || !formData.quantity) {
                toast.error('Please fill all required fields');
                return;
            }

            const price = Number(formData.price);
            const quantity = Number(formData.quantity);

            if (isNaN(price) || price <= 0) {
                toast.error('Please enter a valid price');
                return;
            }

            if (isNaN(quantity) || quantity <= 0) {
                toast.error('Please enter a valid quantity');
                return;
            }

            const updateData = new FormData();
            updateData.append('name', formData.name.trim());
            updateData.append('type', formData.type);
            updateData.append('price', price);
            updateData.append('quantity', quantity);
            updateData.append('description', formData.description?.trim() || '');

            if (formData.image) {
                updateData.append('image', formData.image);
            }

            const response = await updateProduct(selectedProduct._id, updateData);
            if (response.success) {
                toast.success('Product updated successfully');
                setIsEditDialogOpen(false);
                loadProducts();
            }
        } catch (error) {
            toast.error('Failed to update product');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          );    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 pb-20">
            <header className="sticky top-0 bg-white/95 backdrop-blur-sm shadow-sm z-10 border-b border-green-100">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-lg">ش</span>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">{t('common.Market.My Products')}</h1>
                                <p className="text-sm text-gray-500">إدارة منتجات الشركة</p>
                            </div>
                        </div>
                        <Link
                            to="/company/market"
                            className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            {t('common.Market.Add New Product +')}
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
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">{t('common.Market.No products yet')}</h3>
                            <p className="text-gray-500 mb-6">{t('common.Market.Start by adding your first product to the market.')}</p>
                            <Link
                                to="/company/market"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                {t('common.Market.Add Product')}
                            </Link>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Stats Section */}
                        <div className="mb-8">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                            <span className="text-sm font-medium text-gray-600">إجمالي المنتجات</span>
                                        </div>
                                        <span className="text-2xl font-bold text-gray-800">{products.length}</span>
                                    </div>
                                    <Link
                                        to="/company/market"
                                        className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1"
                                    >
                                        إضافة منتج جديد
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Products Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {products.map((product) => (
                                <Card key={product._id} className="product-card group overflow-hidden hover:shadow-xl transition-all duration-300 border-0 shadow-lg hover:-translate-y-1">
                                    <div className="relative">
                                        <img
                                            src={getImageUrl(product.image)}
                                            alt={product.name}
                                            className="product-image w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                                            onError={(e) => {
                                                console.log('Image failed to load:', product.image);
                                                e.target.src = user;
                                                e.target.onerror = null;
                                            }}
                                            onLoad={() => console.log('Image loaded successfully:', product.image)}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                        
                                        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <button
                                                onClick={() => handleEdit(product)}
                                                className="action-button p-1.5 rounded-full bg-white/90 backdrop-blur-sm shadow-lg hover:bg-blue-50 transition-colors"
                                                title="تعديل المنتج"
                                            >
                                                <Pencil className="w-4 h-4 text-blue-500" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(product._id)}
                                                className="action-button p-1.5 rounded-full bg-white/90 backdrop-blur-sm shadow-lg hover:bg-red-50 transition-colors"
                                                title="حذف المنتج"
                                            >
                                                <Trash2 className="w-4 h-4 text-red-500" />
                                            </button>
                                        </div>

                                        {/* Category Badge */}
                                        <div className="absolute bottom-2 left-2">
                                            <span className="category-badge px-3 py-1 bg-white/90 backdrop-blur-sm text-xs font-medium text-gray-700 rounded-full">
                                                {t(`common.Market.${product.type}`) || product.type}
                                            </span>
                                        </div>
                                    </div>

                                    <CardContent className="p-4">
                                        <div className="space-y-3">
                                            <div>
                                                <h3 className="font-semibold text-lg line-clamp-1">{product.name}</h3>
                                                <p className="text-sm text-gray-500">{product.type}</p>
                                            </div>
                                            
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-1">
                                                    <span className="text-xl font-bold text-green-600">{product.price}</span>
                                                    <span className="text-sm text-gray-500">{t('common.EGP')}</span>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs text-gray-500">{t('common.Available')}</p>
                                                    <p className="text-sm font-semibold text-gray-700">{product.quantity}</p>
                                                </div>
                                            </div>
                                            
                                            {product.description && (
                                                <p className="text-sm text-gray-500 line-clamp-2">{product.description}</p>
                                            )}

                                            <div className="flex gap-2 pt-2">
                                                <button
                                                    onClick={() => handleEdit(product)}
                                                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium text-sm"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                    تعديل
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(product._id)}
                                                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium text-sm"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    حذف
                                                </button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </>
                )}
            </main>

            {/* Edit Dialog */}
            <Dialog
                open={isEditDialogOpen}
                onClose={() => setIsEditDialogOpen(false)}
                title={t("common.Market.Edit Product")}
            >
                <form onSubmit={handleUpdate} className="space-y-4 p-4">
                    <div>
                        <label className="block mb-2 text-sm font-medium">{t('common.Market.Product Name*')}</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full p-2 border border-gray-300 rounded-lg"
                            required
                        />
                    </div>
                    <div>
                        <label className="block mb-2 text-sm font-medium">{t('common.Market.Category')}</label>
                        <select
                            value={formData.type}
                            onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                            className="w-full p-2 border border-gray-300 rounded-lg"
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
                        <label className="block mb-2 text-sm font-medium">{t('common.Market.Price (EGP)*')}</label>
                        <input
                            type="number"
                            value={formData.price}
                            onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                            className="w-full p-2 border border-gray-300 rounded-lg"
                            required
                        />
                    </div>
                    <div>
                        <label className="block mb-2 text-sm font-medium">{t('common.Market.Quantity*')}</label>
                        <input
                            type="number"
                            value={formData.quantity}
                            onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                            className="w-full p-2 border border-gray-300 rounded-lg"
                            required
                        />
                    </div>
                    <div>
                        <label className="block mb-2 text-sm font-medium">{t('common.Market.Description')}</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            className="w-full p-2 border border-gray-300 rounded-lg"
                            rows="3"
                        />
                    </div>
                    <div>
                                    <label className="block mb-2 text-sm font-medium">{t('common.Market.Product Image')}</label>
                                    <div className="relative">
                                        <input
                                            id="product-image"
                                            type="file"
                                            onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.files[0] }))}
                                            className="opacity-0 absolute z-10 w-full h-full cursor-pointer"
                                            accept="image/*"
                                        />
                                        <div className="flex items-center gap-2">
                                            <label htmlFor="product-image" className="px-3 py-2 bg-gray-200 rounded cursor-pointer hover:bg-gray-300">
                                                {t('common.Choose File')}
                                            </label>
                                            <span className="text-sm text-gray-500">
                                                {formData.image ? formData.image.name : t('common.No file chosen')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => setIsEditDialogOpen(false)}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                        >
                            {t('common.Cancel')}
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg"
                        >
                           {t('common.Market.Update Product')}
                        </button>
                    </div>
                </form>
            </Dialog>

            <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
    );
};

export default MyProductcompany;










