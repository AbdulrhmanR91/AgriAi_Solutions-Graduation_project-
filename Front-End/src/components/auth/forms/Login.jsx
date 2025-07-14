import { useState } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import logoh from "../../../assets/images/logo agri 2_enhanced.PNG";
import { loginUser } from "../../../utils/apiService";
import LanguageSwitcher from '../../shared/common/LanguageSwitcher';
import '../../../styles/creative-login.css';

export function LoginForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    emailOrPhone: "",
    password: "",
    rememberMe: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate input data
      if (!credentials.emailOrPhone || !credentials.password) {
        setError(t("login.fields_required"));
        setLoading(false);
        return;
      }
      
      // Sanitize inputs to prevent XSS
      const sanitizedEmail = credentials.emailOrPhone.trim()
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      const data = await loginUser({
        email: sanitizedEmail,
        password: credentials.password,
        rememberMe: credentials.rememberMe
      });

      // Navigate based on userType if login is successful
      if (data && data.user) {
        switch (data.user.userType) {
          case "farmer":
            navigate("/farmer");
            break;
          case "expert":
            navigate("/expert");
            break;
          case "company":
            navigate("/company");
            break;
          default:
            setError(t("login.unknown_user_type"));
        }
      } else {
        setError(t("login.invalid_response"));
      }
    } catch (error) {
      console.error("Login error:", error);
      // Display translated error message or fallback to default message
      setError(error.message || t("login.failed"));
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6">
      {error && (
        <div className="creative-error">
          {error}
        </div>
      )}

      <div className="creative-input-container">
        <div className="creative-input-icon">
          <Mail className="w-5 h-5" />
        </div>
        <input
          type="text" 
          className="creative-input"
          placeholder=" "
          value={credentials.emailOrPhone}
          onChange={(e) =>
            setCredentials({ ...credentials, emailOrPhone: e.target.value })
          }
        />
        <label className="floating-label">
          {t('login.email')}
        </label>
      </div>

      <div className="creative-input-container">
        <div className="creative-input-icon">
          <Lock className="w-5 h-5" />
        </div>
        <input
          type={showPassword ? "text" : "password"}
          className="creative-input"
          placeholder=" "
          value={credentials.password}
          onChange={(e) =>
            setCredentials({ ...credentials, password: e.target.value })
          }
        />
        <label className="floating-label">
          {t('login.password')}
        </label>
        <button
          type="button"
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-green-600 transition-colors"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>

      <div className="creative-checkbox-container">
        <label className="creative-checkbox">
          <input
            type="checkbox"
            checked={credentials.rememberMe}
            onChange={(e) =>
              setCredentials({ ...credentials, rememberMe: e.target.checked })
            }
          />
          <div className="creative-checkbox-custom"></div>
          <span className="creative-checkbox-label">{t('login.remember_me')}</span>
        </label>
        <a href="#" className="forgot-password-link">
          {t('login.forgot_password')}
        </a>
      </div>

      <button type="submit" className="creative-login-btn" disabled={loading}>
        {loading ? (
          <div className="flex items-center justify-center">
            <div className="creative-spinner"></div>
            <span className="ml-2">{t('login.signing_in', 'Signing in...')}</span>
          </div>
        ) : (
          t('login.sign_in')
        )}
      </button>
    </form>
  );
}

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleRegisterFarmerClick = () => {
    navigate("/register/farmer");
  };

  const handleRegisterExpertClick = () => {
    navigate("/register/expert");
  };

  const handleRegisterCompanyClick = () => {
    navigate("/register/company");
  };

  return (
    <div className="login-animated-bg">
      {/* Floating Particles */}
      <div className="floating-particles">
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
      </div>

      {/* Language Switcher */}
      <div className="creative-language-switcher">
        <LanguageSwitcher />
      </div>
      
      {/* Main Login Container */}
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="login-glass-card w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <img src={logoh} alt="Logo" className="login-logo w-32 mx-auto mb-4" />
            <h1 className="login-title text-3xl mb-2">
              {t('login.title')}
            </h1>
            <p className="text-black/70 text-sm">
              {t('login.subtitle', 'Welcome back! Please sign in to your account')}
            </p>
          </div>

          {/* Login Form */}
          <LoginForm />

          {/* Registration Options */}
          <div className="creative-registration-options">
            <p className="creative-registration-text">
              {t('registration.noAccount')}
            </p>
            <div className="creative-registration-buttons">
              <button
                onClick={handleRegisterFarmerClick}
                className="creative-registration-btn"
              >
                {t('registration.registerAsFarmer')}
              </button>
              <button
                onClick={handleRegisterExpertClick}
                className="creative-registration-btn"
              >
                {t('registration.registerAsExpert')}
              </button>
              <button 
                onClick={handleRegisterCompanyClick}
                className="creative-registration-btn"
              >
                {t('registration.registerAsCompany')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
