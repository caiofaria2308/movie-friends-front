import React, { type ButtonHTMLAttributes } from 'react';
import styles from './Button.module.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline';
    fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    fullWidth = false,
    className = '',
    ...props
}) => {
    return (
        <button
            className={`${styles.button} ${styles[variant]} ${fullWidth ? styles.fullWidth : ''} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
