import React from 'react';
import { DeploymentStatus } from '../types';

export interface BadgeProps {
  status?: DeploymentStatus | 'USER' | 'ADMIN' | 'ACTIVE' | 'SUSPENDED' | 'LIVE' | 'DEMO';
  label?: string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ status, label, className = '' }) => {
  const displayLabel = label || status;

  const getStyle = () => {
    switch (status) {
      case 'SUCCEEDED':
      case 'LIVE':
      case 'ACTIVE':
        return 'bg-[#E8F5E9] text-[#1B5E20] border-[#2E7D32]';
      case 'FAILED':
      case 'SUSPENDED':
        return 'bg-[#FFEBEE] text-[#B71C1C] border-[#C62828]';
      case 'PUBLISHING':
        return 'bg-[#FFF3E0] text-[#E65100] border-[#EF6C00] animate-pulse';
      case 'VALIDATING':
        return 'bg-[#E0F7FA] text-[#006064] border-[#00838F] animate-pulse';
      case 'QUEUED':
        return 'bg-[#EFEBE9] text-[#4E342E] border-[#5D4037]';
      case 'ADMIN':
        return 'bg-lime text-ink border-ink font-bold';
      case 'USER':
        return 'bg-paper-dark text-ink border-ink';
      case 'DEMO':
        return 'bg-vermilion text-white border-ink font-bold uppercase';
      default:
        return 'bg-paper-dark text-ink border-stone';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs font-mono font-medium border uppercase tracking-wider rounded-none ${getStyle()} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-80" />
      {displayLabel}
    </span>
  );
};
