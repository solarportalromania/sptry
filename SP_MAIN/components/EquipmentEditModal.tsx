
import React, { useState, useEffect } from 'react';
import { EquipmentBrand, PanelModel, InverterModel, BatteryModel, EquipmentType } from '../types';
import Card from './Card';
import Button from './Button';
import { useLanguage } from './LanguageContext';

type ItemType = 'brand' | 'panel' | 'inverter' | 'battery';

interface EquipmentEditModalProps {
  item: any | 'new';
  type: ItemType;
  brands: EquipmentBrand[];
  onClose: () => void;
  onSave: (type: 'brands' | 'panelModels' | 'inverterModels' | 'batteryModels', data: any) => void;
}

const EquipmentEditModal: React.FC<EquipmentEditModalProps> = ({ item, type, brands, onClose, onSave }) => {
    const { t } = useLanguage();
    const isNew = item === 'new';
    
    const getInitialState = () => {
        if(isNew){
             return { id: `new-${Date.now()}`, name: '', brandId: '', wattage: 450, efficiency: 21.0, capacityKwh: 10, type: type === 'brand' ? 'panel' : type };
        }
        return item;
    }
    
    const [formData, setFormData] = useState(getInitialState());

    useEffect(() => {
        setFormData(getInitialState());
    }, [item, type]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev, [name]: (e.target.type === 'number') ? Number(value) : value }));
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        let saveType: 'brands' | 'panelModels' | 'inverterModels' | 'batteryModels' = 'brands';
        if (type === 'panel') saveType = 'panelModels';
        else if (type === 'inverter') saveType = 'inverterModels';
        else if (type === 'battery') saveType = 'batteryModels';
        
        onSave(saveType, formData);
        onClose();
    };

    const renderFields = () => {
        switch (type) {
            case 'brand':
                return (
                    <>
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">{t('Brand Name')}</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full bg-slate-700 border-slate-600 rounded-md text-white px-3 py-2" />
                        </div>
                        <div>
                            <label htmlFor="type" className="block text-sm font-medium text-gray-300 mb-1">{t('Equipment Type')}</label>
                             <select name="type" value={formData.type} onChange={handleChange} required className="w-full bg-slate-700 border-slate-600 rounded-md text-white px-3 py-2">
                                <option value="panel">{t('Panel')}</option>
                                <option value="inverter">{t('Inverter')}</option>
                                <option value="battery">{t('Battery')}</option>
                             </select>
                        </div>
                    </>
                );
            case 'panel':
            case 'inverter':
            case 'battery':
                 const filteredBrands = brands.filter(b => b.type === type);
                 return (
                    <>
                        <div>
                            <label htmlFor="brandId" className="block text-sm font-medium text-gray-300 mb-1">{t('Brand Name')}</label>
                             <select name="brandId" value={formData.brandId} onChange={handleChange} required className="w-full bg-slate-700 border-slate-600 rounded-md text-white px-3 py-2">
                                <option value="" disabled>{t('Select Brand')}</option>
                                {filteredBrands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                             </select>
                        </div>
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">{t('Model Name')}</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full bg-slate-700 border-slate-600 rounded-md text-white px-3 py-2" />
                        </div>
                        {type === 'panel' && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="wattage" className="block text-sm font-medium text-gray-300 mb-1">{t('Wattage')}</label>
                                    <input type="number" name="wattage" value={formData.wattage} onChange={handleChange} required className="w-full bg-slate-700 border-slate-600 rounded-md text-white px-3 py-2" />
                                </div>
                                <div>
                                    <label htmlFor="efficiency" className="block text-sm font-medium text-gray-300 mb-1">{t('Efficiency')}</label>
                                    <input type="number" step="0.1" name="efficiency" value={formData.efficiency} onChange={handleChange} required className="w-full bg-slate-700 border-slate-600 rounded-md text-white px-3 py-2" />
                                </div>
                            </div>
                        )}
                         {type === 'inverter' && (
                             <div>
                                <label htmlFor="efficiency" className="block text-sm font-medium text-gray-300 mb-1">{t('Efficiency')}</label>
                                <input type="number" step="0.1" name="efficiency" value={formData.efficiency} onChange={handleChange} required className="w-full bg-slate-700 border-slate-600 rounded-md text-white px-3 py-2" />
                            </div>
                         )}
                         {type === 'battery' && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="capacityKwh" className="block text-sm font-medium text-gray-300 mb-1">{t('Capacity (kWh)')}</label>
                                    <input type="number" step="0.1" name="capacityKwh" value={formData.capacityKwh} onChange={handleChange} required className="w-full bg-slate-700 border-slate-600 rounded-md text-white px-3 py-2" />
                                </div>
                                <div>
                                    <label htmlFor="efficiency" className="block text-sm font-medium text-gray-300 mb-1">{t('Efficiency')}</label>
                                    <input type="number" step="0.1" name="efficiency" value={formData.efficiency} onChange={handleChange} required className="w-full bg-slate-700 border-slate-600 rounded-md text-white px-3 py-2" />
                                </div>
                            </div>
                        )}
                    </>
                );
        }
    }
    
    const getTitle = () => {
        const action = isNew ? t('Add') : t('Edit');
        const itemType = type === 'brand' ? t('Brand') : t('Model');
        return `${action} ${itemType}`;
    }

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <Card className="w-full max-w-lg bg-slate-800 border-slate-700" onClick={(e) => e.stopPropagation()}>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex justify-between items-start">
                        <h3 className="text-xl font-bold text-white">{getTitle()}</h3>
                        <button type="button" onClick={onClose} className="text-gray-400 hover:text-white text-3xl leading-none">&times;</button>
                    </div>
                    
                    <div className="space-y-4">
                        {renderFields()}
                    </div>

                    <div className="flex justify-end gap-4 pt-4 border-t border-slate-700">
                        <Button type="button" variant="secondary" onClick={onClose}>{t('Cancel')}</Button>
                        <Button type="submit" variant="primary">{t('Save')}</Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default EquipmentEditModal;
