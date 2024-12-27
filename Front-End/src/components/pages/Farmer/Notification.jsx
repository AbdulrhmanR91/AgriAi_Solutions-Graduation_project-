import { Tractor, Calendar, Search, AlertTriangle } from "lucide-react";

const NotificationsPage = () => {
  const notifications = [
    {
      id: 1,
      type: "alert",
      title: "Disease Detection Alert",
      message:
        "Potential disease detected in your wheat crops. View AI analysis results.",
      icon: AlertTriangle,
      time: "Now",
      color: "text-amber-500",
    },
    {
      id: 2,
      type: "order",
      title: "Order Confirmation",
      message:
        "Your fertilizer order #123 has been shipped and will arrive in 2 days.",
      icon: Tractor,
      time: "Now",
      color: "text-green-500",
    },
    {
      id: 3,
      type: "consultation",
      title: "Upcoming Consultation",
      message: "Reminder: Video consultation with Dr. Ahmed tomorrow at 2 PM",
      icon: Calendar,
      time: "Now",
      color: "text-blue-500",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-grow max-w-2xl mx-auto p-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-green-500 mb-6">
            Notifications
          </h1>

          {/* Search Bar */}
          <div className="relative mb-6">
            <input
              type="text"
              placeholder="Search Notification.."
              className="w-full pl-10 pr-4 py-2 border rounded-full border-gray-200 focus:outline-none focus:border-green-500"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
          </div>

          {/* Notifications List */}
          <div className="space-y-4">
            {notifications.map((notification) => {
              const IconComponent = notification.icon;

              return (
                <div
                  key={notification.id}
                  className="p-4 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-1 ${notification.color}`}>
                      <IconComponent className="w-5 h-5" />
                    </div>

                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-gray-800">
                          {notification.title}
                        </h3>
                        <span className="text-green-500 text-sm">
                          {notification.time}
                        </span>
                      </div>
                      <p className="text-gray-600 mt-1">
                        {notification.message}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Navigation Bar */}
      <div className="bg-white border-t border-gray-200 p-4 fixed bottom-0 left-0 right-0">
        <div className="flex justify-around">
          <button className="text-gray-500 hover:text-green-500">Home</button>
          <button className="text-gray-500 hover:text-green-500">
            Notifications
          </button>
          <button className="text-gray-500 hover:text-green-500">
            Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
