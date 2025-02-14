import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent } from '../ui/card';
import search from "/src/assets/images/search.png";
import bell from "/src/assets/images/bell.png";
import { getExpertProfile, getCompanies } from '../../../utils/apiService';
import { getImageUrl } from '../../../utils/helpers';
import toast from 'react-hot-toast';



const Jobs = () => {
  const navigate = useNavigate();
  const [expert, setExpert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);

  // Check authentication and expert status
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (!token || !storedUser) {
        console.log('No token or user data found, redirecting to login');
        navigate('/login');
        return;
      }

      const user = JSON.parse(storedUser);

      if (user.userType !== 'expert') {
        console.log('User is not an expert:', user.userType);
        navigate('/login');
        return;
      }

      try {
        const data = await getExpertProfile();

        if (data && data.name && data.email && data.phone) {
          setExpert(data);
        } else {
          throw new Error('بيانات الخبير غير مكتملة');
        }
      } catch (error) {
        if (error.response?.status === 401) {
          localStorage.clear();
          navigate('/login');
        } else {
          toast.error(error.message || 'فشل في تحميل بيانات الخبير');
        }
      }
    };

    checkAuth();
  }, [navigate]);

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
        setError(error.message || 'فشل في تحميل الشركات');
        setCompanies([]);
        if (error.response?.status === 401) {
          localStorage.clear();
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    loadCompanies();
  }, [expert, navigate, searchQuery]);

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );  }

  const handleWhatsAppConsult = (phone) => {
    if (!phone) {
      toast.error('Phone number not available');
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
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="sticky top-0 bg-white shadow-sm z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-green-600">Available Opportunities</h1>
            </div>
            <Link to="/expert/notifications">
              <div className="relative">
                <img src={bell} alt="Notifications" className="w-6 h-6" />
              </div>
            </Link>
          </div>
        </div>
      </header>


      <main className="w-full max-w-4xl px-4 py-6 mx-auto">
        <div className="relative w-full mb-6">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search companies..."
            className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            <img src={search} alt="Search Icon" className="w-5 h-5" />
          </div>
        </div>

        <Card className="w-full">
          <CardHeader>
            <h2 className="text-xl font-bold text-center">Available Agricultural Companies 🏢</h2>
            <p className="text-center text-gray-500 mt-2">
              {filteredCompanies.length} companies available
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredCompanies.length === 0 ? (
                <div className="col-span-2 flex items-center justify-center py-8 text-gray-500">
                  {error || 'No companies available at the moment'}
                </div>
              ) : (
                filteredCompanies.map((company) => (
                  <div key={company._id} className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                        {company.profileImage ? (
                          <img
                            src={getCompanyImage(company.profileImage)}
                            alt={company.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.parentElement.innerHTML = '🏢';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl">
                            🏢
                          </div>
                        )}
                      </div>
                      <div className="flex-grow">
                        <h3 className="font-medium text-lg mb-1">{company.name}</h3>
                        <p className="text-sm text-gray-500 mb-2">
                          {company.companyDetails?.businessAddress || 'Address not available'}
                        </p>
                        {company.companyDetails?.businessType && (
                          <p className="text-sm text-green-600 mb-2">
                            {company.companyDetails.businessType}
                          </p>
                        )}
                        <button
                          className="w-full mt-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                          onClick={() => handleWhatsAppConsult(company.phone)}
                        >
                          Contact Us
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Jobs;
