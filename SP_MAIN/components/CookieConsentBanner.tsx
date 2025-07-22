
import React from 'react';
import { useLanguage } from './LanguageContext';
import Button from './Button';

interface CookieConsentBannerProps {
  onAccept: () => void;
}

const CookieConsentBanner: React.FC<CookieConsentBannerProps> = ({ onAccept }) => {
  const { t } = useLanguage();
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-sm border-t border-slate-700 p-4 z-50">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-gray-300">
          {t('This website uses cookies to ensure you get the best experience on our website.')}
        </p>
        <Button onClick={onAccept} size="sm">
          {t('Accept')}
        </Button>
      </div>
    </div>
  );
};

export default CookieConsentBanner;