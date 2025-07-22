
import React, { useState } from 'react';
import Card from './Card';
import Button from './Button';
import { useLanguage } from './LanguageContext';

interface MarkAsSignedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmSign: (finalPrice: number) => void;
  currentPrice: number;
}

const MarkAsSignedModal: React.FC<MarkAsSignedModalProps> = ({ isOpen, onClose, onConfirmSign, currentPrice }) => {
  const { t } = useLanguage();
  const [finalPrice, setFinalPrice] = useState(currentPrice);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmSign(finalPrice);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <Card className="w-full max-w-lg bg-slate-800 border-slate-700" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-between items-start">
            <h3 className="text-xl font-bold text-white">{t('Mark as Signed')}</h3>
            <button type="button" onClick={onClose} className="text-gray-400 hover:text-white text-3xl leading-none">&times;</button>
          </div>
          
          <p className="text-gray-300">{t('Please confirm the final price for this project. This action cannot be undone.')}</p>

          <div>
            <label htmlFor="finalPrice" className="block text-sm font-medium text-gray-300 mb-1">{t('Final Price')} ({t('currency_symbol')})</label>
            <input 
              type="number" 
              name="finalPrice" 
              id="finalPrice" 
              value={finalPrice} 
              onChange={(e) => setFinalPrice(Number(e.target.value))} 
              required 
              className="w-full bg-slate-700 border-slate-600 rounded-md text-white px-3 py-2"
              step="100"
            />
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t border-slate-700">
            <Button type="button" variant="secondary" onClick={onClose}>{t('Cancel')}</Button>
            <Button type="submit" variant="primary">{t('Confirm')}</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default MarkAsSignedModal;
