import React from 'react';
import { isToday } from '../dateUtils.js';
import CalendarEvent from '../CalendarEvent/CalendarEvent.jsx';
import styles from './CalendarDay.module.css';

const MAX_VISIBLE_EVENTS = 2;

const CalendarDay = ({
  day,
  events = [],
  isSelected,
  onSelectDay,
  onEventClick,
}) => {
  const isDayToday = isToday(day.date);
  const visibleEvents = events.slice(0, MAX_VISIBLE_EVENTS);
  const overflowCount = events.length - MAX_VISIBLE_EVENTS;

  return (
    <div
      className={`${styles.dayCell} ${!day.isCurrentMonth ? styles.adjacentMonth : ''} ${
        isSelected ? styles.selected : ''
      }`}
      onClick={() => onSelectDay(day)}
    >
      <div className={styles.dayHeader}>
        <span className={`${styles.dayNumber} ${isDayToday ? styles.todayNumber : ''}`}>
          {day.dayNumber}
        </span>
      </div>

      <div className={styles.eventsContainer}>
        {visibleEvents.map((evt) => (
          <CalendarEvent key={evt._id} event={evt} onClick={onEventClick} />
        ))}

        {overflowCount > 0 && (
          <span
            className={styles.morePill}
            onClick={(e) => {
              e.stopPropagation();
              onSelectDay(day);
            }}
          >
            +{overflowCount} more
          </span>
        )}
      </div>
    </div>
  );
};

export default CalendarDay;
