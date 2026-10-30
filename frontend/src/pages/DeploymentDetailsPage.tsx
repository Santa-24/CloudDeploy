import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Skeleton } from '../components/Skeleton';
import { DeploymentTimeline } from '../features/DeploymentTimeline';
import { Deployment, DeploymentEvent } from '../types';
import { deploymentService } from '../services/deploymentService';
import { ArrowLeft, ExternalLink, HardDrive, AlertTriangle, CheckCircle2, Globe } from 'lucide-react';

export const DeploymentDetailsPage: React.FC = () => {
  const { deploymentId } = useParams<{ deploymentId: string }>();
  const [deployment, setDeployment] = useState<Deployment | null>(null);
  const [events, setEvents] = useState<DeploymentEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!deploymentId) return;

    Promise.all([
      deploymentService.getDeployment(deploymentId),
      deploymentService.getEvents(deploymentId),
    ])
      .then(([depData, eventsData]) => {
        setDeployment(depData);
        setEvents(eventsData);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [deploymentId]);

  if (isLoading) {
    return <Skeleton className="h-64" />;
  }

  if (!deployment) {
    return (
      <div className="p-8 text-center bg-paper-light border border-ink">
        <h3 className="font-editorial text-xl font-bold">Deployment Record Not Found</h3>
        <p className="text-xs font-mono text-ink-muted mt-2">Could not locate {deploymentId}</p>
        <Link to="/dashboard" className="inline-block mt-4">
          <Button variant="secondary" size="sm">Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      <Link
        to={`/projects/${deployment.siteId}/history`}
        className="inline-flex items-center gap-1.5 text-xs font-mono text-ink-muted hover:text-ink"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Release History
      </Link>

      <PageHeader
        category={`RELEASE v${deployment.version}`}
        title={`Deployment ${deployment.id}`}
        subtitle={`Target Project: ${deployment.siteId}. Stored in AWS S3 and delivered via CloudFront.`}
        action={<Badge status={deployment.status} />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Metadata & Details */}
        <div className="lg:col-span-7 space-y-6">
          <Card variant="editorial">
            <h3 className="font-editorial text-lg font-bold text-ink pb-2 mb-4 border-b border-ink">
              Release Specification
            </h3>

            <div className="space-y-3 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-stone-subtle">
                <span className="text-ink-faint">Release Version:</span>
                <span className="font-bold text-ink">v{deployment.version}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-subtle">
                <span className="text-ink-faint">AWS Target Region:</span>
                <span className="font-bold text-ink inline-flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-vermilion" />
                  {deployment.region || 'ap-south-1'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-subtle">
                <span className="text-ink-faint">Deployment ID:</span>
                <span className="text-ink">{deployment.id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-subtle">
                <span className="text-ink-faint">S3 Storage Prefix:</span>
                <span className="text-ink break-all">{deployment.s3Prefix}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-subtle">
                <span className="text-ink-faint">Extracted Files:</span>
                <span className="text-ink">{deployment.fileCount} static assets</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-subtle">
                <span className="text-ink-faint">Total Size:</span>
                <span className="text-ink">{(deployment.totalBytes / 1024 / 1024).toFixed(2)} MB</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-subtle">
                <span className="text-ink-faint">Execution Started:</span>
                <span className="text-ink">{new Date(deployment.startedAt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-ink-faint">Completed:</span>
                <span className="text-ink">{deployment.completedAt ? new Date(deployment.completedAt).toLocaleString() : 'In Progress'}</span>
              </div>
            </div>

            {deployment.liveUrl && (
              <div className="mt-4 p-3 bg-paper border border-ink flex items-center justify-between text-xs font-mono">
                <span className="text-ink truncate">{deployment.liveUrl}</span>
                <a
                  href={deployment.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-vermilion hover:underline flex items-center gap-1 font-semibold"
                >
                  Visit <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </Card>

          {deployment.errorCode && (
            <div className="p-4 bg-red-50 border border-red-700 text-xs font-mono text-red-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-red-700" />
                ERROR CODE: {deployment.errorCode}
              </div>
              <p>{deployment.errorSummary}</p>
            </div>
          )}
        </div>

        {/* Right Column: Telemetry Event Timeline */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="font-editorial text-lg font-bold text-ink pb-2 border-b border-ink">
            Deployment Event Telemetry
          </h3>
          <DeploymentTimeline events={events} />
        </div>
      </div>
    </div>
  );
};
