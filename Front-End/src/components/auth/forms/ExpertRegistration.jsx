import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { User, Mail, Phone, Lock, GraduationCap, School, Briefcase, ListChecks } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logo from '/src/assets/images/logor2.png';
import { registerUser } from '../../../utils/apiService';
import { toast } from 'react-hot-toast';

const ExpertRegistration = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        expertAt: '',
        university: '',
        college: '',
        services: '',
        agreed: false,
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const validateForm = () => {
        const newErrors = {};
        
        // Personal Information Validation
        if (!formData.name.trim()) newErrors.name = t('registration.errorRequired');
        if (!formData.email.trim()) newErrors.email = t('registration.errorRequired');
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = t('registration.errorEmailInvalid');
        if (!formData.phone.trim()) newErrors.phone = t('registration.errorRequired');
        if (!formData.password) newErrors.password = t('registration.errorRequired');
        else if (formData.password.length < 8) newErrors.password = t('registration.errorPasswordLength');
        if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = t('registration.errorPasswordMatch');
        
        // Expertise Information Validation
        if (!formData.expertAt.trim()) newErrors.expertAt = t('registration.errorRequired');
        if (!formData.university.trim()) newErrors.university = t('registration.errorRequired');
        if (!formData.college.trim()) newErrors.college = t('registration.errorRequired');
        if (!formData.services.trim()) newErrors.services = t('registration.errorRequired');
        if (!formData.agreed) newErrors.agreed = t('registration.errorRequired');
        
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
                name: formData.name.trim(),
                email: formData.email.trim(),
                password: formData.password,
                phone: formData.phone.trim(),
                userType: 'expert',
                expertDetails: {
                    expertAt: formData.expertAt.trim(),
                    university: formData.university.trim(),
                    college: formData.college.trim(),
                    services: formData.services
                        .split(',')
                        .map(s => s.trim())
                        .filter(s => s.length > 0)
                }
            };

            await registerUser(userData);
            toast.success(t('registration.registrationSuccess'));
            navigate('/login');
        } catch (error) {
            console.error('Registration error:', error);
            toast.error(error.message || 'Registration failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 py-8 px-4">
            <div className="w-full max-w-4xl mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 text-center">
                    <img src={logo} alt="Logo" className="mx-auto w-32 mb-3" />
                    <h1 className="text-3xl font-bold mb-2">Expert Registration</h1>
                    <p className="text-green-100 text-lg">Share your agricultural expertise</p>
                </div>

                <div className="p-8">
                    <button
                        onClick={() => navigate('/login')}
                        className="mb-6 text-green-600 hover:text-green-500 flex items-center gap-2 text-sm font-medium"
                    >
                        ← {t('registration.back')}
                    </button>
                    
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Personal Information Section */}
                        <div className="bg-green-50 p-6 rounded-xl">
                            <h2 className="text-xl font-semibold text-green-800 mb-4 flex items-center gap-2">
                                <User className="w-5 h-5" />
                                {t('registration.personalInfo')}
                            </h2>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600 w-5 h-5" />
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder={t('registration.fullName')}
                                        className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none focus:border-green-500 transition-colors ${
                                            errors.name ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        value={formData.name}
                                        onChange={handleChange}
                                    />
                                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                                </div>

                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600 w-5 h-5" />
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder={t('registration.email')}
                                        className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none focus:border-green-500 transition-colors ${
                                            errors.email ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                                </div>

                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600 w-5 h-5" />
                                    <input
                                        type="tel"
                                        name="phone"
                                        placeholder={t('registration.phone')}
                                        className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none focus:border-green-500 transition-colors ${
                                            errors.phone ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        value={formData.phone}
                                        onChange={handleChange}
                                    />
                                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                                </div>

                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600 w-5 h-5" />
                                    <input
                                        type="password"
                                        name="password"
                                        placeholder={t('registration.password')}
                                        className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none focus:border-green-500 transition-colors ${
                                            errors.password ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        value={formData.password}
                                        onChange={handleChange}
                                    />
                                    {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                                </div>

                                <div className="relative md:col-span-2">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600 w-5 h-5" />
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        placeholder={t('registration.confirmPassword')}
                                        className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none focus:border-green-500 transition-colors ${
                                            errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                    />
                                    {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Expertise Information Section */}
                        <div className="bg-blue-50 p-6 rounded-xl">
                            <h2 className="text-xl font-semibold text-blue-800 mb-4 flex items-center gap-2">
                                <GraduationCap className="w-5 h-5" />
                                {t('registration.expertiseInfo')}
                            </h2>
                            <div className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="relative">
                                        <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600 w-5 h-5" />
                                        <input
                                            type="text"
                                            name="expertAt"
                                            placeholder={t('registration.specialization')}
                                            className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none focus:border-green-500 transition-colors ${
                                                errors.expertAt ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                            value={formData.expertAt}
                                            onChange={handleChange}
                                        />
                                        {errors.expertAt && <p className="text-red-500 text-sm mt-1">{errors.expertAt}</p>}
                                    </div>

                                    <div className="relative">
                                        <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600 w-5 h-5" />
                                        <input
                                            type="text"
                                            name="university"
                                            placeholder={t('registration.university')}
                                            className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none focus:border-green-500 transition-colors ${
                                                errors.university ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                            value={formData.university}
                                            onChange={handleChange}
                                        />
                                        {errors.university && <p className="text-red-500 text-sm mt-1">{errors.university}</p>}
                                    </div>
                                </div>

                                <div className="relative">
                                    <School className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600 w-5 h-5" />
                                    <input
                                        type="text"
                                        name="college"
                                        placeholder={t('registration.college')}
                                        className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none focus:border-green-500 transition-colors ${
                                            errors.college ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        value={formData.college}
                                        onChange={handleChange}
                                    />
                                    {errors.college && <p className="text-red-500 text-sm mt-1">{errors.college}</p>}
                                </div>

                                <div className="relative">
                                    <ListChecks className="absolute left-3 top-3 text-green-600 w-5 h-5" />
                                    <textarea
                                        name="services"
                                        placeholder={t('registration.services')}
                                        className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none focus:border-green-500 transition-colors h-24 resize-none ${
                                            errors.services ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        value={formData.services}
                                        onChange={handleChange}
                                    />
                                    <p className="text-gray-500 text-sm mt-1">
                                        Separate services with commas (e.g., Crop Disease Diagnosis, Soil Analysis)
                                    </p>
                                    {errors.services && <p className="text-red-500 text-sm mt-1">{errors.services}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Terms and Submit */}
                        <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                                <input
                                    type="checkbox"
                                    name="agreed"
                                    id="agreed"
                                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                    checked={formData.agreed}
                                    onChange={(e) => setFormData(prev => ({ ...prev, agreed: e.target.checked }))}
                                />
                                <label htmlFor="agreed" className="text-gray-700 text-sm cursor-pointer">
                                    {t('registration.agreeTerms')}
                                </label>
                            </div>
                            {errors.agreed && <p className="text-red-500 text-sm">{errors.agreed}</p>}

                            <button
                                type="submit"
                                className="w-full px-6 py-4 bg-green-600 text-white text-lg font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-400 disabled:cursor-not-allowed"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Registering...' : t('registration.submit')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ExpertRegistration;