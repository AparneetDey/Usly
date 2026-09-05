import React from 'react';
import BaseIcon from './BaseIcon.jsx';

/**
 * Cute & Elegant Sparkles Icon for Usly Updates
 */
export const SparklesIcon = ({ color = 'currentColor', ...props }) => (
  <BaseIcon {...props}>
    <path
      d="M12 3C12 7.5 7.5 12 3 12C7.5 12 12 16.5 12 21C12 16.5 16.5 12 21 12C16.5 12 12 7.5 12 3Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M19 3C19 4.5 17.5 6 16 6C17.5 6 19 7.5 19 9C19 7.5 20.5 6 22 6C20.5 6 19 4.5 19 3Z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M5 18C5 19 4 20 3 20C4 20 5 21 5 22C5 21 6 20 7 20C6 20 5 19 5 18Z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </BaseIcon>
);

export default SparklesIcon;
