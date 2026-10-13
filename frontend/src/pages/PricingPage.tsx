import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { PricingSection } from '../components/PricingSection';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { useAuth } from '../hooks/useAuth';
import { siteService } from '../services/siteService';
import { planService } from '../services/planService';
import { ArrowLeft, Sparkles, FolderKanban, HardDrive, CheckCircle2 } from 'lucide-react';

export const PricingPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [siteCount, setSiteCount] = useState<number>(0);

  useEffect(() => {
    if (isAuthenticated) {
      siteService.getSites()
        .then(sites => setSiteCount(sites.length))
        .catch(console.error);
    }
  }, [isAuthenticated]);

  const currentTier = user?.planTier || 'FREE';
  const planInfo = planService.getPlanById(currentTier);

  return (
    <div className="bg-paper min-h-screen py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            to={isAuthenticated ? '/dashboard' : '/'}
            className="inline-flex items-center gap-2 text-xs font-mono text-ink-muted hover:text-ink transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{isAuthenticated ? 'Back to Dashboard Console' : 'Back to Home'}</span>
          </Link>

          {isAuthenticated && (
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-ink-faint">Logged in as:</span>
              <span className="text-xs font-mono font-semibold text-ink">{user?.email}</span>
            </div>
          )}
        </div>

        {/* Current Active Plan Status Banner for Logged-In Users */}
        {isAuthenticated && (
          <div className="p-6 bg-paper-light border-2 border-ink shadow-editorial flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-mono uppercase text-ink-faint tracking-wider">
                  Active Subscription:
                </span>
                <span className="px-2.5 py-0.5 bg-vermilion text-white text-xs font-mono font-bold uppercase border border-ink">
                  {planInfo.name} Tier
                </span>
              </div>
              <h2 className="font-editorial text-2xl font-bold text-ink">
                {currentTier === 'FREE' ? 'You are currently on the Free Plan' : `Active ${planInfo.name} Subscription`}
              </h2>
              <p className="text-xs text-ink-muted font-mono">
                Allocated capacity: {user?.maxSites || 3} project repositories and {((user?.storageQuotaBytes || 52428800) / 1024 / 1024).toFixed(0)} MB of S3 storage.
              </p>
            </div>

            <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-ink/20 pt-4 md:pt-0 md:pl-6">
              <div className="text-left font-mono">
                <div className="text-[11px] text-ink-faint uppercase">Projects Used</div>
                <div className="font-editorial text-2xl font-bold text-ink">
                  {siteCount} / {user?.maxSites || 3}
                </div>
                <div className="text-[10px] text-ink-muted">
                  {user?.maxSites && siteCount >= user.maxSites
                    ? 'Quota reached — upgrade below'
                    : `${(user?.maxSites || 3) - siteCount} slot(s) remaining`}
                </div>
              </div>

              {currentTier === 'FREE' && siteCount >= (user?.maxSites || 3) && (
                <div className="p-2 bg-vermilion/10 border border-vermilion text-vermilion text-xs font-mono font-bold animate-pulse">
                  Upgrade Required for New Deployments
                </div>
              )}
            </div>
          </div>
        )}

        {/* Full Interactive Pricing Section */}
        <PricingSection showTitle={true} />
      </div>
    </div>
  );
};
