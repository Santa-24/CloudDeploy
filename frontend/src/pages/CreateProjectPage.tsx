import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { useToast } from '../components/Toast';
import { UpgradePlanModal } from '../components/UpgradePlanModal';
import { siteService } from '../services/siteService';
import { useAuth } from '../hooks/useAuth';
import {
  ArrowLeft,
  Check,
  FolderPlus,
  AlertTriangle,
  Zap,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';

export const CreateProjectPage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeSiteCount, setActiveSiteCount] = useState<number>(0);
  const [isCheckingQuota, setIsCheckingQuota] = useState(true);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  const navigate = useNavigate();
  const toast = useToast();

  const maxSites = user?.maxSites || 3;
  const isFreeTier = !user?.planTier || user.planTier === 'FREE';
  const isQuotaReached = activeSiteCount >= maxSites;

  useEffect(() => {
    siteService.getSites()
      .then(sites => {
        setActiveSiteCount(sites.length);
      })
      .catch(console.error)
      .finally(() => setIsCheckingQuota(false));
  }, []);

  const handleNameChange = (val: string) => {
    setName(val);
    const generatedSlug = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    setSlug(generatedSlug);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isQuotaReached) {
      setUpgradeModalOpen(true);
      return;
    }

    if (!name.trim() || !slug.trim()) {
      toast.error('Validation Error', 'Project name and URL slug are required.');
      return;
    }

    setIsLoading(true);
    try {
      const created = await siteService.createSite({
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim(),
      });
      toast.success('Project Created', `Registered ${created.name}`);
      navigate(`/projects/${created.id}`);
    } catch (err: any) {
      if (err?.status === 400 || err?.message?.includes('maximum project limit') || err?.message?.includes('upgrade')) {
        toast.error('Quota Exceeded', err?.message || 'Project limit reached. Please upgrade your plan.');
        setUpgradeModalOpen(true);
      } else {
        toast.error('Failed to Create Project', err?.message || 'Database registration error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgraded = async () => {
    await refreshUser();
    siteService.getSites().then(sites => setActiveSiteCount(sites.length));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 font-sans">
      <Link
        to="/projects"
        className="inline-flex items-center gap-1.5 text-xs font-mono text-ink-muted hover:text-ink"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Projects
      </Link>

      <PageHeader
        category="INITIALIZE REPOSITORY"
        title="Create Website Project"
        subtitle="Configure the metadata and routing slug for your new AWS static site origin."
      />

      {/* Quota Indicator Banner */}
      {!isCheckingQuota && (
        <>
          {isQuotaReached ? (
            <div className="p-5 bg-paper-light border-2 border-vermilion shadow-editorial-vermilion space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-vermilion text-white shrink-0">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-editorial text-lg font-bold text-ink">
                    {isFreeTier ? 'Free Tier Project Limit Reached (3 of 3)' : `Plan Quota Reached (${maxSites} of ${maxSites})`}
                  </h4>
                  <p className="text-xs text-ink-muted mt-1 leading-relaxed">
                    You have reached your allowance of <strong>{maxSites} website projects</strong> on the{' '}
                    <strong className="text-vermilion">{user?.planTier || 'FREE'}</strong> tier. Upgrade your plan to deploy additional websites and expand your S3 storage.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-paper border border-stone-subtle text-xs font-mono flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="text-ink">
                  Pro Plan includes: <strong>25 Projects</strong>, <strong>5 GB S3 Storage</strong>, & <strong>Custom Domains</strong>.
                </span>
                <div className="flex items-center gap-2">
                  <Link to="/pricing" className="text-xs font-mono text-ink-muted hover:underline">
                    View Plans
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
            </div>
          ) : (
            <div className="p-3 bg-paper-light border border-ink flex items-center justify-between text-xs font-mono text-ink-muted">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-lime" />
                <span>
                  {isFreeTier ? 'Free Tier Quota:' : `${user?.planTier} Plan Quota:`}
                </span>
                <strong className="text-ink">
                  {activeSiteCount} of {maxSites} projects deployed
                </strong>
              </div>
              <Link
                to="/pricing"
                className="text-vermilion hover:underline text-[11px] font-bold flex items-center gap-1"
              >
                <span>Upgrade Plan</span>
                <Zap className="w-3 h-3" />
              </Link>
            </div>
          )}
        </>
      )}

      {/* Main Creation Form Card */}
      <div className={`card-editorial p-8 bg-paper-light ${isQuotaReached ? 'opacity-85' : ''}`}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Project Name"
            required
            disabled={isQuotaReached}
            value={name}
            onChange={e => handleNameChange(e.target.value)}
            placeholder="e.g. Atelier Editorial Monograph"
            helperText="Human-readable project title for dashboard indexing."
          />

          <div>
            <Input
              label="URL Slug"
              required
              disabled={isQuotaReached}
              value={slug}
              onChange={e => setSlug(e.target.value)}
              placeholder="atelier-monograph"
              helperText="Unique path component in live URL (e.g. /s/atelier-monograph/)"
            />
            <div className="mt-2 p-2.5 bg-paper border border-stone-subtle text-xs font-mono text-ink-muted">
              Live Edge Routing: <span className="text-vermilion font-bold">https://sites.clouddeploy.internal/s/{slug || '<slug>'}/</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-ink-muted mb-1.5 font-medium">
              Description (Optional)
            </label>
            <textarea
              rows={3}
              disabled={isQuotaReached}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Brief summary of technology stack (e.g. Vite + React, Astro static bundle, Tailwind)"
              className="w-full bg-paper-light text-ink border border-ink placeholder:text-stone focus:outline-none focus:ring-1 focus:ring-ink p-3 text-sm disabled:opacity-50"
            />
          </div>

          <div className="pt-4 border-t border-ink flex items-center justify-between">
            {isQuotaReached ? (
              <div className="text-xs font-mono text-vermilion font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Limit reached. Upgrade required to create 4th project.</span>
              </div>
            ) : (
              <span className="text-[11px] font-mono text-ink-faint">
                {maxSites - activeSiteCount} site slot(s) remaining on your current plan.
              </span>
            )}

            <div className="flex items-center gap-3">
              <Link to="/projects">
                <Button variant="secondary" size="md">
                  Cancel
                </Button>
              </Link>
              {isQuotaReached ? (
                <Button
                  type="button"
                  variant="vermilion"
                  size="md"
                  onClick={() => setUpgradeModalOpen(true)}
                  leftIcon={<Zap className="w-4 h-4" />}
                >
                  Upgrade Plan to Deploy
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="vermilion"
                  size="md"
                  isLoading={isLoading}
                  leftIcon={<FolderPlus className="w-4 h-4" />}
                >
                  Initialize Project
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Upgrade Plan Modal */}
      <UpgradePlanModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        targetTier="PRO"
        onUpgraded={handleUpgraded}
      />
    </div>
  );
};
