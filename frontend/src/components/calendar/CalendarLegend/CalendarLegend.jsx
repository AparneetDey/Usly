import React from 'react';
import { CATEGORY_CONFIG } from '../categoryColors.js';
import styles from './CalendarLegend.module.css';

const CalendarLegend = () => {
  const categories = Object.values(CATEGORY_CONFIG);

  return (
    <div className={styles.legendContainer}>
      <span className={styles.legendTitle}>Legend:</span>
      {categories.map((cat) => (
        <span
          key={cat.key}
          className={styles.legendItem}
          style={{
            backgroundColor: cat.bg,
            borderColor: cat.border,
            color: cat.text,
          }}
        >
          <span>{cat.emoji}</span>
          <span>{cat.label}</span>
        </span>
      ))}
    </div>
  );
};

export default CalendarLegend;
