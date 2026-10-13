import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  helperText,
  error,
  leftIcon,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full text-left">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-mono uppercase tracking-wider text-ink-muted mb-1.5 font-medium">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-ink-faint">
            {leftIcon}
          </div>
        )}
        <input
          id={inputId}
          className={`w-full bg-paper-light text-ink border border-ink placeholder:text-stone focus:outline-none focus:ring-1 focus:ring-ink focus:border-ink px-3 py-2 text-sm transition-all duration-150 ${
            leftIcon ? 'pl-9' : ''
          } ${error ? 'border-red-600 focus:border-red-600 focus:ring-red-600' : ''} ${className}`}
          {...props}
        />
      </div>
      {error ? (
        <p className="mt-1 text-xs text-red-700 font-mono">{error}</p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-ink-faint">{helperText}</p>
      ) : null}
    </div>
  );
};
