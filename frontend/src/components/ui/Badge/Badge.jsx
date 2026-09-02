import React from 'react';
import styles from './Badge.module.css';

const EVENT_ICONS = {
  anniversary: '❤️',
  birthday: '🎂',
  first_date: '🌸',
  trip: '✈️',
  special_day: '✨',
  custom: '💫',
};

const Badge = ({ type, children, icon }) => {
  const badgeClass = styles[type] || styles.custom;
  const defaultIcon = EVENT_ICONS[type];

  return (
    <span className={`${styles.badge} ${badgeClass}`}>
      {(icon || defaultIcon) && <span>{icon || defaultIcon}</span>}
      <span>{children || type?.replace('_', ' ')}</span>
    </span>
  );
};

export default Badge;
