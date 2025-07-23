



import React, { useState, useEffect, useMemo } from 'react';
import { Quote, ProjectWithDetails, EquipmentBrand, PanelModel, InverterModel, BatteryModel } from '../types';
import Card from './Card';
import Button from './Button';
import { useLanguage } from './LanguageContext';

interface SubmitQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (quoteData: Omit<Quote, 'id' | 'installerId'>) => void;
  lead: ProjectWithDetails;
  existingQuote?: Quote | null;
  equipmentBrands: EquipmentBrand[];
  panelModels: PanelModel[];
  inverterModels: InverterModel[];
  batteryModels: BatteryModel[];
}

const SubmitQuoteModal: React.FC<SubmitQuoteModalProps> = (props) => {
    const { 
        isOpen, onClose, onSubmit, lead, existingQuote,
        equipmentBrands, panelModels, inverterModels, batteryModels
    } = props;
    
    const { t } = useLanguage();
    
    const initialFormData = {
        price: 50000,
        priceWithoutBattery: 0,
        systemSizeKw: 6.5,
        estimatedAnnualProduction: 8000,
        warranty: '25-Year Panel, 10-Year Inverter',
        panelBrandId: '',
        panelModelId: '',
        inverterBrandId: '',
        inverterModelId: '',
        includeBattery: false,
        batteryBrandId: '',
        batteryModelId: '',
    };
    
    const [formData, setFormData] = useState(initialFormData);

    useEffect(() => {
        if (existingQuote) {
            const panel = panelModels.find(m => m.id === existingQuote.panelModelId);
            const inverter = inverterModels.find(m => m.id === existingQuote.inverterModelId);
            const battery = batteryModels.find(m => m.id === existingQuote.batteryModelId);
            
            setFormData({
                price: existingQuote.price,
                priceWithoutBattery: existingQuote.priceWithoutBattery || 0,
                systemSizeKw: existingQuote.systemSizeKw,
                estimatedAnnualProduction: existingQuote.estimatedAnnualProduction,
                warranty: existingQuote.warranty,
                panelBrandId: panel?.brandId || '',
                panelModelId: existingQuote.panelModelId,
                inverterBrandId: inverter?.brandId || '',
                inverterModelId: existingQuote.inverterModelId,
                includeBattery: !!existingQuote.batteryModelId,
                batteryBrandId: battery?.brandId || '',
                batteryModelId: existingQuote.batteryModelId || '',
            });
        }
    }, [existingQuote, panelModels, inverterModels, batteryModels]);

    
    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;

        setFormData(prev => {
            let newState = { ...prev, [name]: (type === 'checkbox' ? (e.target as HTMLInputElement).checked : (e.target as HTMLInputElement).type === 'number' ? Number(value) : value) };
            // Reset model if brand changes
            if (name === 'panelBrandId') newState.panelModelId = '';
            if (name === 'inverterBrandId') newState.inverterModelId = '';
            if (name === 'batteryBrandId') newState.batteryModelId = '';
            return newState;
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const { panelBrandId, inverterBrandId, batteryBrandId, includeBattery, ...rest } = formData;
        
        const quoteData: Omit<Quote, 'id' | 'installerId'> = {
            ...rest,
            costBreakdown: {
                equipment: formData.price * 0.65,
                labor: formData.price * 0.30,
                permits: formData.price * 0.05,
            },
            batteryModelId: includeBattery ? rest.batteryModelId : undefined,
            priceWithoutBattery: includeBattery ? rest.priceWithoutBattery : undefined,
        };
        onSubmit(quoteData);
    };
    
    const { availablePanelModels, availableInverterModels, availableBatteryModels } = useMemo(() => {
        return {
            availablePanelModels: panelModels.filter(m => m.brandId === formData.panelBrandId),
            availableInverterModels: inverterModels.filter(m => m.brandId === formData.inverterBrandId),
            availableBatteryModels: batteryModels.filter(m => m.brandId === formData.batteryBrandId),
        }
    }, [formData, panelModels, inverterModels, batteryModels]);

    return (
        <div 
            className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <Card 
                className="w-full max-w-2xl bg-slate-800 border-slate-700 max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex justify-between items-start">
                        <h3 className="text-xl font-bold text-white">
                            {existingQuote ? t('Revise Quote') : t('Submit Quote')} for {lead.address.city}
                        </h3>
                         <button type="button" onClick={onClose} className="text-gray-400 hover:text-white text-3xl leading-none">&times;</button>
                    </div>

                    <fieldset className="space-y-4">
                        <legend className="text-lg font-medium text-white">{t('Equipment Details')}</legend>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div>
                                <label htmlFor="panelBrandId" className="block text-sm font-medium text-gray-300 mb-1">{t('Panel Brands')}</label>
                                <select name="panelBrandId" id="panelBrandId" value={formData.panelBrandId} onChange={handleChange} required className="w-full bg-slate-700 border-slate-600 rounded-md text-white px-3 py-2">
                                    <option value="" disabled>{t('Select Panel Brand')}</option>
                                    {equipmentBrands.filter(b => b.type === 'panel').map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="panelModelId" className="block text-sm font-medium text-gray-300 mb-1">{t('Panel Models')}</label>
                                <select name="panelModelId" id="panelModelId" value={formData.panelModelId} onChange={handleChange} required className="w-full bg-slate-700 border-slate-600 rounded-md text-white px-3 py-2" disabled={!formData.panelBrandId}>
                                    <option value="" disabled>{t('Select Panel Model')}</option>
                                    {availablePanelModels.map(m => <option key={m.id} value={m.id}>{m.name} - {m.wattage}W</option>)}
                                </select>
                            </div>
                        </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div>
                                <label htmlFor="inverterBrandId" className="block text-sm font-medium text-gray-300 mb-1">{t('Inverter Brands')}</label>
                                <select name="inverterBrandId" id="inverterBrandId" value={formData.inverterBrandId} onChange={handleChange} required className="w-full bg-slate-700 border-slate-600 rounded-md text-white px-3 py-2">
                                    <option value="" disabled>{t('Select Inverter Brand')}</option>
                                    {equipmentBrands.filter(b => b.type === 'inverter').map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="inverterModelId" className="block text-sm font-medium text-gray-300 mb-1">{t('Inverter Models')}</label>
                                <select name="inverterModelId" id="inverterModelId" value={formData.inverterModelId} onChange={handleChange} required className="w-full bg-slate-700 border-slate-600 rounded-md text-white px-3 py-2" disabled={!formData.inverterBrandId}>
                                    <option value="" disabled>{t('Select Inverter Model')}</option>
                                    {availableInverterModels.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                </select>
                            </div>
                        </div>
                    </fieldset>
                    
                    <fieldset className="space-y-4 p-4 border border-slate-700 rounded-md">
                        <div className="flex items-center">
                            <input
                                id="includeBattery"
                                name="includeBattery"
                                type="checkbox"
                                checked={formData.includeBattery}
                                onChange={handleChange}
                                className="h-4 w-4 rounded border-gray-300 text-solar-green-600 focus:ring-solar-green-500 bg-slate-700"
                            />
                            <label htmlFor="includeBattery" className="ml-2 block text-sm font-medium text-gray-200">
                                {t('Add Battery Option')}
                            </label>
                        </div>
                        {formData.includeBattery && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-700">
                                <div>
                                    <label htmlFor="batteryBrandId" className="block text-sm font-medium text-gray-300 mb-1">{t('Battery Brands')}</label>
                                    <select name="batteryBrandId" id="batteryBrandId" value={formData.batteryBrandId} onChange={handleChange} required={formData.includeBattery} className="w-full bg-slate-700 border-slate-600 rounded-md text-white px-3 py-2">
                                        <option value="" disabled>{t('Select Battery Brand')}</option>
                                        {equipmentBrands.filter(b => b.type === 'battery').map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                    </select>
                                </div>
                                 <div>
                                    <label htmlFor="batteryModelId" className="block text-sm font-medium text-gray-300 mb-1">{t('Battery Models')}</label>
                                    <select name="batteryModelId" id="batteryModelId" value={formData.batteryModelId} onChange={handleChange} required={formData.includeBattery} className="w-full bg-slate-700 border-slate-600 rounded-md text-white px-3 py-2" disabled={!formData.batteryBrandId}>
                                        <option value="" disabled>{t('Select Battery Model')}</option>
                                        {availableBatteryModels.map(m => <option key={m.id} value={m.id}>{m.name} - {m.capacityKwh}kWh</option>)}
                                    </select>
                                </div>
                            </div>
                        )}
                    </fieldset>


                     <fieldset className="space-y-4">
                        <legend className="text-lg font-medium text-white">{t('Financials & Performance')}</legend>
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label htmlFor="price" className="block text-sm font-medium text-gray-300 mb-1">{t('Total Price ({currency_symbol})', { currency_symbol: t('currency_symbol') })}</label>
                                <input type="number" name="price" id="price" value={formData.price} onChange={handleChange} required className="w-full bg-slate-700 border-slate-600 rounded-md text-white px-3 py-2" step="500" />
                            </div>
                            <div>
                                <label htmlFor="systemSizeKw" className="block text-sm font-medium text-gray-300 mb-1">{t('System Size (kW)')}</label>
                                <input type="number" name="systemSizeKw" id="systemSizeKw" value={formData.systemSizeKw} onChange={handleChange} required className="w-full bg-slate-700 border-slate-600 rounded-md text-white px-3 py-2" step="0.1" />
                            </div>
                            <div>
                                <label htmlFor="estimatedAnnualProduction" className="block text-sm font-medium text-gray-300 mb-1">{t('Estimated Annual Production (kWh)')}</label>
                                <input type="number" name="estimatedAnnualProduction" id="estimatedAnnualProduction" value={formData.estimatedAnnualProduction} onChange={handleChange} required className="w-full bg-slate-700 border-slate-600 rounded-md text-white px-3 py-2" step="100" />
                            </div>
                         </div>
                         {formData.includeBattery && (
                           <div>
                                <label htmlFor="priceWithoutBattery" className="block text-sm font-medium text-gray-300 mb-1">{t('Price without battery')} ({t('currency_symbol')})</label>
                                <input type="number" name="priceWithoutBattery" id="priceWithoutBattery" value={formData.priceWithoutBattery} onChange={handleChange} required className="w-full bg-slate-700 border-slate-600 rounded-md text-white px-3 py-2" step="500" />
                           </div>
                         )}
                    </fieldset>

                    <fieldset>
                        <label htmlFor="warranty" className="block text-sm font-medium text-gray-300 mb-1">{t('Warranty Details')}</label>
                        <input type="text" name="warranty" id="warranty" value={formData.warranty} onChange={handleChange} required className="w-full bg-slate-700 border-slate-600 rounded-md text-white px-3 py-2" placeholder={t('e.g., 25-Year Panel, 10-Year Inverter')} />
                    </fieldset>

                    <div className="flex justify-end gap-4 pt-4 border-t border-slate-700">
                        <Button type="button" variant="secondary" onClick={onClose}>{t('Cancel')}</Button>
                        <Button type="submit" variant="primary" disabled={!formData.panelModelId || !formData.inverterModelId || (formData.includeBattery && !formData.batteryModelId)}>
                          {existingQuote ? t('Save Changes') : t('Submit Quote')}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default SubmitQuoteModal;