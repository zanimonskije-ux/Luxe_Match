import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Send, MoreVertical, Shield } from 'lucide-react';
import { Profile } from '../data/mockProfiles';

interface Message {
  text: string;
  sender: 'me' | 'them';
  timestamp: number;
}

interface ChatViewProps {
  profile: Profile;
  messages: Message[];
  onSendMessage: (text: string) => void;
  onClose: () => void;
}

export const ChatView: React.FC<ChatViewProps> = ({ profile, messages, onSendMessage, onClose }) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (inputText.trim()) {
      onSendMessage(inputText);
      setInputText('');
      
      // Simulate reply
      setTimeout(() => {
        if (window.Telegram?.WebApp?.HapticFeedback) {
          window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
        }
      }, 100);
    }
  };

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-[90] bg-onyx flex flex-col"
    >
      {/* Header */}
      <header className="px-6 pt-12 pb-4 flex items-center gap-4 border-b border-white/5 bg-onyx/80 backdrop-blur-xl sticky top-0">
        <button onClick={onClose} className="p-2 -ml-2 text-white/40 hover:text-white transition-colors">
          <ArrowLeft size={24} />
        </button>
        
        <div className="flex-1 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden border border-gold/30">
            <img 
              src={profile.images[0]} 
              alt={profile.name} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <h3 className="font-bold text-sm leading-none">{profile.name}</h3>
            <p className="text-[10px] text-green-500 mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              В сети
            </p>
          </div>
        </div>

        <button className="p-2 text-white/40">
          <MoreVertical size={20} />
        </button>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="p-3 bg-white/5 rounded-full mb-3">
            <Shield size={20} className="text-gold" />
          </div>
          <p className="text-[10px] uppercase tracking-widest text-white/20 max-w-[200px]">
            Ваш чат защищен сквозным шифрованием. Будьте вежливы и уважайте друг друга.
          </p>
        </div>

        {messages.map((msg, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            key={idx}
            className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm ${
                msg.sender === 'me'
                  ? 'bg-gold text-onyx font-medium rounded-tr-none'
                  : 'bg-white/5 text-white border border-white/5 rounded-tl-none'
              }`}
            >
              {msg.text}
              <div className={`text-[8px] mt-1 opacity-40 ${msg.sender === 'me' ? 'text-onyx/60' : 'text-white/60'}`}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-6 pb-10 bg-onyx border-t border-white/5">
        <div className="flex items-center gap-3 bg-white/5 rounded-2xl p-2 pl-4 border border-white/5">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Напишите сообщение..."
            className="flex-1 bg-transparent border-none outline-none text-sm py-2"
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim()}
            className={`p-3 rounded-xl transition-all ${
              inputText.trim() ? 'bg-gold text-onyx scale-100' : 'bg-white/10 text-white/20 scale-90'
            }`}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
