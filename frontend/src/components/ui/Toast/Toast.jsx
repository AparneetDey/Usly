import React, { useEffect } from 'react';
import { HeartIcon, WarningIcon } from '../../icons/index.js';
import styles from './Toast.module.css';

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div className={`${styles.toast} ${styles[type]}`}>
      <span>
        {type === 'success' ? (
          <HeartIcon size={16} filled className="text-accent" />
        ) : (
          <WarningIcon size={16} className="text-highlight" />
        )}
      </span>
      <span>{message}</span>
    </div>
  );
};

export default Toast;
