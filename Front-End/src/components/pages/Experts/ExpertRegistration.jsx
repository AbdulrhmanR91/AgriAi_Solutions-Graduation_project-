import { useState } from 'react';
import { User, Mail, Lock, CheckSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logo from '/src/assets/images/logor2.png';
const countryCodes = [
    { code: '+20', country: 'Egypt' },
    { code: '+966', country: 'Saudi Arabia' },
    { code: '+971', country: 'UAE' },
    { code: '+1', country: 'USA' },
    { code: '+44', country: 'UK' },
    // Add more country codes as needed
];

const ExpertRegistration = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        expertAt: '',
        university: '',
        college: '',
        services: '',
        idFile: null,
        agreed: false,
    });
    const [errors, setErrors] = useState({});
    const [selectedCountryCode, setSelectedCountryCode] = useState(countryCodes[0].code);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const handlePhoneChange = (e) => {
        const { value } = e.target;
        setFormData((prev) => ({ ...prev, phone: selectedCountryCode + value }));
        setErrors((prev) => ({ ...prev, phone: '' }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type and size
            const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
            const maxSize = 5 * 1024 * 1024; // 5MB

            if (!validTypes.includes(file.type)) {
                setErrors(prev => ({
                    ...prev,
                    idFile: "File must be JPG, PNG, or PDF"
                }));
                return;
            }

            if (file.size > maxSize) {
                setErrors(prev => ({
                    ...prev,
                    idFile: "File size must not exceed 5MB"
                }));
                return;
            }

            setFormData(prev => ({ ...prev, idFile: file }));
            setErrors(prev => ({ ...prev, idFile: '' }));
        }
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
            } else if (!/^\+\d{1,3}\d{10}$/.test(formData.phone)) {
                newErrors.phone = "Phone number is invalid.";
            }
            if (!formData.password) newErrors.password = "Password is required.";
        }
        if (step === 2) {
            if (!formData.expertAt) newErrors.expertAt = "Expert at is required.";
            if (!formData.university) newErrors.university = "University is required.";
            if (!formData.college) newErrors.college = "College is required.";
            if (!formData.services) newErrors.services = "Services are required.";
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

    const handleSubmit = (e) => {
        e.preventDefault();
        const validationErrors = validateStep(3);
        if (Object.keys(validationErrors).length === 0) {
            console.log("Submitted Data:", formData);
            alert("Registration Successful!");
            navigate('/expert');
        } else {
            setErrors(validationErrors);
        }
    };

    const steps = ['Personal Information', 'Specialization Details', 'Verification'];

    return (
        <div className="min-h-screen bg-green-50 flex items-center justify-center p-6">
            <div className="w-full max-w-4xl bg-white shadow-2xl rounded-3xl overflow-hidden border-4 border-green-500">
                {/* Modern Header */}
                <div className="bg-green-600 text-white p-8 text-center">
                    <div className="flex justify-center items-center mb-4">
                        <img src= {logo} alt="Logo" className="w-40" />
                    </div>
                    <h1 className="text-3xl font-bold mb-2">Expert Registration</h1>
                    <p className="text-xl opacity-80">Join us to share your expertise!</p>
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
                                    <select
                                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600 bg-transparent border-none"
                                        value={selectedCountryCode}
                                        onChange={(e) => setSelectedCountryCode(e.target.value)}
                                    >
                                        {countryCodes.map((country) => (
                                            <option key={country.code} value={country.code}>
                                                {country.country} ({country.code})
                                            </option>
                                        ))}
                                    </select>
                                    <input
                                        type="text"
                                        name="phone"
                                        placeholder="Phone Number"
                                        className={`w-full pl-32 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:border-green-500 ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                                        value={formData.phone.replace(selectedCountryCode, '')}
                                        onChange={handlePhoneChange}
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
                                    <input
                                        type="text"
                                        name="expertAt"
                                        placeholder="Expert At"
                                        className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:border-green-500 ${errors.expertAt ? 'border-red-500' : 'border-gray-300'}`}
                                        value={formData.expertAt}
                                        onChange={handleChange}
                                        required
                                    />
                                    {errors.expertAt && <p className="text-red-500 text-sm mt-1">{errors.expertAt}</p>}
                                </div>

                                <div className="relative">
                                    <input
                                        type="text"
                                        name="university"
                                        placeholder="University"
                                        className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:border-green-500 ${errors.university ? 'border-red-500' : 'border-gray-300'}`}
                                        value={formData.university}
                                        onChange={handleChange}
                                        required
                                    />
                                    {errors.university && <p className="text-red-500 text-sm mt-1">{errors.university}</p>}
                                </div>

                                <div className="relative">
                                    <input
                                        type="text"
                                        name="college"
                                        placeholder="College"
                                        className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:border-green-500 ${errors.college ? 'border-red-500' : 'border-gray-300'}`}
                                        value={formData.college}
                                        onChange={handleChange}
                                        required
                                    />
                                    {errors.college && <p className="text-red-500 text-sm mt-1">{errors.college}</p>}
                                </div>

                                <div className="relative">
                                    <textarea
                                        name="services"
                                        placeholder="Services Offered"
                                        className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:border-green-500 ${errors.services ? 'border-red-500' : 'border-gray-300'}`}
                                        value={formData.services}
                                        onChange={handleChange}
                                        required
                                    />
                                    {errors.services && <p className="text-red-500 text-sm mt-1">{errors.services}</p>}
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
                                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-green-500 ${errors.idFile ? 'border-red-500' : 'border-gray-300'}`}
                                        onChange={handleFileChange}
                                    />
                                    {errors.idFile && <p className="text-red-500 text-sm mt-1">{errors.idFile}</p>}
                                </div>

                                <div className="flex items-center space-x-3">
                                    <input
                                        type="checkbox"
                                        name="agreed"
                                        id="agreed"
                                        className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                        checked={formData.agreed}
                                        onChange={(e) => setFormData({ ...formData, agreed: e.target.checked })}
                                    />
                                    <label htmlFor="agreed" className="text-gray-700 flex items-center cursor-pointer">
                                        <CheckSquare className="mr-2 text-green-600" />
                                        I agree to the terms and conditions
                                    </label>
                                </div>
                                {errors.agreed && <p className="text-red-500 text-sm mt-1">{errors.agreed}</p>}
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

export default ExpertRegistration;