import React from 'react';
import { getCategoryConfig } from '../categoryColors.js';
import styles from './CalendarEvent.module.css';

const CalendarEvent = ({ event, onClick }) => {
  const config = getCategoryConfig(event.type);

  return (
    <div
      className={styles.eventPill}
      style={{
        backgroundColor: config.bg,
        borderColor: config.border,
        color: config.text,
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick(event);
      }}
      title={`${config.emoji} ${event.title} ${event.startTime ? `(${event.startTime})` : ''}`}
    >
      <span className={styles.emoji}>{config.emoji}</span>
      <span className={styles.title}>{event.title}</span>
      {event.startTime && <span className={styles.time}>{event.startTime}</span>}
    </div>
  );
};

export default CalendarEvent;
