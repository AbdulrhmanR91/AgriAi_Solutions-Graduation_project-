import { useState } from "react";
import {
  Wheat,
  MapPin,
  User,
  Mail,
  Phone,
  Lock,
  CheckSquare,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

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
    // Clear error when value changes
    setErrors((prev) => ({ ...prev, [name]: "" }));

    // Real-time validation
    if (name === "email") {
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
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrors((prev) => ({
        ...prev,
        email: "Please enter a valid email address",
      }));
      return false;
    }
    return true;
  };

  // Phone validation
  const validatePhone = (phone) => {
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone)) {
      setErrors((prev) => ({
        ...prev,
        phone: "Phone number must be 10 digits",
      }));
      return false;
    }
    return true;
  };

  // Password strength validation
  const validatePassword = (password) => {
    if (password.length < 8) {
      setErrors((prev) => ({
        ...prev,
        password: "Password must be at least 8 characters long",
      }));
      return false;
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      setErrors((prev) => ({
        ...prev,
        password: "Password must contain at least one uppercase letter",
      }));
      return false;
    }
    if (!/(?=.*\d)/.test(password)) {
      setErrors((prev) => ({
        ...prev,
        password: "Password must contain at least one number",
      }));
      return false;
    }
    return true;
  };

  // Confirm password validation
  const validateConfirmPassword = (confirmPassword) => {
    if (confirmPassword !== formData.password) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: "Passwords do not match",
      }));
      return false;
    }
    return true;
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
      if (!formData.name) {
        newErrors.name = "Name is required";
      } else if (formData.name.length < 3) {
        newErrors.name = "Name must be at least 3 characters long";
      }

      if (!formData.email) {
        newErrors.email = "Email is required";
      } else if (!validateEmail(formData.email)) {
        newErrors.email = "Please enter a valid email address";
      }

      if (!formData.phone) {
        newErrors.phone = "Phone number is required";
      } else if (!validatePhone(formData.phone)) {
        newErrors.phone = "Please enter a valid phone number";
      }

      if (!formData.password) {
        newErrors.password = "Password is required";
      } else if (!validatePassword(formData.password)) {
        // Error already set in validatePassword
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = "Please confirm your password";
      } else if (!validateConfirmPassword(formData.confirmPassword)) {
        // Error already set in validateConfirmPassword
      }
    }

    if (step === 2) {
      if (!formData.farmName) {
        newErrors.farmName = "Farm name is required";
      }

      if (!formData.farmLocation) {
        newErrors.farmLocation = "Farm location is required";
      }

      if (!formData.farmSize) {
        newErrors.farmSize = "Farm size is required";
      } else if (formData.farmSize <= 0) {
        newErrors.farmSize = "Farm size must be greater than 0";
      }

      if (!formData.crops) {
        newErrors.crops = "Primary crops are required";
      }
    }

    if (step === 3) {
      if (!formData.idFile) {
        newErrors.idFile = "ID document is required";
      }
      if (!formData.agreed) {
        newErrors.agreed = "You must agree to the terms and conditions";
      }
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
    const validationErrors = validateStep(3);
    if (Object.keys(validationErrors).length === 0) {
      try {
        // Here you would typically send the data to your server
        console.log("Submitted Data:", formData);
        alert("Registration Successful!");
        navigate("/farmer");
      } catch (error) {
        console.error("Error submitting form:", error);
        alert("An error occurred during registration. Please try again.");
      }
    } else {
      setErrors(validationErrors);
    }
  };

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl bg-white shadow-2xl rounded-3xl overflow-hidden border-4 border-green-500">
        {/* Header */}
        <div className="bg-green-600 text-white p-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Farmer Registration</h1>
          <p className="text-xl opacity-80">
            Join our agricultural innovation platform
          </p>
        </div>

        <div className="max-w-3xl mx-auto py-12 px-8">
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
                      onChange={handleChange}
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
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600" />
                  <input
                    type="text"
                    name="farmLocation"
                    placeholder="Farm Location"
                    className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:border-green-500 ${
                      errors.farmLocation ? "border-red-500" : "border-gray-300"
                    }`}
                    value={formData.farmLocation}
                    onChange={handleChange}
                  />
                  {errors.farmLocation && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.farmLocation}
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
                  <textarea
                    name="crops"
                    placeholder="Primary Crops (comma separated)"
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-green-500 h-24 ${
                      errors.crops ? "border-red-500" : "border-gray-300"
                    }`}
                    value={formData.crops}
                    onChange={handleChange}
                  />
                  {errors.crops && (
                    <p className="text-red-500 text-sm mt-1">{errors.crops}</p>
                  )}
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
                >
                  Back
                </button>
              )}

              {currentStep < 3 && (
                <button
                  type="button"
                  onClick={nextStep}
                  className="ml-auto px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
                >
                  Next Step
                </button>
              )}

              {currentStep === 3 && (
                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
                >
                  Complete Registration
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
