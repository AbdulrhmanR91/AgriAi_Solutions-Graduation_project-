import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations
import enTranslation from './locales/en.json';
import arTranslation from './locales/ar.json';

// Initialize i18next for translation
i18n
  .use(LanguageDetector) // Detect language from browser/localStorage
  .use(initReactI18next) // Pass i18n to react-i18next
  .init({
    resources: {
      en: {
        translation: enTranslation
      },
      ar: {
        translation: arTranslation
      }
    },
    fallbackLng: 'en',
    detection: {
      // Order of language detection:
      order: ['localStorage', 'htmlTag', 'navigator'],
      // Keys to lookup language from:
      lookupLocalStorage: 'preferredLanguage',
    },
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    react: {
      useSuspense: false, // Prevents issues with SSR
    }
  });

// Set document direction based on current language
const updateDocumentDirection = (lng) => {
  document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = lng;
};

// Initialize document direction
updateDocumentDirection(i18n.language);

// Update direction whenever language changes
i18n.on('languageChanged', updateDocumentDirection);

export default i18n;
