
import React from 'react';
import { useLanguage } from './LanguageContext';
import Logo from './Logo';

interface FooterProps {
  onViewTerms: () => void;
  onViewPrivacyPolicy: () => void;
}

const Footer: React.FC<FooterProps> = ({ onViewTerms, onViewPrivacyPolicy }) => {
  const { t } = useLanguage();
  return (
    <footer className="bg-gray-900">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between text-center md:text-left text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} SolarPortal. {t('All rights reserved.')}</p>
          <div className="flex items-center gap-6 my-4 md:my-0">
            <button onClick={onViewTerms} className="hover:text-white transition-colors">{t('Terms and Conditions')}</button>
            <button onClick={onViewPrivacyPolicy} className="hover:text-white transition-colors">{t('Privacy Policy')}</button>
          </div>
          <div className="flex items-center gap-2">
            <Logo className="h-6 w-auto" />
            <span>{t('Connecting you to a brighter future.')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
