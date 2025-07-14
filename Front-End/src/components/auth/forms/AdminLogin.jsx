import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Mail, Lock } from 'lucide-react';
import { loginAdmin } from '../../../utils/apiService';
import toast from 'react-hot-toast';
import logo from '/src/assets/images/logor2.png';
import { useTranslation } from 'react-i18next';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials({
      ...credentials,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await loginAdmin(credentials);
      
      if (response.success) {
        localStorage.setItem('adminToken', response.token);
        toast.success(t('Admin.LoginSuccessful'));
        navigate('/admin/dashboard');
      } else {
        toast.error(response.message || t('Admin.LoginFailed'));
      }
    } catch (error) {
      toast.error(error.message || t('Admin.InvalidCredentials'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <div className="flex justify-center mb-6">
          <img src={logo} alt="AgriAI Solutions" className="h-16" />
        </div>
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">{t('Admin.AdminLogin')}</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              name="email"
              value={credentials.email}
              onChange={handleChange}
              placeholder={t('Admin.Email')}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              placeholder={t('Admin.Password')}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-400"
          >
            {loading ? t('Admin.LoggingIn') : t('Admin.Login')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
