import React from 'react';
import {
  HeartIcon,
  GiftIcon,
  LocationPinIcon,
  StarIcon,
  CalendarIcon,
  CheckIcon,
  ClockIcon,
  MessageCircleIcon,
} from '../../icons/index.js';
import styles from './Badge.module.css';

const EVENT_ICON_MAP = {
  anniversary: HeartIcon,
  birthday: GiftIcon,
  first_date: HeartIcon,
  trip: LocationPinIcon,
  special_day: StarIcon,
  custom: CalendarIcon,
  resolved: CheckIcon,
  pending: ClockIcon,
  seen: ClockIcon,
  discussing: MessageCircleIcon,
};

const Badge = ({ type, children, icon }) => {
  const badgeClass = styles[type] || styles.custom;
  const IconComp = EVENT_ICON_MAP[type];

  return (
    <span className={`${styles.badge} ${badgeClass}`}>
      {icon ? (
        <span>{icon}</span>
      ) : IconComp ? (
        <IconComp size={12} color="currentColor" />
      ) : null}
      <span>{children || type?.replace('_', ' ')}</span>
    </span>
  );
};

export default Badge;
