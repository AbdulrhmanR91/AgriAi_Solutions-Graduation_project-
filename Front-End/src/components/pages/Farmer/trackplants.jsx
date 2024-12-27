import { Card, CardHeader, CardContent } from "../ui/card";
import { Link } from "react-router-dom";
import harvesterIcon from "../../../assets/images/harvester.png";
import searchIcon from "../../../assets/images/search.png";
import bellIcon from "../../../assets/images/bell.png";
import tomatoImage from "../../../assets/images/Tomato.jpg";

const PlantTrackingPage = () => {
  const handleWhatsAppConsult = (phoneNumber) => {
    const formattedNumber = phoneNumber.replace(/\D/g, "");
    const whatsappUrl = `https://wa.me/${formattedNumber}`;
    window.open(whatsappUrl, "_blank");
  };

  // Create an array of placeholder images for the gallery
  const plantPhotos = Array(4).fill(tomatoImage);

  return (
    <div className="min-h-screen bg-green-50 p-4 pb-40">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between mb-6">
        <button className="flex items-center space-x-3">
          <Link to="/farmer/profile">
            <div className="w-10 h-10 bg-gray-300 rounded-full overflow-hidden">
              <img
                src={harvesterIcon}
                alt="User Icon"
                className="w-full h-full object-cover"
              />
            </div>
          </Link>
          <span className="text-xl text-green-600 font-bold">
            Welcome Abdulrhman
          </span>
        </button>

        <div className="relative w-full max-w-xl">
          <input
            type="text"
            placeholder="Search Plants"
            className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            <img src={searchIcon} alt="Search Icon" className="w-5 h-5" />
          </div>
        </div>

        <button className="relative">
          <Link to="/farmer/notifications">
            <div className="w-8 h-8 rounded-full">
              <img
                src={bellIcon}
                alt="Notification Icon"
                className="w-full h-full object-cover"
              />
            </div>
          </Link>
          <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full px-2 py-0.5 text-xs">
            3
          </span>
        </button>
      </div>

      {/* Plant Status Card */}
      <Card className="mb-4">
        <CardHeader className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg overflow-hidden">
              <img
                src={tomatoImage}
                alt="Tomato Plant"
                className="w-full h-full object-cover"
              />
            </div>
            <h2 className="text-xl font-bold">Tomatoes</h2>
          </div>
          <span className="text-orange-500 text-sm">Warning</span>
        </CardHeader>
        <CardContent>
          {/* Status metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <span className="text-blue-500">💧</span>
              <div>
                <div className="text-sm text-gray-500">Moisture</div>
                <div className="font-medium">65%</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-red-500">🌡️</span>
              <div>
                <div className="text-sm text-gray-500">Temperature</div>
                <div className="font-medium">24°C</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">🌱</span>
              <div>
                <div className="text-sm text-gray-500">Growth</div>
                <div className="font-medium">85%</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">🐛</span>
              <div>
                <div className="text-sm text-gray-500">Pests</div>
                <div className="font-medium">Low Risk</div>
              </div>
            </div>
          </div>

          {/* Plant Gallery */}
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Recent Photos
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {plantPhotos.map((photo, index) => (
                <div
                  key={index}
                  className="aspect-square rounded-lg overflow-hidden"
                >
                  <img
                    src={photo}
                    alt={`Plant photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <h2 className="text-xl font-bold">AI Analysis Results 🤖</h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-500">Condition</div>
              <div className="text-green-500">Early Blight detected</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Confidence</div>
              <div className="text-green-500">92%</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Affected Area</div>
              <div>15%</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Severity</div>
              <div className="text-green-500">Moderate</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Treatment Recommendations Card */}
      <Card className="mb-4">
        <CardHeader>
          <h2 className="text-xl font-bold">Treatment Recommendations 💊</h2>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 pl-4">
            <li className="text-gray-700">Apply copper-based fungicide</li>
            <li className="text-gray-700">Improve air circulation</li>
            <li className="text-gray-700">Remove affected leaves</li>
          </ol>
        </CardContent>
      </Card>

      {/* Agricultural Experts Card */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-bold">
            Available Agricultural Experts 👨‍🌾
          </h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Expert profiles should use imported images instead of placeholder API */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    👩‍🌾
                  </div>
                </div>
                <div>
                  <h3 className="font-medium">Dr. Sarah Ahmed</h3>
                  <p className="text-sm text-green-500">Plant Pathology</p>
                </div>
              </div>
              <button
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                onClick={() => handleWhatsAppConsult("+1234567890")}
              >
                Consult Now
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    👨‍🌾
                  </div>
                </div>
                <div>
                  <h3 className="font-medium">Eng. Mohamed Hassan</h3>
                  <p className="text-sm text-green-500">Tomato Cultivation</p>
                </div>
              </div>
              <button
                className="px-4 py-2 bg-gray-100 text-gray-400 rounded-lg cursor-not-allowed"
                disabled
              >
                Unavailable
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlantTrackingPage;
