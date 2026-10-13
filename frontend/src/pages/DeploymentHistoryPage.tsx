import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Skeleton } from '../components/Skeleton';
import { RollbackModal } from '../features/RollbackModal';
import { Deployment, Site } from '../types';
import { deploymentService } from '../services/deploymentService';
import { siteService } from '../services/siteService';
import { ArrowLeft, RotateCcw, ExternalLink, ArrowRight, AlertCircle } from 'lucide-react';

export const DeploymentHistoryPage: React.FC = () => {
  const { siteId } = useParams<{ siteId: string }>();
  const [site, setSite] = useState<Site | null>(null);
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [rollbackTarget, setRollbackTarget] = useState<Deployment | null>(null);
  const [isRollbackOpen, setIsRollbackOpen] = useState(false);

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
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [siteId]);

  const openRollback = (dep: Deployment) => {
    setRollbackTarget(dep);
    setIsRollbackOpen(true);
  };

  const handleRollbackComplete = (newDep: Deployment) => {
    setDeployments(prev => [newDep, ...prev]);
  };

  if (isLoading) {
    return <Skeleton className="h-64" />;
  }

  return (
    <div className="space-y-6 font-sans">
      <Link
        to={`/projects/${siteId}`}
        className="inline-flex items-center gap-1.5 text-xs font-mono text-ink-muted hover:text-ink"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Project Details
      </Link>

      <PageHeader
        category="AUDIT HISTORY"
        title={`Release History — ${site?.name || siteId}`}
        subtitle="Chronological audit log of all immutable versions published to S3 and CloudFront."
      />

      <div className="border border-ink overflow-x-auto bg-paper-light shadow-editorial">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-paper-dark border-b border-ink uppercase tracking-wider text-ink">
            <tr>
              <th className="p-3.5">Version</th>
              <th className="p-3.5">Deployment ID</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5">Payload & Files</th>
              <th className="p-3.5">Created At</th>
              <th className="p-3.5">Diagnostics</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-subtle">
            {deployments.map((dep, index) => {
              const isCurrent = site?.currentDeploymentId === dep.id || index === 0;

              return (
                <tr key={dep.id} className="hover:bg-stone-faint/50">
                  <td className="p-3.5 font-bold text-ink">
                    v{dep.version}
                    {isCurrent && (
                      <span className="ml-2 text-[10px] bg-lime text-ink px-1.5 py-0.5 border border-ink font-bold">
                        ACTIVE
                      </span>
                    )}
                  </td>
                  <td className="p-3.5 text-ink-muted truncate max-w-[120px]">
                    {dep.id}
                  </td>
                  <td className="p-3.5">
                    <Badge status={dep.status} />
                  </td>
                  <td className="p-3.5 text-ink-muted">
                    {dep.fileCount} files ({(dep.totalBytes / 1024 / 1024).toFixed(1)} MB)
                  </td>
                  <td className="p-3.5 text-ink-faint">
                    {new Date(dep.startedAt).toLocaleString()}
                  </td>
                  <td className="p-3.5">
                    {dep.errorCode ? (
                      <span className="text-red-700 flex items-center gap-1 font-semibold">
                        <AlertCircle className="w-3 h-3" />
                        {dep.errorCode}
                      </span>
                    ) : (
                      <span className="text-green-800">Verified</span>
                    )}
                  </td>
                  <td className="p-3.5 text-right space-x-2">
                    <Link
                      to={`/deployments/${dep.id}`}
                      className="text-ink hover:text-vermilion underline font-semibold mr-2"
                    >
                      Events
                    </Link>
                    {dep.status === 'SUCCEEDED' && !isCurrent && (
                      <button
                        onClick={() => openRollback(dep)}
                        className="p-1 px-2 border border-ink text-ink hover:bg-vermilion hover:text-white transition-colors"
                        title="Rollback to this version"
                      >
                        Rollback
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <RollbackModal
        isOpen={isRollbackOpen}
        onClose={() => setIsRollbackOpen(false)}
        siteId={siteId || ''}
        targetDeployment={rollbackTarget}
        onRollbackComplete={handleRollbackComplete}
      />
    </div>
  );
};
