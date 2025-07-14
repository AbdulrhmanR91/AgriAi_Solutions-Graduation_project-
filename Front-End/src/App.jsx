import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import axios from 'axios';

import {
  // Pages
  Home,
  
  // Auth Components
  LoginForm as Login,
  ProtectedRoute,
  AdminProtectedRoute,
  AdminLogin,
  
  // Layouts
  AdminLayout,
  
  // Dashboard Components
  CompanyHomePage,
  
  // Navigation Components
  BottomNavigation as BottomNavigationFarmer,
  
  // Profile Components
  Profile as FarmerProfile,
  
  // Products & Orders Components
  CartAndFavourite as CartPage,
  AdminOrders,
  
  // Analytics Components
  SavedAnalyses,
  SavedAnalysess,
  PlantTrackingPage,
  PlantTrackingPageE,
  
  // Market & Consultation Components
  Market,
  Consult,
  Jobs,
  
} from './components';


import ChatRouter from './components/pages/ChatRouter.jsx';
import ExpertChat from './components/features/chat/ExpertChat.jsx';
import FarmerChat from './components/features/chat/Chat.jsx';

import BottomNavigationE from './components/shared/navigation/botttomNavE.jsx';
import FarmerHomePage from './components/features/dashboard/homePagefarmer.jsx'; 
import FarmerRegistration from "./components/auth/forms/FarmerRegistration page";
import ExpertRegistration from "./components/auth/forms/ExpertRegistration";
import CompanyRegistration from "./components/auth/forms/CompanyRegestration";
import ExperthomePage from "./components/features/dashboard/homeExpert"; 
import CompanyProfile from "./components/features/profile/companyProfile.jsx";
import EngineerProfile from "./components/features/profile/profileE";
import MyProducts from "./components/features/products/myProducts";
import Cartcompany from "./components/features/products/cartcompany";
import MyProductcompany from "./components/features/products/myproductcompany";
import Orders from './components/features/orders/Orders';
import OrdersPage from "./components/features/orders/order";
import ConsultationsPage from "./components/features/orders/ordersE";
import NotificationsPage from "./components/features/notifications/Notification";
import NotificationsCPage from "./components/features/notifications/Notification";
import NotificationsPageE from "./components/features/notifications/notificationE";

// Admin Pages
import Dashboard from './components/features/dashboard/adminDashboard.jsx';
import Users from './components/features/dashboard/adminusers.jsx';
import UserDetails from './components/features/dashboard/userDetails.jsx';

// Context Providers
import FarmerProvider from './context/FarmerProvider';
import CompanyProvider from './context/CompanyProvider';
import CombinedProvider from './context/CombinedProvider';
import { UserProvider } from './context/UserContext';
import { ExpertProvider } from './hooks/useExpert.jsx';
import BottomNavigation from './components/shared/navigation/BottomNavCompany';
import { storage } from './utils/storage';

const App = () => {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    user: null,
    loading: true
  });

  useEffect(() => {
    const initializeAuth = () => {
      const session = storage.getSession();
      
      if (!session) {
        localStorage.clear();
        sessionStorage.clear();
        delete axios.defaults.headers.common['Authorization'];
        setAuthState({
          isAuthenticated: false,
          user: null,
          loading: false
        });
      } else {
        axios.defaults.headers.common['Authorization'] = `Bearer ${session.token}`;
        setAuthState({
          isAuthenticated: true,
          user: session.userData,
          loading: false
        });
      }
    };
    
    initializeAuth();

    const handleStorageChange = (e) => {
      if (e.key === 'agriai_token' && !e.newValue) {
        setAuthState({
          isAuthenticated: false,
          user: null,
          loading: false
        });
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []); 

  if (authState.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <AuthProvider>
      <UserProvider>
        <Toaster position="top-center" />
        <Routes>
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/*" element={
            <AdminProtectedRoute>
              <Routes>
                <Route element={<AdminLayout />}>
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="users" element={<Users />} />
                  <Route path="users/:id" element={<UserDetails />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="*" element={<Dashboard />} />
                </Route>
              </Routes>
            </AdminProtectedRoute>
          } />

          {/* Chat routes - handle both base chat and chat with room ID */}
          <Route path="/chat" element={
            <ProtectedRoute>
              <ChatRouter />
            </ProtectedRoute>
          } />
          <Route path="/chat/:roomId" element={
            <ProtectedRoute>
              <ChatRouter />
            </ProtectedRoute>
          } />

          {/* Public routes */}
          <Route path="/" element={<Home />} />
          
          {/* Login route with conditional redirect */}
          <Route 
            path="/login" 
            element={
              authState.isAuthenticated ? (
                <Navigate to={`/${authState.user?.userType}`} replace />
              ) : (
                <Login />
              )
            } 
          />
          
          <Route path="/register/farmer" element={<FarmerRegistration />} />
          <Route path="/register/expert" element={<ExpertRegistration />} />
          <Route path="/register/company" element={<CompanyRegistration />} />
          
          {/* Protected Routes */}
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
          
          {/* Other protected routes */}
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
    </AuthProvider>
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
          <Route path="/saved-analyses" element={<SavedAnalyses />} />
          <Route path="/market" element={<Market />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/my-products" element={<MyProducts />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/consult" element={<Consult />} />
          
          {/* Chat routes - handle both room IDs and expert IDs */}
          <Route path="/chat/:roomId" element={<FarmerChat />} />
          <Route path="/chat" element={<FarmerChat />} />
        </Routes>
        
        {/* Only show bottom nav on non-chat pages */}
        <Routes>
          <Route path="/chat/*" element={null} />
          <Route path="*" element={<BottomNavigationFarmer />} />
        </Routes>
      </>
    </FarmerProvider>
  );
};

const CompanyRoutes = () => {
  const [setActiveTab] = useState('home');
  
  return (
    <CompanyProvider>
        <>
          <Routes>
            <Route path="/" element={<CompanyHomePage />} />
            <Route path="/profile" element={<CompanyProfile />} />
            <Route path="/notifications" element={<NotificationsCPage />} />
            <Route path="/cart" element={<Cartcompany />} />
            <Route path="/my-products" element={<MyProductcompany />} />
            <Route path="/market" element={
              <CombinedProvider>
                <Market />
              </CombinedProvider>
            } />
            <Route path="/orders" element={<OrdersPage />} />
          </Routes>
          <BottomNavigation onTabChange={setActiveTab} />
        </>
    </CompanyProvider>
  );
};

const ExpertRoutes = () => {
  return (
    <ExpertProvider>
      <>
        <Routes>
          <Route path="/" element={<ExperthomePage />} />
          <Route path="/profile" element={<EngineerProfile />} />
          <Route path="/orders" element={<ConsultationsPage />} />
          <Route path="/trackplants" element={<PlantTrackingPageE />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/notifications" element={<NotificationsPageE />} />
          <Route path="/savedanalyses" element={<SavedAnalysess />} />
          <Route path="/chat" element={<ExpertChat />} />
          <Route path="/chat/:roomId" element={<ExpertChat />} />
        </Routes>
        
        {/* Only show bottom nav on non-chat pages */}
        <Routes>
          <Route path="/chat/*" element={null} />
          <Route path="*" element={<BottomNavigationE />} />
        </Routes>
      </>
    </ExpertProvider>
  );
};

export default App;