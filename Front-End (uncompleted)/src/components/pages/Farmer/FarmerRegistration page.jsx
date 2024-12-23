import { useState } from 'react';
import { Wheat, MapPin, User, Mail, Phone, Lock, FileCheck2, CheckSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FarmerRegistration = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        farmName: '',
        farmLocation: '',
        farmSize: '',
        crops: '',
        idFile: null,
        agreed: false,
    });
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0] || null;
        setFormData((prev) => ({ ...prev, idFile: file }));
        setErrors((prev) => ({ ...prev, idFile: '' }));
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
            if (!formData.name) newErrors.name = "Name is required.";
            if (!formData.email) {
                newErrors.email = "Email is required.";
            } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
                newErrors.email = "Email is invalid.";
            }
            if (!formData.phone) {
                newErrors.phone = "Phone number is required.";
            } else if (!/^\d+$/.test(formData.phone)) {
                newErrors.phone = "Phone number must contain only digits.";
            }
            if (!formData.password) newErrors.password = "Password is required.";
        }
        if (step === 2) {
            if (!formData.farmName) newErrors.farmName = "Farm name is required.";
            if (!formData.farmLocation) newErrors.farmLocation = "Farm location is required.";
            if (!formData.farmSize) newErrors.farmSize = "Farm size is required.";
            if (!formData.crops) newErrors.crops = "Primary crops are required.";
        }
        if (step === 3) {
            if (!formData.idFile) newErrors.idFile = "ID file is required.";
            if (!formData.agreed) newErrors.agreed = "You must agree to the terms.";
        }
        return newErrors;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const validationErrors = validateStep(3);
        if (Object.keys(validationErrors).length === 0) {
            console.log("Submitted Data:", formData);
            alert("Registration Successful!");
        } else {
            setErrors(validationErrors);
        }
    };

    const steps = ['Personal Information', 'Farm Details', 'Verification'];

    return (
        <div className="min-h-screen bg-green-50 flex items-center justify-center p-6">
            <div className="w-full max-w-4xl bg-white shadow-2xl rounded-3xl overflow-hidden border-4 border-green-500">
                {/* Modern Header */}
                <div className="bg-green-600 text-white p-8 text-center">
                    <div className="flex justify-center items-center mb-4">
                        <img src="/src/assets/images/logo agri 3_enhanced.PNG" alt="Logo" className="w-40" />
                    </div>
                    <h1 className="text-3xl font-bold mb-2">Farmer Registration</h1>
                    <p className="text-xl opacity-80">Join our agricultural innovation platform</p>
                </div>

                <div className="max-w-3xl mx-auto py-12 px-8">
                <button
        onClick={() => navigate('/Login')}
        className="mb-6 text-green-600 hover:text-green-500"
      >
        &larr; Back to Login
      </button>
                    {/* Step Indicator with Icons and Numbers */}
                    <div className="flex justify-between mb-10">
                        {steps.map((step, index) => (
                            <div 
                                key={index} 
                                className={`flex items-center space-x-2 ${currentStep === index + 1 ? 'text-green-600 font-bold' : 'text-gray-400'}`}
                            >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === index + 1 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
                                    {index + 1}
                                </div>
                                {index === 0 && <User className={currentStep === 1 ? 'text-green-600' : 'text-gray-400'} />}
                                {index === 1 && <MapPin className={currentStep === 2 ? 'text-green-600' : 'text-gray-400'} />}
                                {index === 2 && <FileCheck2 className={currentStep === 3 ? 'text-green-600' : 'text-gray-400'} />}
                                <span>{step}</span>
                            </div>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit}>
                        {currentStep === 1 && (
                            <div className="space-y-6">
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600" />
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="Full Name"
                                        className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:border-green-500 ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                                </div>

                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600" />
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="Email Address"
                                        className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:border-green-500 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                                </div>

                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600" />
                                    <input
                                        type="tel"
                                        name="phone"
                                        placeholder="Phone Number"
                                        className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:border-green-500 ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                                        value={formData.phone}
                                        onChange={handleChange}
                                        required
                                    />
                                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                                </div>

                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600" />
                                    <input
                                        type="password"
                                        name="password"
                                        placeholder="Password"
                                        className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:border-green-500 ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                    />
                                    {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
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
                                        className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:border-green-500 ${errors.farmName ? 'border-red-500' : 'border-gray-300'}`}
                                        value={formData.farmName}
                                        onChange={handleChange}
                                        required
                                    />
                                    {errors.farmName && <p className="text-red-500 text-sm mt-1">{errors.farmName}</p>}
                                </div>

                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600" />
                                    <input
                                        type="text"
                                        name="farmLocation"
                                        placeholder="Farm Location"
                                        className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:border-green-500 ${errors.farmLocation ? 'border-red-500' : 'border-gray-300'}`}
                                        value={formData.farmLocation}
                                        onChange={handleChange}
                                        required
                                    />
                                    {errors.farmLocation && <p className="text-red-500 text-sm mt-1">{errors.farmLocation}</p>}
                                </div>

                                <div className="relative">
                                    <input
                                        type="number"
                                        name="farmSize"
                                        placeholder="Farm Size (in Acres)"
                                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-green-500 ${errors.farmSize ? 'border-red-500' : 'border-gray-300'}`}
                                        value={formData.farmSize}
                                        onChange={handleChange}
                                        required
                                    />
                                    {errors.farmSize && <p className="text-red-500 text-sm mt-1">{errors.farmSize}</p>}
                                </div>

                                <div className="relative">
                                    <textarea
                                        name="crops"
                                        placeholder="Primary Crops"
                                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-green-500 h-24 ${errors.crops ? 'border-red-500' : 'border-gray-300'}`}
                                        value={formData.crops}
                                        onChange={handleChange}
                                        required
                                    />
                                    {errors.crops && <p className="text-red-500 text-sm mt-1">{errors.crops}</p>}
                                </div>
                            </div>
                        )}

                        {currentStep === 3 && (
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Upload ID Document
                                    </label>
                                    <input
                                        type="file"
                                        name="idFile"
                                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-green-500 ${errors.idFile ? 'border-red-500' : 'border-gray-300'}`}
                                        onChange={handleFileChange}
                                        required
                                    />
                                    {errors.idFile && <p className="text-red-500 text-sm mt-1">{errors.idFile}</p>}
                                </div>

                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="agreed"
                                        className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded mr-3"
                                        checked={formData.agreed}
                                        onChange={(e) => setFormData({ ...formData, agreed: e.target.checked })}
                                    />
                                    <label className="text-gray-700 flex items-center">
                                        <CheckSquare className="mr-2 text-green-600" />
                                        I agree to the terms and conditions
                                    </label>
                                </div>
                                {errors.agreed && <p className="text-red-500 text-sm mt-1">{errors.agreed}</p>}
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
                                    onClick={() => navigate('/farmer')}
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