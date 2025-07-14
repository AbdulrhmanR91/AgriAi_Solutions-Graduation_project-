/**
 * This is a guide for adding translation support to any component
 * Follow these steps to implement i18n in your components
 */

// Step 1: Import the useTranslation hook at the top of your component file
import { useTranslation } from 'react-i18next';

const ExampleComponent = () => {
  // Step 2: Initialize the translation hook
  const { t } = useTranslation();
  
  // Step 3: Replace hardcoded strings with translation keys
  // Before: <h1>Welcome to Our App</h1>
  // After: <h1>{t('example.welcome')}</h1>
  
  return (
    <div>
      <h1>{t('example.welcome')}</h1>
      <p>{t('example.description')}</p>
      
      {/* For dynamic content, you can use string interpolation */}
      <p>{t('example.greeting', { name: 'John' })}</p>
      
      {/* For pluralization */}
      <p>{t('example.items', { count: 5 })}</p>
      
      {/* For conditional text */}
      <button>{userLoggedIn ? t('common.logout') : t('common.login')}</button>
    </div>
  );
};

// Step 4: Add your translation keys to both locale files
// In src/i18n/locales/en.json:
// {
//   "example": {
//     "welcome": "Welcome to Our App",
//     "description": "This is an example component",
//     "greeting": "Hello, {{name}}!",
//     "items_one": "{{count}} item",
//     "items_other": "{{count}} items"
//   }
// }

// In src/i18n/locales/ar.json:
// {
//   "example": {
//     "welcome": "مرحبًا بكم في تطبيقنا",
//     "description": "هذا مكون مثال",
//     "greeting": "مرحبًا، {{name}}!",
//     "items_one": "عنصر {{count}}",
//     "items_other": "{{count}} عناصر"
//   }
// }

export default ExampleComponent;
