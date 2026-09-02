import React, { useEffect } from 'react';
import { Lock, Heart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import Modal from '../ui/Modal/Modal.jsx';
import Button from '../ui/Button/Button.jsx';

const LetterDetailModal = ({ isOpen, onClose, letter, onOpenLetter }) => {
  const { partner } = useAuth();

  useEffect(() => {
    if (isOpen && letter && !letter.isRead && !letter.isLocked && onOpenLetter) {
      onOpenLetter(letter._id);
    }
  }, [isOpen, letter]);

  if (!letter) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const senderName = letter.from?.name || partner?.name || 'Your Partner';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={letter.title} maxWidth="560px">
      <div className="flex flex-col gap-4">
        {letter.isLocked ? (
          <div className="p-6 bg-border/40 rounded-xl text-center flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-accent/30 flex items-center justify-center text-primary">
              <Lock size={24} />
            </div>
            <h4 className="font-bold text-text text-base">This letter is currently locked 🔒</h4>
            <p className="text-sm text-muted max-w-sm">
              {letter.message || `Scheduled to open on ${formatDate(letter.scheduledFor)}`}
            </p>
          </div>
        ) : (
          <div className="p-6 bg-gradient-to-b from-white to-background border border-border rounded-xl shadow-inner font-serif">
            <div className="flex justify-between items-center text-xs text-muted font-sans border-b border-border pb-3 mb-4">
              <span>From: <strong>{senderName}</strong></span>
              <span>{formatDate(letter.createdAt)}</span>
            </div>

            <div className="text-text leading-relaxed whitespace-pre-wrap text-base mb-6">
              {letter.content}
            </div>

            <div className="flex items-center justify-end gap-1 text-primary text-xs font-sans font-semibold pt-3 border-t border-border/60">
              <span>Forever yours</span>
              <Heart size={12} className="fill-primary" />
            </div>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default LetterDetailModal;
