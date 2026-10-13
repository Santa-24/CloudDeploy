import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../components/PageHeader';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Skeleton } from '../../components/Skeleton';
import { AdminOverview } from '../../types';
import { adminService } from '../../services/adminService';
import {
  Users,
  FolderKanban,
  Zap,
  AlertTriangle,
  HardDrive,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';

export const AdminOverviewPage: React.FC = () => {
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    adminService.getOverview()
      .then(setOverview)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <Skeleton className="h-64" />;
  }

  return (
    <div className="space-y-8 font-sans">
      <PageHeader
        category="PLATFORM GOVERNANCE"
        title="Admin Control Center"
        subtitle="Global multi-tenant metrics, fleet capacity, and deployment health across all AWS regions."
      />

      {/* Global Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-paper-light border border-ink shadow-editorial">
          <div className="flex items-center justify-between text-xs font-mono text-ink-muted mb-2">
            <span>TOTAL TENANTS</span>
            <Users className="w-4 h-4 text-ink" />
          </div>
          <div className="font-editorial text-3xl font-bold text-ink">{overview?.totalUsers}</div>
          <div className="text-[11px] font-mono text-ink-faint mt-1">Cognito Registered Users</div>
        </div>

        <div className="p-5 bg-paper-light border border-ink shadow-editorial">
          <div className="flex items-center justify-between text-xs font-mono text-ink-muted mb-2">
            <span>STATIC WEBSITES</span>
            <FolderKanban className="w-4 h-4 text-ink" />
          </div>
          <div className="font-editorial text-3xl font-bold text-ink">{overview?.totalSites}</div>
          <div className="text-[11px] font-mono text-ink-faint mt-1">{overview?.activeSites} Active Routes</div>
        </div>

        <div className="p-5 bg-paper-light border border-ink shadow-editorial">
          <div className="flex items-center justify-between text-xs font-mono text-ink-muted mb-2">
            <span>TOTAL PIPELINES</span>
            <Zap className="w-4 h-4 text-lime-hover" />
          </div>
          <div className="font-editorial text-3xl font-bold text-ink">{overview?.totalDeployments}</div>
          <div className="text-[11px] font-mono text-ink-faint mt-1">Across all tenant projects</div>
        </div>

        <div className="p-5 bg-paper-light border border-ink shadow-editorial">
          <div className="flex items-center justify-between text-xs font-mono text-ink-muted mb-2">
            <span>GLOBAL S3 STORAGE</span>
            <HardDrive className="w-4 h-4 text-vermilion" />
          </div>
          <div className="font-editorial text-3xl font-bold text-ink">{overview?.storageFormatted}</div>
          <div className="text-[11px] font-mono text-ink-faint mt-1">Encrypted S3 bucket assets</div>
        </div>
      </div>

      {/* Quick Links & Platform Health */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card variant="editorial">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-ink">
            <h3 className="font-editorial text-lg font-bold text-ink">Tenant Accounts</h3>
            <Link to="/admin/users" className="text-xs font-mono text-vermilion hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <p className="text-xs text-ink-muted mb-4">
            Inspect tenant accounts, audit quotas, and review Cognito verification statuses.
          </p>
          <Link to="/admin/users">
            <button className="text-xs font-mono py-2 px-3 bg-ink text-paper hover:bg-vermilion transition-colors">
              Manage Tenants Directory →
            </button>
          </Link>
        </Card>

        <Card variant="editorial">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-ink">
            <h3 className="font-editorial text-lg font-bold text-ink">Failed Deployments</h3>
            <Link to="/admin/deployments?filter=failed" className="text-xs font-mono text-vermilion hover:underline flex items-center gap-1">
              Review failures ({overview?.failedDeployments}) <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <p className="text-xs text-ink-muted mb-4">
            Inspect rejected archives, ZIP Slip trigger alerts, and decompression limit triggers.
          </p>
          <Link to="/admin/deployments">
            <button className="text-xs font-mono py-2 px-3 bg-vermilion text-white hover:bg-vermilion-hover transition-colors">
              Inspect Pipeline Failures →
            </button>
          </Link>
        </Card>
      </div>
    </div>
  );
};
