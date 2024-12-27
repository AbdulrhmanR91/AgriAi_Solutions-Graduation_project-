import { useState } from 'react';
import { Pencil, Trash2, Eye, Share2 } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import Dialog from '../ui/dialog';
import { Link } from 'react-router-dom';

const MyProducts = () => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    type: '',
    price: '',
    quantity: ''
  });

  // Sample data - replace with your actual products data
  const [myProducts, setMyProducts] = useState([
    {
      id: 1,
      name: 'Organic Tomatoes',
      type: 'vegetables',
      farm: 'Your Farm',
      location: 'Alexandria',
      price: 'EGP 10/kg',
      available: '500 kg',
      status: 'active',
      publishDate: '2024-01-15'
    },
    // Add more products as needed
  ]);

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setEditFormData({
      name: product.name,
      type: product.type,
      price: product.price.replace('EGP ', '').replace('/kg', ''),
      quantity: product.available.replace(' kg', '')
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (product) => {
    setSelectedProduct(product);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    setMyProducts(prevProducts => 
      prevProducts.filter(p => p.id !== selectedProduct.id)
    );
    setIsDeleteDialogOpen(false);
    setSelectedProduct(null);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    
    const updatedProduct = {
      ...selectedProduct,
      name: editFormData.name,
      type: editFormData.type,
      price: `EGP ${editFormData.price}/kg`,
      available: `${editFormData.quantity} kg`
    };

    setMyProducts(prevProducts =>
      prevProducts.map(p =>
        p.id === selectedProduct.id ? updatedProduct : p
      )
    );

    setIsEditDialogOpen(false);
    setSelectedProduct(null);
    setEditFormData({ name: '', type: '', price: '', quantity: '' });
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="sticky top-0 bg-white shadow-sm z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">My Products</h1>
            <Link
              to="/farmer/market"
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
            >
              + Add New Product
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {myProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <div className="relative">
                <div className="aspect-w-1 aspect-h-1">
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-400">
                    <span>No Image</span>
                  </div>
                </div>
                <div className="absolute top-2 right-2 flex gap-2">
                  <button 
                    className="p-1.5 rounded-full bg-white shadow-lg hover:bg-gray-50"
                    onClick={() => handleEdit(product)}
                  >
                    <Pencil className="w-4 h-4 text-blue-500" />
                  </button>
                  <button 
                    className="p-1.5 rounded-full bg-white shadow-lg hover:bg-gray-50"
                    onClick={() => handleDelete(product)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
              
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-lg text-gray-800">{product.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    product.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {product.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500">{product.type}</p>
                <p className="text-sm text-gray-500">{product.location}</p>
                <div className="mt-3">
                  <span className="text-green-500 font-bold text-xl">{product.price}</span>
                  <div className="mt-2 text-sm text-gray-500">
                    Available: {product.available}
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    Published: {product.publishDate}
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <button 
                    onClick={() => window.location.href = `/product/${product.id}`}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded-lg flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                  <button 
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded-lg flex items-center justify-center gap-2"
                  >
                    <Share2 className="w-4 h-4" />
                    Share
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {myProducts.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900">No products yet</h3>
            <p className="mt-2 text-gray-500">Start by adding your first product to the market.</p>
            <Link
              to="/farmer/market"
              className="mt-4 inline-block bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
            >
              Add Product
            </Link>
          </div>
        )}
      </main>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        title="Delete Product"
      >
        <div className="p-4">
          <p className="text-gray-700">
            Are you sure you want to delete {selectedProduct?.name}? This action cannot be undone.
          </p>
          <div className="mt-6 flex gap-4">
            <button
              onClick={() => setIsDeleteDialogOpen(false)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Delete
            </button>
          </div>
        </div>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        title="Edit Product"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4 p-4">
          <div>
            <label className="block mb-2 text-sm font-medium">Product Name*</label>
            <input
              required
              name="name"
              value={editFormData.name}
              onChange={handleEditInputChange}
              className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter Product Name"
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium">Product Type*</label>
            <select
              required
              name="type"
              value={editFormData.type}
              onChange={handleEditInputChange}
              className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Select Type</option>
              <option value="equipment">Equipment</option>
              <option value="pesticides">Pesticides</option>
              <option value="seeds">Seeds</option>
              <option value="vegetables">Vegetables</option>
              <option value="fruits">Fruits</option>
              <option value="cotton">Cotton</option>
            </select>
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium">Price per kg (EGP)*</label>
            <input
              required
              type="number"
              min="0"
              name="price"
              value={editFormData.price}
              onChange={handleEditInputChange}
              className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter Price per kg"
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium">Available Quantity (kg)*</label>
            <input
              required
              type="number"
              min="1"
              name="quantity"
              value={editFormData.quantity}
              onChange={handleEditInputChange}
              className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter Available Quantity"
            />
          </div>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setIsEditDialogOpen(false)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg transition-colors duration-200"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};

export default MyProducts;