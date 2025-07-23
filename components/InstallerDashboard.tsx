
import React, { useState, useMemo, useEffect } from 'react';
import { Quote, Installer, ProjectStatus as PS, ProjectWithDetails, EquipmentBrand, PanelModel, InverterModel, BatteryModel } from '../types';
import Card from './Card';
import Button from './Button';
import Icon from './Icon';
import { useLanguage } from './LanguageContext';
import SubmitQuoteModal from './SubmitQuoteModal';
import MarkAsSignedModal from './MarkAsSignedModal';
import ConfirmationModal from './ConfirmationModal';

type InstallerTab = 'newLeads' | 'submittedQuotes' | 'sharedContacts' | 'signedDeals' | 'lostDeals';

interface InstallerDashboardProps {
    projects: ProjectWithDetails[];
    onQuoteSubmit: (projectId: string, quote: Omit<Quote, 'id'>, existingQuoteId?: string) => void;
    installer: Installer;
    onViewProfile: () => void;
    onViewQuote: (projectId: string, quoteId: string) => void;
    onMarkAsSigned: (projectId: string, finalPrice: number, winningInstallerId: string) => void;
    onViewChat: (projectId: string, homeownerId: string, installerId: string) => void;
    initialTab?: string;
    equipmentBrands: EquipmentBrand[];
    panelModels: PanelModel[];
    inverterModels: InverterModel[];
    batteryModels: BatteryModel[];
}

