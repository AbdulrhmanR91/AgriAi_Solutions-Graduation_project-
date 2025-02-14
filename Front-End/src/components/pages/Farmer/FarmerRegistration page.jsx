import { useState } from "react";
import {
  Wheat,
  User,
  Mail,
  Phone,
  Lock,
  CheckSquare,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import logo from "/src/assets/images/logor2.png";
import { registerUser } from "../../../utils/apiService";
import { Toast } from "../Toast";
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import PropTypes from 'prop-types';

// إصلاح أيقونة Marker
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// مكون لتتبع النقر على الخريطة
function LocationMarker({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng);
    },
  });
  return null;
}

LocationMarker.propTypes = {
  onLocationSelect: PropTypes.func.isRequired
};

// إضافة مكون SearchControl
const SearchControl = ({ setSelectedLocation, setFormData }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    const handleSearch = async () => {
        if (!searchQuery) return;
        
        setIsSearching(true);
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5`
            );
            const data = await response.json();
            setSearchResults(data);
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <div className="absolute top-4 left-4 right-4 z-[1000] bg-white rounded-xl shadow-lg">
            <div className="flex">
                <input
                    type="text"
                    placeholder="Search location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="flex-1 px-4 py-2 border-2 border-r-0 rounded-l-xl focus:outline-none focus:border-green-500"
                />
                <button
                    onClick={handleSearch}
                    className="px-4 py-2 bg-green-600 text-white rounded-r-xl hover:bg-green-700 transition-colors"
                    disabled={isSearching}
                >
                    {isSearching ? '...' : 'Search'}
                </button>
            </div>
            {searchResults.length > 0 && (
                <div className="mt-2 max-h-48 overflow-y-auto border-t">
                    {searchResults.map((result) => (
                        <button
                            key={result.place_id}
                            className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:outline-none"
                            onClick={() => {
                                const latlng = {
                                    lat: parseFloat(result.lat),
                                    lng: parseFloat(result.lon)
                                };
                                setSelectedLocation(latlng);
                                setFormData(prev => ({
                                    ...prev,
                                    farmLocation: `${latlng.lat},${latlng.lng}`
                                }));
                                setSearchResults([]);
                                setSearchQuery('');
                            }}
                        >
                            {result.display_name}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

SearchControl.propTypes = {
    setSelectedLocation: PropTypes.func.isRequired,
    setFormData: PropTypes.func.isRequired
};

const FarmerRegistration = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneCountry: "+20", // Default to Egypt
    phone: "",
    password: "",
    confirmPassword: "",
    farmName: "",
    farmLocation: "",
    farmSize: "",
    crops: "",
    idFile: null,
    agreed: false,
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);

  const countryCodes = [
    { code: "+1", country: "USA" },
    { code: "+44", country: "UK" },
    { code: "+61", country: "Australia" },
    { code: "+91", country: "India" },
    { code: "+86", country: "China" },
    { code: "+49", country: "Germany" },
    { code: "+33", country: "France" },
    { code: "+966", country: "Saudi Arabia" },
    { code: "+971", country: "UAE" },
    { code: "+20", country: "Egypt" },
    { code: "+974", country: "Qatar" },
    { code: "+973", country: "Bahrain" },
    { code: "+968", country: "Oman" },
    { code: "+965", country: "Kuwait" },
    { code: "+962", country: "Jordan" },
    { code: "+961", country: "Lebanon" },
    { code: "+963", country: "Syria" },
    { code: "+964", country: "Iraq" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));

    // Real-time validation
    if (name === "name") {
      const nameError = validateName(value);
      if (nameError) setErrors(prev => ({ ...prev, name: nameError }));
    } else if (name === "email") {
      validateEmail(value);
    } else if (name === "phone") {
      validatePhone(value);
    } else if (name === "password") {
      validatePassword(value);
    } else if (name === "confirmPassword") {
      validateConfirmPassword(value);
    }
  };

  // Email validation
  // Updated validation messages
  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!email) {
      return "Email is required";
    }
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }
    return "";
  };

  // Phone validation
 const validatePhone = (phone) => {
    const phoneRegex = /^\d+$/;
    if (!phone) return "Phone number is required";
    if (!phoneRegex.test(phone)) return "Phone number must contain only digits";
    if (phone.length < 10) return "Phone number must be at least 10 digits";
    if (phone.length > 11) return "Phone number must not exceed 11 digits";
    return ""; // Success
};


  // Password strength validation
 const validatePassword = (password) => {
    if (!password) return "Password is required";
    if (password.length < 8) return "Password must be at least 8 characters long";
    if (!/(?=.*[A-Z])/.test(password)) return "Password must contain at least one uppercase letter";
    if (!/(?=.*[a-z])/.test(password)) return "Password must contain at least one lowercase letter";
    if (!/(?=.*\d)/.test(password)) return "Password must contain at least one number";
    if (!/(?=.*[!@#$%^&*])/.test(password)) return "Password must contain at least one special character (!@#$%^&*)";
    return ""; // Success
};

  // Confirm password validation
const validateConfirmPassword = (confirmPassword) => {
    if (!confirmPassword) return "Please confirm your password";
    if (confirmPassword !== formData.password) return "Passwords do not match";
    return ""; // Success
};

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type and size
      const validTypes = ["image/jpeg", "image/png", "application/pdf"];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!validTypes.includes(file.type)) {
        setErrors((prev) => ({
          ...prev,
          idFile: "File must be JPG, PNG, or PDF",
        }));
        return;
      }

      if (file.size > maxSize) {
        setErrors((prev) => ({
          ...prev,
          idFile: "File size must not exceed 5MB",
        }));
        return;
      }

      setFormData((prev) => ({ ...prev, idFile: file }));
      setErrors((prev) => ({ ...prev, idFile: "" }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
        // التحقق من الاسم
        if (!formData.name) {
            newErrors.name = "Name is required";
        }

        // التحقق من الإيميل
        if (!formData.email) {
            newErrors.email = "Email is required";
        } else {
            const emailError = validateEmail(formData.email);
            if (emailError) newErrors.email = emailError;
        }

        // التحقق من الهاتف
        const phoneError = validatePhone(formData.phone);
        if (phoneError) newErrors.phone = phoneError;

        // التحقق من كلمة المرور
        const passwordError = validatePassword(formData.password);
        if (passwordError) newErrors.password = passwordError;

        // تأكيد كلمة المرور
        const confirmPasswordError = validateConfirmPassword(formData.confirmPassword);
        if (confirmPasswordError) newErrors.confirmPassword = confirmPasswordError;
    }

    if (step === 2) {
        if (!formData.farmName) newErrors.farmName = "Farm name is required";
        if (!formData.farmLocation) newErrors.farmLocation = "Farm location is required";
        if (!formData.farmSize) newErrors.farmSize = "Farm size is required";
        else if (isNaN(formData.farmSize) || Number(formData.farmSize) <= 0) {
            newErrors.farmSize = "Farm size must be a positive number";
        }
        if (!formData.crops) newErrors.crops = "Crops information is required";
    }

    if (step === 3) {
        if (!formData.idFile) newErrors.idFile = "ID document is required";
        if (!formData.agreed) newErrors.agreed = "You must agree to the terms and conditions";
    }

    return newErrors;
};

  const nextStep = () => {
    const validationErrors = validateStep(currentStep);
    if (Object.keys(validationErrors).length === 0) {
      setCurrentStep((prev) => Math.min(prev + 1, 3));
    } else {
      setErrors(validationErrors);
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateStep(currentStep);

    if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
    }

    setIsSubmitting(true);
    try {
        // تنظيف وتنسيق البيانات
        const mainCrops = formData.crops
            .split(',')
            .map(crop => crop.trim())
            .filter(crop => crop.length > 0);

        const userData = {
            name: formData.name.trim(),
            email: formData.email.trim(),
            password: formData.password,
            phone: formData.phoneCountry + formData.phone.trim(),
            userType: "farmer",
            farmDetails: {
                farmName: formData.farmName.trim(),
                farmLocation: formData.farmLocation,
                farmSize: parseFloat(formData.farmSize),
                mainCrops: mainCrops
            }
        };

        const response = await registerUser(userData);

        if (response && response.token) {
            toast.success("Registration successful!");
            navigate("/login");
        } else {
            throw new Error(response?.message || 'Registration failed');
        }
    } catch (error) {
        console.error('Registration error:', error);
        toast.error(error.response?.data?.message || error.message || "Registration failed");
    } finally {
        setIsSubmitting(false);
    }
  };

  // التحقق من الاسم
  const validateName = (name) => {
    if (!name) {
      return "Name is required";
    }
    const words = name.trim().split(/\s+/);
    if (words.length < 2) {
      return "Please enter your full name (first & last name)";
    }
    return "";
  };

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center p-6">
      <Toast />
      <div className="w-full max-w-4xl bg-white shadow-2xl rounded-3xl overflow-hidden">
        {/* Header */}
        <div className="bg-green-600 text-white p-8 text-center">
          <img src={logo} alt="Logo" className="mx-auto w-40 mb-4" />
          <h1 className="text-3xl font-bold mb-2">Farmer Registration</h1>
          <p className="text-xl opacity-80">
            Join our agricultural innovation platform
          </p>
        </div>

        <div className="max-w-3xl mx-auto py-12 px-8">
            {/* إضافة زر Back to Login */}
            <button
                onClick={() => navigate('/login')}
                className="mb-6 text-green-600 hover:text-green-500 flex items-center gap-2"
            >
                &larr; Back to Login
            </button>

            {/* Progress Bar */}
            <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                    <div>
                        <span className="text-xs font-semibold inline-block text-green-600">
                            {currentStep === 1
                                ? "Personal Information"
                                : currentStep === 2
                                ? "Farm Information"
                                : "Documents & Agreement"}
                        </span>
                    </div>
                    <div>
                        <span className="text-xs font-semibold inline-block text-green-600">
                            {((currentStep - 1) / 2) * 100}% Complete
                        </span>
                    </div>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-green-100">
                    <div
                        style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-600 transition-all duration-300"
                    />
                </div>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmit} className="space-y-6">
                {currentStep === 1 && (
                    <div className="space-y-6">
                        {/* Personal Information Fields */}
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600" />
                            <input
                                type="text"
                                name="name"
                                placeholder="Full Name"
                                className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:border-green-500 ${
                                    errors.name ? "border-red-500" : "border-gray-300"
                                }`}
                                value={formData.name}
                                onChange={handleChange}
                            />
                            {errors.name && (
                                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                            )}
                        </div>

                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600" />
                            <input
                                type="email"
                                name="email"
                                placeholder="Email Address"
                                className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:border-green-500 ${
                                    errors.email ? "border-red-500" : "border-gray-300"
                                }`}
                                value={formData.email}
                                onChange={handleChange}
                            />
                            {errors.email && (
                                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                            )}
                        </div>

                        <div className="flex gap-4">
                            <div className="relative flex-1">
                                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600" />
                                <input
                                    type="tel"
                                    name="phone"
                                    placeholder="Phone Number"
                                    className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:border-green-500 ${
                                        errors.phone ? "border-red-500" : "border-gray-300"
                                    }`}
                                    value={formData.phone}
                                    onChange={(e) => {
                                        // السماح بالأرقام فقط
                                        const value = e.target.value.replace(/\D/g, "");
                                        handleChange({
                                            target: {
                                                name: "phone",
                                                value,
                                            },
                                        });
                                    }}
                                    maxLength={11}
                                />
                            </div>
                            <select
                                name="phoneCountry"
                                className="w-32 py-3 border-2 rounded-xl focus:outline-none focus:border-green-500"
                                value={formData.phoneCountry}
                                onChange={handleChange}
                            >
                                {countryCodes.map((country) => (
                                    <option key={country.code} value={country.code}>
                                        {country.country} ({country.code})
                                    </option>
                                ))}
                            </select>
                        </div>
                        {errors.phone && (
                            <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                        )}

                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600" />
                            <input
                                type="password"
                                name="password"
                                placeholder="Password"
                                className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:border-green-500 ${
                                    errors.password ? "border-red-500" : "border-gray-300"
                                }`}
                                value={formData.password}
                                onChange={handleChange}
                            />
                            {errors.password && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600" />
                            <input
                                type="password"
                                name="confirmPassword"
                                placeholder="Confirm Password"
                                className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:border-green-500 ${
                                    errors.confirmPassword
                                        ? "border-red-500"
                                        : "border-gray-300"
                                }`}
                                value={formData.confirmPassword}
                                onChange={handleChange}
                            />
                            {errors.confirmPassword && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.confirmPassword}
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {currentStep === 2 && (
                    <div className="space-y-6">
                        <div className="relative">
                            <Wheat className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600" />
                            <input
                                type="text"
                                name="farmName"
                                placeholder="Farm Name"
                                className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:border-green-500 ${
                                    errors.farmName ? "border-red-500" : "border-gray-300"
                                }`}
                                value={formData.farmName}
                                onChange={handleChange}
                            />
                            {errors.farmName && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.farmName}
                                </p>
                            )}
                        </div>

                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select Farm Location (Search or click on the map)
                            </label>
                            <div style={{ height: '300px', width: '100%', borderRadius: '0.75rem', overflow: 'hidden' }} className="relative">
                                <MapContainer
                                    center={[30.0444, 31.2357]}
                                    zoom={6}
                                    style={{ height: '100%', width: '100%' }}
                                >
                                    <TileLayer
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    />
                                    <LocationMarker
                                        onLocationSelect={(latlng) => {
                                            setSelectedLocation(latlng);
                                            setFormData(prev => ({
                                                ...prev,
                                                farmLocation: `${latlng.lat},${latlng.lng}`
                                            }));
                                        }}
                                    />
                                    {selectedLocation && (
                                        <Marker position={[selectedLocation.lat, selectedLocation.lng]} />
                                    )}
                                    <SearchControl 
                                        setSelectedLocation={setSelectedLocation} 
                                        setFormData={setFormData} 
                                    />
                                </MapContainer>
                            </div>
                            {errors.farmLocation && (
                                <p className="text-red-500 text-sm mt-1">{errors.farmLocation}</p>
                            )}
                            {selectedLocation && (
                                <p className="text-green-600 text-sm mt-2">
                                    Location selected: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                                </p>
                            )}
                        </div>

                        <div className="relative">
                            <input
                                type="number"
                                name="farmSize"
                                placeholder="Farm Size (in Acres)"
                                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-green-500${
                                    errors.farmSize ? "border-red-500" : "border-gray-300"
                                }`}
                                value={formData.farmSize}
                                onChange={handleChange}
                                min="0"
                                step="0.1"
                            />
                            {errors.farmSize && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.farmSize}
                                </p>
                            )}
                        </div>

                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Primary Crops (separate with commas)
                            </label>
                            <textarea
                                name="crops"
                                placeholder="Example: Wheat, Rice, Cotton, Corn"
                                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-green-500 h-24 ${
                                    errors.crops ? "border-red-500" : "border-gray-300"
                                }`}
                                value={formData.crops}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    // تنظيف الفواصل المتكررة والمسافات الزائدة
                                    const cleanedValue = value
                                        .split(',')
                                        .map(crop => crop.trim())
                                        .filter(crop => crop !== '')
                                        .join(', ');
                                    
                                    handleChange({
                                        target: {
                                            name: 'crops',
                                            value: cleanedValue
                                        }
                                    });
                                }}
                            />
                            {errors.crops && (
                                <p className="text-red-500 text-sm mt-1">{errors.crops}</p>
                            )}
                            <p className="text-gray-500 text-sm mt-1">
                                Enter your crops separated by commas (e.g., &apos;Wheat, Rice, Cotton&apos;)
                            </p>
                        </div>
                    </div>
                )}

                {currentStep === 3 && (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Upload ID Document (JPG, PNG, or PDF, max 5MB)
                            </label>
                            <input
                                type="file"
                                name="idFile"
                                accept=".jpg,.jpeg,.png,.pdf"
                                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-green-500 ${
                                    errors.idFile ? "border-red-500" : "border-gray-300"
                                }`}
                                onChange={handleFileChange}
                            />
                            {errors.idFile && (
                                <p className="text-red-500 text-sm mt-1">{errors.idFile}</p>
                            )}
                        </div>

                        <div className="flex items-center space-x-3">
                            <input
                                type="checkbox"
                                name="agreed"
                                id="agreed"
                                className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                checked={formData.agreed}
                                onChange={(e) =>
                                    setFormData({ ...formData, agreed: e.target.checked })
                                }
                            />
                            <label
                                htmlFor="agreed"
                                className="text-gray-700 flex items-center cursor-pointer"
                            >
                                <CheckSquare className="mr-2 text-green-600" />I agree to
                                the terms and conditions
                            </label>
                        </div>
                        {errors.agreed && (
                            <p className="text-red-500 text-sm mt-1">{errors.agreed}</p>
                        )}
                    </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8">
                    {currentStep > 1 && (
                        <button
                            type="button"
                            onClick={prevStep}
                            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
                            disabled={isSubmitting}
                        >
                            Previous
                        </button>
                    )}

                    {currentStep < 3 && (
                        <button
                            type="button"
                            onClick={nextStep}
                            className="ml-auto px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
                            disabled={isSubmitting}
                        >
                            Next
                        </button>
                    )}

                    {currentStep === 3 && (
                        <button
                            type="submit"
                            className="w-full px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:bg-green-400"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Registering..." : "Complete Registration"}
                        </button>
                    )}
                </div>
            </form>
        </div>
    </div>
</div>
);
};

export default FarmerRegistration;
