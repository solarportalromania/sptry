


import React, { useState } from 'react';
import { Quote, Installer, ProjectStatus, Homeowner, ProjectStatus as PS, RoofType, Project, ProjectWithDetails } from '../types';
import Card from './Card';
import Button from './Button';
import Icon from './Icon';
import { useLanguage } from './LanguageContext';
import HomeownerEditModal from './HomeownerEditModal';
import ProjectFormModal from './ProjectFormModal';
import ConfirmationModal from './ConfirmationModal';
import LeaveReviewModal from './LeaveReviewModal';

type ProjectSubmitHandler = (
    projectData: Omit<Project, 'id' | 'quotes' | 'status' | 'createdAt' | 'reviewSubmitted'>,
) => void;

interface QuoteCardProps {
    project: ProjectWithDetails;
    quote: Quote;
    installer: Installer | undefined;
    onView: () => void;
    onShareContact: (projectId: string, installerId: string) => void;
    onAcceptOffer: (projectId: string, quoteId: string) => void;
    onViewChat: (projectId: string, homeownerId: string, installerId: string) => void;
}

const QuoteCard: React.FC<QuoteCardProps> = ({ project, quote, installer, onView, onShareContact, onAcceptOffer, onViewChat }) => {
    const { t } = useLanguage();
    if (!installer) {
        return <Card className="bg-slate-900/70"><p>{t('Installer details not found.')}</p></Card>
    }
    const isShared = project.sharedWithInstallerIds?.includes(installer.id) || project.status === PS.CONTACT_SHARED;
    const isOfferAccepted = project.status === PS.SIGNED;
    const isMyOfferAccepted = isOfferAccepted && project.winningInstallerId === quote.installerId;


    return (
        <Card className="bg-slate-900/70">
            <div>
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-shrink-0 flex flex-col items-center sm:items-start sm:border-r sm:border-slate-700 sm:pr-4 w-full sm:w-40">
                         <img src={installer.logoDataUrl} alt={`${installer.name} logo`} className="w-16 h-16 rounded-full mb-2 object-cover" />
                         <h4 className="font-bold text-white text-center sm:text-left">{installer.name}</h4>
                    </div>
                    <div className="flex-grow grid grid-cols-2 sm:grid-cols-3 gap-4 text-center sm:text-left w-full">
                        <div>
                            <p className="text-sm text-gray-400">{t('Price')}</p>
                            <p className="text-lg font-bold text-solar-green-400">{quote.price.toLocaleString()} {t('currency_symbol')}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-400">{t('System Size')}</p>
                            <p className="text-lg font-bold text-white">{quote.systemSizeKw} kW</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-400">{t('Est. Production')}</p>
                            <p className="text-lg font-bold text-white">{quote.estimatedAnnualProduction.toLocaleString()} kWh/yr</p>
                        </div>
                    </div>
                </div>
            </div>
             <div className="mt-4 pt-4 border-t border-slate-700 flex flex-wrap gap-2 justify-end">
                <Button variant="secondary" onClick={onView} size="sm">{t('View Quote')}</Button>
                <Button variant="secondary" icon={<Icon name="chat" className="w-4 h-4"/>} size="sm" onClick={() => onViewChat(project.id, project.homeownerId, installer.id)}>{t('Chat')}</Button>
                <Button 
                    variant={isMyOfferAccepted ? "primary" : "secondary"} 
                    icon={<Icon name="check" className="w-4 h-4"/>} 
                    size="sm"
                    onClick={() => onAcceptOffer(project.id, quote.id)}
                    disabled={isOfferAccepted}
                >
                    {isMyOfferAccepted ? t('Offer Accepted') : isOfferAccepted ? t('Another offer accepted') : t('Accept Offer')}
                </Button>
                <Button 
                    variant={isShared ? 'secondary' : 'primary'}
                    icon={<Icon name="share" className="w-4 h-4"/>} 
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); onShareContact(project.id, installer.id); }}
                    disabled={isShared || isOfferAccepted}
                >
                    {isShared ? t('Contact Shared') : t('Share Contact')}
                </Button>
            </div>
        </Card>
    );
};


