import React from 'react';
import { DAY_NAMES, isSameDay } from '../dateUtils.js';
import CalendarDay from '../CalendarDay/CalendarDay.jsx';
import styles from './CalendarGrid.module.css';

const CalendarGrid = ({
  days = [],
  events = [],
  selectedDay,
  onSelectDay,
  onEventClick,
}) => {
  return (
    <div className={styles.gridContainer}>
      <div className={styles.weekdayHeader}>
        {DAY_NAMES.map((dayName) => (
          <div key={dayName} className={styles.weekdayCell}>
            {dayName}
          </div>
        ))}
      </div>

      <div className={styles.daysGrid}>
        {days.map((day) => {
          // Filter events occurring on this specific calendar day
          const dayEvents = events.filter((evt) => isSameDay(evt.date, day.date));

          return (
            <CalendarDay
              key={day.dateString}
              day={day}
              events={dayEvents}
              isSelected={selectedDay && isSameDay(selectedDay.date, day.date)}
              onSelectDay={onSelectDay}
              onEventClick={onEventClick}
            />
          );
        })}
      </div>
    </div>
  );
};

export default CalendarGrid;
