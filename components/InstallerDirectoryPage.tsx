
import React from 'react';
import { Installer, Review } from '../types';
import Card from './Card';
import Button from './Button';
import Icon from './Icon';
import { useLanguage } from './LanguageContext';
import StarRating from './StarRating';

interface InstallerDirectoryPageProps {
  installers: Installer[];
  reviews: Review[];
  onViewProfile: (installerId: string) => void;
}

const InstallerDirectoryPage: React.FC<InstallerDirectoryPageProps> = ({ installers, reviews, onViewProfile }) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">{t('Installer Companies')}</h1>
        <p className="text-lg text-gray-400">{t('Browse our network of verified solar professionals.')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {installers.map(installer => {
            const installerReviews = reviews.filter(r => r.installerId === installer.id);
            const totalReviews = installerReviews.length;
            const avgRating = totalReviews > 0
                ? installerReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
                : 0;
            
            return (
              <Card key={installer.id} className="flex flex-col items-center text-center">
                <img src={installer.logoDataUrl} alt={`${installer.name} logo`} className="w-24 h-24 rounded-full mb-4 border-2 border-slate-600 object-cover"/>
                <h2 className="text-xl font-bold text-white">{installer.name}</h2>
                
                {totalReviews > 0 ? (
                    <div className="flex items-center gap-2 my-2">
                        <StarRating rating={avgRating} size="sm" />
                        <span className="text-xs text-gray-400">({totalReviews})</span>
                    </div>
                ) : (
                     <div className="my-2 h-5 flex items-center"> 
                        <span className="text-xs text-gray-500 italic">{t('No reviews yet.')}</span>
                     </div>
                )}

                <div className="my-2 flex flex-wrap justify-center gap-2">
                    {installer.specialties.slice(0, 3).map(spec => (
                         <span key={spec} className="bg-solar-green-800 text-solar-green-100 text-xs font-medium px-2 py-0.5 rounded-full">{t(spec) || spec}</span>
                    ))}
                </div>

                <p className="text-gray-400 text-sm mb-6 flex-grow">{installer.about.substring(0, 100)}...</p>

                <Button onClick={() => onViewProfile(installer.id)} variant="secondary" className="w-full mt-auto">
                  {t('View Profile')}
                </Button>
              </Card>
            )
        })}
      </div>
    </div>
  );
};

export default InstallerDirectoryPage;
