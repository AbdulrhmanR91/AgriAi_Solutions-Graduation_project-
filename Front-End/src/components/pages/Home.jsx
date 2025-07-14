import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { User, LogOut, Home as HomeIcon } from 'lucide-react';
import axios from 'axios';
import logo from '../../assets/images/logoh.png';
import homeimage from '../../assets/images/hom.jpg';
import recom from '../../assets/images/recom.jpg';
import consulImage from '../../assets/images/consul.jpg';
import LanguageSwitcher from '../shared/common/LanguageSwitcher';
import { storage } from '../../utils/storage';
import { getImageUrl } from '../../utils/apiService';
import { logout as authLogout } from '../../utils/auth';
import config from '../../config/config';

const Home = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  useEffect(() => {
    // Check if user is authenticated
    const session = storage.getSession();
    if (session && session.userData) {
      setUser(session.userData);
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogout = async () => {
    if (window.confirm(t('common.confirmLogout', 'Are you sure you want to logout?'))) {
      try {
        console.log('Starting logout process...');
        
        // Clear session storage first
        storage.clearSession();
        
        // Clear axios authorization headers
        delete axios.defaults.headers.common['Authorization'];
        
        // Clear any cached data
        sessionStorage.clear();
        
        // Update local state immediately
        setUser(null);
        setIsAuthenticated(false);
        
        console.log('Logout completed, redirecting...');
        
        // Force page reload to ensure clean state
        window.location.href = '/login';
        
      } catch (error) {
        console.error('Logout error:', error);
        
        // Force cleanup even if there's an error
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/login';
      }
    }
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    return `/${user.userType}`;
  };

  const getProfilePath = () => {
    if (!user) return '/login';
    return `/${user.userType}/profile`;
  };

  const getProfileImage = () => {
    if (!user?.profileImage) return null;
    return getImageUrl(user.profileImage);
  };

  const getUserDisplayName = () => {
    return user?.name || t('common.user', 'User');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header Navigation */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex justify-between items-center">
            
            {/* Logo Section */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="relative">
                <img
                  src={logo}
                  alt="Logo"
                  className="w-10 h-auto sm:w-14 md:w-16 lg:w-20 transition-transform duration-300 hover:scale-110"
                />
                {/* Glow effect */}
                <div className="absolute inset-0 bg-green-400 rounded-full opacity-0 blur-xl transition-opacity duration-300 hover:opacity-20"></div>
              </div>
              <div className="hidden xs:block">
                <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  {t('home.brandName', 'AgriAI')}
                </h1>
                <p className="text-xs text-gray-500 font-medium hidden sm:block">
                  {t('home.tagline', 'Smart Farming')}
                </p>
              </div>
            </div>

            {/* Navigation Links - Desktop Only */}
            <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
              <a
                href="#features"
                className="relative text-gray-700 font-semibold hover:text-green-600 transition-all duration-300 group text-sm xl:text-base"
              >
                {t('home.features', 'Features')}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-green-600 to-blue-600 transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a
                href="#how-it-works"
                className="relative text-gray-700 font-semibold hover:text-green-600 transition-all duration-300 group text-sm xl:text-base"
              >
                {t('home.howItWorks', 'How It Works')}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-green-600 to-blue-600 transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a
                href="#about"
                className="relative text-gray-700 font-semibold hover:text-green-600 transition-all duration-300 group text-sm xl:text-base"
              >
                {t('home.about', 'About')}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-green-600 to-blue-600 transition-all duration-300 group-hover:w-full"></span>
              </a>
            </nav>

            {/* Right Side - User Actions */}
            <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-3">
              
              {/* Language Switcher with improved design */}
              <div className="relative hidden sm:block">
                <LanguageSwitcher />
              </div>

              {/* Conditional Navigation based on authentication */}
              {isAuthenticated ? (
                <div className="flex items-center space-x-1 sm:space-x-2">
                  
                  {/* User Profile Section - Simplified for mobile */}
                  <div className="flex items-center space-x-1 sm:space-x-2 bg-gray-50 rounded-full px-2 py-1 sm:px-3 sm:py-2 hover:bg-gray-100 transition-colors duration-300">
                    {/* Profile Image */}
                    <div className="relative">
                      {getProfileImage() ? (
                        <img 
                          src={getProfileImage()} 
                          alt={getUserDisplayName()}
                          className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full object-cover border-2 border-green-500/30 hover:border-green-500 transition-colors duration-300"
                        />
                      ) : (
                        <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center border-2 border-green-500/30 hover:border-green-500 transition-colors duration-300">
                          <User size={12} className="sm:w-4 sm:h-4 md:w-5 md:h-5 text-green-600" />
                        </div>
                      )}
                      {/* Online indicator */}
                      <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full border border-white"></div>
                    </div>
                    
                    {/* User Name - Hidden on very small screens */}
                    <div className="hidden md:block lg:block">
                      <p className="text-xs sm:text-sm font-semibold text-gray-700 leading-tight">
                        {getUserDisplayName()}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">
                        {user?.userType || 'User'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Action Buttons - Compact for mobile */}
                  <div className="flex items-center space-x-1">
                    {/* Dashboard Button */}
                    <Link to={getDashboardPath()}>
                      <button className="relative bg-gradient-to-r from-green-600 to-green-700 text-white px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-full hover:from-green-700 hover:to-green-800 transition-all duration-300 text-xs sm:text-sm font-semibold flex items-center space-x-1 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 group">
                        <HomeIcon size={14} className="sm:w-4 sm:h-4 group-hover:scale-110 transition-transform duration-300" />
                        <span className="hidden sm:inline">{t('common.dashboard', 'Dashboard')}</span>
                      </button>
                    </Link>
                    
                    {/* Profile Button - Hidden on very small screens */}
                    <Link to={getProfilePath()} className="hidden xs:block">
                      <button className="relative bg-gradient-to-r from-blue-600 to-blue-700 text-white px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-full hover:from-blue-700 hover:to-blue-800 transition-all duration-300 text-xs sm:text-sm font-semibold flex items-center space-x-1 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 group">
                        <User size={14} className="sm:w-4 sm:h-4 group-hover:scale-110 transition-transform duration-300" />
                        <span className="hidden sm:inline">{t('common.profile', 'Profile')}</span>
                      </button>
                    </Link>
                    
                    {/* Logout Button */}
                    <button 
                      onClick={handleLogout}
                      className="relative bg-gradient-to-r from-red-500 to-red-600 text-white px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-full hover:from-red-600 hover:to-red-700 transition-all duration-300 text-xs sm:text-sm font-semibold flex items-center space-x-1 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 group"
                    >
                      <LogOut size={14} className="sm:w-4 sm:h-4 group-hover:scale-110 transition-transform duration-300" />
                      <span className="hidden sm:inline">{t('common.logout', 'Logout')}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-1 sm:space-x-2">
                  {/* Login Button - Hidden on very small screens */}
                  <Link to="/login" className="hidden xs:block">
                    <button className="text-gray-700 hover:text-green-600 font-semibold px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-full hover:bg-green-50 transition-all duration-300 text-xs sm:text-sm">
                      {t('common.login', 'Login')}
                    </button>
                  </Link>
                  
                  {/* Get Started Button */}
                  <Link to="/login">
                    <button className="bg-gradient-to-r from-green-600 to-green-700 text-white px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 rounded-full hover:from-green-700 hover:to-green-800 transition-all duration-300 text-xs sm:text-sm font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center space-x-1">
                      <span>{t('home.getStarted', 'Get Started')}</span>
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button 
                onClick={toggleMobileMenu}
                className="lg:hidden p-1.5 sm:p-2 rounded-full hover:bg-gray-100 transition-colors duration-300"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu - Now functional */}
          <div className={`lg:hidden transition-all duration-300 ease-in-out ${
            isMobileMenuOpen 
              ? 'mt-4 pb-4 border-t border-gray-100 pt-4 opacity-100 max-h-96' 
              : 'max-h-0 opacity-0 overflow-hidden'
          }`}>
            <nav className="flex flex-col space-y-3">
              <a
                href="#features"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gray-700 font-semibold hover:text-green-600 transition-colors duration-300 py-2 text-sm"
              >
                {t('home.features', 'Features')}
              </a>
              <a
                href="#how-it-works"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gray-700 font-semibold hover:text-green-600 transition-colors duration-300 py-2 text-sm"
              >
                {t('home.howItWorks', 'How It Works')}
              </a>
              <a
                href="#about"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gray-700 font-semibold hover:text-green-600 transition-colors duration-300 py-2 text-sm"
              >
                {t('home.about', 'About')}
              </a>
              
              {/* Additional Mobile Options */}
              {!isAuthenticated && (
                <div className="flex flex-col space-y-2 pt-4 border-t border-gray-100">
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <button className="w-full text-left text-gray-700 hover:text-green-600 font-semibold py-2 text-sm">
                      {t('common.login', 'Login')}
                    </button>
                  </Link>
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <button className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 rounded-full hover:from-green-700 hover:to-green-800 transition-all duration-300 text-sm font-semibold">
                      {t('home.getStarted', 'Get Started')}
                    </button>
                  </Link>
                </div>
              )}
              
              {/* Language Switcher for Mobile */}
              <div className="sm:hidden pt-2">
                <LanguageSwitcher />
              </div>
            </nav>
          </div>
        </div>

        {/* Gradient bottom border */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 opacity-60"></div>
      </header>

      {/* Hero Section with Video */}
      <section className="relative min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-700 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="relative z-10 container mx-auto px-4 sm:px-6 py-6 sm:py-8 lg:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center min-h-screen">
            
            {/* Content Side */}
            <div className="text-center lg:text-left space-y-4 sm:space-y-6 lg:space-y-8 order-2 lg:order-1 px-2 sm:px-0">
              {isAuthenticated ? (
                <>
                  <div className="space-y-3 sm:space-y-4">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight">
                      <span className="block text-green-200">
                        {t('home.welcomeBack', 'Welcome Back')}
                      </span>
                      <span className="block text-white mt-1 sm:mt-2">
                        {getUserDisplayName()}!
                      </span>
                    </h1>
                    <p className="text-sm sm:text-lg md:text-xl lg:text-2xl text-green-100 max-w-2xl mx-auto lg:mx-0 leading-relaxed px-4 sm:px-0">
                      {t('home.heroDescAuth', 'Continue your agricultural journey with our AI-powered solutions')}
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start px-4 sm:px-0">
                    <Link to={getDashboardPath()}>
                      <button className="w-full sm:w-auto bg-white text-green-800 px-6 sm:px-8 py-3 sm:py-4 rounded-full hover:bg-green-50 transition-all duration-300 text-base sm:text-lg font-semibold flex items-center justify-center space-x-2 sm:space-x-3 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                        <HomeIcon size={18} className="sm:w-5 sm:h-5" />
                        <span>{t('common.goToDashboard', 'Go to Dashboard')}</span>
                      </button>
                    </Link>
                    <Link to={getProfilePath()}>
                      <button className="w-full sm:w-auto border-2 border-white text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full hover:bg-white hover:text-green-800 transition-all duration-300 text-base sm:text-lg font-semibold flex items-center justify-center space-x-2 sm:space-x-3 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                        <User size={18} className="sm:w-5 sm:h-5" />
                        <span>{t('common.viewProfile', 'View Profile')}</span>
                      </button>
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-3 sm:space-y-4">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight">
                      <span className="block text-green-200">
                        {t('home.heroTitle', 'Transform Your')}
                      </span>
                      <span className="block text-white mt-1 sm:mt-2">
                        {t('home.heroSubtitle', 'Agricultural Future')}
                      </span>
                    </h1>
                    <p className="text-sm sm:text-lg md:text-xl lg:text-2xl text-green-100 max-w-2xl mx-auto lg:mx-0 leading-relaxed px-4 sm:px-0">
                      {t('home.heroDesc', 'Discover AI-powered solutions for modern farming')}
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start px-4 sm:px-0">
                    <Link to="/login">
                      <button className="w-full sm:w-auto bg-white text-green-800 px-6 sm:px-8 py-3 sm:py-4 rounded-full hover:bg-green-50 transition-all duration-300 text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                        {t('home.explorePlatform', 'Explore Platform')}
                      </button>
                    </Link>
                    <button className="w-full sm:w-auto border-2 border-white text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full hover:bg-white hover:text-green-800 transition-all duration-300 text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                      {t('home.learnMore', 'Learn More')}
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Video Side */}
            <div className="order-1 lg:order-2 flex justify-center px-4 sm:px-0">
              <div className="relative w-full max-w-lg sm:max-w-xl lg:max-w-2xl">
                {/* Video Container with Creative Design */}
                <div className="relative">
                  {/* Decorative Elements - Adjusted for mobile */}
                  <div className="absolute -top-2 sm:-top-4 -left-2 sm:-left-4 w-full h-full bg-gradient-to-br from-green-400 to-green-600 rounded-xl sm:rounded-2xl transform rotate-2 sm:rotate-3 opacity-20"></div>
                  <div className="absolute -top-1 sm:-top-2 -left-1 sm:-left-2 w-full h-full bg-gradient-to-br from-green-500 to-green-700 rounded-xl sm:rounded-2xl transform rotate-1 opacity-30"></div>
                  
                  {/* Main Video Container */}
                  <div className="relative bg-white p-1.5 sm:p-2 rounded-xl sm:rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300">
                    <div className="relative aspect-video rounded-lg sm:rounded-xl overflow-hidden shadow-lg">
                      <iframe
                        src="https://www.youtube.com/embed/B8yrhLB5KO4?rel=0&modestbranding=1&showinfo=0"
                        title="Platform Demo Video"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        className="w-full h-full"
                      ></iframe>
                    </div>
                    
                    {/* Video Caption */}
                    <div className="p-2 sm:p-4 text-center">
                      <p className="text-green-800 font-semibold text-xs sm:text-sm md:text-base">
                        {t('home.videoCaption', 'See Our Platform in Action')}
                      </p>
                    </div>
                  </div>
                  
                  {/* Floating Elements - Adjusted for mobile */}
                  <div className="absolute -bottom-2 sm:-bottom-4 -right-2 sm:-right-4 w-10 h-10 sm:w-16 sm:h-16 bg-green-400 rounded-full opacity-70 animate-pulse"></div>
                  <div className="absolute -top-4 sm:-top-8 -right-4 sm:-right-8 w-8 h-8 sm:w-12 sm:h-12 bg-green-300 rounded-full opacity-50 animate-bounce"></div>
                </div>
                
                {/* Stats or Features around video - Hidden on mobile */}
                <div className="hidden xl:block">
                  </div>
                  
                  <div className="absolute -right-16 bottom-1/4 bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-white">24/7</div>
                    <div className="text-sm text-green-200">{t('home.feature2', 'Support')}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        {/* Bottom Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1200 120" className="w-full h-auto">
            <path d="M0,0V120H1200V0C1200,0 1050,120 900,120C750,120 600,0 450,0C300,0 150,120 0,120Z" fill="#f9fafb"></path>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 sm:px-6">
          {/* Section Header */}
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-green-100 rounded-full mb-4 sm:mb-6">
              <svg className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 px-4">
              {t('home.solutionsTitle', 'Powerful Solutions')}
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-4">
              {t('home.solutionsDesc', 'Discover cutting-edge AI technologies designed to revolutionize your agricultural practices')}
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
            {[
              {
                image: "https://plus.unsplash.com/premium_photo-1664477103105-bc5d69e2e77f?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                title: t('home.feature1Title', 'Plant Disease Detection'),
                desc: t('home.feature1Desc', 'Advanced AI analysis for early disease identification'),
                icon: "🌿",
                color: "from-green-400 to-green-600"
              },
              {
                image: "https://plus.unsplash.com/premium_photo-1663039878530-66fe183c2a23?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                title: t('home.feature2Title', 'Smart Recommendations'),
                desc: t('home.feature2Desc', 'Personalized farming advice based on data analysis'),
                icon: "🧠",
                color: "from-blue-400 to-blue-600"
              },
              {
                image: "https://plus.unsplash.com/premium_photo-1661832711622-e70ea4ec8301?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                title: t('home.feature3Title', 'Expert Consultation'),
                desc: t('home.feature3Desc', 'Connect with agricultural experts for professional guidance'),
                icon: "👨‍🌾",
                color: "from-purple-400 to-purple-600"
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="group relative"
              >
                {/* Card */}
                <div className="relative bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden transform hover:-translate-y-1 sm:hover:-translate-y-2">
                  {/* Image with Overlay */}
                  <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden">
                    <img
                      src={feature.image}
                      alt={feature.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    {/* Gradient Overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-t ${feature.color} opacity-0 group-hover:opacity-80 transition-opacity duration-500`}></div>
                    
                    {/* Icon */}
                    <div className="absolute top-3 right-3 sm:top-4 sm:right-4 w-10 h-10 sm:w-12 sm:h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-lg sm:text-2xl group-hover:scale-110 transition-transform duration-300">
                      {feature.icon}
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-4 sm:p-6 md:p-8">
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-2 sm:mb-3 group-hover:text-green-600 transition-colors duration-300">
                      {feature.title}
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-3 sm:mb-4">
                      {feature.desc}
                    </p>
                    
                    {/* Learn More Button */}
                    <button className="inline-flex items-center text-green-600 font-semibold hover:text-green-700 transition-colors duration-300 text-sm sm:text-base">
                      {t('common.learnMore', 'Learn More')}
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                  
                  {/* Decorative Element */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 to-green-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="text-center mt-8 sm:mt-12 md:mt-16">
            <Link to="/login">
              <button className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full hover:from-green-700 hover:to-green-800 transition-all duration-300 text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                {t('home.exploreAllFeatures', 'Explore All Features')}
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gradient-to-br from-green-50 via-white to-blue-50">
        <div className="container mx-auto px-4 sm:px-6">
          {/* Section Header */}
          <div className="text-center mb-10 sm:mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 px-4">
              {t('home.howItWorks', 'How It Works')}
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-4">
              {t('home.howItWorksDesc', 'Simple steps to transform your agricultural practices with AI')}
            </p>
          </div>

          {/* Steps */}
          <div className="relative">
            {/* Connection Line - Hidden on mobile and tablet */}
            <div className="hidden xl:block absolute top-32 left-1/2 transform -translate-x-1/2 w-full max-w-4xl">
              <div className="relative h-1 bg-gradient-to-r from-green-200 via-blue-200 to-purple-200 rounded-full">
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 rounded-full animate-pulse opacity-60"></div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8 lg:gap-12 relative z-10">
              {[
                {
                  image: "https://images.unsplash.com/photo-1591754060004-f91c95f5cf05?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                  step: t('home.step1', 'Upload Image'),
                  desc: t('home.step1Desc', 'Take a photo of your plant or crop'),
                  number: "01",
                  color: "from-green-400 to-green-600",
                  bgColor: "bg-green-100"
                },
                {
                  image: homeimage,
                  step: t('home.step2', 'AI Analysis'),
                  desc: t('home.step2Desc', 'Our AI analyzes the image instantly'),
                  number: "02",
                  color: "from-blue-400 to-blue-600",
                  bgColor: "bg-blue-100"
                },
                {
                  image: recom,
                  step: t('home.step3', 'Get Results'),
                  desc: t('home.step3Desc', 'Receive detailed recommendations'),
                  number: "03",
                  color: "from-purple-400 to-purple-600",
                  bgColor: "bg-purple-100"
                },
              ].map((step, index) => (
                <div
                  key={index}
                  className="group relative"
                >
                  {/* Step Number */}
                  <div className="flex justify-center mb-4 sm:mb-6">
                    <div className={`relative w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 ${step.bgColor} rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-500`}>
                      <span className="text-lg sm:text-xl md:text-2xl font-bold text-gray-700">{step.number}</span>
                      {/* Pulse Animation */}
                      <div className={`absolute inset-0 bg-gradient-to-r ${step.color} rounded-full opacity-0 group-hover:opacity-20 animate-ping`}></div>
                    </div>
                  </div>

                  {/* Card */}
                  <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden transform hover:-translate-y-1 sm:hover:-translate-y-2 md:hover:-translate-y-3 group">
                    {/* Image */}
                    <div className="relative h-40 sm:h-48 md:h-56 overflow-hidden">
                      <img
                        src={step.image}
                        alt={step.step}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      {/* Overlay */}
                      <div className={`absolute inset-0 bg-gradient-to-t ${step.color} opacity-0 group-hover:opacity-70 transition-all duration-500`}></div>
                      
                      {/* Step Icon */}
                      <div className="absolute top-3 left-3 sm:top-4 sm:left-4 w-10 h-10 sm:w-12 sm:h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        {index === 0 && <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                        {index === 1 && <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>}
                        {index === 2 && <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>}
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="p-4 sm:p-6 text-center">
                      <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-2 sm:mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-green-600 group-hover:to-blue-600 transition-all duration-300">
                        {step.step}
                      </h3>
                      <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </div>

                  {/* Arrow - Hidden on mobile and tablet, last item */}
                  {index < 2 && (
                    <div className="hidden xl:block absolute top-32 -right-6 z-20">
                      <div className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="text-center mt-10 sm:mt-12 md:mt-16">
            <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-12 max-w-4xl mx-auto">
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3 sm:mb-4 px-4">
                {t('home.readyToStart', 'Ready to Get Started?')}
              </h3>
              <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
                {t('home.joinThousands', 'Join thousands of farmers already using our AI-powered platform')}
              </p>
              <Link to="/login">
                <button className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full hover:from-green-700 hover:to-blue-700 transition-all duration-300 text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                  {t('home.startNow', 'Start Now - It\'s Free!')}
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="relative py-12 sm:py-16 md:py-20 lg:py-24 overflow-hidden">
        {/* Background with Parallax Effect - Mobile Optimized */}
        <div 
          className="absolute inset-0 bg-gradient-to-br from-green-800 via-green-700 to-blue-800"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.0.3')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: window.innerWidth > 768 ? 'fixed' : 'scroll'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-green-900/90 via-green-800/80 to-blue-900/90"></div>
        </div>

        {/* Animated Background Elements - Responsive Positioning */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-4 sm:top-10 left-4 sm:left-10 w-12 h-12 sm:w-20 sm:h-20 bg-white/10 rounded-full animate-pulse"></div>
          <div className="absolute top-16 sm:top-32 right-8 sm:right-16 w-8 h-8 sm:w-16 sm:h-16 bg-green-300/20 rounded-full animate-bounce"></div>
          <div className="absolute bottom-10 sm:bottom-20 left-8 sm:left-20 w-16 h-16 sm:w-24 sm:h-24 bg-blue-300/10 rounded-full animate-pulse delay-700"></div>
          <div className="absolute bottom-20 sm:bottom-40 right-4 sm:right-10 w-8 h-8 sm:w-12 sm:h-12 bg-white/20 rounded-full animate-bounce delay-300"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center text-white">
            
            {isAuthenticated ? (
              <>
                {/* For Authenticated Users */}
                <div className="mb-8">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-6">
                    <HomeIcon size={32} className="text-white" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 leading-tight px-4 sm:px-0">
                    {t('home.continueJourney', 'Continue Your Agricultural Journey')}
                  </h2>
                  <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-green-100 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed px-4 sm:px-0">
                    {t('home.exploreFeatures', 'Explore more features and unlock the full potential of AI-powered farming')}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-6 sm:mb-8 px-4 sm:px-0">
                  <Link to={getDashboardPath()}>
                    <button className="w-full sm:w-auto bg-white text-green-800 px-6 sm:px-8 py-3 sm:py-4 rounded-full hover:bg-green-50 transition-all duration-300 text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 sm:hover:-translate-y-2 flex items-center justify-center space-x-2 sm:space-x-3">
                      <HomeIcon size={18} className="sm:w-5 sm:h-5" />
                      <span>{t('home.backToDashboard', 'Back to Dashboard')}</span>
                    </button>
                  </Link>
                  <Link to={getProfilePath()}>
                    <button className="w-full sm:w-auto border-2 border-white text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full hover:bg-white hover:text-green-800 transition-all duration-300 text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 sm:hover:-translate-y-2 flex items-center justify-center space-x-2 sm:space-x-3">
                      <User size={18} className="sm:w-5 sm:h-5" />
                      <span>{t('common.viewProfile', 'View Profile')}</span>
                    </button>
                  </Link>
                </div>

                {/* Stats for Authenticated Users */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-2xl mx-auto px-4 sm:px-0">
                  {[
                    { number: "24/7", label: t('home.support', 'Expert Support') },
                    { number: "AI", label: t('home.powered', 'Powered Analysis') },
                    { number: "∞", label: t('home.possibilities', 'Possibilities') }
                  ].map((stat, index) => (
                    <div key={index} className="text-center">
                      <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1">{stat.number}</div>
                      <div className="text-xs sm:text-sm md:text-base text-green-200">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                {/* For Non-Authenticated Users */}
                <div className="mb-8">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-6">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 leading-tight px-4 sm:px-0">
                    {t('home.transformJourney', 'Transform Your Agricultural Career Today')}
                  </h2>
                  <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-green-100 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed px-4 sm:px-0">
                    {t('home.joinFarmers', 'Join thousands of farmers who are already revolutionizing their practices with AI')}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-8 sm:mb-12 px-4 sm:px-0">
                  <Link to="/login">
                    <button className="w-full sm:w-auto bg-white text-green-800 px-6 sm:px-8 py-3 sm:py-4 rounded-full hover:bg-green-50 transition-all duration-300 text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 sm:hover:-translate-y-2">
                      {t('home.signUpNow', 'Sign Up Now - Free!')}
                    </button>
                  </Link>
                  <button className="w-full sm:w-auto border-2 border-white text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full hover:bg-white hover:text-green-800 transition-all duration-300 text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 sm:hover:-translate-y-2">
                    {t('home.watchDemo', 'Watch Demo')}
                  </button>
                </div>

                {/* Feature Highlights */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto px-4 sm:px-0">
                  {[
                    { 
                      icon: "🚀", 
                      title: t('home.highlight1', 'Instant Results'),
                      desc: t('home.highlight1Desc', 'Get AI analysis in seconds')
                    },
                    { 
                      icon: "🎯", 
                      title: t('home.highlight2', '99% Accuracy'),
                      desc: t('home.highlight2Desc', 'Precision you can trust')
                    },
                    { 
                      icon: "💰", 
                      title: t('home.highlight3', 'Save Money'),
                      desc: t('home.highlight3Desc', 'Reduce crop losses significantly')
                    }
                  ].map((highlight, index) => (
                    <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-1 sm:hover:-translate-y-2">
                      <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">{highlight.icon}</div>
                      <h3 className="text-base sm:text-lg font-semibold text-white mb-1 sm:mb-2">{highlight.title}</h3>
                      <p className="text-xs sm:text-sm text-green-200">{highlight.desc}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Bottom Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1200 120" className="w-full h-auto">
            <path d="M0,0V120H1200V0C1200,0 1050,60 900,60C750,60 600,0 450,0C300,0 150,60 0,60Z" fill="#111827"></path>
          </svg>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            
            {/* Brand Section */}
            <div className="md:col-span-2">
              <div className="flex items-center mb-4">
                <img
                  src={logo}
                  alt="Logo"
                  className="w-12 h-auto mr-3"
                />
                <span className="text-xl font-bold text-white">
                  {t('home.brandName', 'AgriAI Platform')}
                </span>
              </div>
              <p className="text-gray-400 mb-4 max-w-md leading-relaxed">
                {t('home.footerDesc', 'Empowering farmers with AI-powered solutions for sustainable and profitable agriculture.')}
              </p>
              
              {/* Social Links */}
              <div className="flex space-x-4">
                {[
                  { icon: "📘", label: "Facebook" },
                  { icon: "🐦", label: "Twitter" },
                  { icon: "📸", label: "Instagram" },
                  { icon: "💼", label: "LinkedIn" }
                ].map((social, index) => (
                  <button
                    key={index}
                    className="w-10 h-10 bg-gray-800 hover:bg-green-600 rounded-full flex items-center justify-center transition-colors duration-300"
                    aria-label={social.label}
                  >
                    <span className="text-sm">{social.icon}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">
                {t('home.quickLinks', 'Quick Links')}
              </h3>
              <ul className="space-y-2">
                {[
                  { text: t('home.features', 'Features'), href: "#features" },
                  { text: t('home.howItWorks', 'How It Works'), href: "#how-it-works" },
                  { text: t('home.pricing', 'Pricing'), href: "/pricing" },
                  { text: t('home.aboutUs', 'About Us'), href: "/about" }
                ].map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      className="text-gray-400 hover:text-green-400 transition-colors duration-300"
                    >
                      {link.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">
                {t('home.support', 'Support')}
              </h3>
              <ul className="space-y-2">
                {[
                  { text: t('home.helpCenter', 'Help Center'), href: "/help" },
                  { text: t('home.contact', 'Contact Us'), href: "/contact" },
                  { text: t('home.privacy', 'Privacy Policy'), href: "/privacy" },
                  { text: t('home.terms', 'Terms of Service'), href: "/terms" }
                ].map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      className="text-gray-400 hover:text-green-400 transition-colors duration-300"
                    >
                      {link.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              {t('home.copyright', '© 2024 AgriAI Platform. All rights reserved.')}
            </p>
            
            {/* Language Switcher in Footer */}
            <div className="flex items-center space-x-4">
              <span className="text-gray-400 text-sm">{t('home.language', 'Language:')}</span>
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
