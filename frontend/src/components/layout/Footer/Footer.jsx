import React from 'react';
import { HeartIcon } from '../../icons/index.js';
import styles from './Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.text}>
          <span>Usly</span>
          <HeartIcon size={14} filled className="text-highlight inline-block mx-1" />
          <span>Our Private Space</span>
        </div>
        <div>
          <span>Made for two</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
