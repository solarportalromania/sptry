
import React from 'react';
import { useLanguage } from './LanguageContext';
import Icon from './Icon';

interface PasswordStrengthIndicatorProps {
  password?: string;
}

const requirements = [
  { regex: /.{8,}/, textKey: 'pw_length' },
  { regex: /[A-Z]/, textKey: 'pw_uppercase' },
  { regex: /[a-z]/, textKey: 'pw_lowercase' },
  { regex: /[0-9]/, textKey: 'pw_number' },
  { regex: /[^A-Za-z0-9]/, textKey: 'pw_special' },
];

export const isPasswordStrong = (password: string): boolean => {
  return requirements.every(req => req.regex.test(password));
};

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ password = '' }) => {
  const { t } = useLanguage();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-sm mt-2">
      {requirements.map(req => {
        const isValid = req.regex.test(password);
        return (
          <div key={req.textKey} className={`flex items-center gap-2 transition-colors duration-300 ${isValid ? 'text-solar-green-400' : 'text-gray-400'}`}>
            <Icon name="check" className={`w-4 h-4 flex-shrink-0 ${isValid ? 'opacity-100' : 'opacity-30'}`} />
            <span>{t(req.textKey)}</span>
          </div>
        );
      })}
    </div>
  );
};

export default PasswordStrengthIndicator;