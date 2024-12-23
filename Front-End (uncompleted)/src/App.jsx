import { Routes, Route } from "react-router-dom";
import Home from './components/pages/Home';
import Login from './components/pages/Login';
import FarmerRegistration from "./components/pages/Farmer/FarmerRegistration page";
import ExpertRegistration from "./components/pages/ExpertRegistration";
import CompanyRegistration from "./components/pages/Company/CompanyRegestration";
import FarmerHomePage from "./components/pages/Farmer/homePagefarmer";
import BottomNavigationFarmer from "./components/pages/Farmer/Bottom Navigation";
import FarmerProfile from "./components/pages/Farmer/profile";
import PlantTrackingPage from "./components/pages/Farmer/trackplants";
import MarketplacePage from "./components/pages/Farmer/Market";
import CropsPage from "./components/pages/Farmer/crops";
import NotificationsPage from "./components/pages/Farmer/Notification";
import CompanyHomePage from "./components/pages/Company/CompanyHomePage";
import CompanyProfile from "./components/pages/Company/profile";
import MarketplaceCPage from "./components/pages/Company/MarketC";
import NotificationsCPage from "./components/pages/Company/Notification";

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register/farmer" element={<FarmerRegistration />} />
        <Route path="/register/expert" element={<ExpertRegistration />} />
        <Route path="/register/company" element={<CompanyRegistration />} />
        <Route path="/farmer/*" element={<FarmerRoutes />} />
        <Route path="/company/*" element={<CompanyRoutes />} />
      </Routes>
    </>
  );
};

const FarmerRoutes = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<FarmerHomePage />} />
        <Route path="/profile" element={<FarmerProfile />} />
        <Route path="/trackplants" element={<PlantTrackingPage />} />
        <Route path="/market" element={<MarketplacePage />} />
        <Route path="/crops" element={<CropsPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
      </Routes>
      <BottomNavigationFarmer />
    </>
  );
};

const CompanyRoutes = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<CompanyHomePage />} />
        <Route path="/profile" element={<CompanyProfile />} />
        <Route path="/market" element={<MarketplaceCPage />} />
        <Route path="/notifications" element={<NotificationsCPage />} />
        
      </Routes>
    </>
  );
};

export default App;
