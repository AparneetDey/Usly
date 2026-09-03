import React from 'react';
import { getCategoryConfig } from '../categoryColors.js';
import styles from './CalendarEvent.module.css';

const CalendarEvent = ({ event, onClick }) => {
  const config = getCategoryConfig(event.type);
  const IconComp = config.iconComponent;

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
      title={`${config.label}: ${event.title} ${event.startTime ? `(${event.startTime})` : ''}`}
    >
      <IconComp size={12} color="currentColor" className="shrink-0" />
      <span className={styles.title}>{event.title}</span>
      {event.startTime && <span className={styles.time}>{event.startTime}</span>}
    </div>
  );
};

export default CalendarEvent;
