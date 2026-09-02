import React from 'react';
import { MessageCircle, CheckCircle2, Trash2 } from 'lucide-react';
import Card from '../ui/Card/Card.jsx';
import Badge from '../ui/Badge/Badge.jsx';
import styles from './complaints.module.css';

const CATEGORY_EMOJIS = {
  food: '🍟',
  late: '⏰',
  ignored: '🙈',
  annoying: '😜',
  serious: '🥺',
  funny: '😂',
  other: '📌',
};

const ComplaintCard = ({ complaint, currentUserId, onClick, onDelete }) => {
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const isCreator = complaint.createdBy?._id === currentUserId;

  return (
    <Card hoverable className={styles.card} onClick={onClick}>
      <div>
        <div className={styles.cardHeader}>
          <div className="flex items-center gap-1.5">
            <span className="text-xl">{CATEGORY_EMOJIS[complaint.category] || '😭'}</span>
            <h3 className={styles.cardTitle}>{complaint.title}</h3>
          </div>
          <Badge type={complaint.status}>{complaint.status}</Badge>
        </div>

        <p className={styles.description}>{complaint.description}</p>
      </div>

      <div className={styles.footer}>
        <div className="flex items-center gap-3">
          <span>By {complaint.createdBy?.name || 'Partner'}</span>
          <span>• {formatDate(complaint.createdAt)}</span>
        </div>

        <div className="flex items-center gap-2">
          {complaint.responses?.length > 0 && (
            <span className="flex items-center gap-1 text-xs font-semibold text-primary">
              <MessageCircle size={14} />
              <span>{complaint.responses.length}</span>
            </span>
          )}

          {isCreator && onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(complaint._id);
              }}
              className="p-1 text-muted hover:text-highlight transition-colors ml-1"
              title="Delete Complaint"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ComplaintCard;
