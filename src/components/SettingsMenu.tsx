import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, Trash2, Eye, ChevronRight, LogOut, AlertTriangle } from 'lucide-react';

interface SettingsMenuProps {
  onClose: () => void;
  onEditProfile: () => void;
  onDeleteProfile: () => void;
  onViewDiscover: () => void;
  onViewChats: () => void;
}

export const SettingsMenu: React.FC<SettingsMenuProps> = ({ 
  onClose, 
  onEditProfile, 
  onDeleteProfile, 
  onViewDiscover,
  onViewChats
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm flex items-end justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="w-full max-w-md bg-onyx rounded-t-[2.5rem] p-8 pb-12 shadow-2xl border-t border-white/5"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-serif font-bold">Настройки</h2>
          <button onClick={onClose} className="p-2 text-white/40">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-3">
          <button 
            onClick={() => { onEditProfile(); onClose(); }}
            className="w-full p-5 bg-white/5 rounded-2xl flex items-center justify-between group hover:bg-white/10 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gold/10 rounded-xl text-gold">
                <User size={20} />
              </div>
              <span className="font-medium">Редактировать профиль</span>
            </div>
            <ChevronRight size={18} className="text-white/20 group-hover:text-gold transition-colors" />
          </button>

          <button 
            onClick={() => { onViewChats(); onClose(); }}
            className="w-full p-5 bg-white/5 rounded-2xl flex items-center justify-between group hover:bg-white/10 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/10 rounded-xl text-green-500">
                <LogOut className="rotate-180" size={20} />
              </div>
              <span className="font-medium">Чаты</span>
            </div>
            <ChevronRight size={18} className="text-white/20 group-hover:text-green-500 transition-colors" />
          </button>

          <button 
            onClick={() => { onViewDiscover(); onClose(); }}
            className="w-full p-5 bg-white/5 rounded-2xl flex items-center justify-between group hover:bg-white/10 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
                <Eye size={20} />
              </div>
              <span className="font-medium">Просмотр анкет</span>
            </div>
            <ChevronRight size={18} className="text-white/20 group-hover:text-blue-500 transition-colors" />
          </button>

          <div className="h-px bg-white/5 my-4" />

          <button 
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full p-5 bg-red-500/5 rounded-2xl flex items-center justify-between group hover:bg-red-500/10 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-500/10 rounded-xl text-red-500">
                <Trash2 size={20} />
              </div>
              <span className="font-medium text-red-500">Удалить профиль</span>
            </div>
            <LogOut size={18} className="text-red-500/20 group-hover:text-red-500 transition-colors" />
          </button>
        </div>

        <p className="text-center text-[10px] uppercase tracking-[0.2em] text-white/20 mt-10">
          Luxe Match v1.0.4 • Сделано с любовью
        </p>
      </motion.div>

      {/* Delete Confirmation Overlay */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] bg-black/80 backdrop-blur-md flex items-center justify-center p-6"
            onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(false); }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-onyx border border-white/10 rounded-[2rem] p-8 w-full max-w-sm text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-serif font-bold mb-2">Удалить профиль?</h3>
              <p className="text-white/60 text-sm mb-8">
                Это действие необратимо. Все ваши пары и сообщения будут удалены навсегда.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    onDeleteProfile();
                    onClose();
                  }}
                  className="w-full py-4 bg-red-500 text-white font-bold rounded-xl"
                >
                  Да, удалить навсегда
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="w-full py-4 bg-white/5 text-white/60 font-bold rounded-xl"
                >
                  Отмена
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
