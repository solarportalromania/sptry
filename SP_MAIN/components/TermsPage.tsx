
import React from 'react';
import { useLanguage } from './LanguageContext';
import Card from './Card';
import Button from './Button';
import Icon from './Icon';

interface TermsPageProps {
  onBack: () => void;
}

const TermsPage: React.FC<TermsPageProps> = ({ onBack }) => {
  const { t } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <Button variant="secondary" size="sm" onClick={onBack} icon={<Icon name="arrow-left" className="w-4 h-4" />}>
          {t('Back')}
        </Button>
      </div>
      <Card>
        <article className="p-6">
          <h1 className="text-3xl font-bold text-white mb-6">{t('termsTitle')}</h1>
          <div className="prose prose-invert prose-lg max-w-none text-gray-300 whitespace-pre-wrap">
            <p>{t('termsContent')}</p>
          </div>
        </article>
      </Card>
    </div>
  );
};

export default TermsPage;
