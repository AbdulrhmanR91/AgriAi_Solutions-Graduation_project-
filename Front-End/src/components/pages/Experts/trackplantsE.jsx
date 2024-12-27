import { Card, CardHeader, CardContent } from "../ui/card";
import { Link } from "react-router-dom";
import searchIcon from "../../../assets/images/search.png";
import bellIcon from "../../../assets/images/bell.png";
import tomatoImage from "../../../assets/images/Tomato.jpg";
import EngineerIcon from "../../../assets/images/engineering.png";

const PlantTrackingPageE = () => {
  // Create an array of placeholder images for the gallery
  const plantPhotos = Array(4).fill(tomatoImage);

  return (
    <div className="min-h-screen bg-green-50 p-4 pb-40">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between mb-6">
        <button className="flex items-center space-x-3">
          <Link to="/expert/profile">
            <div className="w-10 h-10 bg-gray-300 rounded-full overflow-hidden">
              <img
                src={EngineerIcon}
                alt="User Icon"
                className="w-full h-full object-cover"
              />
            </div>
          </Link>
          <span className="text-xl text-green-600 font-bold">
            Welcome, Eng.Mohamed
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
          <Link to="/expert/notifications">
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
    </div>
  );
};

export default PlantTrackingPageE;
