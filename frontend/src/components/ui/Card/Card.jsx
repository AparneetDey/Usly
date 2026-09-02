import React from 'react';
import styles from './Card.module.css';

const Card = ({
  children,
  hoverable = false,
  glass = false,
  accentBorder = false,
  className = '',
  onClick,
  ...props
}) => {
  const classNames = [
    styles.card,
    hoverable ? styles.hoverable : '',
    glass ? styles.glass : '',
    accentBorder ? styles.accentBorder : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classNames} onClick={onClick} {...props}>
      {children}
    </div>
  );
};

export default Card;
