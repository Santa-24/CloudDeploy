import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { useAuth } from '../hooks/useAuth';
import {
  ShieldCheck,
  Zap,
  Globe2,
  HardDrive,
  Lock,
  RotateCcw,
  Layers,
  Terminal,
  ArrowRight,
  CheckCircle2,
  Server,
  Cloud,
  FileCheck2,
  AlertTriangle,
  Cpu,
  Fingerprint,
} from 'lucide-react';

export const FeaturesPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<'security' | 'storage' | 'edge' | 'rollbacks'>('security');

  return (
    <div className="bg-paper min-h-screen py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-ink text-paper text-xs font-mono tracking-wider uppercase border border-ink shadow-[2px_2px_0px_0px_#C65336]">
            <Cpu className="w-3.5 h-3.5 text-lime" />
            ENGINE ARCHITECTURE
          </div>
          <h1 className="font-editorial text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-ink">
            Engineered for <span className="italic text-vermilion font-normal">Pure AWS Velocity</span>
          </h1>
          <p className="text-base sm:text-lg text-ink-muted leading-relaxed">
            CloudDeploy eliminates slow Docker builds and fragile container orchestrations for static sites. We validate your build archives, stream them to private Amazon S3, and deliver them globally through Amazon CloudFront in under 2 seconds.
          </p>
        </div>

        {/* Feature Highlights Grid (6 Pillars) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card variant="editorial" hoverable>
            <div className="w-10 h-10 bg-ink text-paper border border-ink flex items-center justify-center font-mono font-bold text-sm mb-4">
              <ShieldCheck className="w-5 h-5 text-lime" />
            </div>
            <div className="text-[11px] font-mono text-vermilion font-bold uppercase mb-1">
              PILLAR 01 // DEFENSE
            </div>
            <h3 className="font-editorial text-xl font-bold text-ink mb-2">
              Zip Slip & Sandbox Inspection
            </h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              Every uploaded archive passes through strict canonical path validation in Java 21. Path traversal exploits (<code>../../</code>) and dangerous shell/server executables are discarded before files ever hit disk.
            </p>
          </Card>

          <Card variant="editorial" hoverable>
            <div className="w-10 h-10 bg-vermilion text-paper border border-ink flex items-center justify-center font-mono font-bold text-sm mb-4">
              <Globe2 className="w-5 h-5 text-white" />
            </div>
            <div className="text-[11px] font-mono text-vermilion font-bold uppercase mb-1">
              PILLAR 02 // CDN
            </div>
            <h3 className="font-editorial text-xl font-bold text-ink mb-2">
              CloudFront Origin Access Control
            </h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              Zero public S3 buckets. Your website files are locked behind AWS Origin Access Control (OAC). Traffic is served exclusively through CloudFront's global edge points with automated SSL certificates.
            </p>
          </Card>

          <Card variant="editorial" hoverable>
            <div className="w-10 h-10 bg-lime text-ink border border-ink flex items-center justify-center font-mono font-bold text-sm mb-4">
              <RotateCcw className="w-5 h-5 text-ink" />
            </div>
            <div className="text-[11px] font-mono text-vermilion font-bold uppercase mb-1">
              PILLAR 03 // RELIABILITY
            </div>
            <h3 className="font-editorial text-xl font-bold text-ink mb-2">
              Instant 1-Click Rollbacks
            </h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              Deployments are stored as immutable S3 prefixes: <code>sites/&#123;id&#125;/v1</code>, <code>v2</code>, <code>v3</code>. If a breaking commit deploys, switch back to any previous release in under 1 second.
            </p>
          </Card>

          <Card variant="editorial" hoverable>
            <div className="w-10 h-10 bg-paper-dark text-ink border border-ink flex items-center justify-center font-mono font-bold text-sm mb-4">
              <Lock className="w-5 h-5 text-vermilion" />
            </div>
            <div className="text-[11px] font-mono text-vermilion font-bold uppercase mb-1">
              PILLAR 04 // AUTHENTICATION
            </div>
            <h3 className="font-editorial text-xl font-bold text-ink mb-2">
              Amazon Cognito Identity
            </h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              Multi-tenant authentication managed via Amazon Cognito User Pools. Issues cryptographically signed RSA JWT tokens for secure REST API communication and fine-grained quota access.
            </p>
          </Card>

          <Card variant="editorial" hoverable>
            <div className="w-10 h-10 bg-ink text-paper border border-ink flex items-center justify-center font-mono font-bold text-sm mb-4">
              <HardDrive className="w-5 h-5 text-lime" />
            </div>
            <div className="text-[11px] font-mono text-vermilion font-bold uppercase mb-1">
              PILLAR 05 // MULTI-TENANCY
            </div>
            <h3 className="font-editorial text-xl font-bold text-ink mb-2">
              Dynamic Quotas & Free Tier
            </h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              Tenant-scoped storage quotas, deployment frequency limits, and project caps. Free tier includes up to 3 projects with 50 MB storage, with frictionless 1-click upgrades to Pro and Team.
            </p>
          </Card>

          <Card variant="editorial" hoverable>
            <div className="w-10 h-10 bg-vermilion text-paper border border-ink flex items-center justify-center font-mono font-bold text-sm mb-4">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div className="text-[11px] font-mono text-vermilion font-bold uppercase mb-1">
              PILLAR 06 // ROUTING
            </div>
            <h3 className="font-editorial text-xl font-bold text-ink mb-2">
              Client-Side SPA Routing (404 Fallback)
            </h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              Configured CloudFront custom error responses rewrite 404 HTTP errors to <code>/index.html</code> with a 200 OK status. React Router, Vue Router, and Next.js client routing work seamlessly out of the box.
            </p>
          </Card>
        </div>

        {/* Interactive Architecture Breakdown Tabs */}
        <div className="bg-paper-light border-2 border-ink shadow-editorial p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-ink/20 pb-4 gap-4">
            <div>
              <span className="text-xs font-mono uppercase text-vermilion font-bold">
                // DEEP DIVE SPECIFICATION
              </span>
              <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-ink mt-1">
                Security & Delivery Mechanisms
              </h2>
            </div>

            {/* Interactive Tab Buttons */}
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'security', label: 'Security & Antivirus' },
                { id: 'storage', label: 'Dual S3 Buckets' },
                { id: 'edge', label: 'CloudFront OAC' },
                { id: 'rollbacks', label: 'Atomic Rollbacks' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-all border ${
                    activeTab === tab.id
                      ? 'bg-ink text-paper border-ink shadow-[2px_2px_0px_0px_#C65336]'
                      : 'bg-paper text-ink-muted border-ink/30 hover:border-ink hover:text-ink'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content Display */}
          {activeTab === 'security' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <h3 className="font-editorial text-xl font-bold text-ink">
                  Sandboxed Ingestion with Zero Server Execution
                </h3>
                <p className="text-sm text-ink-muted leading-relaxed">
                  Static hosting must remain strictly static. CloudDeploy prevents attackers from leveraging file uploads for remote code execution or server compromise.
                </p>
                <div className="space-y-2.5 font-mono text-xs">
                  <div className="p-3 bg-paper border border-ink/20 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-lime shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-ink">Zip Slip Mitigation:</strong>
                      <span className="text-ink-muted block mt-0.5">Validates every entry path against canonical directory root before decompression. Rejects <code>../../</code> payload strings.</span>
                    </div>
                  </div>
                  <div className="p-3 bg-paper border border-ink/20 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-lime shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-ink">Decompression Bomb Cap:</strong>
                      <span className="text-ink-muted block mt-0.5">Strictly enforces a 250 MB extracted cap and 1,000 files limit to protect memory and storage exhaustion.</span>
                    </div>
                  </div>
                  <div className="p-3 bg-paper border border-ink/20 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-lime shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-ink">Executable File Filter:</strong>
                      <span className="text-ink-muted block mt-0.5">Blacklists <code>.exe, .sh, .bat, .php, .py, .rb, .env, .htaccess</code> with instant validation failure.</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-ink text-paper p-5 font-mono text-xs border border-ink shadow-[4px_4px_0px_0px_#C65336] space-y-2">
                <div className="text-lime">// SPRING BOOT SECURITY VALIDATION SNIPPET</div>
                <div className="text-paper/60">// PathTraversalChecker.java</div>
                <pre className="text-paper/90 overflow-x-auto p-3 bg-paper/5 border border-paper/10 text-[11px] leading-relaxed">
{`Path destDir = targetDirectory.normalize();
Path destFile = destDir.resolve(zipEntry.getName()).normalize();

if (!destFile.startsWith(destDir)) {
    throw new SecurityException(
        "ZIP Slip attack detected: " + zipEntry.getName()
    );
}

if (isBlacklistedExtension(destFile)) {
    throw new SecurityException(
        "Executable upload forbidden: " + destFile
    );
}`}
                </pre>
                <div className="text-lime text-[11px]">✓ Verification enforced on every deployment chunk</div>
              </div>
            </div>
          )}

          {activeTab === 'storage' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <h3 className="font-editorial text-xl font-bold text-ink">
                  Dual-Bucket S3 Architecture
                </h3>
                <p className="text-sm text-ink-muted leading-relaxed">
                  CloudDeploy separates raw uploaded artifacts from live published websites into two dedicated Amazon S3 buckets.
                </p>
                <div className="space-y-3 font-mono text-xs">
                  <div className="p-4 bg-paper border border-ink/20">
                    <div className="text-vermilion font-bold mb-1">BUCKET 1: UPLOADS STAGING</div>
                    <p className="text-ink-muted">
                      Receives encrypted raw ZIP files from users. Holds temporary uploads until verification succeeds, preventing half-extracted debris.
                    </p>
                  </div>
                  <div className="p-4 bg-paper border border-ink/20">
                    <div className="text-lime font-bold mb-1">BUCKET 2: PUBLISHED SITES</div>
                    <p className="text-ink-muted">
                      Stores validated static HTML/CSS/JS assets partitioned by site ID and deployment revision. Block Public Access enabled [x].
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-ink text-paper p-6 font-mono text-xs border border-ink space-y-2">
                <div className="text-paper/60">// S3 Directory Prefix Structure:</div>
                <div className="text-lime">s3://clouddeploy-sites-published/</div>
                <div className="pl-4 text-paper/80">└── sites/</div>
                <div className="pl-8 text-paper/80">└── site-a7b2-portfolio/</div>
                <div className="pl-12 text-vermilion">├── live/ <span className="text-paper/40">→ active release pointer</span></div>
                <div className="pl-16 text-paper/70">├── index.html</div>
                <div className="pl-16 text-paper/70">└── assets/</div>
                <div className="pl-12 text-paper/80">└── deployments/</div>
                <div className="pl-16 text-lime">├── dep-01-initial/</div>
                <div className="pl-16 text-lime">└── dep-02-redesign/</div>
                <p className="text-paper/50 text-[11px] pt-2">
                  // Zero overwrite conflicts. Every deployment is permanent and rollbacks take &lt; 1s.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'edge' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <h3 className="font-editorial text-xl font-bold text-ink">
                  Global CloudFront Origin Access Control (OAC)
                </h3>
                <p className="text-sm text-ink-muted leading-relaxed">
                  Traditional S3 websites require public bucket policies, exposing raw storage to internet crawlers and DDoS risks. CloudDeploy uses AWS OAC:
                </p>
                <ul className="space-y-2 text-xs text-ink-muted">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-vermilion shrink-0" />
                    <span><strong>100% Private S3:</strong> Direct requests to <code>s3.amazonaws.com</code> return 403 Forbidden.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-vermilion shrink-0" />
                    <span><strong>Signed AWS SigV4 Requests:</strong> CloudFront signs origin fetch requests with dedicated OAC credentials.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-vermilion shrink-0" />
                    <span><strong>Instant Cache Invalidation:</strong> Backend triggers CloudFront invalidations automatically upon every new release.</span>
                  </li>
                </ul>
              </div>

              <div className="p-6 bg-paper border border-ink font-mono text-xs space-y-3">
                <div className="text-ink font-bold">// EDGE BENCHMARK SUMMARY</div>
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="p-3 bg-paper-light border border-ink/20">
                    <div className="text-2xl font-editorial font-bold text-vermilion">18ms</div>
                    <div className="text-[10px] text-ink-faint uppercase mt-1">Average Global TTFB</div>
                  </div>
                  <div className="p-3 bg-paper-light border border-ink/20">
                    <div className="text-2xl font-editorial font-bold text-lime">600+</div>
                    <div className="text-[10px] text-ink-faint uppercase mt-1">CloudFront Edge PoPs</div>
                  </div>
                  <div className="p-3 bg-paper-light border border-ink/20">
                    <div className="text-2xl font-editorial font-bold text-ink">100%</div>
                    <div className="text-[10px] text-ink-faint uppercase mt-1">Free Tier SSL Encryption</div>
                  </div>
                  <div className="p-3 bg-paper-light border border-ink/20">
                    <div className="text-2xl font-editorial font-bold text-vermilion">2.1s</div>
                    <div className="text-[10px] text-ink-faint uppercase mt-1">End-to-End Deploy Speed</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'rollbacks' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <h3 className="font-editorial text-xl font-bold text-ink">
                  Immutable Deployment Snapshots & Atomic Rollbacks
                </h3>
                <p className="text-sm text-ink-muted leading-relaxed">
                  Never fear breaking production again. Every deployment is an immutable snapshot that remains permanently in your private S3 storage.
                </p>
                <div className="space-y-2 text-xs text-ink-muted">
                  <div className="p-3 bg-paper border border-ink/20 flex items-center justify-between">
                    <div>
                      <strong className="text-ink block">Deployment #12 (Current Active)</strong>
                      <span className="text-[11px] font-mono text-ink-faint">SHA-256: 4a9f... | Deployed 2h ago</span>
                    </div>
                    <span className="px-2 py-0.5 bg-lime text-ink text-[10px] font-mono font-bold uppercase border border-ink">
                      LIVE
                    </span>
                  </div>
                  <div className="p-3 bg-paper border border-ink/20 flex items-center justify-between">
                    <div>
                      <strong className="text-ink block">Deployment #11 (Stable Backup)</strong>
                      <span className="text-[11px] font-mono text-ink-faint">SHA-256: 8c1d... | Deployed yesterday</span>
                    </div>
                    <Button variant="outline" size="sm" className="text-[10px] h-7">
                      Rollback (1-Click)
                    </Button>
                  </div>
                </div>
              </div>

              <div className="bg-ink text-paper p-6 font-mono text-xs border border-ink space-y-2">
                <div className="text-lime">// ROLLBACK EXECUTION SEQUENCE</div>
                <div className="text-paper/60">&gt; User triggers rollback to Deployment #11</div>
                <div className="text-paper/80">&gt; Re-pointing live prefix to immutable snapshot #11...</div>
                <div className="text-paper/80">&gt; CloudFront cache invalidation request: /*</div>
                <div className="text-lime font-bold">&gt; ✓ ROLLBACK COMPLETED in 840ms</div>
                <p className="text-paper/50 text-[11px] pt-3">
                  // Zero file rebuilding required. The exact verified assets return to production instantly.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Call to Action */}
        <div className="text-center p-12 bg-ink text-paper border-2 border-ink shadow-editorial space-y-6 max-w-4xl mx-auto">
          <span className="text-xs font-mono uppercase tracking-widest text-lime font-bold">
            // GET STARTED ON AWS TODAY
          </span>
          <h2 className="font-editorial text-3xl sm:text-4xl font-bold tracking-tight text-paper">
            Deploy up to 3 static websites completely free.
          </h2>
          <p className="text-sm text-paper/70 max-w-lg mx-auto font-mono">
            Zero credit card required. Experience safe, instantaneous static publishing powered by Amazon Web Services.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link to={isAuthenticated ? '/dashboard' : '/register'}>
              <Button variant="lime" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Create Free Account
              </Button>
            </Link>
            <Link to="/templates">
              <Button variant="secondary" size="lg">
                Explore Starters
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
