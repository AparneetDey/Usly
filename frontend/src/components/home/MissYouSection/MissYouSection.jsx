import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { HeartIcon, CloseIcon, CheckIcon } from '../../icons/index.js';
import notificationApiService from '../../../services/notification.service.js';
import styles from './MissYouSection.module.css';

/**
 * MissYouSection Component
 *
 * Dedicated Home page card allowing a partner to send an "I Miss You"
 * priority notification and Web Push alert after an explicit confirmation.
 * Enforces server-side cooldown and prevents accidental triggers.
 */
const MissYouSection = ({ partner }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [justSent, setJustSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const timerRef = useRef(null);

  const partnerName = partner?.name || 'them';

  // Fetch initial cooldown status on mount
  const checkStatus = useCallback(async () => {
    try {
      const data = await notificationApiService.getMissYouStatus();
      if (data && typeof data.remainingSeconds === 'number') {
        setCooldownRemaining(data.remainingSeconds);
      }
    } catch {
      // Non-blocking status check failure
    }
  }, []);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  // Countdown timer for cooldown
  useEffect(() => {
    if (cooldownRemaining <= 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setCooldownRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [cooldownRemaining]);

  // Escape key handler for modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && modalOpen && !isSending) {
        setModalOpen(false);
        setErrorMessage('');
      }
    };

    if (modalOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [modalOpen, isSending]);

  const handleOpenModal = () => {
    if (cooldownRemaining > 0 || isSending) return;
    setErrorMessage('');
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    if (isSending) return;
    setModalOpen(false);
    setErrorMessage('');
  };

  const handleSend = async () => {
    if (isSending) return;
    setIsSending(true);
    setErrorMessage('');

    try {
      const response = await notificationApiService.sendMissYou();
      const cooldownSec = response?.cooldownSeconds || 900; // default 15m

      setCooldownRemaining(cooldownSec);
      setJustSent(true);
      setModalOpen(false);

      // Flash "Sent 💜" state for 5 seconds before settling into cooldown state
      setTimeout(() => {
        setJustSent(false);
      }, 5000);
    } catch (err) {
      setErrorMessage(err?.message || "Couldn't send it right now. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const formatCooldownMinutes = (seconds) => {
    const mins = Math.ceil(seconds / 60);
    return mins > 1 ? `${mins}m` : `${seconds}s`;
  };

  const isCooldownActive = cooldownRemaining > 0;

  const modalElement = modalOpen ? (
    <div
      className={styles.modalBackdrop}
      onClick={handleCloseModal}
      role="presentation"
    >
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="miss-you-modal-title"
      >
        <div className={styles.modalHeader}>
          <button
            className={styles.modalCloseBtn}
            onClick={handleCloseModal}
            disabled={isSending}
            aria-label="Close"
          >
            <CloseIcon size={16} />
          </button>

          <div className={styles.modalHeartBadge}>
            <HeartIcon size={24} filled />
          </div>

          <h3 id="miss-you-modal-title" className={styles.modalTitle}>
            Missing {partner?.name ? partner.name : 'them'}?
          </h3>
        </div>

        <div className={styles.modalBody}>
          <p className={styles.modalDescription}>
            Send an “I miss you” notification to{' '}
            <span className={styles.partnerHighlight}>{partnerName}</span>?
          </p>

          {errorMessage && (
            <div className={styles.modalError} role="alert">
              {errorMessage}
            </div>
          )}
        </div>

        <div className={styles.modalFooter}>
          <button
            className={styles.cancelBtn}
            onClick={handleCloseModal}
            disabled={isSending}
          >
            Cancel
          </button>

          <button
            className={styles.sendBtn}
            onClick={handleSend}
            disabled={isSending}
            aria-busy={isSending}
          >
            <HeartIcon size={15} filled />
            <span>{isSending ? 'Sending...' : 'Send ♡'}</span>
          </button>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <section className={styles.card} aria-label="I Miss You section">
        <div className={styles.contentWrapper}>
          <div className={styles.iconBadge} aria-hidden="true">
            <HeartIcon size={22} filled />
          </div>

          <div className={styles.textGroup}>
            <h2 className={styles.title}>
              {partner?.name ? `Thinking of ${partner.name}?` : 'Thinking of them?'}
            </h2>
            <p className={styles.subtitle}>
              Send a little reminder that they're on your mind.
            </p>
          </div>
        </div>

        <div className={styles.actions}>
          {justSent ? (
            <button
              className={`${styles.missYouBtn} ${styles.sentSuccessBtn}`}
              disabled
              aria-label="Notification sent"
            >
              <CheckIcon size={16} />
              <span>Sent 💜</span>
            </button>
          ) : isCooldownActive ? (
            <button
              className={`${styles.missYouBtn} ${styles.cooldownBtn}`}
              disabled
              title={`You can send another in ${formatCooldownMinutes(cooldownRemaining)}`}
              aria-label={`Sent recently. Cooldown active for ${formatCooldownMinutes(cooldownRemaining)}`}
            >
              <CheckIcon size={15} />
              <span>Sent recently ({formatCooldownMinutes(cooldownRemaining)})</span>
            </button>
          ) : (
            <button
              className={styles.missYouBtn}
              onClick={handleOpenModal}
              aria-label={`Send an I Miss You notification to ${partnerName}`}
            >
              <HeartIcon size={16} filled />
              <span>I Miss You</span>
            </button>
          )}

          {justSent && (
            <span className={styles.successNotice}>
              They'll know you're thinking of them.
            </span>
          )}
        </div>
      </section>

      {/* Confirmation Modal portal attached directly to document.body */}
      {typeof document !== 'undefined' && modalElement
        ? createPortal(modalElement, document.body)
        : modalElement}
    </>
  );
};

export default MissYouSection;
