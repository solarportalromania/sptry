
import React, { useState } from 'react';
import Card from './Card';
import Button from './Button';
import StarRating from './StarRating';
import { useLanguage } from './LanguageContext';
import { ProjectWithDetails, Installer } from '../types';

interface LeaveReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => void;
  project: ProjectWithDetails;
  installer: Installer;
}

const LeaveReviewModal: React.FC<LeaveReviewModalProps> = ({ isOpen, onClose, onSubmit, project, installer }) => {
  const { t } = useLanguage();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating > 0) {
      onSubmit(rating, comment);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <Card className="w-full max-w-lg bg-slate-800 border-slate-700" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-between items-start">
            <h3 className="text-xl font-bold text-white">{t('Leave a Review')} for {installer.name}</h3>
            <button type="button" onClick={onClose} className="text-gray-400 hover:text-white text-3xl leading-none">&times;</button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">{t('Rating')}</label>
              <StarRating rating={rating} onRatingChange={setRating} size="lg" />
            </div>
            <div>
              <label htmlFor="comment" className="block text-sm font-medium text-gray-300 mb-1">{t('Comment')}</label>
              <textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={5}
                className="w-full bg-slate-700 border-slate-600 rounded-md text-white px-3 py-2"
                placeholder={t('Share your experience...')}
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t border-slate-700">
            <Button type="button" variant="secondary" onClick={onClose}>{t('Cancel')}</Button>
            <Button type="submit" variant="primary" disabled={rating === 0}>{t('Submit Review')}</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default LeaveReviewModal;
