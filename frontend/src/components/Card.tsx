import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'editorial' | 'flat' | 'dark' | 'lime' | 'vermilion';
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'editorial',
  hoverable = false,
  className = '',
  ...props
}) => {
  const baseStyles = 'p-6 transition-all duration-150';

  const variantStyles = {
    editorial: 'bg-paper-light border border-ink shadow-editorial',
    flat: 'bg-paper-light border border-stone-subtle',
    dark: 'bg-ink text-paper border border-ink shadow-editorial',
    lime: 'bg-lime text-ink border border-ink shadow-editorial',
    vermilion: 'bg-vermilion-light border border-vermilion text-ink',
  };

  const hoverStyle = hoverable ? 'hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_0px_#1D1C19]' : '';

  return (
    <div className={`${baseStyles} ${variantStyles[variant]} ${hoverStyle} ${className}`} {...props}>
      {children}
    </div>
  );
};
