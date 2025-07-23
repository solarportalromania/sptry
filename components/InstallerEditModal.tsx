

import React, { useState } from 'react';
import { Installer } from '../types';
import Card from './Card';
import Button from './Button';
import { useLanguage } from './LanguageContext';
import { romanianCounties } from '../constants';
import Icon from './Icon';
import PasswordInput from './PasswordInput';
import PasswordStrengthIndicator, { isPasswordStrong } from './PasswordStrengthIndicator';

interface InstallerEditModalProps {
  installer: Installer;
  onClose: () => void;
  onSave: (installer: Installer) => void;
}

interface PortfolioItemState {
    id: number;
    imageDataUrl: string;
    caption: string;
}

const InstallerEditModal: React.FC<InstallerEditModalProps> = ({ installer, onClose, onSave }) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: installer.name,
    about: installer.about,
    email: installer.contact.email,
    phone: installer.contact.phone,
    specialties: installer.specialties.join(', '),
    logoDataUrl: installer.logoDataUrl,
    serviceCounties: new Set(installer.serviceCounties),
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');

  const [portfolioItems, setPortfolioItems] = useState<PortfolioItemState[]>(
      installer.portfolio.map((p, index) => ({...p, id: index}))
  );


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordError('');
    setPasswordData(prev => ({ ...prev, [name]: value }));
  }

  const handleCountyChange = (county: string) => {
    setFormData(prev => {
      const newCounties = new Set(prev.serviceCounties);
      if (newCounties.has(county)) {
        newCounties.delete(county);
      } else {
        newCounties.add(county);
      }
      return { ...prev, serviceCounties: newCounties };
    });
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (data: string) => void) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          const reader = new FileReader();
          reader.onloadend = () => {
              setter(reader.result as string);
          };
          reader.readAsDataURL(file);
      }
  }
  
  const handlePortfolioChange = (id: number, field: 'caption' | 'imageDataUrl', value: string) => {
      setPortfolioItems(prev => prev.map(p => p.id === id ? {...p, [field]: value} : p));
  }
  
  const addPortfolioItem = () => {
      setPortfolioItems(prev => [...prev, {id: Date.now(), imageDataUrl: '', caption: ''}]);
  }
  
  const removePortfolioItem = (id: number) => {
      setPortfolioItems(prev => prev.filter(p => p.id !== id));
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    let finalPassword = installer.password;

    if (passwordData.newPassword) {
      if (passwordData.currentPassword !== installer.password) {
        setPasswordError(t('Current password is incorrect.'));
        return;
      }
      if (passwordData.newPassword !== passwordData.confirmNewPassword) {
        setPasswordError(t("New passwords don't match."));
        return;
      }
      if (!isPasswordStrong(passwordData.newPassword)) {
          setPasswordError(t('pw_requirements_not_met'));
          return;
      }
      finalPassword = passwordData.newPassword;
    }


    const updatedInstaller: Installer = {
      ...installer,
      name: formData.name,
      about: formData.about,
      logoDataUrl: formData.logoDataUrl,
      password: finalPassword,
      contact: {
        email: formData.email,
        phone: formData.phone,
      },
      specialties: formData.specialties.split(',').map(s => s.trim()).filter(Boolean),
      serviceCounties: Array.from(formData.serviceCounties),
      portfolio: portfolioItems.map(({caption, imageDataUrl}) => ({caption, imageDataUrl}))
    };
    onSave(updatedInstaller);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <Card className="w-full max-w-3xl bg-slate-800 border-slate-700 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-between items-start">
            <h3 className="text-xl font-bold text-white">{t('Edit Profile')}</h3>
            <button type="button" onClick={onClose} className="text-gray-400 hover:text-white text-3xl leading-none">&times;</button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">{t('Company Name')}</label>
              <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="w-full bg-slate-700 border-slate-600 rounded-md text-white px-3 py-2" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">{t('Email')}</label>
                    <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} required className="w-full bg-slate-700 border-slate-600 rounded-md text-white px-3 py-2" />
                </div>
                 <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-1">{t('Phone')}</label>
                    <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} required className="w-full bg-slate-700 border-slate-600 rounded-md text-white px-3 py-2" />
                </div>
            </div>
            <div>
                <label htmlFor="logo" className="block text-sm font-medium text-gray-300 mb-1">{t('Logo')}</label>
                <div className="mt-2 flex items-center gap-4">
                    {formData.logoDataUrl ? (
                        <img src={formData.logoDataUrl} alt={t('Logo preview')} className="h-16 w-16 rounded-full object-cover" />
                    ) : (
                        <div className="h-16 w-16 rounded-full bg-slate-700 flex items-center justify-center">
                            <Icon name="camera" className="h-8 w-8 text-gray-400" />
                        </div>
                    )}
                    <input type="file" name="logo" id="logo" onChange={(e) => handleFileChange(e, (data) => setFormData(prev => ({...prev, logoDataUrl: data})))} accept="image/*" className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-solar-green-700 file:text-solar-green-100 hover:file:bg-solar-green-600"/>
                </div>
            </div>
             <div>
              <label htmlFor="about" className="block text-sm font-medium text-gray-300 mb-1">{t('About Us')}</label>
              <textarea name="about" id="about" value={formData.about} onChange={handleChange} required rows={5} className="w-full bg-slate-700 border-slate-600 rounded-md text-white px-3 py-2"></textarea>
            </div>
             <div>
              <label htmlFor="specialties" className="block text-sm font-medium text-gray-300 mb-1">{t('Specialties (comma-separated)')}</label>
              <input type="text" name="specialties" id="specialties" value={formData.specialties} onChange={handleChange} required className="w-full bg-slate-700 border-slate-600 rounded-md text-white px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">{t('Service Area')}</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-2 bg-slate-900 rounded-md">
                {romanianCounties.map(county => (
                  <div key={county} className="flex items-center">
                    <input 
                      type="checkbox"
                      id={`county-${county}`}
                      checked={formData.serviceCounties.has(county)}
                      onChange={() => handleCountyChange(county)}
                      className="h-4 w-4 rounded border-gray-300 text-solar-green-600 focus:ring-solar-green-500 bg-slate-700"
                    />
                    <label htmlFor={`county-${county}`} className="ml-2 text-sm text-gray-200">{county}</label>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">{t('Our Portfolio')}</label>
              <div className="space-y-4">
                  {portfolioItems.map((item, index) => (
                      <div key={item.id} className="p-3 bg-slate-900/70 rounded-lg space-y-3">
                          <div className="flex items-start gap-4">
                               {item.imageDataUrl ? (
                                    <img src={item.imageDataUrl} alt={t('Portfolio preview')} className="h-20 w-20 rounded-md object-cover flex-shrink-0" />
                                ) : (
                                    <div className="h-20 w-20 rounded-md bg-slate-700 flex items-center justify-center flex-shrink-0">
                                        <Icon name="camera" className="h-8 w-8 text-gray-400" />
                                    </div>
                                )}
                                <div className="w-full space-y-2">
                                     <input type="file" onChange={(e) => handleFileChange(e, (data) => handlePortfolioChange(item.id, 'imageDataUrl', data))} accept="image/*" className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-solar-green-700 file:text-solar-green-100 hover:file:bg-solar-green-600"/>
                                     <input type="text" placeholder={t('Caption')} value={item.caption} onChange={(e) => handlePortfolioChange(item.id, 'caption', e.target.value)} className="w-full bg-slate-700 border-slate-600 rounded-md text-white px-3 py-2"/>
                                </div>
                          </div>
                          <Button type="button" variant="danger" size="sm" onClick={() => removePortfolioItem(item.id)}>{t('Delete')}</Button>
                      </div>
                  ))}
                  <Button type="button" variant="secondary" onClick={addPortfolioItem}>{t('Add Portfolio Item')}</Button>
              </div>
            </div>
             <fieldset className="space-y-4 pt-4 border-t border-slate-700">
                <legend className="text-lg font-medium text-white">{t('Change Password')}</legend>
                {passwordError && <p className="text-sm text-red-400 bg-red-900/50 p-2 rounded-md">{passwordError}</p>}
                 <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-300 mb-1">{t('Current Password')}</label>
                    <PasswordInput name="currentPassword" id="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordChange} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-300 mb-1">{t('New Password')}</label>
                        <PasswordInput name="newPassword" id="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} />
                    </div>
                    <div>
                        <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-300 mb-1">{t('Confirm New Password')}</label>
                        <PasswordInput name="confirmNewPassword" id="confirmNewPassword" value={passwordData.confirmNewPassword} onChange={handlePasswordChange} />
                    </div>
                </div>
                {passwordData.newPassword && <PasswordStrengthIndicator password={passwordData.newPassword} />}
            </fieldset>
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

export default InstallerEditModal;