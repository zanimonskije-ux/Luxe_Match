import React, { useState } from 'react';
import { motion, AnimatePresence, PanInfo } from 'motion/react';
import { Heart, X, Info, MapPin, Briefcase } from 'lucide-react';
import { Profile } from '../data/mockProfiles';

interface SwipeCardProps {
  profile: Profile;
  onSwipe: (direction: 'left' | 'right') => void;
  onInfoClick: () => void;
}

export const SwipeCard: React.FC<SwipeCardProps> = ({ profile, onSwipe, onInfoClick }) => {
  const [exitX, setExitX] = useState<number>(0);

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x > 100) {
      setExitX(1000);
      onSwipe('right');
    } else if (info.offset.x < -100) {
      setExitX(-1000);
      onSwipe('left');
    }
  };

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center p-4"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ x: exitX, opacity: 0, scale: 0.5, transition: { duration: 0.4 } }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 1.05, rotate: exitX / 20 }}
    >
      <div className="relative w-full max-w-md aspect-[3/4] rounded-[2rem] overflow-hidden shadow-2xl border border-white/10 bg-onyx">
        {/* Profile Image */}
        <img
          src={profile.images[0]}
          alt={profile.name}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          referrerPolicy="no-referrer"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />

        {/* Profile Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <div className="flex items-end justify-between mb-2">
            <div>
              <h2 className="text-4xl font-serif font-bold tracking-tight">
                {profile.name}, <span className="font-sans font-light opacity-80">{profile.age}</span>
              </h2>
              <div className="flex items-center gap-2 mt-2 text-sm font-medium opacity-70">
                <Briefcase size={14} />
                <span>{profile.occupation}</span>
              </div>
              <div className="flex items-center gap-2 mt-1 text-sm font-medium opacity-70">
                <MapPin size={14} />
                <span>{profile.location}</span>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onInfoClick();
              }}
              className="p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-colors"
            >
              <Info size={20} />
            </button>
          </div>
        </div>

        {/* Swipe Indicators */}
        <motion.div
          style={{ opacity: 0 }}
          className="absolute top-10 right-10 border-4 border-green-500 text-green-500 font-bold text-2xl px-4 py-2 rounded-lg rotate-12 pointer-events-none"
          animate={{ opacity: exitX > 0 ? 1 : 0 }}
        >
          ЛАЙК
        </motion.div>
        <motion.div
          style={{ opacity: 0 }}
          className="absolute top-10 left-10 border-4 border-red-500 text-red-500 font-bold text-2xl px-4 py-2 rounded-lg -rotate-12 pointer-events-none"
          animate={{ opacity: exitX < 0 ? 1 : 0 }}
        >
          Мимо
        </motion.div>
      </div>
    </motion.div>
  );
};
