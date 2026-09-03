import React from 'react';
import { HeartIcon } from '../../icons/index.js';
import styles from './Loader.module.css';

const Loader = ({ fullScreen = false, message = 'Loading Usly...' }) => {
  return (
    <div className={`${styles.container} ${fullScreen ? styles.fullScreen : ''}`}>
      <div className={styles.heartPulse}>
        <HeartIcon size={32} filled className="text-accent" />
      </div>
      {message && <p className={styles.message}>{message}</p>}
    </div>
  );
};

export default Loader;
