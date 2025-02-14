import { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Edit, Trash2 } from 'lucide-react';
import Dialog from '../ui/dialog';
import { getMyProducts, updateProduct, deleteProduct } from '../../../utils/apiService';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import user from '/src/assets/images/user.png';

const BASE_URL = 'https://dark-gennifer-abdulrhman-5d081501.koyeb.app';

const MyProducts = () => {
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

    useEffect(() => {
        loadMyProducts();
    }, []);

    const loadMyProducts = async () => {
        try {
            const response = await getMyProducts();
            if (response.success && response.data) {
                setProducts(response.data);
            } else {
                toast.error('Failed to load products');
            }
        } catch (error) {
            console.error('Load products error:', error);
            toast.error(error.message || 'Failed to load products');
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
                toast.error('Please fill all required fields');
                return;
            }

            const price = Number(formData.price);
            const quantity = Number(formData.quantity);

            if (isNaN(price) || price < 0) {
                toast.error('Please enter a valid price');
                return;
            }

            if (isNaN(quantity) || quantity < 0) {
                toast.error('Please enter a valid quantity');
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
                toast.success('Product updated successfully!');
                setIsEditDialogOpen(false);
                await loadMyProducts();
            } else {
                toast.error(response.message || 'Failed to update product');
            }
        } catch (error) {
            console.error('Update product error:', error);
            toast.error(error.message || 'Failed to update product');
        }
    };

    const handleDelete = async (productId) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await deleteProduct(productId);
                toast.success('Product deleted successfully!');
                loadMyProducts();
            } catch (error) {
                toast.error(error.message || 'Failed to delete product');
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          );    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">My Products</h1>
                    <Link
                        to="/farmer/market"
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                    >
                        Back to Market
                    </Link>
                </div>

                {products.length === 0 ? (
                    <div className="text-center py-10">
                        <p className="text-gray-500">No products found</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {products.map((product) => (
                            <Card key={product._id} className="overflow-hidden">
                                <div className="relative w-full h-48">
                                    <img
                                        src={product.image ? `${BASE_URL}${product.image}` : user}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            console.error('Image load error:', e);
                                            e.target.src = user;
                                        }}
                                    />
                                </div>
                                <CardContent className="p-4">
                                    <h3 className="font-semibold text-lg">{product.name}</h3>
                                    <p className="text-gray-600 mb-2">{product.description}</p>
                                    <p className="text-green-600 font-bold mb-4">EGP {product.price}</p>
                                    <div className="flex justify-between">
                                        <button
                                            onClick={() => handleEdit(product)}
                                            className="flex items-center gap-2 text-blue-500 hover:text-blue-600"
                                        >
                                            <Edit className="w-4 h-4" />
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(product._id)}
                                            className="flex items-center gap-2 text-red-500 hover:text-red-600"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Delete
                                        </button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Edit Dialog */}
            <Dialog
                open={isEditDialogOpen}
                onClose={() => setIsEditDialogOpen(false)}
                title="Edit Product"
            >
                <form onSubmit={handleUpdate} className="space-y-4">
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
                            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg"
                        >
                            Update
                        </button>
                    </div>
                </form>
            </Dialog>
        </div>
    );
};

export default MyProducts;