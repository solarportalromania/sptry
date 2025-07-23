import React, { useState, useEffect, useRef } from 'react';
import { Conversation, User, ChatMessage, ProjectWithDetails } from '../types';
import Card from './Card';
import Button from './Button';
import Icon from './Icon';
import { useLanguage } from './LanguageContext';

interface ChatPageProps {
  conversation: Conversation;
  project: ProjectWithDetails;
  currentUser: User;
  allUsers: User[];
  onSendMessage: (text: string) => void;
  onBack: () => void;
  isAdmin: boolean;
}

const ChatPage: React.FC<ChatPageProps> = ({ conversation, project, currentUser, allUsers, onSendMessage, onBack, isAdmin }) => {
  const { t } = useLanguage();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const getParticipant = (userId: string) => allUsers.find(u => u.id === userId);

  const otherParticipantId = conversation.participants.find(pId => pId !== currentUser.id && !pId.startsWith('admin'));
  const otherParticipant = otherParticipantId ? getParticipant(otherParticipantId) : null;
  
  const title = otherParticipant ? t('Chat with {name}', { name: otherParticipant.name }) : t('Chat');

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation.messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim());
      setNewMessage('');
    }
  };

  const MessageBubble: React.FC<{ msg: ChatMessage }> = ({ msg }) => {
      const isMe = msg.senderId === currentUser.id;
      const sender = getParticipant(msg.senderId);
      
      if(msg.isAlert){
        if(!isAdmin) return null;
        return (
            <div className="flex items-center justify-center my-2">
                <div className="text-center text-xs bg-red-800/80 text-white rounded-full px-4 py-1">
                    <strong className="font-bold">{t('Admin Alert')}:</strong> {msg.text}
                </div>
            </div>
        )
      }

      return (
        <div className={`flex items-end gap-2 my-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
            {!isMe && sender && (
                <img src={`https://i.pravatar.cc/40?u=${sender.id}`} alt={sender.name} className="w-8 h-8 rounded-full"/>
            )}
            <div className={`max-w-xs md:max-w-md lg:max-w-xl px-4 py-2 rounded-xl ${isMe ? 'bg-solar-green-600 text-white' : 'bg-slate-700 text-gray-200'}`}>
                <p className="text-sm">{msg.text}</p>
                <p className={`text-xs mt-1 opacity-70 ${isMe ? 'text-right' : 'text-left'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
            </div>
        </div>
      );
  }

  return (
    <div className="space-y-4">
      <div>
        <Button variant="secondary" size="sm" onClick={onBack} icon={<Icon name="arrow-left" className="w-4 h-4" />}>
          {t('Back')}
        </Button>
      </div>
      <Card className="flex flex-col h-[75vh]">
         <div className="p-4 border-b border-slate-700">
            <h1 className="text-xl font-bold text-white">{title}</h1>
            <p className="text-sm text-gray-400">{t('Project')}: {project.address.street}, {project.address.city}</p>
         </div>
         <div className="flex-grow p-4 overflow-y-auto">
            {conversation.messages.length === 0 ? (
                <p className="text-center text-gray-400">{t('No messages yet. Start the conversation!')}</p>
            ) : (
                conversation.messages.map(msg => <MessageBubble key={msg.id} msg={msg} />)
            )}
            <div ref={messagesEndRef} />
         </div>
         <div className="p-4 border-t border-slate-700">
            <form onSubmit={handleSend} className="flex items-center gap-2">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={t('Type your message...')}
                    className="w-full bg-slate-700 border-slate-600 rounded-md text-white px-3 py-2 focus:ring-solar-green-400 focus:border-solar-green-400"
                    disabled={isAdmin}
                />
                <Button type="submit" disabled={isAdmin}>{t('Send')}</Button>
            </form>
         </div>
      </Card>
    </div>
  );
};

export default ChatPage;