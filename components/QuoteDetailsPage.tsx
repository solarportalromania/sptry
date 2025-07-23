
import React, { useState } from 'react';
import { Quote, Installer, UserRole, ProjectWithDetails, ProjectStatus, EquipmentBrand, PanelModel, InverterModel, BatteryModel } from '../types';
import Card from './Card';
import Button from './Button';
import Icon from './Icon';
import { useLanguage } from './LanguageContext';
import MarkAsSignedModal from './MarkAsSignedModal';
import SubmitQuoteModal from './SubmitQuoteModal';
import ConfirmationModal from './ConfirmationModal';

interface QuoteDetailsPageProps {
  project: ProjectWithDetails;
  quote: Quote;
  installer: Installer;
  onBack: () => void;
  userRole: UserRole;
  currentUserId: string | null;
  onMarkAsSigned: (projectId: string, finalPrice: number, winningInstallerId: string) => void;
  onReviseQuote: (quoteData: Omit<Quote, 'id' | 'installerId'>) => void;
  onViewChat: (projectId: string, homeownerId: string, installerId: string) => void;
  onAcceptOffer: (projectId: string, quoteId: string) => void;
  onViewInstallerProfile: (installerId: string) => void;
  equipmentBrands: EquipmentBrand[];
  panelModels: PanelModel[];
  inverterModels: InverterModel[];
  batteryModels: BatteryModel[];
}

