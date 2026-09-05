import React, { useState } from 'react';
import { EyeIcon, EyeOffIcon } from '../../icons/index.js';
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
  showPasswordToggle = false,
  isPasswordVisible: controlledVisible,
  onTogglePassword,
  rightElement,
  ...props
}) => {
  const [internalVisible, setInternalVisible] = useState(false);
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  const isControlled = controlledVisible !== undefined;
  const isVisible = isControlled ? controlledVisible : internalVisible;

  const isPassword = type === 'password';
  const effectiveType = isPassword && showPasswordToggle ? (isVisible ? 'text' : 'password') : type;

  const handleToggle = (e) => {
    e.preventDefault();
    if (!isControlled) {
      setInternalVisible((prev) => !prev);
    }
    if (onTogglePassword) {
      onTogglePassword(!isVisible);
    }
  };

  const hasTrailingAction = (isPassword && showPasswordToggle) || Boolean(rightElement);

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
            type={effectiveType}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={`${styles.input} ${error ? styles.hasError : ''} ${hasTrailingAction ? styles.hasTrailingAction : ''} ${className}`}
            {...props}
          />
        )}

        {isPassword && showPasswordToggle && (
          <button
            type="button"
            onClick={handleToggle}
            className={styles.passwordToggleBtn}
            aria-label={isVisible ? 'Hide password' : 'Show password'}
            title={isVisible ? 'Hide password' : 'Show password'}
            tabIndex={0}
          >
            {isVisible ? (
              <EyeOffIcon size={18} className={styles.toggleIcon} />
            ) : (
              <EyeIcon size={18} className={styles.toggleIcon} />
            )}
          </button>
        )}

        {!showPasswordToggle && rightElement && (
          <div className={styles.rightElementWrapper}>
            {rightElement}
          </div>
        )}
      </div>
      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
};

export default Input;
