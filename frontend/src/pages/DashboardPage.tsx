import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { SectionDivider } from '../components/SectionDivider';
import { Skeleton } from '../components/Skeleton';
import { QuotaGauge } from '../features/QuotaGauge';
import { Site, Deployment, UsageQuota } from '../types';
import { siteService } from '../services/siteService';
import { deploymentService } from '../services/deploymentService';
import { usageService } from '../services/usageService';
import { useAuth } from '../hooks/useAuth';
import { UpgradePlanModal } from '../components/UpgradePlanModal';
import {
  FolderKanban,
  CheckCircle2,
  AlertTriangle,
  HardDrive,
  Plus,
  ArrowRight,
  ExternalLink,
  Upload,
  Globe,
  Clock,
  Zap,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [sites, setSites] = useState<Site[]>([]);
  const [recentDeployments, setRecentDeployments] = useState<Deployment[]>([]);
  const [usage, setUsage] = useState<UsageQuota | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [sitesData, usageData] = await Promise.all([
          siteService.getSites(),
          usageService.getUsage(),
        ]);
        setSites(sitesData);
        setUsage(usageData);

        // Fetch recent deployments across user sites
        if (sitesData.length > 0) {
          const allDeps = await Promise.all(
            sitesData.slice(0, 3).map(s => deploymentService.getDeployments(s.id))
          );
          const flat = allDeps.flat().sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
          setRecentDeployments(flat.slice(0, 5));
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const totalSites = sites.length;
  const successfulDeployments = sites.reduce((acc, s) => acc + (s.deploymentCount || 0), 0);
  const totalStorage = usage ? (usage.storageBytes / (1024 * 1024)).toFixed(1) : '0';

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Workspace Overview" subtitle="Loading tenant telemetry..." />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-28" count={4} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans">
      <PageHeader
        category="TENANT DASHBOARD"
        title="Workspace Overview"
        subtitle={`Active session for ${user?.email}. Real-time AWS storage and deployment telemetry.`}
        action={
          <Link to="/projects/new">
            <Button variant="vermilion" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
              New Project
            </Button>
          </Link>
        }
      />

      {/* Quota Banner when approaching or reaching plan limit */}
      {totalSites >= (user?.maxSites || 3) && (
        <div className="p-4 bg-paper-light border-2 border-vermilion shadow-editorial-vermilion flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-vermilion text-white shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="font-editorial text-lg font-bold text-ink">
                {user?.planTier || 'FREE'} Tier Capacity Reached ({totalSites} of {user?.maxSites || 3} Sites)
              </div>
              <p className="text-xs text-ink-muted font-mono mt-0.5">
                Upgrade to Pro to deploy up to 25 projects, get 5 GB S3 storage, and unlock custom domain routing.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/pricing" className="text-xs font-mono text-ink-muted hover:underline">
              Compare Plans
            </Link>
            <Button
              variant="vermilion"
              size="sm"
              onClick={() => setUpgradeModalOpen(true)}
              leftIcon={<Zap className="w-3.5 h-3.5" />}
            >
              Upgrade to Pro ($19/mo)
            </Button>
          </div>
        </div>
      )}

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-paper-light border border-ink shadow-editorial">
          <div className="flex items-center justify-between text-xs font-mono text-ink-muted mb-2">
            <span>REGISTERED SITES</span>
            <FolderKanban className="w-4 h-4 text-ink" />
          </div>
          <div className="font-editorial text-3xl font-bold text-ink">{totalSites}</div>
          <div className="text-[11px] font-mono text-ink-faint mt-1 flex items-center justify-between">
            <span>Max quota: {usage?.maxSites || user?.maxSites || 3}</span>
            <span className="font-bold text-vermilion uppercase">{user?.planTier || 'FREE'}</span>
          </div>
        </div>

        <div className="p-5 bg-paper-light border border-ink shadow-editorial">
          <div className="flex items-center justify-between text-xs font-mono text-ink-muted mb-2">
            <span>SUCCESSFUL RELEASES</span>
            <CheckCircle2 className="w-4 h-4 text-green-700" />
          </div>
          <div className="font-editorial text-3xl font-bold text-ink">{successfulDeployments}</div>
          <div className="text-[11px] font-mono text-ink-faint mt-1">
            Active version pointers
          </div>
        </div>

        <div className="p-5 bg-paper-light border border-ink shadow-editorial">
          <div className="flex items-center justify-between text-xs font-mono text-ink-muted mb-2">
            <span>S3 OBJECT STORAGE</span>
            <HardDrive className="w-4 h-4 text-vermilion" />
          </div>
          <div className="font-editorial text-3xl font-bold text-ink">{totalStorage} MB</div>
          <div className="text-[11px] font-mono text-ink-faint mt-1">
            of {( (usage?.storageQuotaBytes || 104857600) / 1024 / 1024 ).toFixed(0)} MB limit
          </div>
        </div>

        <div className="p-5 bg-paper-light border border-ink shadow-editorial">
          <div className="flex items-center justify-between text-xs font-mono text-ink-muted mb-2">
            <span>CDN DISTRIBUTION</span>
            <Globe className="w-4 h-4 text-lime-hover" />
          </div>
          <div className="font-editorial text-2xl font-bold text-ink truncate">Active</div>
          <div className="text-[11px] font-mono text-ink-faint mt-1">
            CloudFront Origin Access Control
          </div>
        </div>
      </div>

      {/* Main Grid: Projects List & Quota Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-ink">
            <h3 className="font-editorial text-xl font-bold text-ink">Recent Projects</h3>
            <Link to="/projects" className="text-xs font-mono text-vermilion hover:underline flex items-center gap-1">
              View all ({sites.length}) <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {sites.length === 0 ? (
            <div className="p-10 bg-paper-light border-2 border-dashed border-ink text-center">
              <FolderKanban className="w-12 h-12 text-stone mx-auto mb-3" />
              <h4 className="font-editorial text-lg font-bold text-ink mb-1">
                No Projects Created Yet
              </h4>
              <p className="text-xs text-ink-muted max-w-sm mx-auto mb-4">
                Initialize your first static website repository to begin deploying HTML, CSS, and JS archives.
              </p>
              <Link to="/projects/new">
                <Button variant="vermilion" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
                  Create Project
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {sites.map(site => (
                <div
                  key={site.id}
                  className="card-editorial p-4 bg-paper-light flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/projects/${site.id}`}
                        className="font-editorial text-lg font-bold text-ink hover:text-vermilion transition-colors"
                      >
                        {site.name}
                      </Link>
                      <Badge status={site.latestStatus || 'SUCCEEDED'} />
                    </div>
                    <div className="text-xs font-mono text-ink-faint flex items-center gap-3">
                      <span>ID: {site.id}</span>
                      <span>•</span>
                      <span>Slug: /{site.slug}</span>
                      <span>•</span>
                      <span>{site.deploymentCount || 0} releases</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {site.liveUrl && (
                      <a
                        href={site.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 border border-ink bg-paper text-ink hover:bg-stone-faint text-xs font-mono flex items-center gap-1.5"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Live</span>
                      </a>
                    )}
                    <Link to={`/projects/${site.id}/deploy`}>
                      <Button variant="primary" size="sm" leftIcon={<Upload className="w-3.5 h-3.5" />}>
                        Deploy
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Recent Deployments Table */}
          {recentDeployments.length > 0 && (
            <div className="pt-6">
              <h3 className="font-editorial text-xl font-bold text-ink pb-2 border-b border-ink mb-4">
                Latest Pipeline Activity
              </h3>
              <div className="border border-ink overflow-x-auto bg-paper-light">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-paper-dark border-b border-ink uppercase tracking-wider text-ink">
                    <tr>
                      <th className="p-3">Version</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Assets</th>
                      <th className="p-3">Timestamp</th>
                      <th className="p-3 text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-subtle">
                    {recentDeployments.map(dep => (
                      <tr key={dep.id} className="hover:bg-stone-faint/50">
                        <td className="p-3 font-bold text-ink">
                          v{dep.version} ({dep.id})
                        </td>
                        <td className="p-3">
                          <Badge status={dep.status} />
                        </td>
                        <td className="p-3 text-ink-muted">
                          {dep.fileCount} files ({(dep.totalBytes / 1024 / 1024).toFixed(1)} MB)
                        </td>
                        <td className="p-3 text-ink-faint">
                          {new Date(dep.startedAt).toLocaleString()}
                        </td>
                        <td className="p-3 text-right">
                          <Link
                            to={`/deployments/${dep.id}`}
                            className="text-vermilion hover:underline font-semibold"
                          >
                            Inspect →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Right Rail: Usage & Tenant Health */}
        <div className="lg:col-span-4 space-y-6">
          {usage && <QuotaGauge usage={usage} />}

          <Card variant="dark">
            <h4 className="font-editorial text-lg font-bold text-paper mb-2">
              Isolated S3 Origins
            </h4>
            <p className="text-xs text-paper/70 font-mono leading-relaxed mb-4">
              Your deployments are uploaded to user-scoped S3 prefixes with CloudFront Origin Access Control, ensuring that raw bucket contents are never publicly browsable.
            </p>
            <div className="text-[11px] font-mono text-lime border-t border-paper/20 pt-3">
              IAM POLICY: s3:GetObject allowed only via CloudFront Service Principal
            </div>
          </Card>
        </div>
      </div>

      <UpgradePlanModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        targetTier="PRO"
        onUpgraded={async () => {
          await refreshUser();
          const [sitesData, usageData] = await Promise.all([
            siteService.getSites(),
            usageService.getUsage(),
          ]);
          setSites(sitesData);
          setUsage(usageData);
        }}
      />
    </div>
  );
};
