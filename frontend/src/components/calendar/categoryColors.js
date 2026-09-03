import {
  HeartIcon,
  GiftIcon,
  LocationPinIcon,
  StarIcon,
  CalendarIcon,
} from '../icons/index.js';

export const CATEGORY_CONFIG = {
  anniversary: {
    key: 'anniversary',
    label: 'Anniversary',
    emoji: '❤️',
    iconComponent: HeartIcon,
    bg: '#FFF1F2',
    border: '#FECDD3',
    text: '#E11D48',
    dot: '#E11D48',
  },
  birthday: {
    key: 'birthday',
    label: 'Birthday',
    emoji: '🎂',
    iconComponent: GiftIcon,
    bg: '#FDF2F8',
    border: '#FBCFE8',
    text: '#BE185D',
    dot: '#EC4899',
  },
  first_date: {
    key: 'first_date',
    label: 'First Date',
    emoji: '🌸',
    iconComponent: HeartIcon,
    bg: '#F5F3FF',
    border: '#DDD6FE',
    text: '#6D28D9',
    dot: '#6D28D9',
  },
  trip: {
    key: 'trip',
    label: 'Trip',
    emoji: '✈️',
    iconComponent: LocationPinIcon,
    bg: '#F3E8FF',
    border: '#E9D5FF',
    text: '#7C3AED',
    dot: '#8B5CF6',
  },
  special_day: {
    key: 'special_day',
    label: 'Special Day',
    emoji: '✨',
    iconComponent: StarIcon,
    bg: '#EDE9FE',
    border: '#C4B5FD',
    text: '#5B21B6',
    dot: '#7C3AED',
  },
  custom: {
    key: 'custom',
    label: 'Custom',
    emoji: '📌',
    iconComponent: CalendarIcon,
    bg: '#F8F6FC',
    border: '#D8CCEA',
    text: '#24132F',
    dot: '#5F5268',
  },
};

export const getCategoryConfig = (type) => {
  return CATEGORY_CONFIG[type] || CATEGORY_CONFIG.custom;
};
