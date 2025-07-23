
import React, { useState } from 'react';
import { ProjectWithDetails } from '../types';
import Card from './Card';
import Button from './Button';
import Icon from './Icon';
import { useLanguage } from './LanguageContext';

interface ProjectApprovalModalProps {
  project: ProjectWithDetails;
  onClose: () => void;
  onConfirmApproval: (projectId: string, photoDataUrl?: string) => void;
}

export const ProjectApprovalModal: React.FC<ProjectApprovalModalProps> = ({ project, onClose, onConfirmApproval }) => {
  const { t } = useLanguage();
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(project.photoDataUrl || null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoDataUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmApproval(project.id, photoDataUrl || undefined);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <Card className="w-full max-w-lg bg-slate-800 border-slate-700" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-between items-start">
            <h3 className="text-xl font-bold text-white">{t('Approve Project')}</h3>
            <button type="button" onClick={onClose} className="text-gray-400 hover:text-white text-3xl leading-none">&times;</button>
          </div>

          <p className="text-gray-300">{t('optional_approve_photo_desc')}</p>

          <div>
            <label htmlFor="photo" className="block text-sm font-medium text-gray-300 mb-1">{t('Project Photo')}</label>
            <div className="mt-2 flex items-center gap-4">
              {photoDataUrl ? (
                <img src={photoDataUrl} alt={t('Property preview')} className="h-24 w-24 rounded-md object-cover" />
              ) : (
                <div className="h-24 w-24 rounded-md bg-slate-700 flex items-center justify-center">
                  <Icon name="camera" className="h-10 w-10 text-gray-400" />
                </div>
              )}
              <input type="file" name="photo" id="photo" onChange={handleFileChange} accept="image/*" className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-solar-green-700 file:text-solar-green-100 hover:file:bg-solar-green-600" />
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t border-slate-700">
            <Button type="button" variant="secondary" onClick={onClose}>{t('Cancel')}</Button>
            <Button type="submit" variant="primary">{t('Confirm & Approve')}</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
