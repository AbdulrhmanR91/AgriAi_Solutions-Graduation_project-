import { useState, useEffect } from 'react';
import { Mail, Phone, Lock, CheckSquare, Building2, MapPin, FileText, Receipt } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logo from '/src/assets/images/logor2.png';
import { registerUser } from '../../../utils/apiService';
import PropTypes from 'prop-types';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { toast } from 'react-hot-toast';

const countryCodes = [
    { code: '+20', country: 'Egypt' },
    { code: '+966', country: 'Saudi Arabia' },
    { code: '+971', country: 'UAE' },
    { code: '+1', country: 'USA' },
    { code: '+44', country: 'UK' },
];



const validateCompanyName = (name) => {
    if (!name) return "Company name is required";
    if (name.length < 3) return "Company name must be at least 3 characters";
    return "";
};

const validateEmail = (email) => {
    if (!email) return "Email is required";
    if (!/\S+@\S+\.\S+/.test(email)) return "Email is invalid";
    return "";
};

const validatePhone = (phone) => {
    if (!phone) return "Phone number is required";
    const phoneNumber = phone.replace(/^\+\d{1,3}/, '');
    if (!/^\d{10,11}$/.test(phoneNumber)) return "Phone number must be 10-11 digits";
    return "";
};

const validatePassword = (password) => {
    if (!password) return "Password is required";
    if (password.length < 8) return "Password must be at least 8 characters";
    if (!/[A-Z]/.test(password)) return "Must include uppercase letter";
    if (!/[a-z]/.test(password)) return "Must include lowercase letter";
    if (!/[0-9]/.test(password)) return "Must include number";
    if (!/[!@#$%^&*]/.test(password)) return "Must include special character (!@#$%^&*)";
    return "";
};

const validateTradeLicense = (number) => {
    if (!number) return "Trade license number is required";
    if (!/^TL\d{10}$/.test(number)) {
        return "Trade license number must start with 'TL' followed by 10 digits";
    }
    return "";
};

const validateTaxNumber = (number) => {
    if (!number) return "Tax registration number is required";
    if (!/^\d{9}$/.test(number)) {
        return "Tax registration number must be exactly 9 digits";
    }
    return "";
};

const LocationMarker = ({ position, setPosition }) => {
    const map = useMapEvents({
        click(e) {
            setPosition(e.latlng);
            map.flyTo(e.latlng, map.getZoom());
        },
    });

    return position === null ? null : (
        <Marker 
            position={position}
            icon={L.icon({
                iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
                iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
                shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
            })}
        />
    );
};

LocationMarker.propTypes = {
    position: PropTypes.object,
    setPosition: PropTypes.func.isRequired
};

const SearchControl = ({ setPosition }) => {
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
                                setPosition({
                                    lat: parseFloat(result.lat),
                                    lng: parseFloat(result.lon)
                                });
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
    setPosition: PropTypes.func.isRequired
};

const CompanyRegistration = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        companyName: '',
        email: '',
        phone: countryCodes[0].code,
        password: '',
        businessAddress: '',
        tradeLicenseNumber: '',
        taxRegistrationNumber: '',
        tradeLicenseFile: null,
        taxRegistrationFile: null,
        agreed: false,
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedCountryCode, setSelectedCountryCode] = useState(countryCodes[0].code);
    const [position, setPosition] = useState(null);

    useEffect(() => {
        if (position) {
            fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.lat}&lon=${position.lng}`)
                .then(res => res.json())
                .then(data => {
                    const address = data.display_name;
                    setFormData(prev => ({
                        ...prev,
                        businessAddress: address
                    }));
                })
                .catch(err => console.error('Error getting address:', err));
        }
    }, [position]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        
        let error = '';
        switch (name) {
            case 'companyName':
                error = validateCompanyName(value);
                break;
            case 'email':
                error = validateEmail(value);
                break;
            case 'password':
                error = validatePassword(value);
                break;
            case 'tradeLicenseNumber':
                error = validateTradeLicense(value);
                break;
            case 'taxRegistrationNumber':
                error = validateTaxNumber(value);
                break;
            case 'businessAddress':
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

    const handleFileChange = (e) => {
        const { name } = e.target;
        const file = e.target.files?.[0] || null;
        setFormData((prev) => ({ ...prev, [name]: file }));
        setErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const handlePhoneChange = (e) => {
        const { value } = e.target;
        const phoneNumberOnly = value.replace(/\D/g, '');
        const newPhone = selectedCountryCode + phoneNumberOnly;
        setFormData(prev => ({ ...prev, phone: newPhone }));
        
        const phoneError = validatePhone(newPhone);
        setErrors(prev => ({
            ...prev,
            phone: phoneError
        }));
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
            if (!formData.companyName) newErrors.companyName = "Company name is required.";
            if (!formData.email) {
                newErrors.email = "Email is required.";
            } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
                newErrors.email = "Email is invalid.";
            }
            if (!formData.phone) newErrors.phone = "Phone number is required.";
            if (!formData.password) newErrors.password = "Password is required.";
        }
        if (step === 2) {
            if (!formData.businessAddress) newErrors.businessAddress = "Business address is required.";
            
            const tradeLicenseError = validateTradeLicense(formData.tradeLicenseNumber);
            if (tradeLicenseError) newErrors.tradeLicenseNumber = tradeLicenseError;
            
            const taxNumberError = validateTaxNumber(formData.taxRegistrationNumber);
            if (taxNumberError) newErrors.taxRegistrationNumber = taxNumberError;
        }
        if (step === 3) {
            if (!formData.tradeLicenseFile) {
                newErrors.tradeLicenseFile = "Trade license file is required.";
            }
            if (!formData.taxRegistrationFile) {
                newErrors.taxRegistrationFile = "Tax registration file is required.";
            }
            if (!formData.agreed) {
                newErrors.agreed = "You must agree to the terms and conditions.";
            }
        }
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const validationErrors = validateStep(3);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        
        setIsSubmitting(true);
        try {
            const userData = {
                name: formData.companyName.trim(),
                email: formData.email.trim(),
                password: formData.password,
                phone: formData.phone,
                userType: 'company',
                companyDetails: {
                    companyName: formData.companyName.trim(),
                    businessAddress: formData.businessAddress,
                    tradeLicenseNumber: formData.tradeLicenseNumber,
                    taxRegistrationNumber: formData.taxRegistrationNumber,
                    location: position ? {
                        lat: position.lat,
                        lng: position.lng
                    } : null
                }
            };

            await registerUser(userData);
            toast.success('Registration successful! Redirecting to login...');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (error) {
            const errorMessage = error.message || 'Registration failed';
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const steps = ['Company Information', 'Business Details', 'Verification'];

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

    return (
        <div className="min-h-screen bg-green-50 flex items-center justify-center p-6">
            <div className="w-full max-w-4xl bg-white shadow-2xl rounded-3xl overflow-hidden border-4 border-green-500">
                {/* Modern Header */}
                <div className="bg-green-600 text-white p-8 text-center">
                    <div className="flex justify-center items-center mb-4">
                        <img src= {logo} alt="Logo" className="w-40" />
                    </div>
                    <h1 className="text-3xl font-bold mb-2">Company Registration</h1>
                    <p className="text-xl opacity-80">Join us to grow your business!</p>
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
                                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600" />
                                    <input
                                        type="text"
                                        name="companyName"
                                        placeholder="Company Name"
                                        className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:border-green-500 ${errors.companyName ? 'border-red-500' : 'border-gray-300'}`}
                                        value={formData.companyName}
                                        onChange={handleChange}
                                        required
                                    />
                                    {errors.companyName && <p className="text-red-500 text-sm mt-1">{errors.companyName}</p>}
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
                                    <div className="flex relative">
                                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600 z-10" />
                                        <select
                                            className="w-[110px] sm:w-32 pl-10 pr-2 py-3 border-2 border-r-0 rounded-l-xl focus:outline-none focus:border-green-500 bg-gray-50 text-sm sm:text-base"
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
                                            value={formData.phone.replace(selectedCountryCode, '') || ''}
                                            onChange={handlePhoneChange}
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
                                        required
                                    />
                                    {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                                </div>
                            </div>
                        )}

                        {currentStep === 2 && (
                            <div className="space-y-6">
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 text-green-600 z-10" />
                                    <div className="mb-2">
                                        <input
                                            type="text"
                                            name="businessAddress"
                                            placeholder="Click on map to select location"
                                            className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:border-green-500 cursor-not-allowed bg-gray-50 ${
                                                errors.businessAddress ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                            value={formData.businessAddress}
                                            readOnly
                                            required
                                        />
                                        <p className="text-sm text-gray-500 mt-1">
                                            ⓘ Click on the map to set your business location
                                        </p>
                                        {errors.businessAddress && <p className="text-red-500 text-sm mt-1">{errors.businessAddress}</p>}
                                    </div>
                                    <div className="h-[300px] rounded-xl overflow-hidden border-2 border-gray-300 relative">
                                        <MapContainer
                                            center={[30.0444, 31.2357]}
                                            zoom={13}
                                            style={{ height: '100%', width: '100%' }}
                                        >
                                            <TileLayer
                                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                            />
                                            <LocationMarker position={position} setPosition={setPosition} />
                                            <SearchControl setPosition={setPosition} />
                                        </MapContainer>
                                    </div>
                                </div>

                               

                                <div className="relative">
                                    <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600" />
                                    <input
                                        type="text"
                                        name="tradeLicenseNumber"
                                        placeholder="Trade License Number (Format: TL followed by 10 digits)"
                                        className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:border-green-500 ${
                                            errors.tradeLicenseNumber ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        value={formData.tradeLicenseNumber}
                                        onChange={handleChange}
                                        required
                                    />
                                    {errors.tradeLicenseNumber && <p className="text-red-500 text-sm mt-1">{errors.tradeLicenseNumber}</p>}
                                </div>

                                <div className="relative">
                                    <Receipt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600" />
                                    <input
                                        type="text"
                                        name="taxRegistrationNumber"
                                        placeholder="Tax Registration Number (9 digits)"
                                        className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:border-green-500 ${
                                            errors.taxRegistrationNumber ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        value={formData.taxRegistrationNumber}
                                        onChange={handleChange}
                                        required
                                    />
                                    {errors.taxRegistrationNumber && <p className="text-red-500 text-sm mt-1">{errors.taxRegistrationNumber}</p>}
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
                                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-green-500 ${errors.tradeLicenseFile ? 'border-red-500' : 'border-gray-300'}`}
                                        onChange={handleFileChange}
                                        required
                                    />
                                    {errors.tradeLicenseFile && <p className="text-red-500 text-sm mt-1">{errors.tradeLicenseFile}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Upload Tax Registration Certificate
                                    </label>
                                    <input
                                        type="file"
                                        name="taxRegistrationFile"
                                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-green-500 ${errors.taxRegistrationFile ? 'border-red-500' : 'border-gray-300'}`}
                                        onChange={handleFileChange}
                                        required
                                    />
                                    {errors.taxRegistrationFile && <p className="text-red-500 text-sm mt-1">{errors.taxRegistrationFile}</p>}
                                </div>

                                <div className="flex items-center space-y-2">
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            name="agreed"
                                            id="agreed"
                                            className={`h-5 w-5 text-green-600 focus:ring-green-500 border-2 rounded mr-3 ${
                                                errors.agreed ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                            checked={formData.agreed}
                                            onChange={(e) => {
                                                setFormData({ ...formData, agreed: e.target.checked });
                                                if (e.target.checked) {
                                                    setErrors(prev => ({ ...prev, agreed: '' }));
                                                }
                                            }}
                                        />
                                        <label htmlFor="agreed" className="text-gray-700 flex items-center cursor-pointer">
                                            <CheckSquare className={`mr-2 ${errors.agreed ? 'text-red-500' : 'text-green-600'}`} />
                                            I agree to the terms and conditions
                                        </label>
                                    </div>
                                    {errors.agreed && (
                                        <p className="text-red-500 text-sm ml-8">{errors.agreed}</p>
                                    )}
                                </div>
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
                                    className="w-full px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:bg-green-400"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Registering...' : 'Complete Registration'}
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