import React, { type InputHTMLAttributes } from 'react';
import styles from './Input.module.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    fullWidth?: boolean;
}

const Input: React.FC<InputProps> = ({
    label,
    error,
    fullWidth = false,
    className = '',
    id,
    ...props
}) => {
    const inputId = id || props.name;

    return (
        <div className={`${styles.container} ${fullWidth ? styles.fullWidth : ''} ${className}`}>
            {label && <label htmlFor={inputId} className={styles.label}>{label}</label>}
            <input
                id={inputId}
                className={`${styles.input} ${error ? styles.hasError : ''}`}
                {...props}
            />
            {error && <span className={styles.errorText}>{error}</span>}
        </div>
    );
};

export default Input;
