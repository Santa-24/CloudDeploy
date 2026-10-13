import React from 'react';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { SectionDivider } from '../components/SectionDivider';
import { Shield, FileCheck, Cloud, Server, AlertTriangle } from 'lucide-react';

export const DocsPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <PageHeader
        category="TECHNICAL DOCUMENTATION"
        title="Architecture & Deployment Manual"
        subtitle="Specification for uploading, validating, and distributing static website assets across Amazon S3 and Amazon CloudFront."
      />

      <div className="space-y-12">
        {/* Quick Start Guide */}
        <section>
          <h2 className="font-editorial text-2xl font-bold text-ink mb-4">
            1. Package Structure Requirements
          </h2>
          <Card variant="flat" className="bg-paper-light">
            <p className="text-sm text-ink-muted mb-4">
              CloudDeploy validates every uploaded ZIP file in a strictly sandboxed, streamed Java 21 pipeline. To pass automated verification, your archive must conform to the following directory layout:
            </p>
            <div className="bg-ink text-paper p-4 font-mono text-xs border border-ink space-y-1">
              <div className="text-lime">my-website.zip</div>
              <div>├── index.html          <span className="text-stone">// MANDATORY: Primary entrypoint at archive root</span></div>
              <div>├── 404.html            <span className="text-stone">// OPTIONAL: Fallback error document</span></div>
              <div>├── css/</div>
              <div>│   └── styles.css</div>
              <div>├── js/</div>
              <div>│   └── bundle.js</div>
              <div>└── assets/</div>
              <div>    ├── logo.svg</div>
              <div>    └── font.woff2</div>
            </div>
          </Card>
        </section>

        {/* Permitted File Types */}
        <section>
          <h2 className="font-editorial text-2xl font-bold text-ink mb-4">
            2. Permitted Static Asset MIME Types
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-4 bg-paper-light border border-ink">
              <div className="font-bold text-ink mb-2">// WEB ESSENTIALS</div>
              <ul className="space-y-1 text-ink-muted">
                <li>• HTML: <code className="text-ink">.html, .htm</code></li>
                <li>• Stylesheets: <code className="text-ink">.css</code></li>
                <li>• Scripts: <code className="text-ink">.js, .mjs</code></li>
                <li>• Data: <code className="text-ink">.json, .webmanifest</code></li>
              </ul>
            </div>
            <div className="p-4 bg-paper-light border border-ink">
              <div className="font-bold text-ink mb-2">// MEDIA & TYPOGRAPHY</div>
              <ul className="space-y-1 text-ink-muted">
                <li>• Images: <code className="text-ink">.png, .jpg, .jpeg, .webp, .svg, .ico</code></li>
                <li>• Fonts: <code className="text-ink">.woff, .woff2, .ttf, .otf</code></li>
                <li>• Media: <code className="text-ink">.mp4, .webm, .mp3</code></li>
                <li>• Documents: <code className="text-ink">.pdf, .txt</code></li>
              </ul>
            </div>
          </div>
          <div className="mt-3 p-3 bg-red-50 border border-red-700 text-xs font-mono text-red-800 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
            <span>
              REJECTED EXTENSIONS: Executables (.exe, .bin), shell scripts (.sh, .bat), server-side runtimes (.php, .py, .rb, .jar, .war), and system configuration (.htaccess, .env) are blocked automatically.
            </span>
          </div>
        </section>

        {/* Security & Validation Engine */}
        <section>
          <h2 className="font-editorial text-2xl font-bold text-ink mb-4">
            3. Upload Security Controls
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card variant="editorial">
              <div className="font-mono text-xs font-bold text-vermilion mb-1">DEFENSE 01</div>
              <h4 className="font-editorial text-lg font-bold text-ink mb-2">ZIP Slip Prevention</h4>
              <p className="text-xs text-ink-muted">
                Normalized canonical path inspection rejects directory traversal payloads (e.g. <code>../../etc/passwd</code>) and symlink targets pointing outside extraction boundaries.
              </p>
            </Card>

            <Card variant="editorial">
              <div className="font-mono text-xs font-bold text-vermilion mb-1">DEFENSE 02</div>
              <h4 className="font-editorial text-lg font-bold text-ink mb-2">Decompression Bomb Protection</h4>
              <p className="text-xs text-ink-muted">
                Enforces hard limits on uncompressed byte expansion (maximum 250 MB extracted) and a maximum total file count of 1,000 files per deployment archive.
              </p>
            </Card>

            <Card variant="editorial">
              <div className="font-mono text-xs font-bold text-vermilion mb-1">DEFENSE 03</div>
              <h4 className="font-editorial text-lg font-bold text-ink mb-2">Immutable S3 Storage</h4>
              <p className="text-xs text-ink-muted">
                Every release writes to an isolated prefix: <code>sites/&#123;siteId&#125;/deployments/&#123;deploymentId&#125;/</code>. Past versions are never mutated, enabling instant zero-downtime rollback.
              </p>
            </Card>
          </div>
        </section>

        {/* Edge Delivery & Live URLs */}
        <section>
          <h2 className="font-editorial text-2xl font-bold text-ink mb-4">
            4. Live URL & CloudFront Routing
          </h2>
          <Card variant="editorial" className="bg-paper-light">
            <p className="text-sm text-ink-muted mb-3">
              Published websites are exposed via path-based routing under the configured CloudDeploy domain:
            </p>
            <div className="bg-paper p-3 border border-ink font-mono text-xs text-ink mb-4">
              https://sites.clouddeploy.internal/s/&#123;siteId&#125;/
            </div>
            <p className="text-xs text-ink-muted leading-relaxed">
              When a new version is published or rolled back, the backend API updates the project pointer in Amazon RDS and dispatches a wildcard CloudFront Invalidation request (<code className="font-mono bg-paper-dark px-1">/s/&#123;siteId&#125;/*</code>) to refresh edge caches across global PoPs within seconds.
            </p>
          </Card>
        </section>
      </div>
    </div>
  );
};
