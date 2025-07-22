
import React, { useState } from 'react';
import { EquipmentBrand, PanelModel, InverterModel, BatteryModel, EquipmentType, HistoryLog } from '../types';
import Card from './Card';
import Button from './Button';
import Icon from './Icon';
import { useLanguage } from './LanguageContext';
import EquipmentEditModal from './EquipmentEditModal';
import ConfirmationModal from './ConfirmationModal';

interface EquipmentSettingsTabProps {
    onBack: () => void;
    equipmentBrands: EquipmentBrand[];
    panelModels: PanelModel[];
    inverterModels: InverterModel[];
    batteryModels: BatteryModel[];
    onEquipmentChange: (type: 'brands' | 'panelModels' | 'inverterModels' | 'batteryModels', data: any[]) => void;
    logAction: (action: string, target: HistoryLog['target']) => void;
}

const EquipmentSettingsTab: React.FC<EquipmentSettingsTabProps> = (props) => {
    const { 
        onBack, equipmentBrands, panelModels, inverterModels, batteryModels,
        onEquipmentChange, logAction 
    } = props;
    
    const { t } = useLanguage();
    const [editingItem, setEditingItem] = useState<{ type: 'brand' | 'panel' | 'inverter' | 'battery', item: any | 'new' } | null>(null);
    const [confirmation, setConfirmation] = useState<{ title: string; message: string; onConfirm: () => void; } | null>(null);

    const handleSave = (type: 'brands' | 'panelModels' | 'inverterModels' | 'batteryModels', item: any) => {
        const itemArray = {
            brands: equipmentBrands,
            panelModels,
            inverterModels,
            batteryModels
        }[type];
        
        let updatedArray;
        let action;

        if (item.id.startsWith('new-')) {
            const newItem = { ...item, id: `${type.slice(0, -1)}-${Date.now()}` };
            updatedArray = [...itemArray, newItem];
            action = 'created';
        } else {
            updatedArray = itemArray.map(i => i.id === item.id ? item : i);
            action = 'edited';
        }
        onEquipmentChange(type, updatedArray);
        logAction(`Equipment item ${action}: ${item.name}`, {type: 'equipment', id: item.id, name: item.name });
    };

    const handleDelete = (type: 'brands' | 'panelModels' | 'inverterModels' | 'batteryModels', itemId: string) => {
        const itemArray = {
            brands: equipmentBrands,
            panelModels,
            inverterModels,
            batteryModels
        }[type];

        const itemToDelete = itemArray.find(i => i.id === itemId);
        if(!itemToDelete) return;

        setConfirmation({
            title: t('Delete') + ' ' + t('Equipment'),
            message: t('ConfirmDeleteItem'),
            onConfirm: () => {
                setConfirmation(null); // Close before action
                const updatedArray = itemArray.filter(i => i.id !== itemId);
                onEquipmentChange(type, updatedArray);
                logAction(`Equipment item deleted: ${itemToDelete.name}`, {type: 'equipment', id: itemId, name: itemToDelete.name });
            }
        });
    };

    const renderSection = (titleKey: string, type: EquipmentType, brands: EquipmentBrand[], models: (PanelModel | InverterModel | BatteryModel)[]) => {
        return (
            <Card>
                <h3 className="text-xl font-bold text-white mb-4">{t(titleKey)}</h3>
                <div className="space-y-4">
                    {brands.map(brand => (
                        <div key={brand.id} className="p-3 bg-slate-900/50 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="font-semibold text-white">{brand.name}</h4>
                                <div className="flex gap-2">
                                    <Button size="sm" variant="secondary" onClick={() => setEditingItem({ type: 'brand', item: brand })} icon={<Icon name="edit" className="w-4 h-4"/>} />
                                    <Button size="sm" variant="danger" onClick={() => handleDelete('brands', brand.id)} icon={<Icon name="trash" className="w-4 h-4"/>} />
                                </div>
                            </div>
                            <div className="pl-4 border-l-2 border-slate-700 space-y-2">
                                {models.filter(m => m.brandId === brand.id).map(model => (
                                    <div key={model.id} className="flex justify-between items-center">
                                        <p className="text-sm text-gray-300">{model.name}</p>
                                        <div className="flex gap-2">
                                            <Button size="sm" variant="secondary" onClick={() => setEditingItem({ type, item: model })} icon={<Icon name="edit" className="w-4 h-4"/>} />
                                            <Button size="sm" variant="danger" onClick={() => handleDelete(`${type}Models` as any, model.id)} icon={<Icon name="trash" className="w-4 h-4"/>} />
                                        </div>
                                    </div>
                                ))}
                                 <Button size="sm" variant="secondary" onClick={() => setEditingItem({ type, item: 'new' })}>{t('Add Model')}</Button>
                            </div>
                        </div>
                    ))}
                     <Button variant="secondary" onClick={() => setEditingItem({ type: 'brand', item: 'new' })}>{t('Add Brand')}</Button>
                </div>
            </Card>
        );
    }


    return (
        <div className="space-y-8">
            {editingItem && (
                <EquipmentEditModal 
                    item={editingItem.item}
                    type={editingItem.type}
                    brands={equipmentBrands}
                    onClose={() => setEditingItem(null)}
                    onSave={handleSave}
                />
            )}
            {confirmation && (
                <ConfirmationModal
                    isOpen={!!confirmation}
                    title={confirmation.title}
                    message={confirmation.message}
                    onConfirm={confirmation.onConfirm}
                    onClose={() => setConfirmation(null)}
                />
            )}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">{t('Manage Equipment')}</h2>
                 <Button variant="secondary" onClick={onBack} icon={<Icon name="arrow-left" className="w-4 h-4" />}>
                    {t('Back to Settings')}
                </Button>
            </div>
            {renderSection('Panel Brands', 'panel', equipmentBrands.filter(b => b.type === 'panel'), panelModels)}
            {renderSection('Inverter Brands', 'inverter', equipmentBrands.filter(b => b.type === 'inverter'), inverterModels)}
            {renderSection('Battery Brands', 'battery', equipmentBrands.filter(b => b.type === 'battery'), batteryModels)}
        </div>
    );
};

export default EquipmentSettingsTab;
