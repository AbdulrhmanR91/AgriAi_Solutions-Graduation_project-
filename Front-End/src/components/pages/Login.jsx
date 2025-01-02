import { useState } from "react";
import { Mail, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { RegistrationOptions } from "./RegistrationOptions";
import logoh from '/src/assets/images/logoh.png';
import { loginUser } from "../../../utils/apiService";

export function LoginForm() {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    emailOrPhone: "",
    password: "",
    rememberMe: false
  });
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await loginUser({
        email: credentials.emailOrPhone,
        password: credentials.password
      });

      // Redirect based on user type from database
      switch (data.user.userType) {
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
          setError('Unknown user type');
      }
    } catch (error) {
      setError(error.message || 'Login failed. Please try again!.');
    }
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
        <label className="block text-sm font-medium text-gray-700">
          Password
        </label>
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

      {error && <p className="text-red-500 text-sm">{error}</p>}

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
          Forgot Password?
        </a>
      </div>

      <Button type="submit" className="w-full">
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
          <img src={logoh} alt="Logo" className="w-40" />
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
};

export default Login;