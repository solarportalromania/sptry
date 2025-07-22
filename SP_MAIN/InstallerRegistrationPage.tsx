
import React, { useState } from 'react';
import { Installer } from './types';
import { useLanguage } from './components/LanguageContext';
import Button from './components/Button';
import Card from './components/Card';
import { romanianCounties } from './constants';
import PasswordInput from './components/PasswordInput';

interface InstallerRegistrationPageProps {
  onRegister: (data: Omit<Installer, 'id' | 'status' | 'createdAt' | 'portfolio' | 'about' | 'logoDataUrl'>) => void;
  onNavigateToLogin: () => void;
}

const InstallerRegistrationPage: React.FC<InstallerRegistrationPageProps> = ({ onRegister, onNavigateToLogin }) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    establishmentDate: '',
    registrationNumber: '',
    licenseNumber: '',
    contactEmail: '',
    contactPhone: '',
    password: '',
    serviceCounties: new Set<string>(),
    specialties: 'Residential, Commercial', // Default value
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

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

  const handleSelectAllCounties = () => {
    if (formData.serviceCounties.size === romanianCounties.length) {
      setFormData(prev => ({ ...prev, serviceCounties: new Set() }));
    } else {
      setFormData(prev => ({ ...prev, serviceCounties: new Set(romanianCounties) }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { contactEmail, contactPhone, ...rest } = formData;
    onRegister({
      ...rest,
      establishmentDate: new Date(formData.establishmentDate),
      serviceCounties: Array.from(formData.serviceCounties),
      specialties: formData.specialties.split(',').map(s => s.trim()).filter(Boolean),
      contact: {
        email: contactEmail,
        phone: contactPhone,
      },
    });
  };

  return (
    <div className="flex justify-center items-center">
      <Card className="w-full max-w-2xl">
        <h2 className="text-3xl font-bold text-center text-white mb-6">{t('Create Installer Account')}</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <fieldset className="space-y-4">
            <legend className="text-lg font-medium text-white">{t('Company Information')}</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">{t('Company Name')}</label>
                <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="w-full bg-slate-700 border-slate-600 rounded-md text-white px-3 py-2" />
              </div>
              <div>
                <label htmlFor="establishmentDate" className="block text-sm font-medium text-gray-300 mb-1">{t('Establishment Date')}</label>
                <input type="date" name="establishmentDate" id="establishmentDate" value={formData.establishmentDate} onChange={handleChange} required className="w-full bg-slate-700 border-slate-600 rounded-md text-white px-3 py-2" />
              </div>
              <div>
                <label htmlFor="registrationNumber" className="block text-sm font-medium text-gray-300 mb-1">{t('CUI (Tax ID)')}</label>
                <input type="text" name="registrationNumber" id="registrationNumber" value={formData.registrationNumber} onChange={handleChange} required className="w-full bg-slate-700 border-slate-600 rounded-md text-white px-3 py-2" />
              </div>
              <div>
                <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-300 mb-1">{t('License Number (optional)')}</label>
                <input type="text" name="licenseNumber" id="licenseNumber" value={formData.licenseNumber} onChange={handleChange} className="w-full bg-slate-700 border-slate-600 rounded-md text-white px-3 py-2" />
              </div>
            </div>
             <div>
                <label htmlFor="specialties" className="block text-sm font-medium text-gray-300 mb-1">{t('Specialties (comma-separated)')}</label>
                <input type="text" name="specialties" id="specialties" value={formData.specialties} onChange={handleChange} required className="w-full bg-slate-700 border-slate-600 rounded-md text-white px-3 py-2" />
            </div>
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="text-lg font-medium text-white">{t('Contact Person')}</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-300 mb-1">{t('Email')}</label>
                <input type="email" name="contactEmail" id="contactEmail" value={formData.contactEmail} onChange={handleChange} required className="w-full bg-slate-700 border-slate-600 rounded-md text-white px-3 py-2" />
              </div>
              <div>
                <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-300 mb-1">{t('Phone')}</label>
                <input type="tel" name="contactPhone" id="contactPhone" value={formData.contactPhone} onChange={handleChange} required className="w-full bg-slate-700 border-slate-600 rounded-md text-white px-3 py-2" />
              </div>
            </div>
             <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">{t('Password')}</label>
                <PasswordInput name="password" id="password" value={formData.password} onChange={handleChange} required />
              </div>
          </fieldset>

           <fieldset>
              <label className="block text-lg font-medium text-white mb-2">{t('Service Area')}</label>
              <div className="flex justify-end mb-2">
                 <Button type="button" size="sm" variant="secondary" onClick={handleSelectAllCounties}>
                    {formData.serviceCounties.size === romanianCounties.length ? t('Deselect All') : t('Select All')}
                 </Button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-2 bg-slate-900 rounded-md border border-slate-700">
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
            </fieldset>

          <Button type="submit" size="lg" className="w-full">{t('Create an account')}</Button>
        </form>
        <div className="mt-6 text-center text-sm text-gray-400">
          <p>{t('Already have an account?')} <button onClick={onNavigateToLogin} className="font-medium text-solar-green-400 hover:underline">{t('Login')}</button></p>
        </div>
      </Card>
    </div>
  );
};

export default InstallerRegistrationPage;
