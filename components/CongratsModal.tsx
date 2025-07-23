
import React from 'react';
import Card from './Card';
import Button from './Button';
import Icon from './Icon';
import { useLanguage } from './LanguageContext';

interface CongratsModalProps {
  title: string;
  message: string;
  onClose: () => void;
}

const CongratsModal: React.FC<CongratsModalProps> = ({ title, message, onClose }) => {
  const { t } = useLanguage();

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <Card className="w-full max-w-md bg-slate-800 border-solar-green-500 border-2" onClick={(e) => e.stopPropagation()}>
        <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-solar-green-500 mb-6">
                <Icon name="check" className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
            <p className="text-gray-300 mb-6">{message}</p>
            <Button onClick={onClose} size="lg" className="w-full">
                {t('Great!')}
            </Button>
        </div>
      </Card>
    </div>
  );
};

export default CongratsModal;
