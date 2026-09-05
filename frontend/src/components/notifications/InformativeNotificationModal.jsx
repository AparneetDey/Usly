import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CloseIcon, SparklesIcon } from '../icons/index.js';
import styles from './InformativeNotificationModal.module.css';

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

/**
 * Dedicated modal for Usly Informative Notifications & Product Updates
 */
const InformativeNotificationModal = ({ isOpen, onClose, notification }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !notification) return null;

  const details = notification.details || {};
  const hasHeading = Boolean(details.heading);
  const hasContent = Boolean(details.content);
  const changes = Array.isArray(details.changes) ? details.changes.filter(Boolean) : [];
  const imageUrl = details.imageUrl;

  const modalContent = (
    <div className={styles.backdrop} onClick={onClose} role="presentation">
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="informative-modal-title"
      >
        {/* Header */}
        <div className={styles.header}>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close update"
          >
            <CloseIcon size={18} />
          </button>

          <div className={styles.iconBadge}>
            <SparklesIcon size={24} />
          </div>

          <h2 id="informative-modal-title" className={styles.title}>
            {notification.title}
          </h2>

          <p className={styles.date}>
            {formatDate(notification.createdAt || new Date())}
          </p>
        </div>

        {/* Scrollable Body */}
        <div className={styles.body}>
          {/* Optional Image */}
          {imageUrl && (
            <div className={styles.imageContainer}>
              <img
                src={imageUrl}
                alt={notification.title}
                className={styles.image}
                loading="lazy"
              />
            </div>
          )}

          {/* Short summary callout */}
          {notification.message && (
            <div className={styles.summaryCallout}>
              {notification.message}
            </div>
          )}

          {/* Detailed Content */}
          {(hasHeading || hasContent) && (
            <div className={styles.detailsSection}>
              {hasHeading && (
                <h3 className={styles.heading}>{details.heading}</h3>
              )}
              {hasContent && (
                <p className={styles.content}>{details.content}</p>
              )}
            </div>
          )}

          {/* What's new bullet points */}
          {changes.length > 0 && (
            <div className={styles.changesSection}>
              <h4 className={styles.changesTitle}>
                <SparklesIcon size={14} />
                <span>What's new</span>
              </h4>
              <ul className={styles.changesList}>
                {changes.map((item, index) => (
                  <li key={index} className={styles.changeItem}>
                    <span className={styles.changeBullet} aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <button
            className={styles.confirmButton}
            onClick={onClose}
            aria-label="Close notification details"
          >
            <span>Got it 💜</span>
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? createPortal(modalContent, document.body)
    : modalContent;
};

export default InformativeNotificationModal;
