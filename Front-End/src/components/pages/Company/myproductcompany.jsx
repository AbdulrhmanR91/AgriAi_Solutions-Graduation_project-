import { useState, useEffect } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import Dialog from '../ui/dialog';
import { Link } from 'react-router-dom';
import { getMyProducts, deleteProduct, updateProduct } from '../../../utils/apiService';
import toast from 'react-hot-toast';
import user from '/src/assets/images/user.png';
import BottomNavigation from './BottomNavCompany';

const BASE_URL = 'https://dark-gennifer-abdulrhman-5d081501.koyeb.app';

const MyProductcompany = () => {
    const [products, setProducts] = useState([]);
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
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                const response = await deleteProduct(productId);
                if (response.success) {
                    toast.success('Product deleted successfully');
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
        <div className="min-h-screen bg-gray-50 pb-20">
            <header className="sticky top-0 bg-white shadow-sm z-10">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-gray-800">My Products</h1>
                        <Link
                            to="/company/market"
                            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                        >
                            + Add New Product
                        </Link>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-6">
                {products.length === 0 ? (
                    <div className="text-center py-12">
                        <h3 className="text-lg font-medium text-gray-900">No products yet</h3>
                        <p className="mt-2 text-gray-500">Start by adding your first product to the market.</p>
                        <Link
                            to="/company/market"
                            className="mt-4 inline-block bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                        >
                            Add Product
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {products.map((product) => (
                            <Card key={product._id} className="overflow-hidden">
                                <div className="relative">
                                    <img
                                        src={product.image ? `${BASE_URL}${product.image}` : user}
                                        alt={product.name}
                                        className="w-full h-48 object-cover"
                                    />
                                    <div className="absolute top-2 right-2 flex gap-2">
                                        <button
                                            onClick={() => handleEdit(product)}
                                            className="p-1.5 rounded-full bg-white shadow-lg hover:bg-gray-50"
                                        >
                                            <Pencil className="w-4 h-4 text-blue-500" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(product._id)}
                                            className="p-1.5 rounded-full bg-white shadow-lg hover:bg-gray-50"
                                        >
                                            <Trash2 className="w-4 h-4 text-red-500" />
                                        </button>
                                    </div>
                                </div>

                                <CardContent className="p-4">
                                    <h3 className="font-semibold text-lg">{product.name}</h3>
                                    <p className="text-sm text-gray-500">{product.type}</p>
                                    <p className="text-green-600 font-bold mt-2">EGP {product.price}</p>
                                    <p className="text-sm text-gray-500">Available: {product.quantity}</p>
                                    {product.description && (
                                        <p className="text-sm text-gray-500 mt-2">{product.description}</p>
                                    )}

                                  
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </main>

            {/* Edit Dialog */}
            <Dialog
                open={isEditDialogOpen}
                onClose={() => setIsEditDialogOpen(false)}
                title="Edit Product"
            >
                <form onSubmit={handleUpdate} className="space-y-4 p-4">
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
                            onClick={() => setIsEditDialogOpen(false)}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg"
                        >
                            Update Product
                        </button>
                    </div>
                </form>
            </Dialog>

            <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
    );
};

export default MyProductcompany;










