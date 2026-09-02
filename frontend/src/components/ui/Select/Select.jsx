import React from 'react';
import { ChevronDown } from 'lucide-react';
import styles from './Select.module.css';

const Select = ({
  label,
  options = [],
  value,
  onChange,
  error,
  required = false,
  className = '',
  id,
  name,
  disabled = false,
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

      <div className={styles.selectWrapper}>
        <select
          id={inputId}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`${styles.select} ${error ? styles.hasError : ''} ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown size={18} className={styles.icon} />
      </div>

      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
};

export default Select;
