import React from 'react';
import styles from './Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.text}>
          <span>Usly</span>
          <span className={styles.heart}>❤️</span>
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
