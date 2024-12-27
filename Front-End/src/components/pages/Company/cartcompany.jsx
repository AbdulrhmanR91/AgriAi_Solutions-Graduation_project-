import { useState } from "react";
import { Trash2, Heart, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "../ui/card";
import BottomNavigation from "./BottomNavCompany";
const Cartcompany = () => {
  const [activeTab, setActiveTab] = useState("cart");
  const [cart, setCart] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [quantities, setQuantities] = useState({});

  // Calculate total price
  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      const price = parseFloat(item.price.replace("EGP ", ""));
      return total + price * (quantities[item.name] || 1);
    }, 0);
  };

  const removeFromCart = (productName) => {
    setCart(cart.filter((item) => item.name !== productName));
    const newQuantities = { ...quantities };
    delete newQuantities[productName];
    setQuantities(newQuantities);
  };

  const removeFromFavorites = (productName) => {
    setFavorites(favorites.filter((item) => item.name !== productName));
  };

  const updateQuantity = (productName, newQuantity) => {
    if (newQuantity < 1) return;
    setQuantities({ ...quantities, [productName]: newQuantity });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm fixed top-0 w-full z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              to="/company/market"
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              <span className="text-lg font-medium">Back</span>
            </Link>
            <h1 className="text-xl font-bold text-gray-900">
              {activeTab === "cart" ? "Shopping Cart" : "Favorites"}
            </h1>
            <div className="w-10"></div>
          </div>
        </div>
      </header>

      <div className="pt-20 pb-6">
        <div className="max-w-7xl mx-auto px-4">
          {/* Tabs */}
          <div className="flex space-x-4 mb-6">
            <button
              className={`flex-1 py-3 px-4 text-center rounded-lg font-medium transition-colors
                ${
                  activeTab === "cart"
                    ? "bg-green-500 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              onClick={() => setActiveTab("cart")}
            >
              Cart ({cart.length})
            </button>
            <button
              className={`flex-1 py-3 px-4 text-center rounded-lg font-medium transition-colors
                ${
                  activeTab === "favorites"
                    ? "bg-green-500 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              onClick={() => setActiveTab("favorites")}
            >
              Favorites ({favorites.length})
            </button>
          </div>

          {/* Cart Items */}
          {activeTab === "cart" && (
            <div className="space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">Your cart is empty</p>
                </div>
              ) : (
                <>
                  {cart.map((item, index) => (
                    <Card key={index} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="w-24 h-24 bg-gray-200 rounded-lg flex-shrink-0"></div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-lg text-gray-900">
                              {item.name}
                            </h3>
                            <p className="text-sm text-gray-500">{item.farm}</p>
                            <p className="text-green-600 font-bold mt-1">
                              {item.price}
                            </p>

                            <div className="mt-3 flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <button
                                  onClick={() =>
                                    updateQuantity(
                                      item.name,
                                      (quantities[item.name] || 1) - 1
                                    )
                                  }
                                  className="p-1 rounded-md bg-gray-100 hover:bg-gray-200"
                                >
                                  -
                                </button>
                                <span className="w-8 text-center">
                                  {quantities[item.name] || 1}
                                </span>
                                <button
                                  onClick={() =>
                                    updateQuantity(
                                      item.name,
                                      (quantities[item.name] || 1) + 1
                                    )
                                  }
                                  className="p-1 rounded-md bg-gray-100 hover:bg-gray-200"
                                >
                                  +
                                </button>
                              </div>
                              <button
                                onClick={() => removeFromCart(item.name)}
                                className="text-red-500 hover:text-red-600"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  <div className="mt-6 bg-white rounded-lg p-4 shadow">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-semibold">
                        EGP {calculateTotal().toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between mb-4">
                      <span className="text-gray-600">Delivery Fee</span>
                      <span className="font-semibold">EGP 30.00</span>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between">
                        <span className="text-lg font-semibold">Total</span>
                        <span className="text-lg font-bold text-green-600">
                          EGP {(calculateTotal() + 30).toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <button className="w-full mt-4 bg-green-500 text-white py-3 rounded-lg font-medium hover:bg-green-600 transition-colors">
                      Proceed to Checkout
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Favorites */}
          {activeTab === "favorites" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {favorites.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-500">No favorites yet</p>
                </div>
              ) : (
                favorites.map((item, index) => (
                  <Card key={index} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0"></div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg text-gray-900">
                            {item.name}
                          </h3>
                          <p className="text-sm text-gray-500">{item.farm}</p>
                          <p className="text-green-600 font-bold mt-1">
                            {item.price}
                          </p>

                          <div className="mt-3 flex justify-between items-center">
                            <button
                              onClick={() => removeFromFavorites(item.name)}
                              className="text-red-500 hover:text-red-600"
                            >
                              <Heart className="w-5 h-5 fill-current" />
                            </button>
                            <button
                              onClick={() => {
                                setCart([...cart, item]);
                                removeFromFavorites(item.name);
                              }}
                              className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-600"
                            >
                              Add to Cart
                            </button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </div>
      </div>
      <BottomNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        className="mt-auto"
      />
    </div>
  );
};

export default Cartcompany;
