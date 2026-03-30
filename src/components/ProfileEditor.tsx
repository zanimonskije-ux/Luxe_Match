import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { X, Camera, Plus, Save, ChevronLeft } from 'lucide-react';
import { Profile } from '../data/mockProfiles';

interface ProfileEditorProps {
  profile: Partial<Profile>;
  onSave: (updatedProfile: Partial<Profile>) => void;
  onCancel: () => void;
}

export const ProfileEditor: React.FC<ProfileEditorProps> = ({ profile, onSave, onCancel }) => {
  const [editedProfile, setEditedProfile] = useState<Partial<Profile>>({
    ...profile,
    interests: profile.interests || [],
    images: profile.images || []
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 200 * 1024) {
        alert("Фотография слишком большая. Пожалуйста, выберите фото до 200 КБ.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditedProfile(prev => ({
          ...prev,
          images: [...(prev.images || []), reader.result as string]
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (index: number) => {
    setEditedProfile(prev => ({
      ...prev,
      images: prev.images?.filter((_, i) => i !== index)
    }));
  };

  const toggleInterest = (interest: string) => {
    setEditedProfile(prev => {
      const interests = prev.interests || [];
      if (interests.includes(interest)) {
        return { ...prev, interests: interests.filter(i => i !== interest) };
      }
      return { ...prev, interests: [...interests, interest] };
    });
  };

  const commonInterests = ["Искусство", "Путешествия", "Дизайн", "Вино", "Авиация", "Парусный спорт", "Бизнес", "Фитнес", "Мода", "Фотография", "Опера", "Йога", "Гастрономия", "Музыка", "Походы", "Литература"];

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      className="fixed inset-0 z-[70] bg-onyx overflow-y-auto pb-24"
    >
      <header className="px-6 pt-12 pb-4 flex items-center justify-between sticky top-0 bg-onyx/80 backdrop-blur-md z-10">
        <button onClick={onCancel} className="p-2 text-white/60">
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-xl font-serif font-bold">Редактировать профиль</h2>
        <button 
          onClick={() => onSave(editedProfile)}
          className="p-2 text-gold font-bold uppercase tracking-widest text-xs"
        >
          Сохранить
        </button>
      </header>

      <div className="p-6 space-y-8">
        {/* Photo Grid */}
        <section>
          <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-gold mb-4">Фотографии</h3>
          <div className="grid grid-cols-3 gap-3">
            {editedProfile.images?.map((img, index) => (
              <div key={index} className="relative aspect-[3/4] rounded-xl overflow-hidden group">
                <img 
                  src={img} 
                  className="w-full h-full object-cover" 
                  alt="Profile" 
                  referrerPolicy="no-referrer"
                />
                <button 
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 p-1 bg-black/50 rounded-full text-white"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            {(editedProfile.images?.length || 0) < 6 && (
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="aspect-[3/4] rounded-xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-white/20 hover:text-gold hover:border-gold transition-colors"
              >
                <Plus size={24} />
                <span className="text-[10px] uppercase mt-2">Добавить фото</span>
              </button>
            )}
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handleImageUpload} 
          />
        </section>

        {/* Basic Info */}
        <section className="space-y-4">
          <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-gold mb-4">Основная информация</h3>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] uppercase opacity-40 ml-1">Имя</label>
              <input 
                type="text" 
                value={editedProfile.name || ''} 
                onChange={e => setEditedProfile({...editedProfile, name: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-gold outline-none transition-colors"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] uppercase opacity-40 ml-1">Возраст</label>
                <input 
                  type="number" 
                  value={editedProfile.age || ''} 
                  onChange={e => setEditedProfile({...editedProfile, age: parseInt(e.target.value)})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-gold outline-none transition-colors"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase opacity-40 ml-1">Город</label>
                <input 
                  type="text" 
                  value={editedProfile.location || ''} 
                  onChange={e => setEditedProfile({...editedProfile, location: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-gold outline-none transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] uppercase opacity-40 ml-1">Профессия</label>
              <input 
                type="text" 
                value={editedProfile.occupation || ''} 
                onChange={e => setEditedProfile({...editedProfile, occupation: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-gold outline-none transition-colors"
              />
            </div>
          </div>
        </section>

        {/* Bio */}
        <section>
          <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-gold mb-4">О себе</h3>
          <textarea 
            value={editedProfile.bio || ''} 
            onChange={e => setEditedProfile({...editedProfile, bio: e.target.value})}
            rows={4}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-gold outline-none transition-colors resize-none"
            placeholder="Расскажите о своем стиле жизни..."
          />
        </section>

        {/* Interests */}
        <section>
          <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-gold mb-4">Интересы</h3>
          <div className="flex flex-wrap gap-2">
            {commonInterests.map(interest => (
              <button
                key={interest}
                onClick={() => toggleInterest(interest)}
                className={`px-4 py-2 rounded-full border text-xs font-medium transition-all ${
                  editedProfile.interests?.includes(interest)
                    ? 'bg-gold border-gold text-onyx'
                    : 'bg-white/5 border-white/10 text-white/60 hover:border-white/30'
                }`}
              >
                {interest}
              </button>
            ))}
          </div>
        </section>

        <button 
          onClick={() => onSave(editedProfile)}
          className="w-full py-4 bg-gold text-onyx font-bold rounded-2xl shadow-xl shadow-gold/20 flex items-center justify-center gap-2 mt-8"
        >
          <Save size={20} />
          Сохранить изменения
        </button>
      </div>
    </motion.div>
  );
};
