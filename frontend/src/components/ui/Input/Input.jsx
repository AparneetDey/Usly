import React from 'react';
import styles from './Input.module.css';

const Input = ({
  label,
  error,
  type = 'text',
  placeholder,
  value,
  onChange,
  id,
  className = '',
  required = false,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={styles.group}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label} {required && <span className="text-highlight">*</span>}
        </label>
      )}
      <div className={styles.inputWrapper}>
        {type === 'textarea' ? (
          <textarea
            id={inputId}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={`${styles.input} ${error ? styles.hasError : ''} ${className}`}
            rows={4}
            {...props}
          />
        ) : (
          <input
            id={inputId}
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={`${styles.input} ${error ? styles.hasError : ''} ${className}`}
            {...props}
          />
        )}
      </div>
      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
};

export default Input;
