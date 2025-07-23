import React, { useState } from 'react';
import { RoofType, ProjectWithDetails } from '../types';
import Card from './Card';
import Button from './Button';
import Icon from './Icon';
import { useLanguage } from './LanguageContext';
import { romanianCounties } from '../constants';

interface ProjectEditModalProps {
  project: ProjectWithDetails;
  onClose: () => void;
  onSave: (updatedProject: ProjectWithDetails) => void;
  roofTypes: RoofType[];
}

const ProjectEditModal: React.FC<ProjectEditModalProps> = ({ project, onClose, onSave, roofTypes }) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    street: project.address.street,
    city: project.address.city,
    county: project.address.county,
    energyBill: project.energyBill,
    roofType: project.roofType,
    notes: project.notes || '',
    photoDataUrl: project.photoDataUrl || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'energyBill' ? Number(value) : value }));
  };
  
   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, photoDataUrl: reader.result as string}));
            };
            reader.readAsDataURL(file);
        }
    };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedProject: ProjectWithDetails = {
      ...project,
      address: {
        street: formData.street,
        city: formData.city,
        county: formData.county,
      },
      energyBill: formData.energyBill,
      roofType: formData.roofType,
      notes: formData.notes,
      photoDataUrl: formData.photoDataUrl,
    };
    onSave(updatedProject);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <Card className="w-full max-w-2xl bg-slate-800 border-slate-700 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-between items-start">
            <h3 className="text-xl font-bold text-white">{t('Edit Project')}</h3>
            <button type="button" onClick={onClose} className="text-gray-400 hover:text-white text-3xl leading-none">&times;</button>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-white">{project.homeowner.name}</h4>
             <div>
                <label htmlFor="street" className="block text-sm font-medium text-gray-300 mb-1">{t('Street Address')}</label>
                <input type="text" name="street" id="street" value={formData.street} onChange={handleChange} className="w-full bg-slate-700 border-slate-600 rounded-md text-white px-3 py-2" />
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-300 mb-1">{t('City')}</label>
                    <input type="text" name="city" id="city" value={formData.city} onChange={handleChange} className="w-full bg-slate-700 border-slate-600 rounded-md text-white px-3 py-2" />
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
              <textarea name="notes" id="notes" value={formData.notes} onChange={handleChange} rows={3} className="w-full bg-slate-700 border-slate-600 rounded-md text-white px-3 py-2"></textarea>
            </div>
            <div>
                <label htmlFor="photo" className="block text-sm font-medium text-gray-300 mb-1">{t('Upload a Photo (optional)')}</label>
                <div className="mt-2 flex items-center gap-4">
                    {formData.photoDataUrl ? (
                        <img src={formData.photoDataUrl} alt={t('Property preview')} className="h-16 w-16 rounded-md object-cover" />
                    ) : (
                        <div className="h-16 w-16 rounded-md bg-slate-700 flex items-center justify-center">
                            <Icon name="camera" className="h-8 w-8 text-gray-400" />
                        </div>
                    )}
                    <input type="file" name="photo" id="photo" onChange={handleFileChange} accept="image/*" className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-solar-green-700 file:text-solar-green-100 hover:file:bg-solar-green-600"/>
                </div>
            </div>
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

export default ProjectEditModal;