import { Card, CardContent } from '../ui/card';
import { Heart, Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';


const MarketplacePage = () => {
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
    <div className="min-h-screen bg-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <button className="flex items-center space-x-3">
          <Link to="/farmer/profile">
            <div className="w-10 h-10 bg-gray-300 rounded-full">
              <img src="/src/assets/images/harvester.png" alt="user Icon" />
            </div>
          </Link>
          <span className="text-xl text-green-600 font-bold">Welcome Abdulrhman</span>

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
      </header>

      {/* Search Section */}
      <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="relative w-full ">       
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
      <div className="max-w-7xl mx-auto px-4 pb-8">
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
                  <button className="px-3 py-1 bg-green-500 text-white text-sm rounded-full"    
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
    </div>
  );
};

export default MarketplacePage;