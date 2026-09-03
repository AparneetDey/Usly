import React from 'react';
import BaseIcon from './BaseIcon.jsx';

/**
 * Cute Paper Plane Send Icon with heart trail
 */
export const SendIcon = ({ color = 'currentColor', ...props }) => (
  <BaseIcon {...props}>
    <path d="M22 2L11 13" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </BaseIcon>
);

export default SendIcon;
