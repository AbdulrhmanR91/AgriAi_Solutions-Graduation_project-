import { useState } from "react";
import { Mail, Phone, Lock, CheckSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CompanyRegistration = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    companyName: "",
    email: "",
    phone: "",
    password: "",
    businessAddress: "",
    governorate: "",
    tradeLicenseNumber: "",
    taxRegistrationNumber: "",
    tradeLicenseFile: null,
    taxRegistrationFile: null,
    agreed: false,
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleFileChange = (e) => {
    const { name } = e.target;
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, [name]: file }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const nextStep = () => {
    const validationErrors = validateStep(currentStep);
    if (Object.keys(validationErrors).length === 0) {
      setCurrentStep((prev) => Math.min(prev + 1, 3));
    } else {
      setErrors(validationErrors);
    }
  };

  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const validateStep = (step) => {
    const newErrors = {};
    if (step === 1) {
      if (!formData.companyName)
        newErrors.companyName = "Company name is required.";
      if (!formData.email) {
        newErrors.email = "Email is required.";
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = "Email is invalid.";
      }
      if (!formData.phone) newErrors.phone = "Phone number is required.";
      if (!formData.password) newErrors.password = "Password is required.";
    }
    if (step === 2) {
      if (!formData.businessAddress)
        newErrors.businessAddress = "Business address is required.";
      if (!formData.governorate)
        newErrors.governorate = "Governorate is required.";
      if (!formData.tradeLicenseNumber)
        newErrors.tradeLicenseNumber = "Trade license number is required.";
      if (!formData.taxRegistrationNumber)
        newErrors.taxRegistrationNumber =
          "Tax registration number is required.";
    }
    if (step === 3) {
      if (formData.tradeLicenseFile)
        newErrors.tradeLicenseFile = "Trade license file is required.";
      if (formData.taxRegistrationFile)
        newErrors.taxRegistrationFile = "Tax registration file is required.";
      if (formData.agreed) newErrors.agreed = "You must agree to the terms.";
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateStep(currentStep);
    if (Object.keys(validationErrors).length === 0) {
      try {
        // Here you would typically send the data to your server
        console.log("Submitted Data:", formData);
        alert("Registration Successful!");
        navigate("/expert");
      } catch (error) {
        console.error("Error submitting form:", error);
        alert("An error occurred during registration. Please try again.");
      }
    } else {
      setErrors(validationErrors);
    }
  };

  const steps = ["Company Information", "Business Details", "Verification"];

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl bg-white shadow-2xl rounded-3xl overflow-hidden border-4 border-green-500">
        {/* Modern Header */}
        <div className="bg-green-600 text-white p-8 text-center">
          <div className="flex justify-center items-center mb-4">
            <img
              src="/src/assets/images/logo agri 3_enhanced.PNG"
              alt="Logo"
              className="w-40"
            />
          </div>
          <h1 className="text-3xl font-bold mb-2">Company Registration</h1>
          <p className="text-xl opacity-80">Join us to grow your business!</p>
        </div>

        <div className="max-w-3xl mx-auto py-12 px-8">
          <button
            onClick={() => navigate("/Login")}
            className="mb-6 text-green-600 hover:text-green-500"
          >
            &larr; Back to Login
          </button>
          {/* Step Indicator with Icons and Numbers */}
          <div className="flex justify-between mb-10">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`flex items-center space-x-2 ${
                  currentStep === index + 1
                    ? "text-green-600 font-bold"
                    : "text-gray-400"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    currentStep === index + 1
                      ? "bg-green-600 text-white"
                      : "bg-gray-200 text-gray-400"
                  }`}
                >
                  {index + 1}
                </div>
                <span>{step}</span>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="relative">
                  <input
                    type="text"
                    name="companyName"
                    placeholder="Company Name"
                    className={`w-full pl-4 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:border-green-500 ${
                      errors.companyName ? "border-red-500" : "border-gray-300"
                    }`}
                    value={formData.companyName}
                    onChange={handleChange}
                    required
                  />
                  {errors.companyName && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.companyName}
                    </p>
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
                    required
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600" />
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Company Phone"
                    className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:border-green-500 ${
                      errors.phone ? "border-red-500" : "border-gray-300"
                    }`}
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>

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
                    required
                  />
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.password}
                    </p>
                  )}
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="relative">
                  <input
                    type="text"
                    name="businessAddress"
                    placeholder="Business Address"
                    className={`w-full pl-4 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:border-green-500 ${
                      errors.businessAddress
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    value={formData.businessAddress}
                    onChange={handleChange}
                    required
                  />
                  {errors.businessAddress && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.businessAddress}
                    </p>
                  )}
                </div>

                <div className="relative">
                  <input
                    type="text"
                    name="governorate"
                    placeholder="Governorate"
                    className={`w-full pl-4 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:border-green-500 ${
                      errors.governorate ? "border-red-500" : " border-gray-300"
                    }`}
                    value={formData.governorate}
                    onChange={handleChange}
                    required
                  />
                  {errors.governorate && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.governorate}
                    </p>
                  )}
                </div>

                <div className="relative">
                  <input
                    type="text"
                    name="tradeLicenseNumber"
                    placeholder="Trade License Number"
                    className={`w-full pl-4 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:border-green-500 ${
                      errors.tradeLicenseNumber
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    value={formData.tradeLicenseNumber}
                    onChange={handleChange}
                    required
                  />
                  {errors.tradeLicenseNumber && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.tradeLicenseNumber}
                    </p>
                  )}
                </div>

                <div className="relative">
                  <input
                    type="text"
                    name="taxRegistrationNumber"
                    placeholder="Tax Registration Number"
                    className={`w-full pl-4 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:border-green-500 ${
                      errors.taxRegistrationNumber
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    value={formData.taxRegistrationNumber}
                    onChange={handleChange}
                    required
                  />
                  {errors.taxRegistrationNumber && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.taxRegistrationNumber}
                    </p>
                  )}
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Trade License
                  </label>
                  <input
                    type="file"
                    name="tradeLicenseFile"
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-green-500 ${
                      errors.tradeLicenseFile
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    onChange={handleFileChange}
                    required
                  />
                  {errors.tradeLicenseFile && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.tradeLicenseFile}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Tax Registration Certificate
                  </label>
                  <input
                    type="file"
                    name="taxRegistrationFile"
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-green-500 ${
                      errors.taxRegistrationFile
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    onChange={handleFileChange}
                    required
                  />
                  {errors.taxRegistrationFile && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.taxRegistrationFile}
                    </p>
                  )}
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="agreed"
                    className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded mr-3"
                    checked={formData.agreed}
                    onChange={(e) =>
                      setFormData({ ...formData, agreed: e.target.checked })
                    }
                  />
                  <label className="text-gray-700 flex items-center">
                    <CheckSquare className="mr-2 text-green-600" />I agree to
                    the terms and conditions
                  </label>
                </div>
                {errors.agreed && (
                  <p className="text-red-500 text-sm mt-1">{errors.agreed}</p>
                )}
              </div>
            )}

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

export default CompanyRegistration;
