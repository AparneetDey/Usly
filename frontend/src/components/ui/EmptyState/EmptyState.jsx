import React from 'react';
import styles from './EmptyState.module.css';

const EmptyState = ({ icon = '💌', title = 'Nothing here yet', description, action }) => {
  return (
    <div className={styles.container}>
      <div className={styles.icon}>{icon}</div>
      <h4 className={styles.title}>{title}</h4>
      {description && <p className={styles.description}>{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
};

export default EmptyState;
