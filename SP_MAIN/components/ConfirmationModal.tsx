
import React from 'react';
import Card from './Card';
import Button from './Button';
import Icon from './Icon';
import { useLanguage } from './LanguageContext';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
  const { t } = useLanguage();

  if (!isOpen) return null;

  const handleConfirmClick = () => {
    onConfirm();
    // The calling component is now responsible for closing the modal
    // This prevents a race condition where the parent unmounts before this modal tries to close itself
  };

  return (
    <div
      className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <Card
        className="w-full max-w-md bg-slate-800 border-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-500/20 mb-6">
                <Icon name="exclamation-triangle" className="h-10 w-10 text-yellow-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
            <p className="text-gray-300 mb-6">{message}</p>
            <div className="flex justify-center gap-4">
                <Button onClick={onClose} variant="secondary" size="lg" className="w-full">
                    {t('Cancel')}
                </Button>
                <Button onClick={handleConfirmClick} variant="primary" size="lg" className="w-full">
                    {t('Confirm')}
                </Button>
            </div>
        </div>
      </Card>
    </div>
  );
};

export default ConfirmationModal;
