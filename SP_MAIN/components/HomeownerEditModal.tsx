
import React, { useState } from 'react';
import { Homeowner } from '../types';
import Card from './Card';
import Button from './Button';
import { useLanguage } from './LanguageContext';
import PasswordInput from './PasswordInput';

interface HomeownerEditModalProps {
  homeowner: Homeowner;
  onClose: () => void;
  onSave: (homeowner: Homeowner) => void;
}

const HomeownerEditModal: React.FC<HomeownerEditModalProps> = ({ homeowner, onClose, onSave }) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: homeowner.name,
    email: homeowner.email,
    phone: homeowner.phone,
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    let updatedHomeowner: Homeowner = {
      ...homeowner,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
    };

    if (formData.newPassword) {
        if (formData.currentPassword !== homeowner.password) {
            setPasswordError(t('Current password is incorrect.'));
            return;
        }
        if (formData.newPassword !== formData.confirmNewPassword) {
            setPasswordError(t("New passwords don't match."));
            return;
        }
        updatedHomeowner.password = formData.newPassword;
    }

    onSave(updatedHomeowner);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <Card className="w-full max-w-lg bg-slate-800 border-slate-700" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-between items-start">
            <h3 className="text-xl font-bold text-white">{t('Edit Personal Info')}</h3>
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
                <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-1">{t('Phone')}</label>
                <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} required className="w-full bg-slate-700 border-slate-600 rounded-md text-white px-3 py-2" />
            </div>
          </div>
          
          <fieldset className="space-y-4 pt-4 border-t border-slate-700">
            <legend className="text-lg font-medium text-white">{t('Change Password')}</legend>
            {passwordError && <p className="text-sm text-red-400 bg-red-900/50 p-2 rounded-md">{passwordError}</p>}
            <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-300 mb-1">{t('Current Password')}</label>
                <PasswordInput name="currentPassword" id="currentPassword" value={formData.currentPassword} onChange={handleChange} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-300 mb-1">{t('New Password')}</label>
                    <PasswordInput name="newPassword" id="newPassword" value={formData.newPassword} onChange={handleChange} />
                </div>
                <div>
                    <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-300 mb-1">{t('Confirm New Password')}</label>
                    <PasswordInput name="confirmNewPassword" id="confirmNewPassword" value={formData.confirmNewPassword} onChange={handleChange} />
                </div>
            </div>
          </fieldset>

          <div className="flex justify-end gap-4 pt-4 border-t border-slate-700">
            <Button type="button" variant="secondary" onClick={onClose}>{t('Cancel')}</Button>
            <Button type="submit" variant="primary">{t('Save Changes')}</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default HomeownerEditModal;
