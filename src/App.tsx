import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Sparkles, Settings, Bell, Send, UserPlus, MessageCircle } from 'lucide-react';
import { mockProfiles, Profile } from './data/mockProfiles';
import { SwipeCard } from './components/SwipeCard';
import { ProfileDetail } from './components/ProfileDetail';
import { Navigation } from './components/Navigation';
import { ProfileEditor } from './components/ProfileEditor';
import { SettingsMenu } from './components/SettingsMenu';
import { ChatView } from './components/ChatView';

type View = 'discover' | 'matches' | 'profile' | 'chats';

declare global {
  interface Window {
    Telegram: any;
  }
}

export default function App() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [activeTab, setActiveTab] = useState<View>('discover');
  const [matches, setMatches] = useState<Profile[]>([]);
  const [isTelegram, setIsTelegram] = useState(false);
  const [tgUser, setTgUser] = useState<any>(null);
  
  // User's own profile state
  const [userProfile, setUserProfile] = useState<Partial<Profile>>({
    name: '',
    age: 25,
    bio: '',
    images: [],
    location: '',
    occupation: '',
    interests: []
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [activeChat, setActiveChat] = useState<Profile | null>(null);
  const [messages, setMessages] = useState<Record<string, { text: string; sender: 'me' | 'them'; timestamp: number }[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initApp = async () => {
      const tg = window.Telegram?.WebApp;
      
      let telegramId = '';
      if (tg && tg.initData) {
        setIsTelegram(true);
        const user = tg.initDataUnsafe?.user;
        setTgUser(user);
        telegramId = user?.id?.toString() || '';
        
        tg.expand?.();
        tg.ready?.();
        tg.setHeaderColor?.('#0F0F0F');
        tg.setBackgroundColor?.('#0F0F0F');
      }

      // Load profile from localStorage
      const savedProfile = localStorage.getItem('luxe_user_profile');
      if (savedProfile) {
        const parsed = JSON.parse(savedProfile);
        setUserProfile(parsed);
        setIsNewUser(false);
      } else if (telegramId) {
        // New user from Telegram, pre-fill
        setIsNewUser(true);
        setUserProfile(prev => ({
          ...prev,
          uid: telegramId,
          id: telegramId,
          name: tg.initDataUnsafe?.user?.first_name || '',
          images: tg.initDataUnsafe?.user?.photo_url ? [tg.initDataUnsafe.user.photo_url] : prev.images
        }));
      } else {
        setIsNewUser(true);
      }

      // Load matches and messages from localStorage
      const savedMatches = localStorage.getItem('luxe_matches');
      if (savedMatches) {
        const matchedUserIds = JSON.parse(savedMatches);
        const matchedProfiles = mockProfiles.filter(p => matchedUserIds.includes(p.id));
        setMatches(matchedProfiles);
      }

      const savedMessages = localStorage.getItem('luxe_messages');
      if (savedMessages) {
        setMessages(JSON.parse(savedMessages));
      }

      setLoading(false);
    };

    initApp();
  }, []);

  const handleSaveProfile = async (updated: Partial<Profile>) => {
    try {
      const tg = window.Telegram?.WebApp;
      const telegramId = tg?.initDataUnsafe?.user?.id?.toString() || updated.uid || 'dev_user';
      
      // Basic validation
      if (!updated.name || !updated.name.trim()) {
        alert("Пожалуйста, введите ваше имя.");
        return;
      }
      
      if (!updated.age || isNaN(updated.age) || updated.age < 18 || updated.age > 99) {
        alert("Пожалуйста, введите корректный возраст (18-99).");
        return;
      }

      const profileData = {
        ...updated,
        id: telegramId,
        uid: telegramId,
        createdAt: userProfile.createdAt || Date.now()
      };

      setUserProfile(profileData as any);
      
      // Save to localStorage
      localStorage.setItem('luxe_user_profile', JSON.stringify(profileData));
      
      setIsEditingProfile(false);
      setIsNewUser(false);
      
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
      }
    } catch (e) {
      console.error("Failed to save profile", e);
      alert("Ошибка при сохранении профиля. Пожалуйста, попробуйте еще раз.");
    }
  };

  const handleDeleteProfile = async () => {
    try {
      localStorage.removeItem('luxe_user_profile');
      localStorage.removeItem('luxe_matches');
      localStorage.removeItem('luxe_messages');
      
      setUserProfile({
        name: '',
        age: 25,
        bio: '',
        images: [],
        location: '',
        occupation: '',
        interests: []
      });
      setMatches([]);
      setMessages({});
      setIsNewUser(true);
      setActiveTab('discover');
      
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('warning');
      }
    } catch (e) {
      console.error("Failed to delete profile", e);
    }
  };

  const handleSendMessage = async (profileId: string, text: string) => {
    try {
      const newMessage = {
        text,
        sender: 'me' as const,
        timestamp: Date.now()
      };
      
      const newMessages = {
        ...messages,
        [profileId]: [...(messages[profileId] || []), newMessage]
      };
      
      setMessages(newMessages);
      localStorage.setItem('luxe_messages', JSON.stringify(newMessages));

      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
      }
    } catch (e) {
      console.error("Failed to send message", e);
    }
  };

  const currentProfile = mockProfiles[currentIndex];

  const handleSwipe = async (direction: 'left' | 'right') => {
    if (direction === 'right') {
      const matchedProfile = mockProfiles[currentIndex];
      const newMatches = [...matches, matchedProfile];
      setMatches(newMatches);
      
      const matchedIds = newMatches.map(m => m.id);
      localStorage.setItem('luxe_matches', JSON.stringify(matchedIds));

      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
      }
    } else {
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
      }
    }
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
    }, 400);
  };

  const handleLikeFromDetail = async () => {
    if (!selectedProfile) return;
    
    const newMatches = [...matches, selectedProfile];
    setMatches(newMatches);
    
    const matchedIds = newMatches.map(m => m.id);
    localStorage.setItem('luxe_matches', JSON.stringify(matchedIds));

    setSelectedProfile(null);
    setCurrentIndex(prev => prev + 1);
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
    }
  };

  const handlePassFromDetail = () => {
    setSelectedProfile(null);
    setCurrentIndex(prev => prev + 1);
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-full bg-onyx flex flex-col items-center justify-center p-8 text-center">
        <Sparkles size={64} className="text-gold mb-8 animate-pulse" />
        <h1 className="text-3xl font-serif font-bold mb-4">Luxe Match</h1>
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-full bg-onyx flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-8">
          <Bell size={40} className="text-red-500" />
        </div>
        <h1 className="text-3xl font-serif font-bold mb-4">Ошибка</h1>
        <p className="text-white/60 mb-8 max-w-xs">
          {error}
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="w-full py-4 bg-gold text-onyx font-bold rounded-2xl shadow-xl shadow-gold/20 flex items-center justify-center gap-3"
        >
          Попробовать снова
        </button>
      </div>
    );
  }

  if (!isTelegram && process.env.NODE_ENV === 'production') {
    return (
      <div className="h-screen w-full bg-onyx flex flex-col items-center justify-center p-8 text-center">
        <Sparkles size={64} className="text-gold mb-8 animate-pulse" />
        <h1 className="text-3xl font-serif font-bold mb-4">Luxe Match</h1>
        <p className="text-white/60 mb-8 max-w-xs">
          Этот эксклюзивный опыт доступен только внутри Telegram.
        </p>
        <a 
          href="https://t.me/Ambrella_admin_bot" 
          className="px-10 py-4 bg-gold text-onyx font-bold rounded-full shadow-xl shadow-gold/20 flex items-center gap-3"
        >
          <Send size={20} />
          Открыть в Telegram
        </a>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-onyx flex flex-col overflow-hidden">
      {/* New User Welcome / Profile Creation */}
      <AnimatePresence>
        {isNewUser && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-onyx flex flex-col items-center justify-center p-8 text-center"
          >
            <Sparkles size={64} className="text-gold mb-8" />
            <h2 className="text-4xl font-serif font-bold mb-4">Добро пожаловать в Luxe</h2>
            <p className="text-white/60 mb-10 max-w-xs">
              Чтобы войти в мир эксклюзивных знакомств, пожалуйста, заполните свой профиль.
            </p>
            <button 
              onClick={() => setIsEditingProfile(true)}
              className="w-full py-4 bg-gold text-onyx font-bold rounded-2xl shadow-xl shadow-gold/20 flex items-center justify-center gap-3"
            >
              <UserPlus size={20} />
              Создать профиль
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="px-6 pt-12 pb-4 flex items-center justify-between z-10">
        <button 
          onClick={() => setIsSettingsOpen(true)}
          className="p-2 text-white/40 hover:text-white transition-colors"
        >
          <Settings size={24} />
        </button>
        
        <div className="flex items-center gap-2">
          <Sparkles size={20} className="text-gold" />
          <h1 className="text-xl font-serif font-bold tracking-widest uppercase">Luxe Match</h1>
        </div>

        <button className="p-2 text-white/40 hover:text-white transition-colors relative">
          <Bell size={24} />
          <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full" />
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 relative">
        <AnimatePresence mode="wait">
          {activeTab === 'discover' && (
            <motion.div 
              key="discover" 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full w-full relative"
            >
              {currentIndex < mockProfiles.length ? (
                <AnimatePresence mode="popLayout">
                  <SwipeCard
                    key={currentProfile.id}
                    profile={currentProfile}
                    onSwipe={handleSwipe}
                    onInfoClick={() => setSelectedProfile(currentProfile)}
                  />
                </AnimatePresence>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center"
                >
                  <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                    <Sparkles size={40} className="text-gold opacity-50" />
                  </div>
                  <h2 className="text-2xl font-serif font-bold mb-2">Профили закончились</h2>
                  <p className="text-white/40 max-w-xs">
                    Вы просмотрели всех в вашем районе. Заходите позже, чтобы увидеть новые эксклюзивные анкеты.
                  </p>
                  <button 
                    onClick={() => setCurrentIndex(0)}
                    className="mt-8 px-8 py-3 rounded-full border border-gold text-gold font-bold uppercase tracking-widest text-xs hover:bg-gold hover:text-onyx transition-all"
                  >
                    Обновить
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}

          {activeTab === 'matches' && (
            <motion.div
              key="matches"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="h-full w-full p-6 overflow-y-auto pb-32"
            >
              <h2 className="text-3xl font-serif font-bold mb-8">Новые пары</h2>
              
              {matches.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {matches.map((match) => (
                    <div key={match.id} className="relative aspect-[3/4] rounded-2xl overflow-hidden group">
                      <img
                        src={match.images[0]}
                        alt={match.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      <div className="absolute bottom-3 left-3">
                        <p className="text-white font-bold">{match.name}, {match.age}</p>
                        <p className="text-white/60 text-xs">{match.occupation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center opacity-30">
                  <div className="w-16 h-16 rounded-full border-2 border-dashed border-white mb-4" />
                  <p>Пока нет пар. Продолжайте искать!</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'chats' && (
            <motion.div
              key="chats"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="h-full w-full p-6 overflow-y-auto pb-32"
            >
              <h2 className="text-3xl font-serif font-bold mb-8">Чаты</h2>
              {matches.length > 0 ? (
                <div className="space-y-4">
                  {matches.map((match) => (
                    <button
                      key={match.id}
                      onClick={() => setActiveChat(match)}
                      className="w-full p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-4 hover:bg-white/10 transition-colors"
                    >
                      <div className="w-14 h-14 rounded-full overflow-hidden border border-gold/30">
                        <img 
                          src={match.images[0]} 
                          alt={match.name} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="flex-1 text-left">
                        <h3 className="font-bold">{match.name}</h3>
                        <p className="text-xs text-white/40 truncate">
                          {messages[match.id]?.slice(-1)[0]?.text || 'Начните общение...'}
                        </p>
                      </div>
                      <div className="text-[10px] text-white/20 uppercase tracking-widest">
                        {messages[match.id]?.slice(-1)[0] ? '12:00' : ''}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center opacity-30">
                  <MessageCircle size={48} className="mb-4" />
                  <p>У вас пока нет активных чатов. Найдите пару!</p>
                </div>
              )}
            </motion.div>
          )}
          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="h-full w-full p-6 flex flex-col items-center pt-12"
            >
              <div className="relative mb-6">
                <div className="w-32 h-32 rounded-full p-1 border-2 border-gold overflow-hidden">
                  <img
                    src={userProfile.images?.[0] || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400"}
                    alt="My Profile"
                    className="w-full h-full rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <button 
                  onClick={() => setIsSettingsOpen(true)}
                  className="absolute bottom-0 right-0 p-2 bg-gold rounded-full text-onyx shadow-lg"
                >
                  <Settings size={16} />
                </button>
              </div>
              
              <h2 className="text-3xl font-serif font-bold">{userProfile.name || 'Джеймс'}, {userProfile.age}</h2>
              <p className="text-gold font-medium tracking-widest uppercase text-[10px] mt-1">Premium Участник</p>

              <div className="grid grid-cols-3 w-full gap-4 mt-12">
                <div className="flex flex-col items-center p-4 bg-white/5 rounded-2xl border border-white/5">
                  <span className="text-xl font-bold">0</span>
                  <span className="text-[10px] uppercase opacity-40">Пары</span>
                </div>
                <div className="flex flex-col items-center p-4 bg-white/5 rounded-2xl border border-white/5">
                  <span className="text-xl font-bold">0</span>
                  <span className="text-[10px] uppercase opacity-40">Лайки</span>
                </div>
                <div className="flex flex-col items-center p-4 bg-white/5 rounded-2xl border border-white/5">
                  <span className="text-xl font-bold">0%</span>
                  <span className="text-[10px] uppercase opacity-40">Рейтинг</span>
                </div>
              </div>

              <div className="w-full mt-8 space-y-4">
                <button 
                  onClick={() => setIsEditingProfile(true)}
                  className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between px-6 hover:bg-white/10 transition-colors"
                >
                  <span className="font-medium">Редактировать профиль</span>
                  <Sparkles size={18} className="text-gold" />
                </button>
                <button 
                  onClick={() => setIsSettingsOpen(true)}
                  className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between px-6 hover:bg-white/10 transition-colors"
                >
                  <span className="font-medium">Центр безопасности</span>
                  <Settings size={18} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Profile Detail Modal */}
      <AnimatePresence>
        {selectedProfile && (
          <ProfileDetail
            profile={selectedProfile}
            onClose={() => setSelectedProfile(null)}
            onLike={handleLikeFromDetail}
            onPass={handlePassFromDetail}
          />
        )}
      </AnimatePresence>

      {/* Profile Editor Modal */}
      <AnimatePresence>
        {isEditingProfile && (
          <ProfileEditor
            profile={userProfile}
            onSave={handleSaveProfile}
            onCancel={() => setIsEditingProfile(false)}
          />
        )}
      </AnimatePresence>

      {/* Settings Menu Modal */}
      <AnimatePresence>
        {isSettingsOpen && (
          <SettingsMenu
            onClose={() => setIsSettingsOpen(false)}
            onEditProfile={() => setIsEditingProfile(true)}
            onDeleteProfile={handleDeleteProfile}
            onViewDiscover={() => setActiveTab('discover')}
            onViewChats={() => setActiveTab('chats')}
          />
        )}
      </AnimatePresence>

      {/* Chat View Modal */}
      <AnimatePresence>
        {activeChat && (
          <ChatView
            profile={activeChat}
            messages={messages[activeChat.id] || []}
            onSendMessage={(text) => handleSendMessage(activeChat.id, text)}
            onClose={() => setActiveChat(null)}
          />
        )}
      </AnimatePresence>

      {/* Navigation */}
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
