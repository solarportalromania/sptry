


import React from 'react';
import { Project, RoofType } from '../types';
import Card from './Card';
import Button from './Button';
import { useLanguage } from './LanguageContext';
import ProjectForm from './ProjectForm';

interface ProjectFormModalProps {
    onClose: () => void;
    onProjectSubmit: (projectData: Omit<Project, 'id' | 'quotes' | 'status' | 'createdAt' | 'reviewSubmitted'>) => void;
    isSubmitting: boolean;
    homeownerId: string;
    roofTypes: RoofType[];
}

const ProjectFormModal: React.FC<ProjectFormModalProps> = ({ onClose, onProjectSubmit, isSubmitting, homeownerId, roofTypes }) => {
    const { t } = useLanguage();

    const handleSubmit = (data: Omit<Project, 'id' | 'homeownerId' | 'quotes' | 'status' | 'createdAt' | 'reviewSubmitted'>) => {
        onProjectSubmit({
            ...data,
            homeownerId,
        });
        if(!isSubmitting){
            onClose();
        }
    }

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <Card className="w-full max-w-2xl bg-slate-800 border-slate-700 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                 <div className="flex justify-between items-start mb-6">
                    <h3 className="text-xl font-bold text-white">{t('Create a New Project')}</h3>
                    <button type="button" onClick={onClose} className="text-gray-400 hover:text-white text-3xl leading-none">&times;</button>
                </div>
                <ProjectForm onSubmit={handleSubmit} isSubmitting={isSubmitting} roofTypes={roofTypes} />
            </Card>
        </div>
    );
};

export default ProjectFormModal;