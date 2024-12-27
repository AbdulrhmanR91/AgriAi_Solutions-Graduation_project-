import { useState } from "react";
import { Plus, Share2, Heart, ShoppingCart, Minus } from "lucide-react";
import Dialog from "../ui/dialog";
import { Link } from "react-router-dom";
import { Card, CardContent } from "../ui/card";

const Market = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [cart, setCart] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [quantities, setQuantities] = useState({});

  const [formData, setFormData] = useState({
    name: "",
    type: "",
    price: "",
    quantity: "",
  });
  const [orderForm, setOrderForm] = useState({
    name: "",
    phone: "",
    address: "",
    quantity: "1",
    notes: "",
  });
  const [products, setProducts] = useState([
    {
      id: 1,
      name: "Organic Tomatoes",
      farm: "Ahmed Farms",
      location: "Alexandria",
      price: "EGP 10/kg",
      available: "500 kg",
      type: "vegetables",
    },
    {
      id: 2,
      name: "Fresh Wheat",
      farm: "Delta Agricultural Co.",
      location: "Giza",
      price: "EGP 8/kg",
      available: "2000 kg",
      type: "seeds",
    },
    {
      id: 3,
      name: "Banana",
      farm: "Masr Farm",
      location: "Tanta",
      price: "EGP 20/kg",
      available: "300 kg",
      type: "fruits",
    },
    {
      id: 4,
      name: "Cotton",
      farm: "Mohamed Farms",
      location: "Monufia",
      price: "EGP 60/kg",
      available: "5000 kg",
      type: "cotton",
    },
    {
      id: 5,
      name: "Lemon",
      farm: "Khalid Farms",
      location: "Fayom",
      price: "EGP 20/kg",
      available: "600 kg",
      type: "fruits",
    },
  ]);

  const filteredProducts = products.filter((product) => {
    if (selectedCategory === "All") return true;
    return product.type?.toLowerCase() === selectedCategory.toLowerCase();
  });

  const categories = [
    { id: "all", label: "All", icon: "📋" },
    { id: "equipment", label: "Equipment", icon: "🛠️" },
    { id: "pesticides", label: "pesticides", icon: "🌱" },
    { id: "seeds", label: "seeds", icon: "🌾" },
    { id: "vegetables", label: "Vegetables", icon: "🌽" },
    { id: "fruits", label: "Fruits", icon: "🍎" },
    { id: "cotton", label: "Cotton", icon: "🌿" },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate form data
    if (
      !formData.name ||
      !formData.type ||
      !formData.price ||
      !formData.quantity
    ) {
      alert("Please fill in all required fields");
      return;
    }

    // Create new product object
    const newProduct = {
      id: products.length + 1,
      name: formData.name,
      farm: "Your Farm Name", // You can make this dynamic based on user profile
      location: "Your Location", // You can make this dynamic based on user profile
      price: `EGP ${formData.price}/kg`,
      available: `${formData.quantity} kg`,
      type: formData.type,
    };

    // Add new product to the products list
    setProducts((prevProducts) => [...prevProducts, newProduct]);

    // Reset form and close dialog
    setFormData({
      name: "",
      type: "",
      price: "",
      quantity: "",
    });
    setIsDialogOpen(false);

    // Show success message
    alert("Product published successfully!");
  };

  const handleShare = (product) => {
    setSelectedProduct(product);
    setIsShareDialogOpen(true);
  };

  const handleSocialShare = (platform) => {
    if (!selectedProduct) return;
    const productDetails = `Check out ${selectedProduct.name} from ${selectedProduct.farm} in ${selectedProduct.location}. Price: ${selectedProduct.price}`;
    const encodedText = encodeURIComponent(productDetails);

    let url = "";
    switch (platform) {
      case "whatsapp":
        url = `https://wa.me/?text=${encodedText}`;
        break;
      case "facebook":
        url = `https://www.facebook.com/sharer/sharer.php?u=${window.location.href}&quote=${encodedText}`;
        break;
      case "twitter":
        url = `https://twitter.com/intent/tweet?text=${encodedText}`;
        break;
      case "telegram":
        url = `https://t.me/share/url?url=${window.location.href}&text=${encodedText}`;
        break;
      default:
        return;
    }
    window.open(url, "_blank");
  };

  const updateQuantity = (productId, change) => {
    setQuantities((prev) => {
      const currentQty = prev[productId] || 1;
      const newQty = Math.max(1, currentQty + change);
      return { ...prev, [productId]: newQty };
    });
  };

  const addToCart = (product) => {
    const quantity = quantities[product.name] || 1;
    const cartItem = {
      ...product,
      quantity,
      totalPrice: parseFloat(product.price.replace("EGP ", "")) * quantity,
    };

    setCart((prev) => [...prev, cartItem]);
    setQuantities((prev) => ({ ...prev, [product.name]: 1 }));
    alert(`Added ${quantity} ${product.name} to cart`);
  };

  const handleOrderClick = (product) => {
    setSelectedProduct(product);
    setIsOrderDialogOpen(true);
  };

  const handleOrderSubmit = (e) => {
    e.preventDefault();
    const order = {
      product: selectedProduct,
      orderDetails: orderForm,
      status: "pending",
      orderDate: new Date().toISOString(),
    };

    console.log("New Order:", order);
    setCart((prev) => [...prev, order]);
    setOrderForm({
      name: "",
      phone: "",
      address: "",
      quantity: "1",
      notes: "",
    });
    setIsOrderDialogOpen(false);
    alert("Order submitted successfully! You can view it in your cart.");
  };

  const handleOrderInputChange = (e) => {
    const { name, value } = e.target;
    setOrderForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="sticky top-0 bg-white shadow-sm z-10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link
                to="/farmer/profile"
                className="flex items-center space-x-3"
              >
                <div className="w-10 h-10 bg-gray-300 rounded-full overflow-hidden">
                  <img
                    src="/src/assets/images/harvester.png"
                    alt="user Icon"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-xl text-green-600 font-bold hidden sm:inline">
                  Welcome Abdulrhman
                </span>
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <button
                className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-full transition-colors"
                onClick={() => setIsDialogOpen(true)}
              >
                <Plus className="w-5 h-5" />
              </button>
              <Link
                to="/farmer/my-products"
                className="p-2 text-gray-600 hover:text-gray-900"
              >
                My Products
              </Link>

              <Link to="/farmer/cart" className="relative">
                <ShoppingCart className="w-6 h-6 text-gray-600" />
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full px-2 py-0.5 text-xs">
                    {cart.length}
                  </span>
                )}
              </Link>

              <Link to="/farmer/notifications" className="relative">
                <div className="w-6 h-6">
                  <img
                    src="/src/assets/images/bell.png"
                    alt="notification Icon"
                    className="w-full h-full"
                  />
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full px-2 py-0.5 text-xs">
                    3
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Search Bar */}
        <div className="relative w-full mb-6">
          <input
            type="text"
            placeholder="Search for Plants"
            className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            <img
              src="/src/assets/images/search.png"
              alt="Search Icon"
              className="w-5 h-5"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="mb-6 -mx-4 px-4 overflow-x-auto">
          <div className="flex space-x-2 min-w-max pb-2">
            {categories.map((category) => (
              <button
                key={category.id}
                className={`px-4 py-2 rounded-full border transition-colors
                  ${
                    selectedCategory === category.label
                      ? "bg-green-500 text-white border-green-500"
                      : "border-gray-200 hover:bg-gray-50"
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
          {filteredProducts.map((product, index) => (
            <Card key={index} className="overflow-hidden">
              <div className="relative">
                <div className="aspect-w-1 aspect-h-1 bg-gray-100">
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-400">
                    <span>No Image</span>
                  </div>
                </div>
                <button
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-white shadow-lg hover:bg-gray-50"
                  onClick={() => {
                    const isFavorite = favorites.some(
                      (fav) => fav.name === product.name
                    );
                    if (isFavorite) {
                      setFavorites(
                        favorites.filter((fav) => fav.name !== product.name)
                      );
                    } else {
                      setFavorites([...favorites, product]);
                    }
                  }}
                >
                  <Heart
                    className={`w-5 h-5 ${
                      favorites.some((fav) => fav.name === product.name)
                        ? "text-red-500 fill-current"
                        : "text-gray-400"
                    }`}
                  />
                </button>
                <button
                  className="absolute top-2 right-10 p-1.5 rounded-full bg-white shadow-lg hover:bg-gray-50"
                  onClick={() => handleShare(product)}
                >
                  <Share2 className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <CardContent className="p-4">
                <h3 className="font-semibold text-lg text-gray-800">
                  {product.name}
                </h3>
                <p className="text-sm text-gray-500">{product.farm}</p>
                <p className="text-sm text-gray-500">{product.location}</p>
                <div className="mt-3">
                  <span className="text-green-500 font-bold text-xl">
                    {product.price}
                  </span>
                  <div className="mt-2 text-sm text-gray-500">
                    Available: {product.available}
                  </div>

                  <div className="mt-3 flex items-center space-x-2">
                    <button
                      onClick={() => updateQuantity(product.name, -1)}
                      className="p-1 rounded-md bg-gray-100 hover:bg-gray-200"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center">
                      {quantities[product.name] || 1}
                    </span>
                    <button
                      onClick={() => updateQuantity(product.name, 1)}
                      className="p-1 rounded-md bg-gray-100 hover:bg-gray-200"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => addToCart(product)}
                      className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black py-1.5 px-3 rounded-full flex items-center justify-center space-x-1 transition-colors duration-200 text-sm"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>Add to Cart</span>
                    </button>
                    <button
                      onClick={() => handleOrderClick(product)}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white py-1.5 px-3 rounded-full text-sm"
                    >
                      Order Now
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      {/* Add Product Dialog */}
      <Dialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title="Add New Product"
        className="max-h-[90vh] overflow-y-auto"
      >
        <form onSubmit={handleSubmit} className="space-y-4 p-4">
          <div>
            <label className="block mb-2 text-sm font-medium">
              Product Name*
            </label>
            <input
              required
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter Product Name"
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium">
              Product Type*
            </label>
            <select
              required
              name="type"
              value={formData.type}
              onChange={handleInputChange}
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
            <label className="block mb-2 text-sm font-medium">
              Price per kg (EGP)*
            </label>
            <input
              required
              type="number"
              min="0"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter Price per kg"
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium">
              Available Quantity (kg)*
            </label>
            <input
              required
              type="number"
              min="1"
              name="quantity"
              value={formData.quantity}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter Available Quantity"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg transition-colors duration-200"
          >
            Publish
          </button>
        </form>
      </Dialog>

      {/* Share Dialog */}
      <Dialog
        open={isShareDialogOpen}
        onClose={() => setIsShareDialogOpen(false)}
        title="Share Product"
      >
        <div className="p-4">
          {selectedProduct && (
            <div className="mb-4">
              <h3 className="font-semibold text-lg">{selectedProduct.name}</h3>
              <p className="text-sm text-gray-500">{selectedProduct.farm}</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleSocialShare("whatsapp")}
              className="flex items-center justify-center gap-2 p-3 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              WhatsApp
            </button>
            <button
              onClick={() => handleSocialShare("facebook")}
              className="flex items-center justify-center gap-2 p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Facebook
            </button>
            <button
              onClick={() => handleSocialShare("twitter")}
              className="flex items-center justify-center gap-2 p-3 bg-blue-400 text-white rounded-lg hover:bg-blue-500"
            >
              Twitter
            </button>
            <button
              onClick={() => handleSocialShare("telegram")}
              className="flex items-center justify-center gap-2 p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Telegram
            </button>
          </div>
        </div>
      </Dialog>

      {/* Order Dialog */}
      <Dialog
        open={isOrderDialogOpen}
        onClose={() => setIsOrderDialogOpen(false)}
        title="Place Order"
        className="fixed inset-0 z-1000 flex items-center justify-center"
      >
        <div className="p-4 max-h-[80vh] overflow-y-auto">
          {selectedProduct && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-lg">{selectedProduct.name}</h3>
              <p className="text-sm text-gray-500">{selectedProduct.farm}</p>
              <p className="text-green-500 font-bold">
                {selectedProduct.price}
              </p>
            </div>
          )}

          <form onSubmit={handleOrderSubmit} className="space-y-4">
            <div>
              <label className="block mb-2">Full Name</label>
              <input
                required
                name="name"
                value={orderForm.name}
                onChange={handleOrderInputChange}
                className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block mb-2">Phone Number</label>
              <input
                required
                name="phone"
                value={orderForm.phone}
                onChange={handleOrderInputChange}
                className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter your phone number"
              />
            </div>

            <div>
              <label className="block mb-2">Delivery Address</label>
              <textarea
                required
                name="address"
                value={orderForm.address}
                onChange={handleOrderInputChange}
                className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter your delivery address"
                rows="3"
              />
            </div>

            <div>
              <label className="block mb-2">Quantity</label>
              <input
                required
                type="number"
                min="1"
                name="quantity"
                value={orderForm.quantity}
                onChange={handleOrderInputChange}
                className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block mb-2">Notes (Optional)</label>
              <textarea
                name="notes"
                value={orderForm.notes}
                onChange={handleOrderInputChange}
                className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Any special requests?"
                rows="2"
              />
            </div>

            <div className="sticky bottom-0 pt-4 bg-white">
              <button
                type="submit"
                className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg"
              >
                Confirm Order (Cash on Delivery)
              </button>
            </div>
          </form>
        </div>
      </Dialog>
    </div>
  );
};

export default Market;
