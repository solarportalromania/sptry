
import React, { useState } from 'react';
import { Installer, Review, UserRole } from '../types';
import Card from './Card';
import Button from './Button';
import Icon from './Icon';
import { useLanguage } from './LanguageContext';
import InstallerEditModal from './InstallerEditModal';
import StarRating from './StarRating';

interface InstallerProfilePageProps {
  installer: Installer;
  reviews: Review[];
  onBack: () => void;
  onEditProfile: (installer: Installer) => void;
  isOwner: boolean;
  viewerRole: UserRole;
}

const InstallerProfilePage: React.FC<InstallerProfilePageProps> = ({ installer, reviews, onBack, onEditProfile, isOwner, viewerRole }) => {
    const { t } = useLanguage();
    const [isEditModalOpen, setEditModalOpen] = useState(false);

    const handleSave = (updatedInstaller: Installer) => {
        onEditProfile(updatedInstaller);
        setEditModalOpen(false);
    }

    const canViewPhone = isOwner || viewerRole === UserRole.ADMIN;

    const totalReviews = reviews.length;
    const avgRating = totalReviews > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
        : 0;

    return (
        <div className="space-y-8">
            {isEditModalOpen && <InstallerEditModal installer={installer} onClose={() => setEditModalOpen(false)} onSave={handleSave} />}
            <div>
                <Button variant="secondary" size="sm" onClick={onBack} icon={<Icon name="arrow-left" className="w-4 h-4" />}>
                    {t('Back')}
                </Button>
            </div>
            
            <Card className="p-8">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="flex-shrink-0 text-center md:text-left">
                        <img src={installer.logoDataUrl} alt={`${installer.name} logo`} className="w-32 h-32 rounded-full mx-auto md:mx-0 mb-4 border-4 border-slate-700 object-cover" />
                    </div>
                    <div className="flex-grow">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
                            <h1 className="text-4xl font-bold text-white">{installer.name}</h1>
                             {isOwner && <Button onClick={() => setEditModalOpen(true)} icon={<Icon name="edit" className="w-4 h-4" />}>{t('Edit Profile')}</Button>}
                        </div>
                        <div className="flex flex-wrap gap-2 mt-4">
                            {installer.specialties.map(spec => (
                                <span key={spec} className="bg-solar-green-800 text-solar-green-100 text-xs font-medium px-2.5 py-1 rounded-full">{t(spec) || spec}</span>
                            ))}
                        </div>
                        <div className="mt-4 text-gray-400 space-y-1">
                            <p><strong>{t('Contact')}:</strong> <a href={`mailto:${installer.contact.email}`} className="text-solar-green-400 hover:underline">{installer.contact.email}</a>{canViewPhone && ` | ${installer.contact.phone}`}</p>
                            <p><strong>{t('Service Area')}:</strong> <span className="text-gray-200">{installer.serviceCounties.join(', ')}</span></p>
                        </div>
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <Card>
                        <h2 className="text-2xl font-bold text-white mb-4">{t('About Us')}</h2>
                        <p className="text-gray-300 leading-relaxed">{installer.about}</p>
                    </Card>
                    <Card>
                         <h2 className="text-2xl font-bold text-white mb-4">{t('Reviews')}</h2>
                         {totalReviews > 0 ? (
                             <div className="space-y-6">
                                 <div className="flex items-center gap-4 p-4 bg-slate-900 rounded-lg">
                                     <span className="text-4xl font-bold text-solar-green-400">{avgRating.toFixed(1)}</span>
                                     <div>
                                         <StarRating rating={avgRating} />
                                         <p className="text-sm text-gray-400">{t('from {count} reviews', {count: totalReviews})}</p>
                                     </div>
                                 </div>
                                 <div className="space-y-4 max-h-96 overflow-y-auto">
                                    {reviews.map(review => (
                                        <div key={review.id} className="p-4 border-b border-slate-700 last:border-b-0">
                                            <div className="flex justify-between items-center mb-1">
                                                <h4 className="font-semibold text-white">{review.homeownerName}</h4>
                                                <StarRating rating={review.rating} size="sm" />
                                            </div>
                                             <p className="text-sm text-gray-400 mb-2">{new Date(review.createdAt).toLocaleDateString()}</p>
                                            <p className="text-gray-300 italic">"{review.comment}"</p>
                                        </div>
                                    ))}
                                 </div>
                             </div>
                         ) : (
                             <p className="text-gray-400">{t('No reviews yet.')}</p>
                         )}
                    </Card>
                </div>
                <div className="lg:col-span-1">
                     <Card>
                        <h2 className="text-2xl font-bold text-white mb-4">{t('Our Portfolio')}</h2>
                        <div className="space-y-4">
                            {installer.portfolio.map((item, index) => (
                                <div key={index}>
                                    <img src={item.imageDataUrl} alt={item.caption} className="w-full h-40 object-cover rounded-lg mb-2" />
                                    <p className="text-sm text-center text-gray-400 italic">{item.caption}</p>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>

        </div>
    );
};

export default InstallerProfilePage;
