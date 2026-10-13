import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { ZipDropzone } from '../features/ZipDropzone';
import { Site, Deployment } from '../types';
import { siteService } from '../services/siteService';
import { Skeleton } from '../components/Skeleton';
import { ArrowLeft } from 'lucide-react';

export const UploadDeployPage: React.FC = () => {
  const { siteId } = useParams<{ siteId?: string }>();
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState<string>(siteId || '');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    siteService.getSites()
      .then(data => {
        setSites(data);
        if (!selectedSiteId && data.length > 0) {
          setSelectedSiteId(data[0].id);
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const handleDeploymentComplete = (dep: Deployment) => {
    setTimeout(() => {
      navigate(`/projects/${dep.siteId}`);
    }, 1500);
  };

  if (isLoading) {
    return <Skeleton className="h-64" />;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 font-sans">
      <Link
        to={selectedSiteId ? `/projects/${selectedSiteId}` : '/projects'}
        className="inline-flex items-center gap-1.5 text-xs font-mono text-ink-muted hover:text-ink"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Project
      </Link>

      <PageHeader
        category="DEPLOYMENT PIPELINE"
        title="Deploy Website Archive"
        subtitle="Upload your ZIP file to trigger Spring Boot validation, private S3 staging, and CloudFront edge synchronization."
      />

      {sites.length > 1 && !siteId && (
        <div className="card-editorial p-4 bg-paper-light">
          <label className="block text-xs font-mono uppercase tracking-wider text-ink-muted mb-1.5 font-medium">
            Select Target Project
          </label>
          <select
            value={selectedSiteId}
            onChange={e => setSelectedSiteId(e.target.value)}
            className="w-full bg-paper text-ink border border-ink p-2 text-sm font-mono focus:outline-none"
          >
            {sites.map(s => (
              <option key={s.id} value={s.id}>
                {s.name} (/{s.slug})
              </option>
            ))}
          </select>
        </div>
      )}

      {selectedSiteId ? (
        <ZipDropzone
          siteId={selectedSiteId}
          onDeploymentComplete={handleDeploymentComplete}
        />
      ) : (
        <div className="p-8 text-center bg-paper-light border border-ink">
          <p className="text-xs font-mono text-ink-muted">
            Please register a website project before uploading deployment archives.
          </p>
        </div>
      )}
    </div>
  );
};
