import { useState } from 'react';
import { Mail, Phone, Lock, CheckSquare, Building2, MapPin, FileText, Receipt } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logo from '../../../assets/images/logo_agri_white_text.png';
import { registerUser } from '../../../utils/apiService';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { companyTranslations } from '../../../i18n/companyTranslations';
import '../../../styles/company-registration-responsive.css';

const countryCodes = [
    { code: '+20', country: 'Egypt' },
    { code: '+966', country: 'Saudi Arabia' },
    { code: '+971', country: 'UAE' },
    { code: '+1', country: 'USA' },
    { code: '+44', country: 'UK' },
];

const CompanyRegistration = () => {
    const navigate = useNavigate();
    const { i18n } = useTranslation();
    const currentLang = i18n.language || 'en';
    const t = companyTranslations[currentLang] || companyTranslations.en;
    const [formData, setFormData] = useState({
        companyName: '',
        email: '',
        phone: countryCodes[0].code,
        password: '',
        businessAddress: '',
        tradeLicenseNumber: '',
        taxRegistrationNumber: '',
        agreed: false,
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedCountryCode, setSelectedCountryCode] = useState(countryCodes[0].code);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const handlePhoneChange = (e) => {
        const { value } = e.target;
        const phoneNumberOnly = value.replace(/\D/g, '');
        const newPhone = selectedCountryCode + phoneNumberOnly;
        setFormData(prev => ({ ...prev, phone: newPhone }));
        setErrors(prev => ({ ...prev, phone: '' }));
    };

    const validateForm = () => {
        const newErrors = {};
        
        // Company Information
        if (!formData.companyName.trim()) newErrors.companyName = t.errors.companyNameRequired;
        if (!formData.email.trim()) newErrors.email = t.errors.emailRequired;
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = t.errors.emailInvalid;
        if (!formData.phone.replace(selectedCountryCode, '').trim()) newErrors.phone = t.errors.phoneRequired;
        if (!formData.password) newErrors.password = t.errors.passwordRequired;
        else if (formData.password.length < 8) newErrors.password = t.errors.passwordLength;
        
        // Business Details
        if (!formData.businessAddress.trim()) newErrors.businessAddress = t.errors.businessAddressRequired;
        
        // Trade License Number validation
        if (!formData.tradeLicenseNumber.trim()) {
            newErrors.tradeLicenseNumber = t.errors.tradeLicenseRequired;
        } else if (!/^\d{5,10}$/.test(formData.tradeLicenseNumber.trim())) {
            newErrors.tradeLicenseNumber = t.errors.tradeLicenseInvalid;
        }
        
        // Tax Registration Number validation
        if (!formData.taxRegistrationNumber.trim()) {
            newErrors.taxRegistrationNumber = t.errors.taxRegistrationRequired;
        } else if (!/^\d{9,14}$/.test(formData.taxRegistrationNumber.trim())) {
            newErrors.taxRegistrationNumber = t.errors.taxRegistrationInvalid;
        }
        
        // Agreement
        if (!formData.agreed) newErrors.agreed = t.errors.agreeTermsRequired;
        
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const validationErrors = validateForm();
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
                    businessAddress: formData.businessAddress.trim(),
                    tradeLicenseNumber: formData.tradeLicenseNumber.trim(),
                    taxRegistrationNumber: formData.taxRegistrationNumber.trim()
                }
            };

            await registerUser(userData);
            toast.success(t.messages.registrationSuccessful);
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (error) {
            const errorMessage = error.message || t.messages.registrationFailed;
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 py-4 sm:py-8 px-2 sm:px-4">
            <div className="w-full max-w-4xl mx-auto bg-white shadow-2xl rounded-lg sm:rounded-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4 sm:p-6 text-center">
                    <img src={logo} alt="Logo" className="mx-auto w-24 sm:w-32 mb-2 sm:mb-3" />
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2">{t.title}</h1>
                    <p className="text-green-100 text-sm sm:text-base lg:text-lg">{t.subtitle}</p>
                </div>

                <div className="p-4 sm:p-6 lg:p-8">
                    <button
                        onClick={() => navigate('/login')}
                        className="mb-4 sm:mb-6 text-green-600 hover:text-green-500 flex items-center gap-2 text-sm font-medium"
                    >
                        {t.backToLogin}
                    </button>

                    <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
                        {/* Company Information Section */}
                        <div className="bg-green-50 p-4 sm:p-6 rounded-lg sm:rounded-xl">
                            <h2 className="text-lg sm:text-xl font-semibold text-green-800 mb-3 sm:mb-4 flex items-center gap-2">
                                <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />
                                {t.companyInformation}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                                <div className="relative md:col-span-2 lg:col-span-1">
                                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600 w-4 h-4 sm:w-5 sm:h-5" />
                                    <input
                                        type="text"
                                        name="companyName"
                                        placeholder={t.placeholders.companyName}
                                        className={`w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 text-sm sm:text-base border-2 rounded-lg focus:outline-none focus:border-green-500 transition-colors ${errors.companyName ? 'border-red-500' : 'border-gray-300'}`}
                                        value={formData.companyName}
                                        onChange={handleChange}
                                    />
                                    {errors.companyName && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.companyName}</p>}
                                </div>

                                <div className="relative md:col-span-2 lg:col-span-1">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600 w-4 h-4 sm:w-5 sm:h-5" />
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder={t.placeholders.email}
                                        className={`w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 text-sm sm:text-base border-2 rounded-lg focus:outline-none focus:border-green-500 transition-colors ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                    {errors.email && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.email}</p>}
                                </div>

                                <div className="relative md:col-span-2 lg:col-span-1">
                                    <div className="flex relative">
                                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600 z-10 w-4 h-4 sm:w-5 sm:h-5" />
                                        <select
                                            className="w-20 sm:w-24 lg:w-32 pl-8 sm:pl-10 pr-1 sm:pr-2 py-2.5 sm:py-3 text-xs sm:text-sm border-2 border-r-0 rounded-l-lg focus:outline-none focus:border-green-500 bg-gray-50"
                                            value={selectedCountryCode}
                                            onChange={(e) => setSelectedCountryCode(e.target.value)}
                                        >
                                            {countryCodes.map((country) => (
                                                <option key={country.code} value={country.code}>
                                                    {country.code}
                                                </option>
                                            ))}
                                        </select>
                                        <input
                                            type="text"
                                            name="phone"
                                            placeholder={t.placeholders.phoneNumber}
                                            className={`flex-1 pl-2 sm:pl-3 pr-4 py-2.5 sm:py-3 text-sm sm:text-base border-2 border-l-0 rounded-r-lg focus:outline-none focus:border-green-500 ${
                                                errors.phone ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                            value={formData.phone.replace(selectedCountryCode, '') || ''}
                                            onChange={handlePhoneChange}
                                        />
                                    </div>
                                    {errors.phone && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.phone}</p>}
                                </div>

                                <div className="relative md:col-span-2 lg:col-span-1">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600 w-4 h-4 sm:w-5 sm:h-5" />
                                    <input
                                        type="password"
                                        name="password"
                                        placeholder={t.placeholders.password}
                                        className={`w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 text-sm sm:text-base border-2 rounded-lg focus:outline-none focus:border-green-500 transition-colors ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                                        value={formData.password}
                                        onChange={handleChange}
                                    />
                                    {errors.password && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.password}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Business Details Section */}
                        <div className="bg-blue-50 p-4 sm:p-6 rounded-lg sm:rounded-xl">
                            <h2 className="text-lg sm:text-xl font-semibold text-blue-800 mb-3 sm:mb-4 flex items-center gap-2">
                                <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                                {t.businessDetails}
                            </h2>
                            <div className="space-y-3 sm:space-y-4">
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 sm:top-1/2 sm:transform sm:-translate-y-1/2 text-green-600 w-4 h-4 sm:w-5 sm:h-5" />
                                    <textarea
                                        name="businessAddress"
                                        placeholder={t.placeholders.businessAddress}
                                        rows="3"
                                        className={`w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 text-sm sm:text-base border-2 rounded-lg focus:outline-none focus:border-green-500 transition-colors resize-none ${
                                            errors.businessAddress ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        value={formData.businessAddress}
                                        onChange={handleChange}
                                    />
                                    {errors.businessAddress && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.businessAddress}</p>}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                    <div className="relative">
                                        <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600 w-4 h-4 sm:w-5 sm:h-5" />
                                        <input
                                            type="text"
                                            name="tradeLicenseNumber"
                                            placeholder={t.placeholders.tradeLicenseNumber}
                                            className={`w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 text-sm sm:text-base border-2 rounded-lg focus:outline-none focus:border-green-500 transition-colors ${
                                                errors.tradeLicenseNumber ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                            value={formData.tradeLicenseNumber}
                                            onChange={handleChange}
                                            maxLength="10"
                                            pattern="\d{5,10}"
                                        />
                                        {errors.tradeLicenseNumber && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.tradeLicenseNumber}</p>}
                                        <p className="text-gray-500 text-xs mt-1">{t.helpTexts.tradeLicenseFormat}</p>
                                    </div>

                                    <div className="relative">
                                        <Receipt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600 w-4 h-4 sm:w-5 sm:h-5" />
                                        <input
                                            type="text"
                                            name="taxRegistrationNumber"
                                            placeholder={t.placeholders.taxRegistrationNumber}
                                            className={`w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 text-sm sm:text-base border-2 rounded-lg focus:outline-none focus:border-green-500 transition-colors ${
                                                errors.taxRegistrationNumber ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                            value={formData.taxRegistrationNumber}
                                            onChange={handleChange}
                                            maxLength="14"
                                            pattern="\d{9,14}"
                                        />
                                        {errors.taxRegistrationNumber && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.taxRegistrationNumber}</p>}
                                        <p className="text-gray-500 text-xs mt-1">{t.helpTexts.taxRegistrationFormat}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Terms and Submit */}
                        <div className="space-y-3 sm:space-y-4">
                            <div className="flex items-start sm:items-center space-x-3">
                                <input
                                    type="checkbox"
                                    name="agreed"
                                    id="agreed"
                                    className="h-4 w-4 mt-1 sm:mt-0 text-green-600 focus:ring-green-500 border-gray-300 rounded flex-shrink-0"
                                    checked={formData.agreed}
                                    onChange={(e) => setFormData({ ...formData, agreed: e.target.checked })}
                                />
                                <label htmlFor="agreed" className="text-gray-700 text-xs sm:text-sm cursor-pointer flex items-start sm:items-center leading-tight sm:leading-normal">
                                    <CheckSquare className="mr-2 text-green-600 w-4 h-4 flex-shrink-0 hidden sm:block" />
                                    {t.labels.agreeTerms}
                                </label>
                            </div>
                            {errors.agreed && <p className="text-red-500 text-xs sm:text-sm">{errors.agreed}</p>}

                            <button
                                type="submit"
                                className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-green-600 text-white text-sm sm:text-base lg:text-lg font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-400 disabled:cursor-not-allowed"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? t.labels.registering : t.labels.completeRegistration}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );  
};  

export default CompanyRegistration;