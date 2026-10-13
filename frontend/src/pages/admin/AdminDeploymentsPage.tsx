import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { PageHeader } from '../../components/PageHeader';
import { Badge } from '../../components/Badge';
import { Skeleton } from '../../components/Skeleton';
import { Deployment } from '../../types';
import { adminService } from '../../services/adminService';
import { ArrowLeft, AlertCircle, CheckCircle2, Filter } from 'lucide-react';

export const AdminDeploymentsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const filter = searchParams.get('filter') || 'all';

  useEffect(() => {
    const fetchDeps = filter === 'failed'
      ? adminService.getFailedDeployments()
      : adminService.getDeployments();

    fetchDeps
      .then(setDeployments)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [filter]);

  return (
    <div className="space-y-6 font-sans">
      <Link
        to="/admin"
        className="inline-flex items-center gap-1.5 text-xs font-mono text-ink-muted hover:text-ink"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Admin Overview
      </Link>

      <PageHeader
        category="FLEET TELEMETRY"
        title="Deployment Operations Log"
        subtitle="Live feed of static asset releases across all tenant environments."
        action={
          <div className="flex items-center gap-2 text-xs font-mono">
            <button
              onClick={() => setSearchParams({})}
              className={`px-3 py-1.5 border border-ink ${
                filter === 'all' ? 'bg-ink text-paper font-bold' : 'bg-paper text-ink'
              }`}
            >
              All Pipelines
            </button>
            <button
              onClick={() => setSearchParams({ filter: 'failed' })}
              className={`px-3 py-1.5 border border-ink ${
                filter === 'failed' ? 'bg-vermilion text-white font-bold' : 'bg-paper text-ink'
              }`}
            >
              Failed Only
            </button>
          </div>
        }
      />

      {isLoading ? (
        <Skeleton className="h-64" />
      ) : deployments.length === 0 ? (
        <div className="p-8 text-center bg-paper-light border border-ink">
          <p className="text-xs font-mono text-ink-muted">No deployment records matched current filter.</p>
        </div>
      ) : (
        <div className="border border-ink overflow-x-auto bg-paper-light shadow-editorial">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-paper-dark border-b border-ink uppercase tracking-wider text-ink">
              <tr>
                <th className="p-3.5">Release</th>
                <th className="p-3.5">Site / Target</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Diagnostic Message / Reason</th>
                <th className="p-3.5">Started At</th>
                <th className="p-3.5 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-subtle">
              {deployments.map(dep => (
                <tr key={dep.id} className="hover:bg-stone-faint/50">
                  <td className="p-3.5 font-bold text-ink">
                    v{dep.version} ({dep.id})
                  </td>
                  <td className="p-3.5 text-ink-muted">
                    {dep.siteName || dep.siteId}
                  </td>
                  <td className="p-3.5">
                    <Badge status={dep.status} />
                  </td>
                  <td className="p-3.5 text-ink-muted max-w-sm truncate">
                    {dep.errorCode ? (
                      <span className="text-red-700 font-semibold">
                        [{dep.errorCode}] {dep.errorSummary}
                      </span>
                    ) : (
                      <span className="text-green-800">
                        Published ({dep.fileCount} assets, {(dep.totalBytes / 1024 / 1024).toFixed(1)} MB)
                      </span>
                    )}
                  </td>
                  <td className="p-3.5 text-ink-faint">
                    {new Date(dep.startedAt).toLocaleString()}
                  </td>
                  <td className="p-3.5 text-right">
                    <Link
                      to={`/deployments/${dep.id}`}
                      className="text-vermilion hover:underline font-semibold"
                    >
                      Audit →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
