import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export function Input({ icon, className = '', ...props }: InputProps) {
  return (
    <div className="relative">
      {icon && (
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          {icon}
        </div>
      )}
      <input
        className={`w-full px-4 py-3 ${icon ? 'pl-10' : ''} rounded-full border border-gray-300 
          focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none 
          transition-colors duration-200 ${className}`}
        {...props}
      />
    </div>
  );
}