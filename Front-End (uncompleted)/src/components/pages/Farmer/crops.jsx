import { useState } from 'react';
import {  Plus } from 'lucide-react';
import Dialog from '../ui/dialog';
import { Link } from 'react-router-dom';

const CropsPage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    price: '',
    quantity: ''
  });

  const handleWhatsAppConsult = (phoneNumber) => {
    const formattedNumber = phoneNumber.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/${formattedNumber}`;
    window.open(whatsappUrl, '_blank');
  };

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'vegetables', label: 'Vegetables', icon: '🌽' },
    { id: 'fruits', label: 'Fruits', icon: '🍎' },
    { id: 'cotton', label: 'Cotton', icon: '🌿' },
  ];

  const products = [
    {
      name: 'Organic Tomatoes',
      farm: 'Ahmed Farms',
      location: 'Alexandria',
      price: 'EGP 10/kg',
      available: '500 kg'
    },
    {
      name: 'Fresh Wheat',
      farm: 'Delta Agricultural Co.',
      location: 'Giza',
      price: 'EGP 8/kg',
      available: '2000 kg'
    },
    {
      name: 'Banana',
      farm: 'Masr Farm',
      location: 'Tanta',
      price: 'EGP 20/kg',
      available: '300 kg'
    },
    {
      name: 'Cotton',
      farm: 'Mohamed Farms',
      location: 'Monufia',
      price: 'EGP 60/kg',
      available: '5000 kg'
    },
    {
      name: 'Lemon',
      farm: 'Khalid Farms',
      location: 'Fayom',
      price: 'EGP 20/kg',
      available: '600 kg'
    }
  ];

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

  return (
    <div className="min-h-screen bg-green-50">
      {/* Header */}
      <header className=" shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
        <button className="flex items-center space-x-3">
          <Link to="/farmer/profile">
            <div className="w-10 h-10 bg-gray-300 rounded-full">
              <img src="/src/assets/images/harvester.png" alt="user Icon" />
            </div>
          </Link>
          <span className="text-xl text-green-600 font-bold">Welcome Abdulrhman</span>

        </button>
        </div>
        <div className="flex items-center gap-3">
        <button
        className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-full mr-5  "
        onClick={() => setIsDialogOpen(true)}
      >
        <Plus className="w-6 h-6" />
      </button>

      <button className="relative">
          <Link to="/farmer/notifications">
          <div className="w-8 h-8 rounded-full">
            <img src="/src/assets/images/bell.png" alt="notification Icon" />
          </div>
          </Link>
          <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full px-2 py-0.5 text-xs">3</span>
        </button>
        
        </div>

    </div>
      </header>

{ /* Search Bar */}
    <div className="max-w-7xl mx-auto px-4 py-6">
    <div className="relative w-full ">       

    <input 
        type="text" 
        placeholder="Search for Plants"
        className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-400"
      />
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
        <img src="/src/assets/images/search.png" alt="Search Icon" className="w-5 h-5" />
      </div>
      </div>
      </div>
    


    {/* Categories */}
    <div className="max-w-7xl mx-auto px-4 mb-6">
    <div className="flex space-x-1 overflow-x-auto pb-2">
                    {categories.map((category) => (
          <button
            key={category.id}
            className={`px-4 py-2 rounded-full border  ${
              selectedCategory === category.label
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

      {/* Products List */}
      <div className="max-w-7xl mx-auto px-2 grid grid-cols-1 gap-4">
      {products.map((product, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold">{product.name}</h3>
                <p className="text-sm text-gray-500">{product.farm}</p>
                <p className="text-sm text-gray-500">{product.location}</p>
                <div className="mt-3 flex items-center justify-between">
                

                  <button className="px-3 py-1 bg-green-500 text-white text-sm rounded-full"    
                     onClick={() => handleWhatsAppConsult('+1234567890')}
                  >
                    Message
                  </button>
                </div>
              </div>
              <div className="text-right">
                <p className="text-green-500 font-semibold">{product.price}</p>
                <p className="text-sm">Available: {product.available}</p>
              </div>
            </div>
          </div>
        ))}
            
            

                {/* Custom Dialog */}
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
      </div>
  

    </div>
  );
};

export default CropsPage;