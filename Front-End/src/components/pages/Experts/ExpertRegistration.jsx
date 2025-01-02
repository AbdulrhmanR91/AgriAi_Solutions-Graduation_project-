import { useState } from 'react';
import { User, Mail, Lock, CheckSquare, GraduationCap, School, Briefcase, ListChecks } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logo from '/src/assets/images/logor2.png';
import { registerUser } from '../../../../utils/apiService';
import PropTypes from 'prop-types';
import { toast } from 'react-hot-toast';

const countryCodes = [
    { code: '+20', country: 'Egypt' },
    { code: '+966', country: 'Saudi Arabia' },
    { code: '+971', country: 'UAE' },
    { code: '+1', country: 'USA' },
    { code: '+44', country: 'UK' },
    // Add more country codes as needed
];

const steps = ['Personal Information', 'Specialization Details', 'Verification'];

const Progress = ({ currentStep }) => {
    const percentage = ((currentStep - 1) / 2) * 100;
    
    return (
        <div className="mb-8">
            <div className="h-2 w-full bg-gray-200 rounded-full">
                <div
                    className="h-full bg-green-600 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                />
            </div>
            <div className="flex justify-between mt-2">
                <span className="text-sm text-gray-600">
                    {steps[currentStep - 1]}
                </span>
                <span className="text-sm text-gray-600">
                    {Math.round(percentage)}% Complete
                </span>
            </div>
        </div>
    );
};

Progress.propTypes = {
    currentStep: PropTypes.number.isRequired
};

const egyptianUniversities = [
    "Cairo University",
    "Alexandria University",
    "Ain Shams University",
    "Al-Azhar University",
    "Assiut University",
    "Helwan University",
    "Mansoura University",
    "Zagazig University",
    "Tanta University",
    "Suez Canal University",
    "Benha University",
    "Fayoum University",
    "South Valley University",
    "Menoufia University",
    "Beni Suef University",
    "Port Said University",
    "Sohag University",
    "Kafr El Sheikh University",
    "Damietta University",
    "Aswan University",
    "Luxor University",
    "Modern Academy",
    "Future University in Egypt",
    "German University in Cairo",
    "British University in Egypt",
    "American University in Cairo",
    "Arab Academy for Science and Technology",
    "Modern Sciences and Arts University",
    "October 6 University",
    "Misr International University",
    "Misr University for Science and Technology",
].sort();

