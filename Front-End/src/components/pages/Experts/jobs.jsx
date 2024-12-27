import { Link } from 'react-router-dom';
import { Card, CardHeader, CardContent } from '../ui/card';
import engineer from "/src/assets/images/engineering.png";
import search from "/src/assets/images/search.png";

const Jobs = () => {
  const handleWhatsAppConsult = (phoneNumber) => {
    const formattedNumber = phoneNumber.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/${formattedNumber}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 flex flex-col items-center">
      <header className="sticky top-0 bg-white shadow-sm z-10 w-full">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link to="/expert/profile" className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-300 rounded-full overflow-hidden">
                  <img
                    src= {engineer}
                    alt="user Icon"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-xl text-green-600 font-bold hidden sm:inline">
                  Welcome, Eng.Mohamed
                </span>
              </Link>
            </div>

            <Link to="/expert/notifications" className="relative">
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
      </header>

      <main className="w-full max-w-2xl px-4 py-6">
        {/* Search Bar */}
        <div className="relative w-full mb-6">
          <input
            type="text"
            placeholder="Search for Companies"
            className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            <img src= {search} alt="Search Icon" className="w-5 h-5" />
          </div>
        </div>

        {/* Agricultural Experts Card */}
        <Card className="w-full">
          <CardHeader>
            <h2 className="text-xl font-bold text-center">Available Agricultural Companies 🏢 </h2>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-6">
              {/* companies profiles */}
              <div className="flex items-center justify-between w-full border-b pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                        🏢
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium">Delta Agricultural Co. </h3>
                    <p className="text-sm text-green-500">supplier</p>
                  </div>
                </div>
                <button
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  onClick={() => handleWhatsAppConsult('+1234567890')}
                >
                  Contact
                </button>
              </div>
              <div className="flex items-center justify-between w-full border-b pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                    🏢
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium">Egypt Agricultural co.</h3>
                    <p className="text-sm text-green-500">Fields and seeds proviedor</p>
                  </div>
                </div>
                <button
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  onClick={() => handleWhatsAppConsult('+1234567890')}
                  >
                    Contact
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Jobs;
