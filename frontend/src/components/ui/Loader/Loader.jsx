import React from 'react';
import styles from './Loader.module.css';

/**
 * Usly Reusable Loading Screen / Loader
 *
 * Implements a gentle, repeating breathing animation focused on the Usly logo
 * with an ambient supporting glow, adhering to Usly's design tokens and accessibility standards.
 *
 * @param {boolean} fullScreen - Display as fixed full-screen overlay (100dvh)
 * @param {string} message - Optional user-facing loading message
 * @param {string} className - Optional custom class name
 */
const Loader = ({ fullScreen = false, message = '', className = '' }) => {
  return (
    <div
      className={`${styles.container} ${fullScreen ? styles.fullScreen : ''} ${className}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className={styles.animationWrapper}>
        {/* Subtle ambient supporting glow */}
        <div className={styles.glow} aria-hidden="true" />

        {/* Core breathing Usly logo */}
        <img
          src="/usly-logo.png"
          alt="Usly"
          className={styles.logo}
          draggable={false}
        />
      </div>

      {message ? (
        <p className={styles.message}>{message}</p>
      ) : (
        <span className={styles.srOnly}>Loading Usly, please wait...</span>
      )}
    </div>
  );
};

export { Loader, Loader as LoadingScreen };
export default Loader;