interface ClientDashboardProps {
    projects: ProjectWithDetails[];
    installers: Installer[];
    onProjectSubmit: ProjectSubmitHandler;
    isSubmitting: boolean;
    onViewQuote: (projectId: string, quoteId: string) => void;
    homeowner: Homeowner;
    onShareContact: (projectId: string, installerId: string) => void;
    onAcceptOffer: (projectId: string, quoteId: string) => void;
    onEditHomeowner: (homeowner: Homeowner) => void;
    onViewChat: (projectId: string, homeownerId: string, installerId: string) => void;
    roofTypes: RoofType[];
    onLeaveReview: (projectId: string, installerId: string, rating: number, comment: string) => void;
}

const UserInfoCard: React.FC<{homeowner: Homeowner, onEdit: () => void}> = ({homeowner, onEdit}) => {
    const {t} = useLanguage();
    return (
        <Card>
            <div className="flex justify-between items-center mb-4">
                 <h3 className="text-xl font-bold text-white">{t('Personal Info')}</h3>
                 <Button variant="secondary" size="sm" onClick={onEdit} icon={<Icon name="edit" className="w-4 h-4"/>}>{t('Edit')}</Button>
            </div>
           
            <div className="space-y-2 text-gray-300">
                <p><strong>{t('Full Name')}:</strong> {homeowner.name}</p>
                <p><strong>{t('Email')}:</strong> {homeowner.email}</p>
                <p><strong>{t('Phone')}:</strong> {homeowner.phone}</p>
            </div>
        </Card>
    );
};


