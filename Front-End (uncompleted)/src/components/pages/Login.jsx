import { useState } from "react";
import { Mail, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { RegistrationOptions } from "./RegistrationOptions";

export function LoginForm() {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    emailOrPhone: "",
    password: "",
    rememberMe: false,
    userType: "" // Add userType to track selected type
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Here you would typically validate credentials with your backend
    // For now, we'll simulate a successful login
    if (!credentials.userType) {
      return; // Prevent submission if no user type is selected
    }
    
    // Store auth info in localStorage  
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userType', credentials.userType);

    // Redirect based on user type
    switch(credentials.userType) {
      case 'farmer':
        navigate('/farmer');
        break;
      case 'expert':
        navigate('/expert');
        break;
      case 'company':
        navigate('/company');
        break;
      default:
        console.error('Invalid user type');
    }
  };

  const handleUserTypeChange = (type) => {
    setCredentials({ ...credentials, userType: type });
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Email or Phone Number
        </label>
        <Input
          type="text"
          placeholder="Enter your Email or Phone Number"
          value={credentials.emailOrPhone}
          onChange={(e) =>
            setCredentials({ ...credentials, emailOrPhone: e.target.value })
          }
          icon={<Mail className="w-5 h-5 text-gray-400" />}
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Password</label>
        <Input
          type="password"
          placeholder="Enter your Password"
          value={credentials.password}
          onChange={(e) =>
            setCredentials({ ...credentials, password: e.target.value })
          }
          icon={<Lock className="w-5 h-5 text-gray-400" />}
        />
      </div>

      {/* User Type Selection */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Login As
        </label>
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => handleUserTypeChange('farmer')}
            className={`px-4 py-2 rounded-lg ${
              credentials.userType === 'farmer'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Farmer
          </button>
          <button
            type="button"
            onClick={() => handleUserTypeChange('expert')}
            className={`px-4 py-2 rounded-lg ${
              credentials.userType === 'expert'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Expert
          </button>
          <button
            type="button"
            onClick={() => handleUserTypeChange('company')}
            className={`px-4 py-2 rounded-lg ${
              credentials.userType === 'company'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Company
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            className="rounded border-gray-300 text-green-600 focus:ring-green-500"
            checked={credentials.rememberMe}
            onChange={(e) =>
              setCredentials({ ...credentials, rememberMe: e.target.checked })
            }
          />
          <span className="text-sm text-gray-600">Remember me</span>
        </label>
        <a href="#" className="text-sm text-green-600 hover:text-green-500">
          Forget Password?
        </a>
      </div>

      <Button type="submit" className="w-full" disabled={!credentials.userType}>
        Sign In
      </Button>
    </form>
  );
}

const Login = () => {
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 shadow-lg rounded-lg">
        <div className="flex justify-center items-center mb-4">
          <img
            src="/src/assets/images/logo agri 3_enhanced.PNG"
            alt="Logo"
            className="w-40"
          />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
          Sign In
        </h2>
        <LoginForm />
        <div className="mt-6">
          <RegistrationOptions
            onRegisterFarmerClick={handleRegisterFarmerClick}
            onRegisterExpertClick={handleRegisterExpertClick}
            onRegisterCompanyClick={handleRegisterCompanyClick}
          />
        </div>
      </div>
    </div>
  );
}

export default Login;