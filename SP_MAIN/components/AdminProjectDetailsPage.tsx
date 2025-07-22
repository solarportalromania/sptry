
import React from 'react';
import { ProjectWithDetails, Conversation, User, Installer } from '../types';
import Card from './Card';
import Button from './Button';
import Icon from './Icon';
import { useLanguage } from './LanguageContext';

interface AdminProjectDetailsPageProps {
  project: ProjectWithDetails;
  installers: Installer[];
  conversations: Conversation[];
  allUsers: User[];
  onBack: () => void;
  onViewChat: (conversationId: string) => void;
}

const AdminProjectDetailsPage: React.FC<AdminProjectDetailsPageProps> = ({ project, installers, conversations, allUsers, onBack, onViewChat }) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-8">
      <div>
        <Button variant="secondary" size="sm" onClick={onBack} icon={<Icon name="arrow-left" className="w-4 h-4" />}>
          {t('Back to Dashboard')}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Project Details */}
          <Card>
            <h2 className="text-2xl font-bold text-white mb-4">{t('Project Details')}</h2>
            <div className="space-y-2 text-gray-300">
              <p><strong>{t('Address')}:</strong> {`${project.address.street}, ${project.address.city}, ${project.address.county}`}</p>
              <p><strong>{t('Monthly Bill')}:</strong> {project.energyBill} {t('currency_symbol')}</p>
              <p><strong>{t('Roof Type')}:</strong> {t(project.roofType) || project.roofType}</p>
              <p><strong>{t('Wants Battery')}:</strong> {project.wantsBattery ? t('Yes') : 'No'}</p>
              {project.notes && <p><strong>{t('Notes')}:</strong> <em className="text-gray-400">"{project.notes}"</em></p>}
            </div>
            {project.photoDataUrl && <img src={project.photoDataUrl} alt="Project" className="mt-4 rounded-lg w-full max-h-64 object-cover" />}
          </Card>

          {/* Submitted Quotes */}
          <Card>
            <h2 className="text-2xl font-bold text-white mb-4">{t('Submitted Quotes ({count})', { count: project.quotes.length })}</h2>
            <div className="space-y-4">
              {project.quotes.length > 0 ? project.quotes.map(quote => {
                const installer = installers.find(i => i.id === quote.installerId);
                return (
                  <div key={quote.id} className="p-4 bg-slate-900/50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-bold text-white">{installer?.name || 'Unknown Installer'}</p>
                        <p className="text-solar-green-400 font-semibold">{quote.price.toLocaleString()} {t('currency_symbol')}</p>
                      </div>
                      <span className="text-sm text-gray-400">{quote.systemSizeKw} kW</span>
                    </div>
                  </div>
                );
              }) : <p className="text-gray-400">{t('No quotes submitted yet.')}</p>}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-8">
            {/* Homeowner Info */}
            <Card>
                <h2 className="text-xl font-bold text-white mb-4">{t('Homeowner Information')}</h2>
                <div className="space-y-2 text-gray-300">
                    <p><strong>{t('Full Name')}:</strong> {project.homeowner.name}</p>
                    <p><strong>{t('Email')}:</strong> <a href={`mailto:${project.homeowner.email}`} className="text-solar-green-400 hover:underline">{project.homeowner.email}</a></p>
                    <p><strong>{t('Phone')}:</strong> <a href={`tel:${project.homeowner.phone}`} className="text-solar-green-400 hover:underline">{project.homeowner.phone}</a></p>
                </div>
            </Card>

            {/* Associated Chats */}
            <Card>
                <h2 className="text-xl font-bold text-white mb-4">{t('Associated Chats')}</h2>
                <div className="space-y-3">
                    {conversations.length > 0 ? conversations.map(convo => {
                         const otherParticipant = allUsers.find(u => convo.participants.includes(u.id) && u.id !== project.homeownerId && !('role' in u));
                        return (
                             <button key={convo.id} onClick={() => onViewChat(convo.id)} className="w-full text-left p-3 bg-slate-900/50 rounded-lg hover:bg-slate-800 transition-colors">
                                <p className="font-semibold text-white">{t('Chat with {name}', {name: otherParticipant?.name || t('Admin')})}</p>
                                <p className="text-sm text-gray-400">{convo.messages.length} messages</p>
                            </button>
                        )
                    }) : <p className="text-gray-400">{t('No chats found for this project.')}</p>}
                </div>
            </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminProjectDetailsPage;
