import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import search from "/src/assets/images/search.png";
import bell from "/src/assets/images/bell.png";
import { getExpertProfile, getCompanies } from '../../../utils/apiService';
import { getImageUrl } from '../../../utils/helpers';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next'; // Import translation hook
import { storage } from '../../../utils/storage';

const Jobs = () => {
  const { t } = useTranslation(); // Add translation hook
  const navigate = useNavigate();
  const [expert, setExpert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);

  // Check authentication and expert status
  useEffect(() => {
    const checkAuth = async () => {
      const session = storage.getSession();

      if (!session) {
        console.log('No valid session found, redirecting to login');
        navigate('/login');
        return;
      }

      try {
        if (session.userData.userType !== 'expert') {
          console.log('User is not an expert:', session.userData.userType);
          navigate('/login');
          return;
        }

        try {
          const data = await getExpertProfile();

          if (data && data.name) {
            setExpert(data);
          } else {
            console.warn('Incomplete expert data received:', data);
          }
        } catch (error) {
          console.error('Error loading expert profile:', error);
          
          if (error.response?.status === 401) {
            storage.clearSession();
            navigate('/login');
          } else {
            toast.error(error.message || t('common.error'));
          }
        }
      } catch (parseError) {
        console.error('Error with session data:', parseError);
        storage.clearSession();
        navigate('/login');
      }
    };

    checkAuth();
  }, [navigate, t]);

  // Load companies after expert is authenticated
  useEffect(() => {
    const loadCompanies = async () => {
      if (!expert) {
        return;
      }

      try {
        setLoading(true);
        const companiesData = await getCompanies(searchQuery);

        if (Array.isArray(companiesData)) {
          setCompanies(companiesData);
        } else {
          setCompanies([]);
        }
        setError(null);
      } catch (error) {
        setError(error.message || t('common.error'));
        setCompanies([]);
        if (error.response?.status === 401) {
          storage.clearSession();
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    loadCompanies();
  }, [expert, navigate, searchQuery, t]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  // تصفية الشركات بناءً على البحث
  const filteredCompanies = companies.filter(company => {
    const searchLower = searchQuery.toLowerCase();
    return (
      company.name?.toLowerCase().includes(searchLower) ||
      company.companyDetails?.businessAddress?.toLowerCase().includes(searchLower) ||
      company.companyDetails?.businessType?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-emerald-400 rounded-full animate-spin mx-auto" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">جاري تحميل الفرص المتاحة</h3>
          <p className="text-gray-500">يرجى الانتظار بينما نحضر لك أفضل الشركات</p>
        </div>
      </div>
    );
  }

  const handleWhatsAppConsult = (phone) => {
    if (!phone) {
      toast.error(t('expert.jobs.phone_not_available'));
      return;
    }
    const whatsappUrl = `https://wa.me/${phone.replace(/^0/, '20')}`;
    window.open(whatsappUrl, '_blank');
  };

  const getCompanyImage = (profileImage) => {
    if (profileImage) {
      return getImageUrl(profileImage);
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 pb-20">
      <header className="sticky top-0 bg-white/80 backdrop-blur-lg shadow-lg border-b border-green-100 z-10">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xl">💼</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  {t('expert.jobs.available_opportunities')}
                </h1>
                <p className="text-sm text-gray-500 mt-1">اكتشف فرص عمل جديدة مع أفضل الشركات الزراعية</p>
              </div>
            </div>
            <Link to="/expert/notifications">
              <div className="relative p-3 bg-green-50 rounded-full hover:bg-green-100 transition-all duration-200 hover:scale-105">
                <img src={bell} alt={t('expert.common.notifications')} className="w-6 h-6" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              </div>
            </Link>
          </div>
        </div>
      </header>

      <main className="w-full max-w-6xl px-6 py-8 mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            {filteredCompanies.length} شركة متاحة الآن
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">اكتشف فرص العمل المناسبة لك</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">تواصل مع أفضل الشركات الزراعية واحصل على فرص عمل متميزة في مجال الزراعة والاستشارات الزراعية</p>
        </div>

        {/* Enhanced Search Bar */}
        <div className="relative w-full max-w-2xl mx-auto mb-10">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder={t('expert.jobs.search_companies')}
              className="w-full px-6 py-4 pl-14 pr-6 bg-white border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-200 shadow-lg text-lg"
            />
            <div className="absolute left-5 top-1/2 -translate-y-1/2">
              <img src={search} alt={t('market.search')} className="w-6 h-6 opacity-60" />
            </div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-5 top-1/2 -translate-y-1/2 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <span className="text-gray-500 text-lg">×</span>
              </button>
            )}
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-500 rounded-2xl opacity-20 blur-xl -z-10"></div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-8 py-8 text-white">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-2xl">🏢</span>
              </div>
              <h2 className="text-2xl font-bold">{t('expert.jobs.agricultural_companies')}</h2>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                <span className="font-medium">{filteredCompanies.length} {t('expert.jobs.companies_available')}</span>
              </div>
            </div>
          </div>
          
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCompanies.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center py-16 text-gray-500">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <span className="text-4xl">🔍</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">لا توجد شركات</h3>
                  <p className="text-center">{error || t('expert.jobs.no_companies')}</p>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="mt-4 px-6 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
                    >
                      مسح البحث
                    </button>
                  )}
                </div>
              ) : (
                filteredCompanies.map((company) => (
                  <div key={company._id} className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden hover:-translate-y-2">
                    <div className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="relative">
                          <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gradient-to-br from-green-100 to-blue-100 flex-shrink-0 ring-4 ring-white shadow-lg">
                            {company.profileImage ? (
                              <img
                                src={getCompanyImage(company.profileImage)}
                                alt={company.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center text-2xl">🏢</div>';
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl">
                                🏢
                              </div>
                            )}
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        </div>
                        <div className="flex-grow">
                          <h3 className="font-bold text-lg text-gray-800 mb-1 group-hover:text-green-600 transition-colors">
                            {company.name}
                          </h3>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <span>📍</span>
                            <span>{company.companyDetails?.businessAddress || t('expert.jobs.address_not_available')}</span>
                          </div>
                        </div>
                      </div>
                      
                      {company.companyDetails?.businessType && (
                        <div className="mb-4">
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                            <span>🌱</span>
                            {company.companyDetails.businessType}
                          </span>
                        </div>
                      )}
                      
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span>💼</span>
                          <span>فرص عمل متاحة</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span>⭐</span>
                          <span>شركة موثقة</span>
                        </div>
                      </div>
                      
                      <button
                        className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
                        onClick={() => handleWhatsAppConsult(company.phone)}
                      >
                        <span>💬</span>
                        {t('expert.jobs.contact_us')}
                      </button>
                    </div>
                    
                    <div className="h-1 bg-gradient-to-r from-green-500 to-emerald-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        
        {/* Floating Stats */}
        <div className="fixed bottom-24 right-6 bg-white rounded-2xl shadow-2xl p-4 border border-gray-100 z-20">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{filteredCompanies.length}</div>
            <div className="text-xs text-gray-500">شركات متاحة</div>
          </div>
        </div>
        
        {/* Floating Action Button */}
        <div className="fixed bottom-6 right-6 z-20">
          <button className="group w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300 flex items-center justify-center">
            <span className="text-white text-xl group-hover:animate-bounce">🔄</span>
          </button>
        </div>
      </main>
    </div>
  );
};

export default Jobs;
