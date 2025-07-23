
import React, { useState } from 'react';
import { BlogPost } from '../types';
import Card from './Card';
import Button from './Button';
import { useLanguage } from './LanguageContext';
import Icon from './Icon';

interface BlogEditModalProps {
  post: BlogPost | null;
  onClose: () => void;
  onSave: (postData: Omit<BlogPost, 'id' | 'authorId' | 'createdAt' | 'status'>) => void;
}

const BlogEditModal: React.FC<BlogEditModalProps> = ({ post, onClose, onSave }) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    title: post?.title || { en: '', ro: '' },
    content: post?.content || { en: '', ro: '' },
    imageDataUrl: post?.imageDataUrl || '',
  });

  const handleBilingualChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: 'title' | 'content', lang: 'en' | 'ro') => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        [lang]: value,
      }
    }));
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          const reader = new FileReader();
          reader.onloadend = () => {
              setFormData(prev => ({...prev, imageDataUrl: reader.result as string}));
          };
          reader.readAsDataURL(file);
      }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title.en && formData.title.ro && formData.content.en && formData.content.ro && formData.imageDataUrl) {
      onSave(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <Card className="w-full max-w-3xl bg-slate-800 border-slate-700 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-between items-start">
            <h3 className="text-xl font-bold text-white">{post ? t('Edit Post') : t('Add New Post')}</h3>
            <button type="button" onClick={onClose} className="text-gray-400 hover:text-white text-3xl leading-none">&times;</button>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="title-en" className="block text-sm font-medium text-gray-300 mb-1">{t('Title (English)')}</label>
                  <input type="text" name="title-en" id="title-en" value={formData.title.en} onChange={(e) => handleBilingualChange(e, 'title', 'en')} required className="w-full bg-slate-700 border-slate-600 rounded-md text-white px-3 py-2" />
                </div>
                <div>
                  <label htmlFor="title-ro" className="block text-sm font-medium text-gray-300 mb-1">{t('Title (Romanian)')}</label>
                  <input type="text" name="title-ro" id="title-ro" value={formData.title.ro} onChange={(e) => handleBilingualChange(e, 'title', 'ro')} required className="w-full bg-slate-700 border-slate-600 rounded-md text-white px-3 py-2" />
                </div>
            </div>
            <div>
                <label htmlFor="imageDataUrl" className="block text-sm font-medium text-gray-300 mb-1">{t('Image')}</label>
                <div className="mt-2 flex items-center gap-4">
                    {formData.imageDataUrl ? (
                        <img src={formData.imageDataUrl} alt={t('Image preview')} className="h-20 w-32 rounded-md object-cover" />
                    ) : (
                        <div className="h-20 w-32 rounded-md bg-slate-700 flex items-center justify-center">
                            <Icon name="camera" className="h-8 w-8 text-gray-400" />
                        </div>
                    )}
                    <input type="file" name="imageDataUrl" id="imageDataUrl" onChange={handleFileChange} required={!post} accept="image/*" className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-solar-green-700 file:text-solar-green-100 hover:file:bg-solar-green-600"/>
                </div>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="content-en" className="block text-sm font-medium text-gray-300 mb-1">{t('Content (English)')}</label>
                  <textarea name="content-en" id="content-en" value={formData.content.en} onChange={(e) => handleBilingualChange(e, 'content', 'en')} required rows={10} className="w-full bg-slate-700 border-slate-600 rounded-md text-white px-3 py-2"></textarea>
                </div>
                 <div>
                  <label htmlFor="content-ro" className="block text-sm font-medium text-gray-300 mb-1">{t('Content (Romanian)')}</label>
                  <textarea name="content-ro" id="content-ro" value={formData.content.ro} onChange={(e) => handleBilingualChange(e, 'content', 'ro')} required rows={10} className="w-full bg-slate-700 border-slate-600 rounded-md text-white px-3 py-2"></textarea>
                </div>
             </div>
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

export default BlogEditModal;
