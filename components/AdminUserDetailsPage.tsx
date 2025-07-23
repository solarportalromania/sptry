
import React from 'react';
import { User, ProjectWithDetails, Conversation, UserRole, Admin, ProjectStatus } from '../types';
import Card from './Card';
import Button from './Button';
import Icon from './Icon';
import { useLanguage } from './LanguageContext';

interface AdminUserDetailsPageProps {
  user: User;
  projects: ProjectWithDetails[];
  conversations: Conversation[];
  allUsers: User[];
  onBack: () => void;
  onViewChat: (conversationId: string) => void;
  onViewProjectDetails: (projectId: string) => void;
}

const AdminUserDetailsPage: React.FC<AdminUserDetailsPageProps> = ({ user, projects, conversations, allUsers, onBack, onViewChat, onViewProjectDetails }) => {
  const { t } = useLanguage();

  const renderUserDetails = () => {
    const email = 'contact' in user ? user.contact.email : user.email;
    const phone = 'phone' in user ? user.phone : ('contact' in user ? user.contact.phone : null);
    
    return (
        <Card>
            <h2 className="text-2xl font-bold text-white mb-4">{t('User Details')}</h2>
            <div className="space-y-2 text-gray-300">
                <p><strong>{t('Full Name')}:</strong> {user.name}</p>
                <p><strong>{t('Email')}:</strong> <a href={`mailto:${email}`} className="text-solar-green-400 hover:underline">{email}</a></p>
                {phone && <p><strong>{t('Phone')}:</strong> <a href={`tel:${phone}`} className="text-solar-green-400 hover:underline">{phone}</a></p>}
                {'role' in user && <p><strong>{t('Role')}:</strong> {(user as Admin).role}</p>}
                {'serviceCounties' in user && <p><strong>{t('Service Counties')}:</strong> {user.serviceCounties.join(', ')}</p>}
            </div>
            {'permissions' in user && (
                <div className="mt-4 pt-4 border-t border-slate-700">
                    <h3 className="text-lg font-bold text-white mb-2">{t('Permissions')}</h3>
                    <p className="text-gray-300"><strong>{t('Can login as other users')}:</strong> {user.permissions.canLoginAs ? 'Yes' : 'No'}</p>
                    <p className="text-gray-300"><strong>{t('Visible Dashboard Tabs')}:</strong> {user.permissions.visibleTabs.join(', ')}</p>
                </div>
            )}
        </Card>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <Button variant="secondary" size="sm" onClick={onBack} icon={<Icon name="arrow-left" className="w-4 h-4" />}>
          {t('Back to Dashboard')}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
          {renderUserDetails()}
        </div>

        <div className="lg:col-span-2 space-y-8">
          <Card>
            <h2 className="text-xl font-bold text-white mb-4">{t('Associated Projects')}</h2>
            <div className="space-y-4 max-h-96 overflow-y-auto">
                {projects.length > 0 ? projects.map(p => (
                    <button key={p.id} onClick={() => onViewProjectDetails(p.id)} className="w-full text-left p-3 bg-slate-900/50 rounded-lg hover:bg-slate-800 transition-colors">
                        <p className="font-semibold text-white">{`${p.address.street}, ${p.address.city}`}</p>
                        <p className="text-sm text-gray-400">{t(ProjectStatus[p.status])}</p>
                    </button>
                )) : <p className="text-gray-400">{t('No projects found for this user.')}</p>}
            </div>
          </Card>
          
          <Card>
            <h2 className="text-xl font-bold text-white mb-4">{t('Associated Chats')}</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {conversations.length > 0 ? conversations.map(convo => {
                 const otherParticipant = allUsers.find(u => convo.participants.includes(u.id) && u.id !== user.id);
                return (
                  <button key={convo.id} onClick={() => onViewChat(convo.id)} className="w-full text-left p-3 bg-slate-900/50 rounded-lg hover:bg-slate-800 transition-colors">
                    <p className="font-semibold text-white">{t('Chat with {name}', {name: otherParticipant?.name || t('Admin')})}</p>
                    <p className="text-sm text-gray-400">{convo.messages.length} messages</p>
                  </button>
                );
              }) : <p className="text-gray-400">{t('No chats found for this user.')}</p>}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminUserDetailsPage;