const ClientDashboard: React.FC<ClientDashboardProps> = ({ projects, installers, onProjectSubmit, isSubmitting, onViewQuote, homeowner, onShareContact, onAcceptOffer, onEditHomeowner, onViewChat, roofTypes, onLeaveReview }) => {
    const { t } = useLanguage();
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [isProjectModalOpen, setProjectModalOpen] = useState(false);
    const [confirmation, setConfirmation] = useState<{ title: string; message: string; onConfirm: () => void; } | null>(null);
    const [reviewingProject, setReviewingProject] = useState<ProjectWithDetails | null>(null);

    const handleLeaveReviewClick = (project: ProjectWithDetails) => {
        setReviewingProject(project);
    };

    const handleReviewSubmit = (rating: number, comment: string) => {
        if (reviewingProject && reviewingProject.winningInstallerId) {
            onLeaveReview(reviewingProject.id, reviewingProject.winningInstallerId, rating, comment);
        }
    };
    
    const winningInstaller = reviewingProject ? installers.find(i => i.id === reviewingProject.winningInstallerId) : null;
    
    const getStatusInfo = (status: ProjectStatus) => {
      switch(status) {
        case PS.PENDING_APPROVAL: return { text: t('PENDING_APPROVAL'), className: 'bg-yellow-500/20 text-yellow-300'};
        case PS.APPROVED: return { text: t('APPROVED'), className: 'bg-green-500/20 text-green-300'};
        case PS.CONTACT_SHARED: return { text: t('CONTACT_SHARED'), className: 'bg-purple-500/20 text-purple-300'};
        case PS.ON_HOLD: return { text: t('ON_HOLD'), className: 'bg-blue-500/20 text-blue-300' };
        case PS.SIGNED: return { text: t('SIGNED'), className: 'bg-teal-500/20 text-teal-300' };
        case PS.COMPLETED: return { text: t('COMPLETED'), className: 'bg-gray-500/20 text-gray-300'};
        case PS.DELETED: return { text: t('DELETED'), className: 'bg-red-500/20 text-red-300'};
        default: return { text: t('Unknown'), className: 'bg-gray-500/20 text-gray-300'}
      }
    }

    const handleAcceptOfferClick = (projectId: string, quoteId: string) => {
        setConfirmation({
            title: t('Accept Offer'),
            message: t('confirmActionMessage'),
            onConfirm: () => {
                setConfirmation(null);
                onAcceptOffer(projectId, quoteId);
            }
        });
    };

    return (
        <div className="space-y-8">
            {isEditModalOpen && <HomeownerEditModal homeowner={homeowner} onSave={onEditHomeowner} onClose={() => setEditModalOpen(false)} />}
            {isProjectModalOpen && <ProjectFormModal 
                onClose={() => setProjectModalOpen(false)}
                onProjectSubmit={onProjectSubmit}
                isSubmitting={isSubmitting}
                homeownerId={homeowner.id}
                roofTypes={roofTypes}
            />}
             {confirmation && (
                <ConfirmationModal
                    isOpen={!!confirmation}
                    title={confirmation.title}
                    message={confirmation.message}
                    onConfirm={confirmation.onConfirm}
                    onClose={() => setConfirmation(null)}
                />
            )}
            {reviewingProject && winningInstaller && (
                <LeaveReviewModal
                    isOpen={!!reviewingProject}
                    onClose={() => setReviewingProject(null)}
                    onSubmit={handleReviewSubmit}
                    project={reviewingProject}
                    installer={winningInstaller}
                />
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                     <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-white">{t('My Projects')}</h2>
                        <Button onClick={() => setProjectModalOpen(true)} size="lg">{t('Start New Project')}</Button>
                    </div>

                    {projects.length === 0 && !isSubmitting ? (
                        <Card><p className="text-center text-gray-400 py-12">{t('You have no active projects. Click "Start New Project" to get quotes!')}</p></Card>
                    ) : (
                        <div className="space-y-8">
                            {projects.map(project => {
                                const statusInfo = getStatusInfo(project.status);
                                return (
                                    <Card key={project.id} className="space-y-6">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-xl font-semibold text-solar-green-400">{`${project.address.street}, ${project.address.city}`}</h3>
                                                <p className="text-sm text-gray-400">{t('Monthly Bill')}: {project.energyBill} {t('currency_symbol')} | {t('Roof')}: {t(project.roofType) || project.roofType}</p>
                                            </div>
                                            <div className={`text-sm font-semibold px-3 py-1 rounded-full ${statusInfo.className}`}>
                                            {statusInfo.text}
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                                            <Icon name="quote" className="w-5 h-5 text-solar-green-400"/>
                                            {t('Received Quotes ({count})', { count: project.quotes.length })}
                                            </h4>
                                            {project.status === PS.PENDING_APPROVAL || project.status === PS.ON_HOLD ? (
                                                <Card className="bg-slate-900 text-center py-8">
                                                    <p className="text-gray-400">{project.status === PS.ON_HOLD ? t('Project on hold') : t('Your project is pending approval. Quotes will appear here once approved.')}</p>
                                                </Card>
                                            ) : project.quotes.length > 0 ? (
                                                <div className="space-y-4">
                                                    {project.quotes.map(quote => {
                                                        const installer = installers.find(i => i.id === quote.installerId);
                                                        return <QuoteCard key={quote.id} project={project} quote={quote} installer={installer} onView={() => onViewQuote(project.id, quote.id)} onShareContact={onShareContact} onAcceptOffer={handleAcceptOfferClick} onViewChat={onViewChat} />
                                                    })}
                                                </div>
                                            ) : (
                                                <Card className="bg-slate-900 text-center py-8">
                                                    <p className="text-gray-400">{t('Installers are reviewing your project. Quotes will appear here soon!')}</p>
                                                </Card>
                                            )}
                                        </div>

                                        {project.status === PS.SIGNED && (
                                            <div className="mt-4 pt-4 border-t border-slate-700 flex justify-end">
                                                {project.reviewSubmitted ? (
                                                    <p className="text-sm text-gray-400 italic">{t('Review Submitted. Thank you!')}</p>
                                                ) : (
                                                    <Button onClick={() => handleLeaveReviewClick(project)}>{t('Leave a Review')}</Button>
                                                )}
                                            </div>
                                        )}
                                    </Card>
                                )
                            })}
                        </div>
                    )}
                </div>
                <div className="lg:col-span-1">
                     <UserInfoCard homeowner={homeowner} onEdit={() => setEditModalOpen(true)} />
                </div>
            </div>
        </div>
    );
};

export default ClientDashboard;