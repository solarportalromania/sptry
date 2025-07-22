
import React, { useState } from 'react';
import { Homeowner, Project, RoofType } from './types';
import { useLanguage } from './components/LanguageContext';
import Button from './components/Button';
import Card from './components/Card';
import Icon from './components/Icon';
import PasswordInput from './components/PasswordInput';
import { romanianCounties } from './constants';

interface HomeownerProjectRegistrationPageProps {
  onRegister: (
    homeownerData: Omit<Homeowner, 'id' | 'status' | 'createdAt'>,
    projectData: Omit<Project, 'id' | 'homeownerId' | 'quotes' | 'status' | 'createdAt' | 'reviewSubmitted'>
  ) => void;
  onNavigateToLogin: () => void;
  isSubmitting: boolean;
  roofTypes: RoofType[];
}

const HomeownerProjectRegistrationPage: React.FC<HomeownerProjectRegistrationPageProps> = ({ onRegister, onNavigateToLogin, isSubmitting, roofTypes }) => {
  const { t } = useLanguage();
  
  const [formData, setFormData] = useState({
    // Homeowner data
    name: '',
    email: '',
    phone: '',
    password: '',
    // Project data
    street: '',
    city: '',
    county: '',
    energyBill: 1000,
    roofType: roofTypes[0]?.name || 'Tile',
    notes: '',
    wantsBattery: false,
    photoDataUrl: null as string | null,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if(type === 'checkbox'){
        const { checked } = e.target as HTMLInputElement;
        setFormData(prev => ({...prev, [name]: checked}));
    } else {
        setFormData(prev => ({ ...prev, [name]: name === 'energyBill' ? Number(value) : value }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({...prev, photoDataUrl: reader.result as string}));
      };
      reader.readAsDataURL(file);
    } else {
      setFormData(prev => ({...prev, photoDataUrl: null}));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const homeownerData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
    };
    const projectData = {
      address: { street: formData.street, city: formData.city, county: formData.county },
      energyBill: formData.energyBill,
      roofType: formData.roofType,
      notes: formData.notes,
      wantsBattery: formData.wantsBattery,
      photoDataUrl: formData.photoDataUrl || undefined,
    };
    onRegister(homeownerData, projectData);
  };

  return (
    <div className="flex justify-center items-center">
      <Card className="w-full max-w-2xl">
        <h2 className="text-3xl font-bold text-center text-white mb-6">{t('Create Homeowner Account')}</h2>
        <p className="text-center text-gray-400 mb-8">{t('Fill out the form below to get started.')}</p>
        <form onSubmit={handleSubmit} className="space-y-8">

          {/* User Details Section */}
          <fieldset className="space-y-6">
            <legend className="text-xl font-bold text-white border-b border-slate-700 pb-2 mb-4">{t('Your Details')}</legend>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">{t('Full Name')}</label>
              <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="w-full bg-slate-700 border-slate-600 rounded-md text-white px-3 py-2" placeholder={t('e.g., Jane Doe')} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">{t('Email')}</label>
                <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} required className="w-full bg-slate-700 border-slate-600 rounded-md text-white px-3 py-2" placeholder={t('you@example.com')} />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-1">{t('Phone')}</label>
                <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} required className="w-full bg-slate-700 border-slate-600 rounded-md text-white px-3 py-2" placeholder={t('555-123-4567')} />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">{t('Password')}</label>
              <PasswordInput name="password" id="password" value={formData.password} onChange={handleChange} required />
            </div>
          </fieldset>

          {/* Project Details Section */}
          <fieldset className="space-y-6">
            <legend className="text-xl font-bold text-white border-b border-slate-700 pb-2 mb-4">{t('Your First Project')}</legend>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="street" className="block text-sm font-medium text-gray-300 mb-1">{t('Street Address')}</label>
                <input type="text" name="street" id="street" value={formData.street} onChange={handleChange} required className="w-full bg-slate-700 border-slate-600 rounded-md text-white px-3 py-2" placeholder={t('123 Sunshine Ln')} />
              </div>
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-300 mb-1">{t('City')}</label>
                <input type="text" name="city" id="city" value={formData.city} onChange={handleChange} required className="w-full bg-slate-700 border-slate-600 rounded-md text-white px-3 py-2" placeholder={t('Sunville')} />
              </div>
              <div>
                <label htmlFor="county" className="block text-sm font-medium text-gray-300 mb-1">{t('County / State')}</label>
                <select name="county" id="county" value={formData.county} onChange={handleChange} required className="w-full bg-slate-700 border-slate-600 rounded-md text-white px-3 py-2">
                  <option value="" disabled>{t('Select County')}</option>
                  {romanianCounties.map(county => <option key={county} value={county}>{county}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="roofType" className="block text-sm font-medium text-gray-300 mb-1">{t('Roof Type')}</label>
              <select name="roofType" id="roofType" value={formData.roofType} onChange={handleChange} className="w-full bg-slate-700 border-slate-600 rounded-md text-white px-3 py-2">
                {roofTypes.map(rt => <option key={rt.id} value={rt.name}>{t(rt.name) || rt.name}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="energyBill" className="block text-sm font-medium text-gray-300 mb-1">{t('Average Monthly Electric Bill ({currency_symbol}{amount})', { amount: formData.energyBill, currency_symbol: t('currency_symbol') })}</label>
              <input type="range" name="energyBill" id="energyBill" min="250" max="5000" step="50" value={formData.energyBill} onChange={handleChange} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-solar-green-400" />
            </div>
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-300 mb-1">{t('Additional Notes (optional)')}</label>
              <textarea name="notes" id="notes" value={formData.notes} onChange={handleChange} rows={3} className="w-full bg-slate-700 border-slate-600 rounded-md text-white px-3 py-2" placeholder={t('e.g., new roof, any shading concerns, etc.')}></textarea>
            </div>
            <div className="flex items-center">
              <input id="wantsBattery" name="wantsBattery" type="checkbox" checked={formData.wantsBattery} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-solar-green-600 focus:ring-solar-green-500 bg-slate-700" />
              <label htmlFor="wantsBattery" className="ml-2 block text-sm text-gray-300">{t('I am interested in a battery backup solution')}</label>
            </div>
            <div>
              <label htmlFor="photo" className="block text-sm font-medium text-gray-300 mb-1">{t('Upload a Photo (optional)')}</label>
              <div className="mt-2 flex items-center gap-4">
                {formData.photoDataUrl ? <img src={formData.photoDataUrl} alt={t('Property preview')} className="h-16 w-16 rounded-md object-cover" /> : <div className="h-16 w-16 rounded-md bg-slate-700 flex items-center justify-center"><Icon name="camera" className="h-8 w-8 text-gray-400" /></div>}
                <input type="file" name="photo" id="photo" onChange={handleFileChange} accept="image/*" className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-solar-green-700 file:text-solar-green-100 hover:file:bg-solar-green-600"/>
              </div>
            </div>
          </fieldset>
          
          <Button type="submit" size="lg" className="w-full" isLoading={isSubmitting} icon={isSubmitting ? null : <Icon name="bolt" className="w-5 h-5"/>}>
            {t('Create Account & Submit Project')}
          </Button>
        </form>
        <div className="mt-6 text-center text-sm text-gray-400">
          <p>{t('Already have an account?')} <button onClick={onNavigateToLogin} className="font-medium text-solar-green-400 hover:underline">{t('Login')}</button></p>
        </div>
      </Card>
    </div>
  );
};

export default HomeownerProjectRegistrationPage;
