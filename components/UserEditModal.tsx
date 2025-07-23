import React, { useState } from 'react';
import { User, Homeowner, Installer, Admin } from '../types';
import Card from './Card';
import Button from './Button';
import { useLanguage } from './LanguageContext';

interface UserEditModalProps {
  user: User;
  onClose: () => void;
  onSave: (updatedUser: User) => void;
}

const UserEditModal: React.FC<UserEditModalProps> = ({ user, onClose, onSave }) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: user.name,
    email: 'contact' in user ? user.contact.email : user.email,
    phone: 'phone' in user ? user.phone : ('contact' in user ? user.contact.phone : ''),
    role: 'role' in user ? user.role : ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let updatedUser: User = { ...user, name: formData.name };

    if ('contact' in updatedUser) { // Installer
      updatedUser.contact.email = formData.email;
      updatedUser.contact.phone = formData.phone;
    } else if ('role' in updatedUser) { // Admin
        updatedUser.email = formData.email;
        updatedUser.role = formData.role;
    } else { // Homeowner
      updatedUser.email = formData.email;
      updatedUser.phone = formData.phone;
    }

    onSave(updatedUser);
    onClose();
  };
  
  const isInstaller = 'contact' in user;
  const isHomeowner = 'phone' in user && !isInstaller;
  const isAdmin = 'role' in user;

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <Card className="w-full max-w-lg bg-slate-800 border-slate-700" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-between items-start">
            <h3 className="text-xl font-bold text-white">{t('Edit User')}</h3>
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
            {(isHomeowner || isInstaller) && (
                 <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-1">{t('Phone')}</label>
                    <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} required className="w-full bg-slate-700 border-slate-600 rounded-md text-white px-3 py-2" />
                </div>
            )}
            {isAdmin && (
                <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-300 mb-1">{t('Role')}</label>
                    <input type="text" name="role" id="role" value={formData.role} onChange={handleChange} required className="w-full bg-slate-700 border-slate-600 rounded-md text-white px-3 py-2" />
                </div>
            )}
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t border-slate-700">
            <Button type="button" variant="secondary" onClick={onClose}>{t('Cancel')}</Button>
            <Button type="submit" variant="primary">{t('Save Changes')}</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default UserEditModal;