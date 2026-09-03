import React from 'react';
import BaseIcon from './BaseIcon.jsx';

/**
 * Cute Open Envelope / Letter Icon
 */
export const OpenMailIcon = ({ color = 'currentColor', ...props }) => (
  <BaseIcon {...props}>
    <path d="M3 19h18a2 2 0 002-2V9a2 2 0 00-2-2H3a2 2 0 00-2 2v8a2 2 0 002 2z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3 7l9-5 9 5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 14.5l-.35-.32c-1.25-1.12-1.95-1.87-1.95-2.78 0-.75.58-1.35 1.33-1.35.42 0 .82.2 1.1.5.28-.3.68-.5 1.1-.5.75 0 1.33.6 1.33 1.35 0 .91-.7 1.66-1.95 2.78L12 14.5z" fill={color} />
  </BaseIcon>
);

export default OpenMailIcon;
