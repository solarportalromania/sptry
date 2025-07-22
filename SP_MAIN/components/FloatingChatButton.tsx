
import React from 'react';
import Icon from './Icon';
import { useLanguage } from './LanguageContext';

interface FloatingChatButtonProps {
    onChatWithAdmin: () => void;
}

const FloatingChatButton: React.FC<FloatingChatButtonProps> = ({ onChatWithAdmin }) => {
    const { t } = useLanguage();
    return (
        <button
            onClick={onChatWithAdmin}
            className="fixed bottom-6 right-6 bg-solar-green-500 hover:bg-solar-green-600 text-white rounded-full p-4 shadow-lg z-50 transition-transform duration-200 ease-in-out hover:scale-110"
            aria-label={t('Chat with Admin')}
        >
            <Icon name="chat" className="w-8 h-8" />
        </button>
    );
};

export default FloatingChatButton;
