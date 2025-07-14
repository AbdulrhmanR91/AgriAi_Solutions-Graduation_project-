import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LanguageSwitcher = ({ className = "" }) => {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language || 'en');
  
  useEffect(() => {
    // Set document direction based on language
    document.documentElement.dir = currentLanguage === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = currentLanguage;
  }, [currentLanguage]);

  const toggleLanguage = () => {
    const newLanguage = currentLanguage === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLanguage);
    setCurrentLanguage(newLanguage);
    
    // Save language preference to localStorage
    localStorage.setItem('preferredLanguage', newLanguage);
  };

  // Enhanced button for creative login page
  const buttonClasses = `
    creative-language-btn
    flex items-center gap-2 px-4 py-2
    transition-all duration-300
    ${className}
  `;

  return (
    <button
      onClick={toggleLanguage}
      className={buttonClasses}
      aria-label={currentLanguage === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
    >
      <Globe size={16} className="text-gray-600 transition-colors" />
      <span className="font-medium">
        {currentLanguage === 'ar' ? 'English' : 'العربية'}
      </span>
    </button>
  );
};

export default LanguageSwitcher;