const InstallerDashboard: React.FC<InstallerDashboardProps> = ({ 
    projects, onQuoteSubmit, installer, onViewProfile, onViewQuote, onMarkAsSigned, onViewChat, initialTab,
    equipmentBrands, panelModels, inverterModels, batteryModels
}) => {
    const { t } = useLanguage();
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSignModalOpen, setIsSignModalOpen] = useState(false);
    const [confirmation, setConfirmation] = useState<{ title: string; message: string; onConfirm: () => void; } | null>(null);
    
    const [selectedLead, setSelectedLead] = useState<ProjectWithDetails | null>(null);
    const [revisingQuote, setRevisingQuote] = useState<Quote | null>(null);
    const [signingProject, setSigningProject] = useState<ProjectWithDetails | null>(null);
    const [activeTab, setActiveTab] = useState<InstallerTab>(initialTab as InstallerTab || 'newLeads');

    useEffect(() => {
        if(initialTab) {
            setActiveTab(initialTab as InstallerTab);
        }
    }, [initialTab]);

    const handleOpenSubmitModal = (lead: ProjectWithDetails, quoteToRevise?: Quote) => {
        setSelectedLead(lead);
        setRevisingQuote(quoteToRevise || null);
        setIsModalOpen(true);
    };

    const handleOpenSignModal = (project: ProjectWithDetails) => {
        setSigningProject(project);
        setIsSignModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setIsSignModalOpen(false);
        setSelectedLead(null);
        setRevisingQuote(null);
        setSigningProject(null);
    };

    const handleQuoteSubmit = (quoteData: Omit<Quote, 'id' | 'installerId'>) => {
        if (selectedLead) {
            onQuoteSubmit(selectedLead.id, { ...quoteData, installerId: installer.id }, revisingQuote?.id);
            handleCloseModal();
        }
    };
    
    const handleConfirmSign = (finalPrice: number) => {
        if (signingProject) {
            handleCloseModal(); // Close the sign modal first
            setConfirmation({
                title: t('Confirm Project Signature'),
                message: t('Please confirm the final price for this project. This action cannot be undone.'),
                onConfirm: () => {
                    setConfirmation(null); // Close confirmation before action
                    onMarkAsSigned(signingProject.id, finalPrice, installer.id);
                },
            });
        }
    };

    const { newLeads, submittedQuotes, sharedContacts, signedDeals, lostDeals } = useMemo(() => {
        const mySubmittedQuotesProjects: ProjectWithDetails[] = [];
        const myNewLeads: ProjectWithDetails[] = [];
        const mySharedContacts: ProjectWithDetails[] = [];
        const mySignedDeals: ProjectWithDetails[] = [];
        const myLostDeals: ProjectWithDetails[] = [];

        projects.forEach(p => {
            const myQuote = p.quotes.find(q => q.installerId === installer.id);
            if(p.status === PS.DELETED) return;
            
            // County check for new leads
            const isLeadInServiceArea = installer.serviceCounties.includes(p.address.county);

            if(p.status === PS.SIGNED) {
                if (p.winningInstallerId === installer.id) mySignedDeals.push(p);
                else if(myQuote) myLostDeals.push(p);
            } else if (p.status === PS.CONTACT_SHARED && p.sharedWithInstallerIds?.includes(installer.id)) {
                 mySharedContacts.push(p);
            } else if (myQuote) {
                 mySubmittedQuotesProjects.push(p);
            } else if (p.status === PS.APPROVED && isLeadInServiceArea) {
                 myNewLeads.push(p);
            }
        });

        return {
            newLeads: myNewLeads,
            submittedQuotes: mySubmittedQuotesProjects,
            sharedContacts: mySharedContacts,
            signedDeals: mySignedDeals,
            lostDeals: myLostDeals
        }

    }, [projects, installer.id, installer.serviceCounties]);

    const getTabTitle = (tab: InstallerTab) => {
        switch(tab) {
            case 'newLeads': return t('TabTitle_newLeads');
            case 'submittedQuotes': return t('TabTitle_submittedQuotes');
            case 'sharedContacts': return t('TabTitle_sharedContacts');
            case 'signedDeals': return t('TabTitle_signedDeals');
            case 'lostDeals': return t('TabTitle_lostDeals');
            default: return '';
        }
    }

    const renderProjectCard = (project: ProjectWithDetails, cardType: InstallerTab) => {
        const myQuote = project.quotes.find(q => q.installerId === installer.id);

        switch (cardType) {
            case 'newLeads':
                return (
                     <Card key={project.id} className="bg-slate-900/70 hover:bg-slate-800 transition-colors duration-200">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div className="flex-grow">
                                <h3 className="text-lg font-bold text-solar-green-400">{`${project.address.city}, ${project.address.county}`}</h3>
                                <p className="text-sm text-gray-400">{t('Homeowner')}: {project.homeowner.name}</p>
                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-300 mt-1">
                                    <span className="flex items-center gap-1.5"><Icon name="dollar" className="w-4 h-4 text-gray-400" />{t('monthly_bill_estimate', { amount: project.energyBill, currency_symbol: t('currency_symbol')})}</span>
                                    <span className="flex items-center gap-1.5"><Icon name="briefcase" className="w-4 h-4 text-gray-400" />{t(project.roofType) || project.roofType}</span>
                                    {project.wantsBattery && <span className="flex items-center gap-1.5 font-semibold text-solar-green-300"><Icon name="battery" className="w-4 h-4" />{t('Wants Battery')}</span>}
                                </div>
                                {project.notes && <p className="text-sm text-gray-400 mt-2 italic">"{project.notes}"</p>}
                            </div>
                            <div className="flex-shrink-0 w-full md:w-auto"><Button variant="primary" className="w-full md:w-auto" onClick={() => handleOpenSubmitModal(project)}>{t('Submit Quote')}</Button></div>
                        </div>
                    </Card>
                );
            case 'submittedQuotes':
                if (!myQuote) return null;
                return (
                     <Card key={project.id} className="bg-slate-900/70 p-0">
                        <button onClick={() => onViewQuote(project.id, myQuote.id)} className="w-full text-left p-6 focus:outline-none focus:ring-2 focus:ring-solar-green-500 rounded-lg transition-colors duration-200 hover:bg-slate-800">
                            <div>
                                <p className="text-sm text-gray-400">{t('Quote for {homeownerName} in {address}', {homeownerName: project.homeowner.name, address: `${project.address.city}, ${project.address.county}`})}</p>
                                <p className="text-lg font-bold text-solar-green-400">{myQuote.price.toLocaleString()} {t('currency_symbol')}</p>
                            </div>
                        </button>
                    </Card>
                );
            case 'sharedContacts':
                return (
                     <Card key={project.id} className="bg-slate-900/70">
                        <div>
                            <h3 className="text-lg font-bold text-solar-green-400">{project.homeowner.name}</h3>
                            <p className="text-gray-300">{`${project.address.street}, ${project.address.city}`}</p>
                            <div className="mt-2 space-y-1 text-sm text-gray-400">
                                <p><strong>{t('Email')}:</strong> <a href={`mailto:${project.homeowner.email}`} onClick={e => e.stopPropagation()} className="text-solar-green-300 hover:underline">{project.homeowner.email}</a></p>
                                <p><strong>{t('Phone')}:</strong> <a href={`tel:${project.homeowner.phone}`} onClick={e => e.stopPropagation()} className="text-solar-green-300 hover:underline">{project.homeowner.phone}</a></p>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-700 flex flex-wrap justify-end gap-2">
                            {myQuote && <Button size="sm" variant="secondary" onClick={() => onViewQuote(project.id, myQuote.id)}>{t('View Quote')}</Button>}
                            <Button size="sm" variant="secondary" icon={<Icon name="chat" className="w-4 h-4"/>} onClick={() => onViewChat(project.id, project.homeownerId, installer.id)}>{t('Chat')}</Button>
                            {myQuote 
                                ? <Button size="sm" variant="secondary" onClick={() => handleOpenSubmitModal(project, myQuote)} icon={<Icon name="edit" className="w-4 h-4"/>}>{t('Revise Quote')}</Button>
                                : <Button size="sm" variant="primary" onClick={() => handleOpenSubmitModal(project)}>{t('Submit Quote')}</Button>
                            }
                            <Button size="sm" onClick={() => handleOpenSignModal(project)} icon={<Icon name="check" className="w-4 h-4"/>}>{t('Mark as Signed')}</Button>
                        </div>
                    </Card>
                )
            case 'signedDeals':
                 return (
                     <Card key={project.id} className="bg-slate-900/70 border-l-4 border-solar-green-500">
                         <div className="flex justify-between items-start">
                             <div>
                                 <h3 className="font-bold text-solar-green-400">{project.homeowner.name}</h3>
                                 <p className="text-sm text-gray-300">{`${project.address.street}, ${project.address.city}, ${project.address.county}`}</p>
                                 <p className="text-sm font-semibold mt-1">{t('You won this deal!')}</p>
                             </div>
                             <div className="text-right">
                                <p className="text-lg font-bold text-white">{project.finalPrice?.toLocaleString()} {t('currency_symbol')}</p>
                                <p className="text-xs text-gray-400">{t('Signed Price')}</p>
                             </div>
                         </div>
                         <div className="mt-4 pt-4 border-t border-slate-700 space-y-1 text-sm text-gray-400">
                            <p><strong>{t('Email')}:</strong> <a href={`mailto:${project.homeowner.email}`} onClick={e => e.stopPropagation()} className="text-solar-green-300 hover:underline">{project.homeowner.email}</a></p>
                            <p><strong>{t('Phone')}:</strong> <a href={`tel:${project.homeowner.phone}`} onClick={e => e.stopPropagation()} className="text-solar-green-300 hover:underline">{project.homeowner.phone}</a></p>
                         </div>
                         {myQuote && (
                            <div className="mt-4 pt-4 border-t border-slate-700 flex justify-end">
                                <Button size="sm" variant="secondary" onClick={() => onViewQuote(project.id, myQuote.id)}>{t('View Quote')}</Button>
                            </div>
                         )}
                    </Card>
                 )
            case 'lostDeals':
                 return (
                     <Card key={project.id} className="bg-slate-900/70 opacity-80 border-l-4 border-red-500">
                         <h3 className="font-bold text-white">{`${project.address.city}, ${project.address.county}`}</h3>
                         <p className="text-sm text-gray-400">{t('Homeowner')}: {project.homeowner.name}</p>
                         <p className="text-sm font-semibold">{t('Another installer won this deal.')}</p>
                         <p className="text-lg font-bold mt-2 text-white">{project.finalPrice?.toLocaleString()} {t('currency_symbol')}</p>
                         {myQuote && (
                            <div className="mt-4 pt-4 border-t border-slate-700 flex justify-end">
                                <Button size="sm" variant="secondary" onClick={() => onViewQuote(project.id, myQuote.id)}>{t('View Quote')}</Button>
                            </div>
                         )}
                    </Card>
                 )
            default:
                return null;
        }
    };
    
    const tabContent = {
        newLeads, submittedQuotes, sharedContacts, signedDeals, lostDeals
    };

    return (
        <div className="space-y-8">
            {(selectedLead && isModalOpen) && (
                <SubmitQuoteModal 
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onSubmit={handleQuoteSubmit}
                    lead={selectedLead}
                    existingQuote={revisingQuote}
                    equipmentBrands={equipmentBrands}
                    panelModels={panelModels}
                    inverterModels={inverterModels}
                    batteryModels={batteryModels}
                />
            )}
            
            {(signingProject && isSignModalOpen) && (
                <MarkAsSignedModal
                    isOpen={isSignModalOpen}
                    onClose={handleCloseModal}
                    onConfirmSign={handleConfirmSign}
                    currentPrice={signingProject.quotes.find(q => q.installerId === installer.id)?.price || 0}
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


            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white">{t('Installer Dashboard')}</h2>
                    <p className="text-lg text-gray-400 mt-1">{t('Welcome, {name}!', { name: installer.name })}</p>
                </div>
                 <Button variant="secondary" onClick={onViewProfile}>
                    {t('View My Profile')}
                 </Button>
            </div>

            <div className="p-2 bg-slate-800 rounded-lg flex flex-wrap gap-2">
                <Button variant={activeTab === 'newLeads' ? 'primary' : 'secondary'} onClick={() => setActiveTab('newLeads')}>{t('New Leads')} ({newLeads.length})</Button>
                <Button variant={activeTab === 'submittedQuotes' ? 'primary' : 'secondary'} onClick={() => setActiveTab('submittedQuotes')}>{t('Submitted Quotes')} ({submittedQuotes.length})</Button>
                <Button variant={activeTab === 'sharedContacts' ? 'primary' : 'secondary'} onClick={() => setActiveTab('sharedContacts')}>{t('Shared Contacts')} ({sharedContacts.length})</Button>
                <Button variant={activeTab === 'signedDeals' ? 'primary' : 'secondary'} onClick={() => setActiveTab('signedDeals')}>{t('Signed Deals')} ({signedDeals.length})</Button>
                <Button variant={activeTab === 'lostDeals' ? 'primary' : 'secondary'} onClick={() => setActiveTab('lostDeals')}>{t('Lost Deals')} ({lostDeals.length})</Button>
            </div>

             <Card>
                <h3 className="text-xl font-bold text-white mb-4">{getTabTitle(activeTab)}</h3>
                <div className="space-y-4">
                    {tabContent[activeTab].length > 0 ? (
                        tabContent[activeTab].map(p => renderProjectCard(p, activeTab))
                    ) : (
                        <p className="text-center text-gray-400 py-8">{t('No projects in this category.')}</p>
                    )}
                </div>
            </Card>

        </div>
    );
};

export default InstallerDashboard;
