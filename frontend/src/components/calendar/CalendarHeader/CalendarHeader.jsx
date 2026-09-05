import React from 'react';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  PlusIcon,
} from '../../icons/index.js';
import { MONTH_NAMES } from '../dateUtils.js';
import Button from '../../ui/Button/Button.jsx';
import styles from './CalendarHeader.module.css';

const CalendarHeader = ({
  currentYear,
  currentMonth,
  onPrevMonth,
  onNextMonth,
  onToday,
  onYearChange,
  onAddEvent,
}) => {
  const startYear = 2000;
  const endYear = Math.max(2050, currentYear + 10);
  const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);

  return (
    <div className={styles.headerContainer}>
      <div className={styles.leftControls}>
        <div className={styles.navGroup}>
          <Button variant="ghost" size="sm" onClick={onPrevMonth} title="Previous Month">
            <ChevronLeftIcon size={18} />
          </Button>
          <Button variant="ghost" size="sm" onClick={onToday} title="Go to Today">
            Today
          </Button>
          <Button variant="ghost" size="sm" onClick={onNextMonth} title="Next Month">
            <ChevronRightIcon size={18} />
          </Button>
        </div>

        <div className={styles.monthYearTitle}>
          <span className={styles.monthText}>{MONTH_NAMES[currentMonth]}</span>
          <div className={styles.yearSelectWrapper}>
            <select
              value={currentYear}
              onChange={(e) => onYearChange(parseInt(e.target.value, 10))}
              className={styles.yearSelect}
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <ChevronDownIcon size={16} className={styles.yearChevron} />
          </div>
        </div>
      </div>

      <div className={styles.rightControls}>
        <span className={styles.viewBadge}>Month View</span>
        <Button variant="primary" onClick={onAddEvent}>
          <PlusIcon size={18} />
          <span>Add Event</span>
        </Button>
      </div>
    </div>
  );
};

export default CalendarHeader;
