import React from 'react';
import { useTranslation } from 'react-i18next';

interface RegistrationOptionsProps {
  onRegisterFarmerClick: () => void;
  onRegisterExpertClick: () => void;
  onRegisterCompanyClick: () => void;
}

export function RegistrationOptions({ 
  onRegisterFarmerClick, 
  onRegisterExpertClick,
  onRegisterCompanyClick 
}: RegistrationOptionsProps) {
  const { t } = useTranslation();
  
  return (
    <div className="text-center space-y-3">
      <p className="text-gray-600">{t('registration.noAccount')}</p>
      <div className="space-y-2">
        <button
          onClick={onRegisterFarmerClick}
          className="block w-full text-green-600 hover:text-green-500"
        >
          {t('registration.registerAsFarmer')}
        </button>
         <button
          onClick={onRegisterExpertClick}
          className="block w-full text-green-600 hover:text-green-500"
        >
          {t('registration.registerAsExpert')}
        </button>
        <button 
          onClick={onRegisterCompanyClick}
          className="block w-full text-green-600 hover:text-green-500"
        >
          {t('registration.registerAsCompany')}
        </button>
      </div>
    </div>
  );
}