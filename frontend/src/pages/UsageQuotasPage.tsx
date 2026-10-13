import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { QuotaGauge } from '../features/QuotaGauge';
import { Skeleton } from '../components/Skeleton';
import { UpgradePlanModal } from '../components/UpgradePlanModal';
import { UsageQuota } from '../types';
import { usageService } from '../services/usageService';
import { useAuth } from '../hooks/useAuth';
import { planService } from '../services/planService';
import { HardDrive, AlertCircle, ShieldCheck, Zap, Sparkles, ArrowRight } from 'lucide-react';

export const UsageQuotasPage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [usage, setUsage] = useState<UsageQuota | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  useEffect(() => {
    usageService.getUsage()
      .then(setUsage)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <Skeleton className="h-64" />;
  }

  const currentTier = user?.planTier || 'FREE';
  const planInfo = planService.getPlanById(currentTier);

  return (
    <div className="max-w-4xl space-y-8 font-sans">
      <PageHeader
        category="TENANT RESOURCE UTILIZATION"
        title="Usage & Quotas"
        subtitle="Monitor Amazon S3 storage consumption, active website allocations, and account rate limits."
        action={
          <Button
            variant="vermilion"
            size="sm"
            onClick={() => setUpgradeModalOpen(true)}
            leftIcon={<Zap className="w-4 h-4" />}
          >
            Manage Plan
          </Button>
        }
      />

      {/* Plan Tier Status Card */}
      <div className="p-6 bg-paper-light border-2 border-ink shadow-editorial flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-ink-faint">
              Active Plan Tier:
            </span>
            <span className="px-2 py-0.5 bg-vermilion text-white text-xs font-mono font-bold uppercase border border-ink">
              {planInfo.name} (${planInfo.priceMonthly}/mo)
            </span>
          </div>
          <div className="font-editorial text-2xl font-bold text-ink">
            {currentTier === 'FREE' ? 'Free Tier (Up to 3 Projects)' : `${planInfo.name} Infrastructure`}
          </div>
          <p className="text-xs text-ink-muted font-mono mt-1">
            Max Projects: <strong>{usage?.maxSites || user?.maxSites || 3}</strong> • S3 Limit: <strong>{((usage?.storageQuotaBytes || 52428800) / 1024 / 1024).toFixed(0)} MB</strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/pricing">
            <Button variant="secondary" size="sm">
              All Plans
            </Button>
          </Link>
          <Button
            variant="vermilion"
            size="sm"
            onClick={() => setUpgradeModalOpen(true)}
            leftIcon={<Zap className="w-4 h-4" />}
          >
            {currentTier === 'FREE' ? 'Upgrade to Pro' : 'Change Plan'}
          </Button>
        </div>
      </div>

      {usage && <QuotaGauge usage={usage} />}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card variant="flat" className="bg-paper-light">
          <h4 className="font-editorial text-lg font-bold text-ink mb-2">
            Storage Retention & Pruning
          </h4>
          <p className="text-xs text-ink-muted leading-relaxed mb-4">
            CloudDeploy retains deployment history for rapid rollback operations. Incomplete uploads and temporary staging files are automatically cleaned up to prevent quota bloat.
          </p>
          <div className="p-3 bg-paper border border-stone-subtle text-xs font-mono text-ink-faint">
            Lifecycle Policy: Upload staging buckets automatically purge unreferenced archives after 7 days.
          </div>
        </Card>

        <Card variant="flat" className="bg-paper-light">
          <h4 className="font-editorial text-lg font-bold text-ink mb-2">
            SaaS Plan Scaling
          </h4>
          <p className="text-xs text-ink-muted leading-relaxed mb-4">
            Need more projects or higher object storage capacity? Upgrading to Pro provides 25 website slots, 5 GB S3 storage, custom domain SSL routing, and edge cache invalidation.
          </p>
          <div className="p-3 bg-paper border border-stone-subtle text-xs font-mono text-ink-faint flex items-center justify-between">
            <span>Instant provisioning without downtime</span>
            <button
              onClick={() => setUpgradeModalOpen(true)}
              className="text-vermilion font-bold hover:underline"
            >
              Upgrade →
            </button>
          </div>
        </Card>
      </div>

      <UpgradePlanModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        targetTier="PRO"
        onUpgraded={async () => {
          await refreshUser();
          const refreshedUsage = await usageService.getUsage();
          setUsage(refreshedUsage);
        }}
      />
    </div>
  );
};
