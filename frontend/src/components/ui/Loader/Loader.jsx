import React from 'react';
import styles from './Loader.module.css';

const Loader = ({ fullScreen = false, message = 'Loading Usly... 💜' }) => {
  return (
    <div className={`${styles.container} ${fullScreen ? styles.fullScreen : ''}`}>
      <span className={styles.heartPulse}>💖</span>
      {message && <p className={styles.message}>{message}</p>}
    </div>
  );
};

export default Loader;
