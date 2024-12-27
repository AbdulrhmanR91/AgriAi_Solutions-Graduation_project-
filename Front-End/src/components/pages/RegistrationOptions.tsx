import React from 'react';

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
  return (
    <div className="text-center space-y-3">
      <p className="text-gray-600">Don't have an account?</p>
      <div className="space-y-2">
        <button
          onClick={onRegisterFarmerClick}
          className="block w-full text-green-600 hover:text-green-500"
        >
          Register as Individual Farmer
        </button>
        <button
          onClick={onRegisterExpertClick}
          className="block w-full text-green-600 hover:text-green-500"
        >
          Register as Expert
        </button>  
        <button 
          onClick={onRegisterCompanyClick}
          className="block w-full text-green-600 hover:text-green-500"
        >
          Register as Company
        </button>
      </div>
    </div>
  );
}