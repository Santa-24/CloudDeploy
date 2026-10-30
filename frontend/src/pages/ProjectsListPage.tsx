import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { Skeleton } from '../components/Skeleton';
import { Site } from '../types';
import { siteService } from '../services/siteService';
import { Plus, ExternalLink, Upload, FolderKanban, ArrowRight, Globe } from 'lucide-react';

export const ProjectsListPage: React.FC = () => {
  const [sites, setSites] = useState<Site[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    siteService.getSites()
      .then(setSites)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-8 font-sans">
      <PageHeader
        category="TENANT REPOSITORY"
        title="Website Projects"
        subtitle="Manage registered static websites, trigger new version deployments, and inspect edge performance."
        action={
          <Link to="/projects/new">
            <Button variant="vermilion" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
              Create New Project
            </Button>
          </Link>
        }
      />

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-20" count={3} />
        </div>
      ) : sites.length === 0 ? (
        <div className="p-12 bg-paper-light border-2 border-dashed border-ink text-center">
          <FolderKanban className="w-12 h-12 text-stone mx-auto mb-3" />
          <h3 className="font-editorial text-xl font-bold text-ink mb-2">No Projects Found</h3>
          <p className="text-xs text-ink-muted max-w-sm mx-auto mb-6">
            You have not registered any static websites yet. Create one to begin uploading ZIP archives.
          </p>
          <Link to="/projects/new">
            <Button variant="vermilion" size="md">
              Create First Project
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sites.map(site => (
            <div key={site.id} className="card-editorial p-6 bg-paper-light flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Badge status={site.latestStatus || 'SUCCEEDED'} />
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 bg-paper border border-ink text-ink inline-flex items-center gap-1">
                      <Globe className="w-2.5 h-2.5 text-vermilion" />
                      {site.region || 'ap-south-1'}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-ink-faint">
                    {site.deploymentCount || 0} release(s)
                  </span>
                </div>

                <Link to={`/projects/${site.id}`}>
                  <h3 className="font-editorial text-xl font-bold text-ink hover:text-vermilion transition-colors">
                    {site.name}
                  </h3>
                </Link>

                <p className="text-xs text-ink-muted mt-2 mb-4 line-clamp-2">
                  {site.description || 'No project description supplied.'}
                </p>

                <div className="p-2.5 bg-paper border border-stone-subtle text-xs font-mono space-y-1 text-ink-faint">
                  <div>Slug: <span className="text-ink">/{site.slug}</span></div>
                  <div>Site ID: <span className="text-ink">{site.id}</span></div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-stone-subtle flex items-center justify-between">
                <Link
                  to={`/projects/${site.id}`}
                  className="text-xs font-mono text-vermilion hover:underline flex items-center gap-1 font-semibold"
                >
                  Manage <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <div className="flex items-center gap-2">
                  {site.liveUrl && (
                    <a
                      href={site.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 border border-ink bg-paper text-ink hover:bg-stone-faint"
                      title="Open Live Website"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                  <Link to={`/projects/${site.id}/deploy`}>
                    <Button variant="primary" size="sm" leftIcon={<Upload className="w-3 h-3" />}>
                      Deploy
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
