
import React, { useState } from 'react';
import Icon from './Icon';
import { useLanguage } from './LanguageContext';

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  // We can add more specific props if needed
}

const PasswordInput: React.FC<PasswordInputProps> = (props) => {
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const { t } = useLanguage();

  const toggleVisibility = () => {
    setPasswordVisible(prev => !prev);
  };

  return (
    <div className="relative">
      <input
        {...props}
        type={isPasswordVisible ? 'text' : 'password'}
        className="w-full bg-slate-700 border-slate-600 rounded-md text-white px-3 py-2 pr-10 focus:ring-solar-green-400 focus:border-solar-green-400"
      />
      <button
        type="button"
        onClick={toggleVisibility}
        className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-white"
        aria-label={t(isPasswordVisible ? 'Hide password' : 'Show password')}
      >
        <Icon name={isPasswordVisible ? 'eye-slash' : 'eye'} className="h-5 w-5" />
      </button>
    </div>
  );
};

export default PasswordInput;
