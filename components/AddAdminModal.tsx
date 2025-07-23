

import React, { useState } from 'react';
import Card from './Card';
import Button from './Button';
import { useLanguage } from './LanguageContext';
import PasswordInput from './PasswordInput';
import { Admin, AdminTab } from '../types';
import PasswordStrengthIndicator, { isPasswordStrong } from './PasswordStrengthIndicator';

interface AddAdminModalProps {
  onClose: () => void;
  onAddAdmin: (adminData: { name: string; email: string; role: string; password: string; permissions: Admin['permissions'] }) => void;
}

const allTabs: AdminTab[] = ['projects', 'users', 'blog', 'settings', 'finance', 'reports'];

const AddAdminModal: React.FC<AddAdminModalProps> = ({ onClose, onAddAdmin }) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Admin',
  });
  const [passwordError, setPasswordError] = useState('');
  
  const [permissions, setPermissions] = useState({
      canLoginAs: true,
      visibleTabs: new Set<AdminTab>(allTabs)
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if(name === 'password') setPasswordError('');
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePermissionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, checked } = e.target;
      if (name === 'canLoginAs') {
          setPermissions(prev => ({...prev, canLoginAs: checked}));
      } else {
          setPermissions(prev => {
              const newTabs = new Set(prev.visibleTabs);
              if(checked) {
                  newTabs.add(name as AdminTab);
              } else {
                  newTabs.delete(name as AdminTab);
              }
              return {...prev, visibleTabs: newTabs};
          })
      }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordStrong(formData.password)) {
        setPasswordError(t('pw_requirements_not_met'));
        return;
    }
    if (formData.name && formData.email && formData.role && formData.password) {
      onAddAdmin({ 
          ...formData,
          permissions: {
              canLoginAs: permissions.canLoginAs,
              visibleTabs: Array.from(permissions.visibleTabs),
          }
       });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <Card className="w-full max-w-lg bg-slate-800 border-slate-700" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-between items-start">
            <h3 className="text-xl font-bold text-white">{t('Add New Admin')}</h3>
            <button type="button" onClick={onClose} className="text-gray-400 hover:text-white text-3xl leading-none">&times;</button>
          </div>
          
          <div className="space-y-4">
             <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">{t('Full Name')}</label>
                <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="w-full bg-slate-700 border-slate-600 rounded-md text-white px-3 py-2" />
            </div>
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">{t('Email')}</label>
                <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} required className="w-full bg-slate-700 border-slate-600 rounded-md text-white px-3 py-2" />
            </div>
            <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">{t('Password')}</label>
                <PasswordInput name="password" id="password" value={formData.password} onChange={handleChange} required />
                <PasswordStrengthIndicator password={formData.password} />
                {passwordError && <p className="text-sm text-red-400 mt-2">{passwordError}</p>}
            </div>
            <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-300 mb-1">{t('Admin Role')}</label>
                <input type="text" name="role" id="role" value={formData.role} onChange={handleChange} required className="w-full bg-slate-700 border-slate-600 rounded-md text-white px-3 py-2" />
            </div>
          </div>
          
          <fieldset className="space-y-4 pt-4 border-t border-slate-700">
             <legend className="text-lg font-medium text-white">{t('Permissions')}</legend>
             <div className="space-y-2">
                 <div className="flex items-center">
                    <input id="canLoginAs" name="canLoginAs" type="checkbox" checked={permissions.canLoginAs} onChange={handlePermissionChange} className="h-4 w-4 rounded border-gray-300 text-solar-green-600 focus:ring-solar-green-500 bg-slate-700" />
                    <label htmlFor="canLoginAs" className="ml-2 block text-sm text-gray-300">{t('Can login as other users')}</label>
                 </div>
             </div>
             <div>
                 <label className="block text-sm font-medium text-gray-300 mb-1">{t('Visible Dashboard Tabs')}</label>
                 <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                     {allTabs.map(tab => (
                        <div key={tab} className="flex items-center">
                            <input id={tab} name={tab} type="checkbox" checked={permissions.visibleTabs.has(tab)} onChange={handlePermissionChange} className="h-4 w-4 rounded border-gray-300 text-solar-green-600 focus:ring-solar-green-500 bg-slate-700" />
                            <label htmlFor={tab} className="ml-2 block text-sm text-gray-300 capitalize">{t(tab)}</label>
                        </div>
                     ))}
                 </div>
             </div>
          </fieldset>

          <div className="flex justify-end gap-4 pt-4 border-t border-slate-700">
            <Button type="button" variant="secondary" onClick={onClose}>{t('Cancel')}</Button>
            <Button type="submit" variant="primary">{t('Add Admin')}</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default AddAdminModal;