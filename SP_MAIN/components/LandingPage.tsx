


import React from 'react';
import Button from './Button';
import Icon from './Icon';
import { useLanguage } from './LanguageContext';

interface LandingPageProps {
  onNavigateToRegister: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onNavigateToRegister }) => {
  const { t } = useLanguage();
  
  const HowItWorksStep: React.FC<{ step: number; title: string; description: string; }> = ({ step, title, description }) => (
    <div className="flex items-start gap-4">
      <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-solar-green-800 text-solar-green-100 font-bold text-xl">{step}</div>
      <div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <p className="mt-1 text-gray-400">{description}</p>
      </div>
    </div>
  );

  const BenefitCard: React.FC<{ iconName: 'shield-check' | 'quote' | 'dollar'; titleKey: string; descriptionKey: string; }> = ({ iconName, titleKey, descriptionKey }) => (
    <div className="flex flex-col items-center text-center p-6 bg-slate-800/50 border border-slate-700 rounded-lg transform hover:-translate-y-2 transition-transform duration-300">
      <div className="mb-4 bg-slate-900/50 p-4 rounded-full">
        <Icon name={iconName} className="w-10 h-10 text-solar-green-400" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{t(titleKey)}</h3>
      <p className="text-gray-400 text-sm flex-grow">{t(descriptionKey)}</p>
    </div>
  );

  return (
    <div className="py-12">
      <div className="grid md:grid-cols-2 gap-16 items-center">
        {/* Left Column: "How It Works" */}
        <div className="order-2 md:order-1">
          <h2 className="text-3xl font-bold text-white text-center md:text-left mb-8">{t('How It Works')}</h2>
          <div className="space-y-8 max-w-md mx-auto md:mx-0">
            <HowItWorksStep 
              step={1} 
              title={t('Submit Your Project')} 
              description={t('Fill out a simple form with your address, energy usage, and roof details. It takes less than 5 minutes.')}
            />
            <HowItWorksStep 
              step={2} 
              title={t('Receive Quotes')} 
              description={t('Verified local installers will review your project and send you competitive quotes directly on our platform.')}
            />
            <HowItWorksStep 
              step={3} 
              title={t('Compare & Choose')} 
              description={t('Easily compare offers, equipment, and installer ratings to find the perfect fit for your home and budget.')}
            />
          </div>
        </div>
        
        {/* Right Column: "Get Started" */}
        <div className="order-1 md:order-2 text-center md:text-left">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white">
            {t('The Smart Way to Go Solar')}
          </h1>
          <p className="mt-4 max-w-2xl mx-auto md:mx-0 text-lg md:text-xl text-gray-300">
            {t('landingPageSubtitle')}
          </p>
          <div className="mt-8">
              <Button onClick={onNavigateToRegister} size="lg" variant="primary">
                  {t('Get Started')}
                  <Icon name="arrow-right" className="w-5 h-5 ml-2" />
              </Button>
          </div>
        </div>
      </div>
      
      {/* "Our Promise to You" Section */}
      <div className="mt-24 text-center">
        <h2 className="text-3xl font-bold text-white mb-12">{t('ourPromiseTitle')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <BenefitCard 
            iconName="shield-check"
            titleKey='benefitPrivacyTitle'
            descriptionKey='benefitPrivacyDesc'
          />
          <BenefitCard 
            iconName="quote"
            titleKey='benefitQuotesTitle'
            descriptionKey='benefitQuotesDesc'
          />
          <BenefitCard 
            iconName="dollar"
            titleKey='benefitSavingsTitle'
            descriptionKey='benefitSavingsDesc'
          />
        </div>
      </div>

    </div>
  );
};

export default LandingPage;