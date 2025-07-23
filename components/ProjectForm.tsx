


import React, { useState } from 'react';
import { useLanguage } from './LanguageContext';
import Icon from './Icon';
import Button from './Button';
import { RoofType, Project } from '../types';
import { romanianCounties } from '../constants';

interface ProjectFormProps {
    isSubmitting: boolean;
    onSubmit: (data: Omit<Project, 'id' | 'homeownerId' | 'quotes' | 'status' | 'createdAt' | 'reviewSubmitted'>) => void;
    roofTypes: RoofType[];
}

const ProjectForm: React.FC<ProjectFormProps> = ({ onSubmit, isSubmitting, roofTypes }) => {
    const { language, t } = useLanguage();
    const [formData, setFormData] = useState({
        street: '', city: '', county: '',
        energyBill: 1000, roofType: roofTypes[0]?.name || 'Tile', notes: '', wantsBattery: false,
    });
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

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
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setPhotoPreview(null);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            address: { street: formData.street, city: formData.city, county: formData.county },
            energyBill: formData.energyBill,
            roofType: formData.roofType,
            notes: formData.notes,
            wantsBattery: formData.wantsBattery,
            photoDataUrl: photoPreview || undefined,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <fieldset className="space-y-6">
                <legend className="text-lg font-medium text-white">{t('Property Details')}</legend>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label htmlFor="street" className="block text-sm font-medium text-gray-300 mb-1">{t('Street Address')}</label>
                        <input type="text" name="street" id="street" value={formData.street} onChange={handleChange} required className="w-full bg-slate-700 border-slate-600 rounded-md text-white px-3 py-2 focus:ring-solar-green-400 focus:border-solar-green-400" placeholder={t('123 Sunshine Ln')} />
                    </div>
                    <div>
                        <label htmlFor="city" className="block text-sm font-medium text-gray-300 mb-1">{t('City')}</label>
                        <input type="text" name="city" id="city" value={formData.city} onChange={handleChange} required className="w-full bg-slate-700 border-slate-600 rounded-md text-white px-3 py-2 focus:ring-solar-green-400 focus:border-solar-green-400" placeholder={t('Sunville')} />
                    </div>
                    <div>
                        <label htmlFor="county" className="block text-sm font-medium text-gray-300 mb-1">{t('County / State')}</label>
                        <select name="county" id="county" value={formData.county} onChange={handleChange} required className="w-full bg-slate-700 border-slate-600 rounded-md text-white px-3 py-2 focus:ring-solar-green-400 focus:border-solar-green-400">
                            <option value="" disabled>{t('Select County')}</option>
                            {romanianCounties.map(county => <option key={county} value={county}>{county}</option>)}
                        </select>
                    </div>
                </div>
                 <div>
                    <label htmlFor="roofType" className="block text-sm font-medium text-gray-300 mb-1">{t('Roof Type')}</label>
                    <select name="roofType" id="roofType" value={formData.roofType} onChange={handleChange} className="w-full bg-slate-700 border-slate-600 rounded-md text-white px-3 py-2 focus:ring-solar-green-400 focus:border-solar-green-400">
                       {roofTypes.map(rt => <option key={rt.id} value={rt.name}>{t(rt.name) || rt.name}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="energyBill" className="block text-sm font-medium text-gray-300 mb-1">{t('Average Monthly Electric Bill ({currency_symbol}{amount})', { amount: formData.energyBill, currency_symbol: t('currency_symbol') })}</label>
                    <input type="range" name="energyBill" id="energyBill" min="250" max="5000" step="50" value={formData.energyBill} onChange={handleChange} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-solar-green-400" />
                </div>
                <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-300 mb-1">{t('Additional Notes (optional)')}</label>
                    <textarea name="notes" id="notes" value={formData.notes} onChange={handleChange} rows={3} className="w-full bg-slate-700 border-slate-600 rounded-md text-white px-3 py-2 focus:ring-solar-green-400 focus:border-solar-green-400" placeholder={t('e.g., new roof, any shading concerns, etc.')}></textarea>
                </div>
                 <div className="flex items-center">
                    <input
                        id="wantsBattery"
                        name="wantsBattery"
                        type="checkbox"
                        checked={formData.wantsBattery}
                        onChange={handleChange}
                        className="h-4 w-4 rounded border-gray-300 text-solar-green-600 focus:ring-solar-green-500 bg-slate-700"
                    />
                    <label htmlFor="wantsBattery" className="ml-2 block text-sm text-gray-300">
                        {t('I am interested in a battery backup solution')}
                    </label>
                </div>
                <div>
                    <label htmlFor="photo" className="block text-sm font-medium text-gray-300 mb-1">{t('Upload a Photo (optional)')}</label>
                    <div className="mt-2 flex items-center gap-4">
                        {photoPreview ? (
                            <img src={photoPreview} alt={t('Property preview')} className="h-16 w-16 rounded-md object-cover" />
                        ) : (
                            <div className="h-16 w-16 rounded-md bg-slate-700 flex items-center justify-center">
                                <Icon name="camera" className="h-8 w-8 text-gray-400" />
                            </div>
                        )}
                        <input type="file" name="photo" id="photo" onChange={handleFileChange} accept="image/*" className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-solar-green-700 file:text-solar-green-100 hover:file:bg-solar-green-600"/>
                    </div>
                </div>
            </fieldset>

            <div className="mt-6 pt-6 border-t border-slate-700 flex justify-end">
                <Button type="submit" size="lg" isLoading={isSubmitting} icon={isSubmitting ? null : <Icon name="bolt" className="w-5 h-5"/>}>
                    {t('Submit Project for Quotes')}
                </Button>
            </div>
        </form>
    );
};

export default ProjectForm;