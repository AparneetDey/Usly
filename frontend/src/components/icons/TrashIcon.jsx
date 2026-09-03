import React from 'react';
import BaseIcon from './BaseIcon.jsx';

/**
 * Cute rounded Trash / Delete Icon with heart detail
 */
export const TrashIcon = ({ color = 'currentColor', ...props }) => (
  <BaseIcon {...props}>
    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 14.5l-.3-.28c-1-.9-1.5-1.5-1.5-2.22 0-.6.47-1.08 1.07-1.08.34 0 .66.16.88.4.22-.24.54-.4.88-.4.6 0 1.07.48 1.07 1.08 0 .72-.5 1.32-1.5 2.22L12 14.5z" fill={color} />
  </BaseIcon>
);

export default TrashIcon;
