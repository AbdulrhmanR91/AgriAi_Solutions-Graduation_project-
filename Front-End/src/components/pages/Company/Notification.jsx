import { Search } from "lucide-react";
import BottomNavigation from "./BottomNavCompany";

const NotificationsCPage = () => {
  const notifications = [
    {
      id: 1,
      title: "Upcoming Consultation",
      message: "Reminder: Video consultation with Dr. Ahmed tomorrow at 2 PM",
      icon: "📅",
      time: "Now",
    },
    {
      id: 2,
      title: "New Message",
      message:
        "Cairo Fertilizers Co. sent you a new message about your recent inquiry",
      icon: "📨",
      time: "Now",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="flex-grow max-w-2xl mx-auto p-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-green-500 mb-6">
            Notifications
          </h1>

          {/* Search Bar */}
          <div className="relative mb-6">
            <input
              type="text"
              placeholder="Search Notification.."
              className="w-full pl-12 pr-4 py-3 rounded-full border-2 border-green-500 focus:outline-none text-gray-600 text-lg"
            />
            <Search className="absolute left-4 top-3.5 text-green-500 w-6 h-6" />
          </div>

          {/* Notifications List */}
          <div className="space-y-6">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="p-4 bg-white rounded-3xl border-2 border-green-500"
              >
                <div className="flex items-start gap-4">
                  <div className="text-2xl">{notification.icon}</div>

                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-xl text-gray-900">
                        {notification.title}
                      </h3>
                      <span className="text-green-500 text-lg font-medium">
                        {notification.time}
                      </span>
                    </div>
                    <p className="text-gray-800 mt-1 text-base">
                      {notification.message}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <BottomNavigation onTabChange={() => {}} />
    </div>
  );
};

export default NotificationsCPage;
