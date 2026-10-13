import React from 'react';
import { UsageQuota } from '../types';

interface QuotaGaugeProps {
  usage: UsageQuota;
}

export const QuotaGauge: React.FC<QuotaGaugeProps> = ({ usage }) => {
  const formatBytes = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const storagePercent = Math.min(100, Math.round((usage.storageBytes / (usage.storageQuotaBytes || 1)) * 100));
  const projectPercent = Math.min(100, Math.round((usage.projectCount / (usage.maxSites || 1)) * 100));

  return (
    <div className="card-editorial p-6 bg-paper-light">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-ink">
        <h3 className="font-editorial text-lg font-bold text-ink">Tenant Resource Quotas</h3>
        <span className="font-mono text-xs text-ink-faint">Amazon S3 Storage Limits</span>
      </div>

      <div className="space-y-6">
        {/* Storage Quota */}
        <div>
          <div className="flex justify-between text-xs font-mono mb-1.5">
            <span className="text-ink font-semibold">S3 Object Storage</span>
            <span className="text-ink-muted">
              {formatBytes(usage.storageBytes)} / {formatBytes(usage.storageQuotaBytes)} ({storagePercent}%)
            </span>
          </div>
          <div className="w-full bg-paper border border-ink h-4 p-0.5">
            <div
              className={`h-full transition-all duration-300 ${
                storagePercent > 85 ? 'bg-red-600' : storagePercent > 60 ? 'bg-vermilion' : 'bg-lime'
              }`}
              style={{ width: `${storagePercent}%` }}
            />
          </div>
        </div>

        {/* Project Count Quota */}
        <div>
          <div className="flex justify-between text-xs font-mono mb-1.5">
            <span className="text-ink font-semibold">Registered Websites</span>
            <span className="text-ink-muted">
              {usage.projectCount} / {usage.maxSites} Projects ({projectPercent}%)
            </span>
          </div>
          <div className="w-full bg-paper border border-ink h-4 p-0.5">
            <div
              className={`h-full transition-all duration-300 ${
                projectPercent > 80 ? 'bg-vermilion' : 'bg-ink'
              }`}
              style={{ width: `${projectPercent}%` }}
            />
          </div>
        </div>

        <div className="pt-2 border-t border-stone-subtle flex items-center justify-between text-xs font-mono text-ink-faint">
          <span>Total Lifetime Deployments: {usage.deploymentCount}</span>
          <span className="text-vermilion">Per-User Isolation Enforced</span>
        </div>
      </div>
    </div>
  );
};
