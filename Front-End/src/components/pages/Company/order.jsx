import { useState } from "react";
import { Card, CardContent } from "../ui/card";
import { Phone, MapPin, Package, Clock, User } from "lucide-react";
import BottomNavigation from "./BottomNavCompany";

const OrdersPage = () => {
  const [activeTab, setActiveTab] = useState("orders");
  const [orderStatus, setOrderStatus] = useState("all");

  const [orders, setOrders] = useState([
    {
      id: 1,
      customerName: "Ahmed Mohamed",
      phone: "+20 123 456 7890",
      address: "Alexandria, Egypt",
      product: "Organic Tomatoes",
      quantity: "100 kg",
      price: "EGP 1000",
      status: "pending",
      orderDate: "2024-12-25",
      notes: "Delivery preferred in the morning",
    },
    {
      id: 2,
      customerName: "Mohamed Ali",
      phone: "+20 111 222 3333",
      address: "Giza, Egypt",
      product: "Fresh Wheat",
      quantity: "500 kg",
      price: "EGP 4000",
      status: "completed",
      orderDate: "2024-12-24",
      notes: "",
    },
  ]);

  const handleComplete = (orderId) => {
    setOrders(
      orders.map((order) =>
        order.id === orderId ? { ...order, status: "completed" } : order
      )
    );
  };

  const filteredOrders =
    orderStatus === "all"
      ? orders
      : orders.filter((order) => order.status === orderStatus);

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      completed: "bg-green-100 text-green-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="sticky top-0 bg-white shadow-sm z-10 p-4">
        <h1 className="text-xl font-bold text-green-600">Orders Management</h1>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {["all", "pending", "completed"].map((status) => (
            <button
              key={status}
              onClick={() => setOrderStatus(status)}
              className={`px-4 py-2 rounded-full capitalize ${
                orderStatus === status
                  ? "bg-green-500 text-white"
                  : "bg-white border border-gray-200"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-semibold text-lg">{order.product}</h3>
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>
                </div>

                <div className="space-y-3 text-gray-600">
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    <span>{order.customerName}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Phone className="w-5 h-5" />
                    <a href={`tel:${order.phone}`} className="text-green-600">
                      {order.phone}
                    </a>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    <span>{order.address}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    <span>Quantity: {order.quantity}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    <span>
                      Ordered: {new Date(order.orderDate).toLocaleDateString()}
                    </span>
                  </div>

                  {order.notes && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm">Notes: {order.notes}</p>
                    </div>
                  )}

                  {order.status === "pending" && (
                    <div className="mt-4">
                      <button
                        onClick={() => handleComplete(order.id)}
                        className="w-full bg-green-500 text-white py-2 rounded-lg"
                      >
                        Mark as Completed
                      </button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default OrdersPage;
