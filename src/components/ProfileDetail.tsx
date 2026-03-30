import React from 'react';
import { motion } from 'motion/react';
import { X, MapPin, Briefcase, Heart } from 'lucide-react';
import { Profile } from '../data/mockProfiles';

interface ProfileDetailProps {
  profile: Profile;
  onClose: () => void;
  onLike: () => void;
  onPass: () => void;
}

export const ProfileDetail: React.FC<ProfileDetailProps> = ({ profile, onClose, onLike, onPass }) => {
  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-50 bg-onyx overflow-y-auto"
    >
      {/* Header Image Section */}
      <div className="relative h-[60vh]">
        <img
          src={profile.images[0]}
          alt={profile.name}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-onyx via-transparent to-black/30" />
        
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-3 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white"
        >
          <X size={24} />
        </button>
      </div>

      {/* Content Section */}
      <div className="px-8 py-10 -mt-12 relative rounded-t-[3rem] bg-onyx">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className="text-5xl font-serif font-bold mb-2">
              {profile.name}, <span className="font-sans font-light opacity-60">{profile.age}</span>
            </h1>
            <div className="flex flex-col gap-2 opacity-70">
              <div className="flex items-center gap-2">
                <Briefcase size={18} />
                <span className="text-lg">{profile.occupation}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={18} />
                <span className="text-lg">{profile.location}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="h-px bg-white/10 w-full mb-8" />

        <section className="mb-10">
          <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-gold mb-4">О себе</h3>
          <p className="text-xl font-light leading-relaxed opacity-80 italic">
            "{profile.bio}"
          </p>
        </section>

        <section className="mb-10">
          <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-gold mb-4">Интересы</h3>
          <div className="flex flex-wrap gap-3">
            {profile.interests.map((interest) => (
              <span
                key={interest}
                className="px-5 py-2 rounded-full border border-white/10 bg-white/5 text-sm font-medium"
              >
                {interest}
              </span>
            ))}
          </div>
        </section>

        {/* Second Image */}
        {profile.images[1] && (
          <div className="rounded-3xl overflow-hidden mb-10 aspect-[4/5]">
            <img
              src={profile.images[1]}
              alt={`${profile.name} alternate`}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center gap-6 pb-12">
          <button
            onClick={onPass}
            className="w-20 h-20 rounded-full border border-red-500/30 flex items-center justify-center text-red-500 hover:bg-red-500/10 transition-colors"
          >
            <X size={32} />
          </button>
          <button
            onClick={onLike}
            className="w-20 h-20 rounded-full bg-gold flex items-center justify-center text-onyx shadow-xl shadow-gold/20 hover:scale-105 transition-transform"
          >
            <Heart size={32} fill="currentColor" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
