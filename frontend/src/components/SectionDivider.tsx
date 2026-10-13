import React from 'react';

export interface SectionDividerProps {
  label?: string;
  badge?: string;
  className?: string;
}

export const SectionDivider: React.FC<SectionDividerProps> = ({
  label,
  badge,
  className = '',
}) => {
  return (
    <div className={`relative my-8 ${className}`}>
      <div className="absolute inset-0 flex items-center" aria-hidden="true">
        <div className="w-full border-t border-ink" />
      </div>
      {(label || badge) && (
        <div className="relative flex items-center justify-between">
          {label && (
            <span className="bg-paper pr-4 text-xs font-mono uppercase tracking-widest text-ink font-semibold">
              {label}
            </span>
          )}
          {badge && (
            <span className="bg-paper pl-4 text-xs font-mono text-stone font-medium">
              [{badge}]
            </span>
          )}
        </div>
      )}
    </div>
  );
};
