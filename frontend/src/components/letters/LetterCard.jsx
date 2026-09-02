import React from 'react';
import { Lock, Trash2, Calendar } from 'lucide-react';
import styles from './letters.module.css';

const LetterCard = ({ letter, isSent = false, onClick, onDelete }) => {
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div
      className={`${styles.envelopeCard} ${letter.isLocked ? styles.lockedCard : ''}`}
      onClick={onClick}
    >
      <div>
        <div className={styles.topRow}>
          <span className={styles.envelopeIcon}>{letter.isLocked ? '🔒' : '💌'}</span>
          {!isSent && !letter.isRead && !letter.isLocked && (
            <span className={styles.unreadBadge}>New</span>
          )}
          {letter.isRead && !letter.isLocked && (
            <span className="text-xs text-muted font-medium">Opened</span>
          )}
        </div>

        <h3 className={styles.letterTitle}>{letter.title}</h3>

        {letter.isLocked ? (
          <div className={styles.lockedNotice}>
            <Lock size={14} />
            <span>Open when ready on {formatDate(letter.scheduledFor)}</span>
          </div>
        ) : (
          <p className={styles.letterSnippet}>{letter.content}</p>
        )}
      </div>

      <div className={styles.footer}>
        <div>
          <span>{isSent ? `To: ${letter.to?.name || 'Partner'}` : `From: ${letter.from?.name || 'Partner'}`}</span>
          <span className="mx-1">•</span>
          <span>{formatDate(letter.createdAt)}</span>
        </div>

        {isSent && onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(letter._id);
            }}
            className="p-1 text-muted hover:text-highlight transition-colors"
            title="Delete Letter"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  );
};

export default LetterCard;
