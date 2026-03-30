import React from 'react';
import { Compass, MessageCircle, User, Heart } from 'lucide-react';

interface NavigationProps {
  activeTab: 'discover' | 'matches' | 'profile' | 'chats';
  onTabChange: (tab: 'discover' | 'matches' | 'profile' | 'chats') => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 h-24 bg-black/40 backdrop-blur-2xl border-t border-white/5 flex items-center justify-around px-6 z-40">
      <button
        onClick={() => onTabChange('discover')}
        className={`flex flex-col items-center gap-1 transition-colors ${
          activeTab === 'discover' ? 'text-gold' : 'text-white/40'
        }`}
      >
        <Compass size={24} />
        <span className="text-[10px] uppercase tracking-widest font-bold">Знакомства</span>
      </button>
      
      <button
        onClick={() => onTabChange('matches')}
        className={`flex flex-col items-center gap-1 transition-colors ${
          activeTab === 'matches' ? 'text-gold' : 'text-white/40'
        }`}
      >
        <Heart size={24} />
        <span className="text-[10px] uppercase tracking-widest font-bold">Пары</span>
      </button>

      <button
        onClick={() => onTabChange('chats')}
        className={`flex flex-col items-center gap-1 transition-colors ${
          activeTab === 'chats' ? 'text-gold' : 'text-white/40'
        }`}
      >
        <div className="relative">
          <MessageCircle size={24} />
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-gold rounded-full" />
        </div>
        <span className="text-[10px] uppercase tracking-widest font-bold">Чаты</span>
      </button>

      <button
        onClick={() => onTabChange('profile')}
        className={`flex flex-col items-center gap-1 transition-colors ${
          activeTab === 'profile' ? 'text-gold' : 'text-white/40'
        }`}
      >
        <User size={24} />
        <span className="text-[10px] uppercase tracking-widest font-bold">Профиль</span>
      </button>
    </div>
  );
};