const QuoteDetailsPage: React.FC<QuoteDetailsPageProps> = (props) => {
  const { 
    project, quote, installer, onBack, userRole, currentUserId, 
    onMarkAsSigned, onReviseQuote, onViewChat, onAcceptOffer, onViewInstallerProfile,
    equipmentBrands, panelModels, inverterModels, batteryModels
  } = props;

  const { t } = useLanguage();
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [isReviseModalOpen, setIsReviseModalOpen] = useState(false);
  const [confirmation, setConfirmation] = useState<{ title: string; message: string; onConfirm: () => void; } | null>(null);
  
  const isInstallerOwner = userRole === UserRole.INSTALLER && currentUserId === quote.installerId;
  const isSigned = project.status === ProjectStatus.SIGNED;
  const canViewContact = project.sharedWithInstallerIds?.includes(installer.id) || project.winningInstallerId === installer.id;
  
  const getFullEquipmentDetails = () => {
    const panel = panelModels.find(m => m.id === quote.panelModelId);
    const panelBrand = equipmentBrands.find(b => b.id === panel?.brandId);
    const inverter = inverterModels.find(m => m.id === quote.inverterModelId);
    const inverterBrand = equipmentBrands.find(b => b.id === inverter?.brandId);
    let battery = undefined;
    let batteryBrand = undefined;
    if (quote.batteryModelId) {
        battery = batteryModels.find(m => m.id === quote.batteryModelId);
        batteryBrand = equipmentBrands.find(b => b.id === battery?.brandId);
    }
    return { panel, panelBrand, inverter, inverterBrand, battery, batteryBrand };
  }
  
  const { panel, panelBrand, inverter, inverterBrand, battery, batteryBrand } = getFullEquipmentDetails();


  const DetailItem: React.FC<{ icon: 'bolt' | 'dollar' | 'briefcase' | 'battery'; label: string; value: string | React.ReactNode;}> = ({ icon, label, value }) => (
    <div className="flex items-start gap-3">
      <Icon name={icon} className="w-5 h-5 text-solar-green-400 mt-1" />
      <div>
        <p className="text-sm text-gray-400">{label}</p>
        <p className="font-semibold text-white">{value}</p>
      </div>
    </div>
  );

  const handleAcceptOfferClick = () => {
    setConfirmation({
        title: t('Accept Offer'),
        message: t('confirmActionMessage'),
        onConfirm: () => {
            setConfirmation(null); // Close confirmation first
            onAcceptOffer(project.id, quote.id);
        }
    });
  }

  const handleConfirmSign = (finalPrice: number) => {
    setIsSignModalOpen(false);
    setConfirmation({
        title: t('Confirm Project Signature'),
        message: t('Please confirm the final price for this project. This action cannot be undone.'),
        onConfirm: () => {
            setConfirmation(null); // Close confirmation first
            onMarkAsSigned(project.id, finalPrice, quote.installerId);
        },
    });
  };
  
  const renderActionButtons = () => {
    if (isInstallerOwner) {
      return (
        <div className="mt-6 pt-6 border-t border-slate-700 flex flex-wrap gap-4">
          <Button size="lg" onClick={() => setIsSignModalOpen(true)} disabled={isSigned}>{t('Mark as Signed')}</Button>
          <Button size="lg" variant="secondary" onClick={() => setIsReviseModalOpen(true)} icon={<Icon name="edit" className="w-5 h-5"/>} disabled={isSigned}>{t('Revise Quote')}</Button>
          <Button size="lg" variant="secondary" onClick={() => onViewChat(project.id, project.homeownerId, installer.id)} icon={<Icon name="chat" className="w-5 h-5"/>}>{t('Chat')}</Button>
        </div>
      );
    }
    if (userRole === UserRole.CLIENT) {
      return (
         <div className="mt-6 pt-6 border-t border-slate-700 flex flex-wrap gap-4">
            <Button 
              size="lg" 
              className="w-full sm:w-auto" 
              onClick={handleAcceptOfferClick}
              disabled={isSigned}
            >
              {isSigned ? t('Offer Accepted') : t('Accept Quote')}
            </Button>
            <Button size="lg" variant="secondary" onClick={() => onViewChat(project.id, project.homeownerId, installer.id)} icon={<Icon name="chat" className="w-5 h-5"/>}>{t('Chat')}</Button>
        </div>
      );
    }
    return null;
  }

  return (
    <>
      {isSignModalOpen && (
        <MarkAsSignedModal 
            isOpen={isSignModalOpen}
            onClose={() => setIsSignModalOpen(false)}
            onConfirmSign={handleConfirmSign}
            currentPrice={quote.price}
        />
      )}
      {isReviseModalOpen && (
          <SubmitQuoteModal 
            isOpen={isReviseModalOpen}
            onClose={() => setIsReviseModalOpen(false)}
            onSubmit={onReviseQuote}
            lead={project}
            existingQuote={quote}
            equipmentBrands={equipmentBrands}
            panelModels={panelModels}
            inverterModels={inverterModels}
            batteryModels={batteryModels}
          />
      )}
      {confirmation && (
        <ConfirmationModal
            isOpen={!!confirmation}
            title={confirmation.title}
            message={confirmation.message}
            onConfirm={confirmation.onConfirm}
            onClose={() => setConfirmation(null)}
        />
      )}
      <div className="space-y-8">
        <div>
          <Button variant="secondary" size="sm" onClick={onBack} icon={<Icon name="arrow-left" className="w-4 h-4" />}>
            {t('Back to Dashboard')}
          </Button>
        </div>
        
        <Card className="p-8">
          <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-shrink-0 text-center">
                  <img src={installer.logoDataUrl} alt={`${installer.name} logo`} className="w-24 h-24 rounded-full mx-auto mb-4 border-2 border-slate-600 object-cover" />
                  <h2 className="text-2xl font-bold text-white">{t('Offer from {name}', { name: installer.name })}</h2>
                  <p className="text-gray-400">{t('for')} {project.address.city}, {project.address.county}</p>
              </div>
              <div className="flex-grow">
                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      <DetailItem icon="dollar" label={t('Total Cost')} value={`${quote.price.toLocaleString()} ${t('currency_symbol')}`} />
                      <DetailItem icon="bolt" label={t('System Size')} value={`${quote.systemSizeKw} kW`} />
                      <DetailItem icon="briefcase" label={t('Warranty')} value={quote.warranty} />
                   </div>
                   {renderActionButtons()}
              </div>
          </div>
        </Card>
        
        <div className="grid md:grid-cols-3 gap-8 items-start">
          <div className="md:col-span-2 space-y-8">
              <Card>
                  <h3 className="text-xl font-bold text-white mb-4">{t('System Specifications')}</h3>
                  <div className="space-y-4">
                      {panel && panelBrand && <DetailItem icon="briefcase" label={t('Panel')} value={`${panelBrand.name} ${panel.name} - ${panel.wattage}W`} />}
                      {inverter && inverterBrand && <DetailItem icon="briefcase" label={t('Inverter')} value={`${inverterBrand.name} ${inverter.name}`} />}
                      <DetailItem icon="bolt" label={t('Est. Production')} value={`${quote.estimatedAnnualProduction.toLocaleString()} kWh/yr`} />
                      {battery && batteryBrand && (
                          <DetailItem icon="battery" label={t('Battery')} value={`${batteryBrand.name} ${battery.name} - ${battery.capacityKwh} kWh`} />
                      )}
                  </div>
              </Card>
              <Card>
                  <h3 className="text-xl font-bold text-white mb-4">{t('Cost Breakdown')}</h3>
                  <ul className="space-y-2 text-gray-300">
                      <li className="flex justify-between"><span>{t('Equipment Cost')}</span><span className="font-medium text-white">{quote.costBreakdown.equipment.toLocaleString()} {t('currency_symbol')}</span></li>
                      <li className="flex justify-between"><span>{t('Labor Cost')}</span><span className="font-medium text-white">{quote.costBreakdown.labor.toLocaleString()} {t('currency_symbol')}</span></li>
                      <li className="flex justify-between"><span>{t('Permits & Fees')}</span><span className="font-medium text-white">{quote.costBreakdown.permits.toLocaleString()} {t('currency_symbol')}</span></li>
                      {quote.priceWithoutBattery && (
                        <li className="flex justify-between text-sm text-gray-400 mt-2">
                            <span>{t('Price without battery')}</span>
                            <span className="font-medium">{quote.priceWithoutBattery.toLocaleString()} {t('currency_symbol')}</span>
                        </li>
                      )}
                      <li className="flex justify-between border-t border-slate-600 mt-2 pt-2">
                          <span className="font-bold text-white">{t('Total Cost')}</span>
                          <span className="font-bold text-solar-green-400 text-lg">{quote.price.toLocaleString()} {t('currency_symbol')}</span>
                      </li>
                  </ul>
              </Card>
          </div>
          <div className="md:col-span-1 space-y-8">
              {canViewContact && isInstallerOwner && (
                <Card>
                   <h3 className="text-xl font-bold text-white mb-4">{t('Homeowner Information')}</h3>
                   <div className="space-y-2 text-gray-300">
                       <p><strong>{t('Full Name')}:</strong> {project.homeowner.name}</p>
                       <p><strong>{t('Address')}:</strong> {`${project.address.street}, ${project.address.city}, ${project.address.county}`}</p>
                       <p><strong>{t('Email')}:</strong> <a href={`mailto:${project.homeowner.email}`} className="text-solar-green-400 hover:underline">{project.homeowner.email}</a></p>
                       <p><strong>{t('Phone')}:</strong> <a href={`tel:${project.homeowner.phone}`} className="text-solar-green-400 hover:underline">{project.homeowner.phone}</a></p>
                   </div>
                </Card>
              )}
              <Card>
                   <h3 className="text-xl font-bold text-white mb-4">{t('About the Installer')}</h3>
                   <p className="text-gray-400 text-sm mb-4">{installer.about}</p>
                   <Button variant="secondary" size="sm" className="w-full" onClick={() => onViewInstallerProfile(installer.id)}>{t('View Full Profile')}</Button>
              </Card>
          </div>
        </div>

      </div>
    </>
  );
};

export default QuoteDetailsPage;
