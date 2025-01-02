import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Home from './components/pages/Home';
import Login from './components/pages/Login';
import FarmerRegistration from "./components/pages/Farmer/FarmerRegistration page";
import ExpertRegistration from "./components/pages/Experts/ExpertRegistration";
import CompanyRegistration from "./components/pages/Company/CompanyRegestration";
import FarmerHomePage from "./components/pages/Farmer/homePagefarmer";
import BottomNavigationFarmer from "./components/pages/Farmer/Bottom Navigation";
import FarmerProfile from "./components/pages/Farmer/profile";
import PlantTrackingPage from "./components/pages/Farmer/trackplants";
import Market from "./components/pages/Farmer/Market";
import NotificationsPage from "./components/pages/Farmer/Notification";
import CompanyHomePage from "./components/pages/Company/CompanyHomePage";
import CompanyProfile from "./components/pages/Company/profile";
import MarketplaceCPage from "./components/pages/Company/MarketC";
import NotificationsCPage from "./components/pages/Company/Notification";
import CartPage from "./components/pages/Farmer/cart and favourite";
import Consult from "./components/pages/Farmer/consult";
import MyProducts from "./components/pages/Farmer/myProducts";
import Cartcompany from "./components/pages/Company/cartcompany";
import MyProductcompany from "./components/pages/Company/myproductcompany";
import OrdersPage from "./components/pages/Company/order";
import ExperthomePage from "./components/pages/Experts/homeExpert";
import EngineerProfile from "./components/pages/Experts/profileE";
import ConsultationsPage from "./components/pages/Experts/ordersE";
import PlantTrackingPageE from "./components/pages/Experts/trackplantsE";
import BottomNavigationE from "./components/pages/Experts/botttomNavE";
import Jobs from "./components/pages/Experts/jobs";
import NotificationsPageE from "./components/pages/Experts/notificationE";

const App = () => {
  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            theme: {
              primary: '#4CAF50',
            },
          },
          error: {
            duration: 4000,
            theme: {
              primary: '#f44336',
            },
          },
        }}
      />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register/farmer" element={<FarmerRegistration />} />
        <Route path="/register/expert" element={<ExpertRegistration />} />
        <Route path="/register/company" element={<CompanyRegistration />} />
        <Route path="/farmer/*" element={<FarmerRoutes />} />
        <Route path="/company/*" element={<CompanyRoutes />} />
        <Route path="/expert/*" element={<ExpertRoutes />} />
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
        <Route path="/market" element={<Market />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/Consult" element={<Consult />} />
        <Route path="/my-products" element={<MyProducts />} />


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
        <Route path="/cart" element={<Cartcompany />} />
        <Route path="/my-products" element={<MyProductcompany />} />
        <Route path="/orders" element={<OrdersPage />} />
      </Routes>
      
    </>
  );
};

const ExpertRoutes = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<ExperthomePage />} />
        <Route path="/profile" element={<EngineerProfile />} />
        <Route path="/orders" element={<ConsultationsPage />} />
        <Route path="/trackplants" element={<PlantTrackingPageE />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/notifications" element={<NotificationsPageE />} />
      </Routes>
      <BottomNavigationE />
    </>
  );
};

export default App;
