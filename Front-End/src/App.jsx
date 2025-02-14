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
import FarmerProvider from './context/FarmerProvider';
import Orders from './components/pages/Farmer/Orders';
import CompanyProvider  from './context/CompanyProvider';
import CombinedProvider from './context/CombinedProvider';
import ProtectedRoute from './components/pages/Protected Route';
import { UserProvider } from './context/UserContext';
import SavedAnalyses from './components/pages/Farmer/savedanalyses';
import SavedAnalysess from './components/pages/Experts/saved-analyses';

const App = () => {
  return (
    <UserProvider>
      <Toaster position="top-center" />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register/farmer" element={<FarmerRegistration />} />
        <Route path="/register/expert" element={<ExpertRegistration />} />
        <Route path="/register/company" element={<CompanyRegistration />} />
        <Route path="/farmer/*" element={
          <ProtectedRoute>
            <FarmerRoutes />
          </ProtectedRoute>
        } />
        <Route path="/company/*" element={
          <ProtectedRoute>
            <CompanyRoutes />
          </ProtectedRoute>
        } />
        <Route path="/expert/*" element={
          <ProtectedRoute>
            <ExpertRoutes />
          </ProtectedRoute>
        } />
        <Route path="/market" element={
          <ProtectedRoute>
            <CombinedProvider>
              <Market />
            </CombinedProvider>
          </ProtectedRoute>
        } />
        <Route path="/cart" element={
          <ProtectedRoute>
            <CartPage />
          </ProtectedRoute>
        } />
        <Route path="/orders" element={
          <ProtectedRoute>
            <Orders />
          </ProtectedRoute>
        } />
        <Route path="/farmer/market" element={
          <ProtectedRoute>
            <CombinedProvider>
              <Market />
            </CombinedProvider>
          </ProtectedRoute>
        } />
        <Route path="/company/market" element={
          <ProtectedRoute>
            <CombinedProvider>
              <Market />
            </CombinedProvider>
          </ProtectedRoute>
        } />
      </Routes>
    </UserProvider>
  );
};

const FarmerRoutes = () => {
  return (
    <FarmerProvider>
      <>
        <Routes>
          <Route path="/" element={<FarmerHomePage />} />
          <Route path="/home" element={<FarmerHomePage />} />
          <Route path="/profile" element={<FarmerProfile />} />
          <Route path="/trackplants" element={<PlantTrackingPage />} />
          <Route path="/saved-analyses" element={<SavedAnalyses />} /> {/* Add this line */}
          <Route path="/market" element={<Market />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/Consult" element={<Consult />} />
          <Route path="/my-products" element={<MyProducts />} />
          <Route path="/orders" element={<Orders />} />
        </Routes>
        <BottomNavigationFarmer />
      </>
    </FarmerProvider>
  );
};

const CompanyRoutes = () => {
  return (
    <CompanyProvider>
      <>
        <Routes>
          <Route path="/" element={<CompanyHomePage />} />
          <Route path="/profile" element={<CompanyProfile />} />
          <Route path="/notifications" element={<NotificationsCPage />} />
          <Route path="/cart" element={<Cartcompany />} />
          <Route path="/my-products" element={<MyProductcompany />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/market" element={
            <CombinedProvider>
              <Market />
            </CombinedProvider>
          } />
        </Routes>
      </>
    </CompanyProvider>
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
        <Route path="/savedanalyses" element={<SavedAnalysess />} /> {/* Add this line */}
      </Routes>
      <BottomNavigationE />
    </>
  );
};

export default App;