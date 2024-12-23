import { Card, CardContent } from '../ui/card';
import { Heart, Share2, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import Dialog from '../ui/dialog';
import BottomNavigation from './BottomNavCompany';

const MarketplacePage = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    price: '',
    quantity: ''
  });

  const categories = [
    { id: 'all', label: 'All', icon: '📋' },
    { id: 'equipment', label: 'Equipment', icon: '🛠️' },
    { id: 'pesticides', label: 'pesticides', icon: '🌱' },
    { id: 'seeds', label: 'seeds', icon: '🌾' },
  ];

  const handleWhatsAppConsult = (phoneNumber) => {
    const formattedNumber = phoneNumber.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/${formattedNumber}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log(formData);
    setIsDialogOpen(false);
    setFormData({ name: '', type: '', price: '', quantity: '' });
  };

  const products = [
    {
      id: 1,
      title: 'Professional Farming Tools',
      company: 'GreenGrow International',
      tags: ['Premium Quality', 'Eco-friendly'],
      price: 1299,
    },
    {
      id: 2,
      title: 'Professional Farming Tools',
      company: 'GreenGrow International',
      tags: ['Premium Quality', 'Eco-friendly'],
      price: 1299,
    },
    {
      id: 3,
      title: 'Professional Farming Tools',
      company: 'GreenGrow International',
      tags: ['Premium Quality', 'Eco-friendly'],
      price: 1299,
    },
    {
      id: 4,
      title: 'Professional Farming Tools',
      company: 'GreenGrow International',
      tags: ['Premium Quality', 'Eco-friendly'],
      price: 1299,
    },
  ];

  return (
    <div className="min-h-screen bg-green-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <button className="flex items-center space-x-3">
            <Link to="/profile">
              <div className="w-10 h-10 bg-gray-300 rounded-full">
                <img src="/src/assets/images/company.png" alt="user Icon" />
              </div>
            </Link>
          </button>
          <div className="flex items-center gap-3">
            <button
              className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-full mr-5"
              onClick={() => setIsDialogOpen(true)}
            >
              <Plus className="w-6 h-6" />
            </button>
            <button className="relative">
              <Link to="/notifications">
                <div className="w-8 h-8 rounded-full">
                  <img src="/src/assets/images/bell.png" alt="notification Icon" />
                </div>
              </Link>
              <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full px-2 py-0.5 text-xs">3</span>
            </button>
          </div>
        </div>
      </header>

      {/* Search Section */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Search for Products, Services, Or Experts..."
            className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            <img src="/src/assets/images/search.png" alt="Search Icon" className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="max-w-7xl mx-auto px-4 mb-6">
        <div className="flex space-x-4 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category.id}
              className={`px-4 py-2 rounded-full flex items-center space-x-2 ${
                category.id === 'all' ? 'bg-green-500 text-white' : 'bg-white border border-gray-300'
              }`}
            >
              <span>{category.icon}</span>
              <span>{category.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <div className="flex-grow max-w-7xl mx-auto px-4 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <div className="relative">
                <div className="aspect-w-1 aspect-h-1 bg-gray-200">
                  {/* Product image placeholder */}
                  <div className="w-full h-48 bg-gray-200"></div>
                </div>
                <button className="absolute top-2 right-2 p-1 rounded-full bg-white">
                  <Heart className="w-5 h-5 text-gray-400" />
                </button>
                <button className="absolute top-2 right-10 p-1 rounded-full bg-white">
                  <Share2 className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-sm">{product.title}</h3>
                <p className="text-sm text-gray-600">{product.company}</p>
                <div className="mt-2 space-y-1">
                  {product.tags.map((tag, index) => (
                    <div key={index} className="text-xs text-gray-500">
                      • {tag}
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-green-500 font-semibold">${product.price}</span>
                  <button
                    className="px-3 py-1 bg-green-500 text-white text-sm rounded-full"
                    onClick={() => handleWhatsAppConsult('+1234567890')}
                  >
                    Message
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Add Product Dialog */}
      <Dialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title="Add New Product"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2">Product Name</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter Product Name"
            />
          </div>
          <div>
            <label className="block mb-2">Product Type</label>
            <input
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter Product Type"
            />
          </div>
          <div>
            <label className="block mb-2">Product Price</label>
            <input
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter Product Price"
            />
          </div>
          <div>
            <label className="block mb-2">Product Quantity</label>
            <input
              name="quantity"
              value={formData.quantity}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter Product Quantity"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg"
          >
            Publish
          </button>
        </form>
      </Dialog>

      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} className="mt-auto" />
    </div>
  );
};

export default MarketplacePage;  