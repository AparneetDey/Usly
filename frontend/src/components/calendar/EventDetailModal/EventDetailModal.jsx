import React from 'react';
import { Calendar as CalendarIcon, Clock, Edit2, Trash2, RefreshCw } from 'lucide-react';
import { getCategoryConfig } from '../categoryColors.js';
import Modal from '../../ui/Modal/Modal.jsx';
import Button from '../../ui/Button/Button.jsx';
import styles from './EventDetailModal.module.css';

const EventDetailModal = ({
  isOpen,
  onClose,
  event,
  onEdit,
  onDelete,
}) => {
  if (!event) return null;

  const config = getCategoryConfig(event.type);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Event Details" maxWidth="480px">
      <div className={styles.detailBox}>
        <div
          className={styles.headerBanner}
          style={{
            backgroundColor: config.bg,
            borderColor: config.border,
            color: config.text,
          }}
        >
          <span className={styles.emojiBadge}>{config.emoji}</span>
          <div>
            <h3 className={styles.bannerTitle}>{event.title}</h3>
            <span className="text-xs font-semibold opacity-90 uppercase tracking-wider">
              {config.label}
            </span>
          </div>
        </div>

        <div className={styles.infoRow}>
          <CalendarIcon size={18} className="text-primary" />
          <span>{formatDate(event.date)}</span>
        </div>

        {(event.startTime || event.endTime) && (
          <div className={styles.infoRow}>
            <Clock size={18} className="text-primary" />
            <span>
              {event.startTime || 'Start'} {event.endTime ? `- ${event.endTime}` : ''}
            </span>
          </div>
        )}

        {event.description && <p className={styles.desc}>{event.description}</p>}

        <div className={styles.metaFooter}>
          <div className="flex items-center gap-2">
            <span>Added by {event.createdBy?.name || 'Partner'}</span>
            {event.isRecurring && (
              <span className="flex items-center gap-1 text-primary text-xs font-semibold bg-border px-2 py-0.5 rounded-full">
                <RefreshCw size={12} />
                <span>{event.recurrenceRule}</span>
              </span>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center pt-3 border-t border-border mt-2">
          <Button variant="danger" size="sm" onClick={() => onDelete(event)}>
            <Trash2 size={14} />
            <span>Delete Event</span>
          </Button>

          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => onEdit(event)}>
              <Edit2 size={14} />
              <span>Edit</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default EventDetailModal;
