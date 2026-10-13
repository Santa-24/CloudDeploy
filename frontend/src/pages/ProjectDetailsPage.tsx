import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Skeleton } from '../components/Skeleton';
import { ZipDropzone } from '../features/ZipDropzone';
import { RollbackModal } from '../features/RollbackModal';
import { Site, Deployment } from '../types';
import { siteService } from '../services/siteService';
import { deploymentService } from '../services/deploymentService';
import { useToast } from '../components/Toast';
import {
  ExternalLink,
  Upload,
  History,
  RotateCcw,
  Trash2,
  HardDrive,
  Calendar,
  Layers,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';

export const ProjectDetailsPage: React.FC = () => {
  const { siteId } = useParams<{ siteId: string }>();
  const [site, setSite] = useState<Site | null>(null);
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [rollbackTarget, setRollbackTarget] = useState<Deployment | null>(null);
  const [isRollbackOpen, setIsRollbackOpen] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!siteId) return;

    Promise.all([
      siteService.getSite(siteId),
      deploymentService.getDeployments(siteId),
    ])
      .then(([siteData, depsData]) => {
        setSite(siteData);
        setDeployments(depsData);
      })
      .catch(err => {
        toast.error('Error', err?.message || 'Could not load project metadata');
      })
      .finally(() => setIsLoading(false));
  }, [siteId]);

  const handleDelete = async () => {
    if (!site) return;
    if (confirm(`Are you sure you want to delete project "${site.name}"? This removes historical version pointers in RDS.`)) {
      try {
        await siteService.deleteSite(site.id);
        toast.success('Project Deleted', `Deleted ${site.name}`);
        navigate('/projects');
      } catch (err: any) {
        toast.error('Delete Failed', err?.message || 'Could not delete site');
      }
    }
  };

  const handleDeploymentComplete = (newDep: Deployment) => {
    setDeployments(prev => [newDep, ...prev]);
    if (site) {
      setSite({
        ...site,
        currentDeploymentId: newDep.id,
        liveUrl: newDep.liveUrl || site.liveUrl,
        deploymentCount: (site.deploymentCount || 0) + 1,
        latestStatus: newDep.status,
      });
    }
  };

  const openRollback = (dep: Deployment) => {
    setRollbackTarget(dep);
    setIsRollbackOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40" />
      </div>
    );
  }

  if (!site) {
    return (
      <div className="p-8 text-center bg-paper-light border border-ink">
        <h3 className="font-editorial text-xl font-bold">Project Not Found</h3>
        <p className="text-xs font-mono text-ink-muted mt-2">Could not locate site {siteId}</p>
        <Link to="/projects" className="inline-block mt-4">
          <Button variant="secondary" size="sm">Back to Projects</Button>
        </Link>
      </div>
    );
  }

  const currentDep = deployments.find(d => d.id === site.currentDeploymentId) || deployments[0];
  const successfulReleases = deployments.filter(d => d.status === 'SUCCEEDED');

  return (
    <div className="space-y-8 font-sans">
      <Link
        to="/projects"
        className="inline-flex items-center gap-1.5 text-xs font-mono text-ink-muted hover:text-ink"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Projects
      </Link>

      <PageHeader
        category={`PROJECT // ${site.slug}`}
        title={site.name}
        subtitle={site.description || `Configured S3 prefix: sites/${site.id}/`}
        action={
          <div className="flex items-center gap-2">
            {site.liveUrl && (
              <a
                href={site.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 border border-ink bg-paper text-ink hover:bg-stone-faint text-xs font-mono flex items-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Visit Live Site</span>
              </a>
            )}
            <Link to={`/projects/${site.id}/history`}>
              <Button variant="secondary" size="sm" leftIcon={<History className="w-3.5 h-3.5" />}>
                History ({deployments.length})
              </Button>
            </Link>
          </div>
        }
      />

      {/* Primary Status Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          {/* Active Version Banner */}
          <div className="p-6 bg-paper-light border border-ink shadow-editorial">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-ink">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs uppercase text-ink-faint">ACTIVE VERSION</span>
                <Badge status={currentDep ? currentDep.status : 'QUEUED'} />
              </div>
              <span className="text-xs font-mono text-ink-faint">
                ID: {site.id}
              </span>
            </div>

            {currentDep ? (
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="font-editorial text-2xl font-bold text-ink">
                    Release v{currentDep.version} ({currentDep.id})
                  </div>
                  <div className="text-xs font-mono text-ink-muted">
                    Published: {new Date(currentDep.startedAt).toLocaleString()}
                  </div>
                </div>

                {site.liveUrl && (
                  <div className="bg-paper p-3 border border-stone-subtle flex items-center justify-between gap-3 text-xs font-mono">
                    <span className="truncate text-ink font-semibold">{site.liveUrl}</span>
                    <a
                      href={site.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-vermilion hover:underline shrink-0"
                    >
                      Open in New Tab ↗
                    </a>
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs font-mono text-ink-muted">
                  <div className="p-2 bg-paper border border-stone-subtle">
                    <span className="block text-[10px] text-ink-faint">FILES</span>
                    <span className="text-ink font-bold">{currentDep.fileCount || 0}</span>
                  </div>
                  <div className="p-2 bg-paper border border-stone-subtle">
                    <span className="block text-[10px] text-ink-faint">PAYLOAD</span>
                    <span className="text-ink font-bold">{(currentDep.totalBytes / 1024 / 1024).toFixed(1)} MB</span>
                  </div>
                  <div className="p-2 bg-paper border border-stone-subtle">
                    <span className="block text-[10px] text-ink-faint">ORIGIN</span>
                    <span className="text-ink font-bold">Amazon S3</span>
                  </div>
                  <div className="p-2 bg-paper border border-stone-subtle">
                    <span className="block text-[10px] text-ink-faint">DISTRIBUTION</span>
                    <span className="text-ink font-bold">CloudFront</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-xs font-mono text-ink-faint">
                No active release yet. Upload your static assets archive below.
              </div>
            )}
          </div>

          {/* Upload & Deploy Widget */}
          <ZipDropzone siteId={site.id} onDeploymentComplete={handleDeploymentComplete} />

          {/* Quick Rollback Strip if multiple versions exist */}
          {successfulReleases.length > 1 && (
            <div className="card-editorial p-6 bg-paper-light">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-ink">
                <div>
                  <h4 className="font-editorial text-lg font-bold text-ink">
                    Instant Version Rollback
                  </h4>
                  <p className="text-xs text-ink-muted">
                    Switch edge distribution pointer back to a previously validated release.
                  </p>
                </div>
                <RotateCcw className="w-4 h-4 text-ink-muted" />
              </div>

              <div className="space-y-2">
                {successfulReleases.slice(1, 4).map(pastDep => (
                  <div
                    key={pastDep.id}
                    className="p-3 bg-paper border border-stone-subtle flex items-center justify-between text-xs font-mono"
                  >
                    <div>
                      <span className="font-bold text-ink">v{pastDep.version}</span>
                      <span className="text-ink-faint ml-2">({pastDep.id})</span>
                      <span className="text-ink-muted ml-3">
                        {new Date(pastDep.startedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => openRollback(pastDep)}
                      leftIcon={<RotateCcw className="w-3 h-3" />}
                    >
                      Roll Back to v{pastDep.version}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Rail: Metadata & Danger Zone */}
        <div className="lg:col-span-4 space-y-6">
          <Card variant="flat" className="bg-paper-light">
            <h4 className="font-editorial text-base font-bold text-ink pb-2 mb-3 border-b border-ink">
              Project Specification
            </h4>
            <div className="space-y-3 text-xs font-mono">
              <div>
                <span className="text-ink-faint block text-[10px]">INTERNAL IDENTIFIER</span>
                <span className="text-ink break-all">{site.id}</span>
              </div>
              <div>
                <span className="text-ink-faint block text-[10px]">URL SLUG</span>
                <span className="text-ink">/{site.slug}</span>
              </div>
              <div>
                <span className="text-ink-faint block text-[10px]">OWNER TENANT</span>
                <span className="text-ink">{site.ownerId}</span>
              </div>
              <div>
                <span className="text-ink-faint block text-[10px]">INITIALIZED</span>
                <span className="text-ink">{new Date(site.createdAt).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="text-ink-faint block text-[10px]">TOTAL RELEASES</span>
                <span className="text-ink">{deployments.length}</span>
              </div>
            </div>
          </Card>

          <Card variant="flat" className="border-red-300 bg-red-50/40">
            <h4 className="text-xs font-mono font-bold text-red-900 uppercase tracking-wider mb-2">
              Danger Zone
            </h4>
            <p className="text-xs text-red-800 mb-4">
              Deleting this project deletes metadata references in RDS and marks the CloudFront routing record as archived.
            </p>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDelete}
              leftIcon={<Trash2 className="w-3.5 h-3.5" />}
            >
              Delete Project
            </Button>
          </Card>
        </div>
      </div>

      <RollbackModal
        isOpen={isRollbackOpen}
        onClose={() => setIsRollbackOpen(false)}
        siteId={site.id}
        targetDeployment={rollbackTarget}
        onRollbackComplete={handleDeploymentComplete}
      />
    </div>
  );
};