const agricultureColleges = [
    "Faculty of Agriculture",
    "Faculty of Agricultural Engineering",
    "Faculty of Science",
    "Faculty of Agricultural Sciences",
    "Faculty of Environmental Agricultural Sciences",
    "Faculty of Desert Agriculture",
    "Faculty of Biotechnology",
    "Faculty of Food and Dairy Technology",
    "Faculty of Natural Resources",
].sort();

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
        
        let error = '';
        switch (name) {
            case 'name':
                error = validateName(value);
                break;
            case 'email':
                error = value ? (!/\S+@\S+\.\S+/.test(value) ? "Email is invalid" : "") : "";
                break;
            case 'password':
                error = value ? validatePassword(value) : "";
                break;
            case 'services':
                error = validateServices(value);
                break;
            case 'expertAt':
            case 'university':
            case 'college':
                error = !value.trim() ? `${name} is required` : "";
                break;
            default:
                break;
        }
        
        setErrors(prev => ({
            ...prev,
            [name]: error
        }));
    };

    const handlePhoneChange = (e) => {
        const { value } = e.target;
        const newPhone = selectedCountryCode + value;
        setFormData((prev) => ({ ...prev, phone: newPhone }));
        
        const phoneError = validatePhone(newPhone);
        setErrors(prev => ({
            ...prev,
            phone: phoneError
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
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

    const validateName = (name) => {
        if (!name) return "Name is required";
        if (name.trim().split(' ').length < 2) return "Please enter your full name (at least two words)";
        return "";
    };

    const validatePhone = (phone) => {
        if (!phone) return "Phone number is required";
        // حذف رمز البلد من التحقق
        const phoneNumber = phone.replace(/^\+\d{1,3}/, '');
        if (!/^\d{10,11}$/.test(phoneNumber)) return "Phone number must be 10-11 digits";
        return "";
    };

    const validatePassword = (password) => {
        if (!password) return "Password is required";
        if (password.length < 8) return "Password must be at least 8 characters";
        if (!/[A-Z]/.test(password)) return "Password must include at least one uppercase letter";
        if (!/[a-z]/.test(password)) return "Password must include at least one lowercase letter";
        if (!/[0-9]/.test(password)) return "Password must include at least one number";
        if (!/[!@#$%^&*]/.test(password)) return "Password must include at least one special character (!@#$%^&*)";
        return "";
    };

    const validateServices = (services) => {
        if (!services) return "Services are required";
        const servicesList = services.split(',').map(s => s.trim());
        if (servicesList.length < 1) return "Please add  services separated by commas";
        if (servicesList.some(s => s.length < 3)) return "Each service should be at least 3 characters long";
        return "";
    };

    const validateStep = (step) => {
        const newErrors = {};
        if (step === 1) {
            const nameError = validateName(formData.name);
            if (nameError) newErrors.name = nameError;

            if (!formData.email) {
                newErrors.email = "Email is required";
            } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
                newErrors.email = "Email is invalid";
            }

            const phoneError = validatePhone(formData.phone);
            if (phoneError) newErrors.phone = phoneError;

            const passwordError = validatePassword(formData.password);
            if (passwordError) newErrors.password = passwordError;
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
            } else {
                const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
                const maxSize = 5 * 1024 * 1024; // 5MB

                if (!validTypes.includes(formData.idFile.type)) {
                    newErrors.idFile = "File must be JPG, PNG, or PDF";
                }

                if (formData.idFile.size > maxSize) {
                    newErrors.idFile = "File size must not exceed 5MB";
                }
            }

            if (!formData.agreed) {
                newErrors.agreed = "You must agree to the terms and conditions";
            }
        }
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // التحقق من الموافقة وملف الهوية
        if (!formData.agreed || !formData.idFile) {
            setErrors(prev => ({
                ...prev,
                agreed: !formData.agreed ? "You must agree to the terms and conditions" : "",
                idFile: !formData.idFile ? "ID document is required" : ""
            }));
            toast.error('Please complete all required fields');
            return;
        }

        // التحقق من جميع الحقول في الخطوة الأخيرة
        const validationErrors = validateStep(3);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        
        try {
            const userData = {
                name: formData.name.trim(),
                email: formData.email.trim(),
                password: formData.password,
                phone: formData.phone,
                userType: 'expert',
                expertDetails: {
                    expertAt: formData.expertAt.trim(),
                    university: formData.university.trim(),
                    college: formData.college.trim(),
                    services: formData.services.split(',').map(s => s.trim()).filter(s => s).join(', ')
                }
            };

            await registerUser(userData);
            toast.success('Registration successful! Redirecting to login...');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (error) {
            toast.error(error.message || 'Registration failed. Please try again.');
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        let error = '';
        
        switch (name) {
            case 'name':
                error = validateName(value);
                break;
            case 'email':
                error = !value ? "Email is required" : 
                       !/\S+@\S+\.\S+/.test(value) ? "Email is invalid" : "";
                break;
            case 'password':
                error = validatePassword(value);
                break;
            case 'phone':
                error = validatePhone(value);
                break;
            case 'expertAt':
            case 'university':
            case 'college':
            case 'services':
                error = !value.trim() ? `${name} is required` : "";
                break;
            default:
                break;
        }
        
        setErrors(prev => ({
            ...prev,
            [name]: error
        }));
    };

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
                    
                    <Progress currentStep={currentStep} />
                    
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
                                        onBlur={handleBlur}
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
                                        onBlur={handleBlur}
                                        required
                                    />
                                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                                </div>

                                <div className="relative">
                                    <div className="flex relative">
                                        <select
                                            className="w-[110px] sm:w-32 pl-2 pr-2 py-3 border-2 border-r-0 rounded-l-xl focus:outline-none focus:border-green-500 bg-gray-50 text-sm sm:text-base"
                                            value={selectedCountryCode}
                                            onChange={(e) => setSelectedCountryCode(e.target.value)}
                                        >
                                            {countryCodes.map((country) => (
                                                <option key={country.code} value={country.code}>
                                                    {country.code} {country.country}
                                                </option>
                                            ))}
                                        </select>
                                        <input
                                            type="text"
                                            name="phone"
                                            placeholder="Phone Number"
                                            className={`w-full min-w-0 pl-3 pr-4 py-3 border-2 border-l-0 rounded-r-xl focus:outline-none focus:border-green-500 text-sm sm:text-base ${
                                                errors.phone ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                            value={formData.phone.replace(selectedCountryCode, '')}
                                            onChange={handlePhoneChange}
                                            onBlur={handleBlur}
                                            required
                                        />
                                    </div>
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
                                        onBlur={handleBlur}
                                        required
                                    />
                                    {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                                </div>
                            </div>
                        )}

                        {currentStep === 2 && (
                            <div className="space-y-6">
                                <div className="relative">
                                    <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600" />
                                    <input
                                        type="text"
                                        name="expertAt"
                                        placeholder="Expert At"
                                        className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:border-green-500 ${
                                            errors.expertAt ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        value={formData.expertAt}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        required
                                    />
                                    {errors.expertAt && <p className="text-red-500 text-sm mt-1">{errors.expertAt}</p>}
                                </div>

                                <div className="relative">
                                    <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600" />
                                    <select
                                        name="university"
                                        className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:border-green-500 ${
                                            errors.university ? 'border-red-500' : 'border-gray-300'
                                        } bg-white`}
                                        value={formData.university}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        required
                                    >
                                        <option value="">Select University</option>
                                        {egyptianUniversities.map((uni) => (
                                            <option key={uni} value={uni}>
                                                {uni}
                                            </option>
                                        ))}
                                        <option value="other">Other</option>
                                    </select>
                                    {formData.university === 'other' && (
                                        <input
                                            type="text"
                                            name="universityOther"
                                            placeholder="Enter University Name"
                                            className="w-full mt-2 pl-4 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:border-green-500"
                                            value={formData.universityOther || ''}
                                            onChange={(e) => {
                                                handleChange({
                                                    target: {
                                                        name: 'university',
                                                        value: e.target.value
                                                    }
                                                });
                                            }}
                                        />
                                    )}
                                    {errors.university && (
                                        <p className="text-red-500 text-sm mt-1">{errors.university}</p>
                                    )}
                                </div>

                                <div className="relative">
                                    <School className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600" />
                                    <select
                                        name="college"
                                        className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:border-green-500 ${
                                            errors.college ? 'border-red-500' : 'border-gray-300'
                                        } bg-white`}
                                        value={formData.college}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        required
                                    >
                                        <option value="">Select College</option>
                                        {agricultureColleges.map((college) => (
                                            <option key={college} value={college}>
                                                {college}
                                            </option>
                                        ))}
                                        <option value="other">Other</option>
                                    </select>
                                    {formData.college === 'other' && (
                                        <input
                                            type="text"
                                            name="collegeOther"
                                            placeholder="Enter College Name"
                                            className="w-full mt-2 pl-4 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:border-green-500"
                                            value={formData.collegeOther || ''}
                                            onChange={(e) => {
                                                handleChange({
                                                    target: {
                                                        name: 'college',
                                                        value: e.target.value
                                                    }
                                                });
                                            }}
                                        />
                                    )}
                                    {errors.college && (
                                        <p className="text-red-500 text-sm mt-1">{errors.college}</p>
                                    )}
                                </div>

                                <div className="relative">
                                    <ListChecks className="absolute left-3 top-3 text-green-600" />
                                    <textarea
                                        name="services"
                                        placeholder="Enter your services (separate with commas) 
Example: Crop Disease Diagnosis, Soil Analysis, Irrigation Consulting"
                                        className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:border-green-500 ${
                                            errors.services ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        value={formData.services}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            // تنظيف الفواصل المتكررة والمسافات الزائدة
                                            const cleanedValue = value
                                                .split(',')
                                                .map(s => s.trim())
                                                .filter(s => s)
                                                .join(', ');
                                            handleChange({
                                                target: {
                                                    name: 'services',
                                                    value: cleanedValue
                                                }
                                            });
                                        }}
                                        onBlur={handleBlur}
                                        required
                                    />
                                    <p className="text-gray-500 text-sm mt-1">
                                        Separate services with commas. Minimum 1 service required.
                                    </p>
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
                                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-green-500 ${
                                            errors.idFile ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        onChange={handleFileChange}
                                    />
                                    {errors.idFile && (
                                        <p className="text-red-500 text-sm mt-1">{errors.idFile}</p>
                                    )}
                                    {formData.idFile && !errors.idFile && (
                                        <p className="text-green-600 text-sm mt-1">
                                            File selected: {formData.idFile.name}
                                        </p>
                                    )}
                                </div>

                                <div className="flex items-center space-x-3">
                                    <input
                                        type="checkbox"
                                        name="agreed"
                                        id="agreed"
                                        className={`h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded ${
                                            errors.agreed ? 'border-red-500' : ''
                                        }`}
                                        checked={formData.agreed}
                                        onChange={(e) => {
                                            setFormData(prev => ({ ...prev, agreed: e.target.checked }));
                                            if (e.target.checked) {
                                                setErrors(prev => ({ ...prev, agreed: '' }));
                                            }
                                        }}
                                    />
                                    <label
                                        htmlFor="agreed"
                                        className={`text-gray-700 flex items-center cursor-pointer ${
                                            errors.agreed ? 'text-red-500' : ''
                                        }`}
                                    >
                                        <CheckSquare className={`mr-2 ${errors.agreed ? 'text-red-500' : 'text-green-600'}`} />
                                        I agree to the terms and conditions
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

export default ExpertRegistration;