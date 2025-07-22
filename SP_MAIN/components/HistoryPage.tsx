import React, { useState, useMemo } from 'react';
import { HistoryLog, User, ProjectWithDetails, UserRole } from '../types';
import Card from './Card';
import Button from './Button';
import Icon from './Icon';
import { useLanguage } from './LanguageContext';

interface HistoryPageProps {
  history: HistoryLog[];
  projects: ProjectWithDetails[];
  users: User[];
  onBack: () => void;
}

const HistoryPage: React.FC<HistoryPageProps> = ({ history, projects, users, onBack }) => {
  const { t } = useLanguage();
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedUser, setSelectedUser] = useState('');

  const filteredHistory = useMemo(() => {
    return history.filter(log => {
      const projectMatch = !selectedProject || (log.target.type === 'project' && log.target.id === selectedProject);
      const userMatch = !selectedUser || log.actor.id === selectedUser || (log.target.type === 'user' && log.target.id === selectedUser);
      return projectMatch && userMatch;
    });
  }, [history, selectedProject, selectedUser]);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">{t('Action History')}</h1>
        <Button variant="secondary" size="sm" onClick={onBack} icon={<Icon name="arrow-left" className="w-4 h-4" />}>
          {t('Back to Dashboard')}
        </Button>
      </div>

      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
                <label htmlFor="projectFilter" className="block text-sm font-medium text-gray-300 mb-1">{t('Filter by Project')}</label>
                 <select 
                    id="projectFilter" 
                    value={selectedProject} 
                    onChange={e => setSelectedProject(e.target.value)}
                    className="w-full bg-slate-700 border-slate-600 rounded-md text-white px-3 py-2 focus:ring-solar-green-400 focus:border-solar-green-400"
                >
                    <option value="">{t('All Projects')}</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.address.street}, {p.address.city}</option>)}
                </select>
            </div>
             <div>
                <label htmlFor="userFilter" className="block text-sm font-medium text-gray-300 mb-1">{t('Filter by User')}</label>
                 <select 
                    id="userFilter" 
                    value={selectedUser} 
                    onChange={e => setSelectedUser(e.target.value)}
                    className="w-full bg-slate-700 border-slate-600 rounded-md text-white px-3 py-2 focus:ring-solar-green-400 focus:border-solar-green-400"
                 >
                    <option value="">{t('All Users')}</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
            </div>
        </div>
      </Card>

      <Card>
        {filteredHistory.length === 0 ? (
          <p className="text-center text-gray-400 py-12">{t('No history yet.')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-300">
              <thead className="text-xs text-gray-400 uppercase bg-slate-700/50">
                <tr>
                  <th scope="col" className="px-6 py-3">{t('Timestamp')}</th>
                  <th scope="col" className="px-6 py-3">{t('Actor')}</th>
                  <th scope="col" className="px-6 py-3">{t('Action')}</th>
                  <th scope="col" className="px-6 py-3">{t('Target')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map(log => (
                  <tr key={log.id} className="bg-slate-800/50 border-b border-slate-700 hover:bg-slate-800">
                    <td className="px-6 py-4">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="px-6 py-4">{log.actor.name} ({t(`Role_${UserRole[log.actor.role]}`)})</td>
                    <td className="px-6 py-4">{log.action}</td>
                    <td className="px-6 py-4">
                        <span className="font-medium">{log.target.name}</span>
                        <span className="text-gray-400 ml-2">({log.target.type} ID: {log.target.id})</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default HistoryPage;