import React from 'react';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  category?: string;
  action?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  category,
  action,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 mb-8 border-b border-ink">
      <div>
        {category && (
          <span className="text-xs font-mono uppercase tracking-widest text-vermilion font-semibold block mb-1">
            // {category}
          </span>
        )}
        <h1 className="font-editorial text-3xl md:text-4xl font-bold tracking-tight text-ink">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-sm md:text-base text-ink-muted max-w-2xl font-sans">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="shrink-0 flex items-center gap-3">{action}</div>}
    </div>
  );
};
