

import React from 'react';
import { useLanguage } from './components/LanguageContext';
import Card from './components/Card';
import Icon from './components/Icon';

interface RegistrationPageProps {
  onNavigate: (view: 'register-homeowner-project' | 'register-installer' | 'login') => void;
}

const RegistrationPage: React.FC<RegistrationPageProps> = ({ onNavigate }) => {
  const { t } = useLanguage();

  return (
    <div className="flex justify-center items-center">
      <Card className="w-full max-w-lg text-center">
        <h2 className="text-3xl font-bold text-white mb-8">{t('Join SolarPortal')}</h2>

        {/* Main Homeowner CTA */}
        <div
          onClick={() => onNavigate('register-homeowner-project')}
          className="p-8 border-2 border-slate-700 rounded-lg hover:border-solar-green-500 hover:bg-slate-800 transition-all duration-200 cursor-pointer text-left"
        >
          <Icon name="user" className="w-12 h-12 mb-4 text-solar-green-400" />
          <h3 className="text-2xl font-bold text-white mb-2">{t('Homeowner')}</h3>
          <p className="text-gray-400">{t('Looking to install solar panels on my property.')}</p>
        </div>

        {/* Installer & Login links */}
        <div className="mt-8 pt-6 border-t border-slate-700 space-y-3">
          <p className="text-sm text-gray-400">
            {t('Are you an installer?')}
            {' '}
            <button
              onClick={() => onNavigate('register-installer')}
              className="font-medium text-solar-green-400 hover:underline"
            >
              {t('Register here')}
            </button>
          </p>
          <p className="text-sm text-gray-400">
            {t('Already have an account?')}
            {' '}
            <button
              onClick={() => onNavigate('login')}
              className="font-medium text-solar-green-400 hover:underline"
            >
              {t('Login')}
            </button>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default RegistrationPage;