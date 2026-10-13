import React from 'react';
import { Link } from 'react-router-dom';
import {
  UploadCloud,
  Globe2,
  ShieldCheck,
  Zap,
  ArrowRight,
  CheckCircle2,
  Terminal,
  Server,
  Layers,
  Lock,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { SectionDivider } from '../components/SectionDivider';
import { PricingSection } from '../components/PricingSection';

export const LandingPage: React.FC = () => {
  return (
    <div className="bg-paper text-ink font-sans">
      {/* Hero Section */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-32 border-b border-ink bg-grid-editorial overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-ink text-paper text-xs font-mono tracking-wider uppercase border border-ink shadow-[2px_2px_0px_0px_#C65336]">
                <span className="w-2 h-2 rounded-full bg-lime animate-pulse" />
                AWS-Native Static Website Deployment
              </div>

              <h1 className="font-editorial text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-ink leading-[1.05]">
                Upload. Deploy. <br />
                <span className="italic font-normal text-vermilion">Go Live.</span>
              </h1>

              <p className="text-lg md:text-xl text-ink-muted max-w-xl font-normal leading-relaxed">
                The opinionated platform designed to deploy static websites directly to private Amazon S3 origins and deliver them globally through Amazon CloudFront. Built with Java 21, Spring Boot, and enterprise-grade multi-tenant isolation.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link to="/register">
                  <Button variant="vermilion" size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
                    Create Your Workspace
                  </Button>
                </Link>
                <Link to="/docs">
                  <Button variant="secondary" size="lg">
                    Read Architecture
                  </Button>
                </Link>
              </div>

              {/* Technical specs pill strip */}
              <div className="pt-6 border-t border-ink/20 flex flex-wrap gap-4 text-xs font-mono text-ink-faint">
                <div>// ZERO SERVER CODE EXECUTION</div>
                <div>// ZIP SLIP MITIGATION</div>
                <div>// CLOUDFRONT OAC</div>
                <div>// S3 BLOCK PUBLIC ACCESS</div>
              </div>
            </div>

            {/* Interactive Terminal / Deployment Mockup Visual */}
            <div className="lg:col-span-5">
              <div className="bg-ink text-paper p-6 border-2 border-ink shadow-[8px_8px_0px_0px_#C65336]">
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-paper/20 text-xs font-mono">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-[#C65336]" />
                    <span className="w-3 h-3 rounded-full bg-[#D7EE73]" />
                    <span className="w-3 h-3 rounded-full bg-paper/60" />
                  </div>
                  <span className="text-paper/60">pipeline.sh — CloudDeploy</span>
                </div>

                <div className="font-mono text-xs space-y-2.5 text-paper/90 leading-relaxed">
                  <p className="text-lime">$ clouddeploy push --site portfolio-v2</p>
                  <p className="text-paper/60">&gt; Packaging static assets into archive...</p>
                  <p className="text-paper/60">&gt; Encrypting & streaming to S3 staging bucket...</p>
                  <div className="p-3 bg-paper/10 border border-paper/20 space-y-1">
                    <div className="text-lime flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-lime" />
                      <span>ZIP verification passed (38 files, 12.4 MB)</span>
                    </div>
                    <div className="text-paper/60 pl-5">• Path traversal checks: SECURE</div>
                    <div className="text-paper/60 pl-5">• Root index.html: FOUND</div>
                    <div className="text-paper/60 pl-5">• Decompression ratio: 1.8x (SAFE)</div>
                  </div>
                  <p className="text-paper/60">&gt; Synced to S3: s3://clouddeploy-sites/s/site-a7b2/</p>
                  <p className="text-paper/60">&gt; CloudFront cache invalidation: IN_PROGRESS</p>
                  <p className="text-lime font-bold mt-2">
                    ✓ DEPLOYMENT SUCCEEDED in 2.14s
                  </p>
                  <p className="text-paper/90 bg-paper/20 p-2 border border-paper/30 break-all">
                    URL: https://sites.clouddeploy.internal/s/site-a7b2/
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The 6-Step Deployment Workflow */}
      <section id="workflow" className="py-20 border-b border-ink bg-paper-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-mono uppercase tracking-widest text-vermilion font-bold">
              // ARCHITECTURAL WORKFLOW
            </span>
            <h2 className="font-editorial text-3xl sm:text-4xl font-bold tracking-tight text-ink mt-2">
              From Local ZIP to Global Edge Network
            </h2>
            <p className="mt-3 text-base text-ink-muted">
              Every deployment executes within strict isolation boundaries, preventing malicious file uploads and ensuring zero customer server-side code execution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card variant="editorial" hoverable>
              <div className="w-10 h-10 bg-ink text-paper border border-ink flex items-center justify-center font-mono font-bold text-sm mb-4">
                01
              </div>
              <h3 className="font-editorial text-xl font-bold text-ink mb-2">Create & Configure</h3>
              <p className="text-sm text-ink-muted">
                Define your project namespace and custom slug. CloudDeploy registers the project in Amazon RDS and pre-configures user-scoped storage quotas.
              </p>
            </Card>

            <Card variant="editorial" hoverable>
              <div className="w-10 h-10 bg-vermilion text-white border border-ink flex items-center justify-center font-mono font-bold text-sm mb-4">
                02
              </div>
              <h3 className="font-editorial text-xl font-bold text-ink mb-2">Validate Archive</h3>
              <p className="text-sm text-ink-muted">
                Our Spring Boot verification engine performs ZIP Slip inspection, enforces decompression bomb size caps, verifies index.html, and rejects forbidden executable scripts.
              </p>
            </Card>

            <Card variant="editorial" hoverable>
              <div className="w-10 h-10 bg-lime text-ink border border-ink flex items-center justify-center font-mono font-bold text-sm mb-4">
                03
              </div>
              <h3 className="font-editorial text-xl font-bold text-ink mb-2">Distribute Globally</h3>
              <p className="text-sm text-ink-muted">
                Assets are published into private S3 version prefixes and exposed exclusively through CloudFront Origin Access Control (OAC) with sub-second live URLs.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Cloud Infrastructure Grid */}
      <section id="architecture" className="py-20 border-b border-ink bg-paper">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-vermilion font-bold">
                // AWS FOUNDATION
              </span>
              <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-ink mt-2">
                Pure AWS-Native Stack
              </h2>
            </div>
            <p className="text-sm text-ink-muted max-w-md mt-4 md:mt-0 font-mono">
              Engineered exclusively for AWS Cloud. Zero reliance on third-party PaaS or external database vendors.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 bg-paper-light border border-ink shadow-editorial">
              <div className="font-mono text-xs text-vermilion font-bold mb-1">AMAZON S3</div>
              <h4 className="font-editorial text-lg font-bold text-ink mb-2">Encrypted Object Store</h4>
              <p className="text-xs text-ink-muted leading-relaxed">
                Dedicated private buckets with Block Public Access enabled. AES-256 server-side encryption and strict prefix segregation per user deployment.
              </p>
            </div>

            <div className="p-6 bg-paper-light border border-ink shadow-editorial">
              <div className="font-mono text-xs text-vermilion font-bold mb-1">CLOUDFRONT + OAC</div>
              <h4 className="font-editorial text-lg font-bold text-ink mb-2">Global Edge CDN</h4>
              <p className="text-xs text-ink-muted leading-relaxed">
                Origin Access Control protects S3 origins from direct internet requests. Edge caching and instant cache invalidations on version release.
              </p>
            </div>

            <div className="p-6 bg-paper-light border border-ink shadow-editorial">
              <div className="font-mono text-xs text-vermilion font-bold mb-1">AMAZON RDS MYSQL</div>
              <h4 className="font-editorial text-lg font-bold text-ink mb-2">Metadata Database</h4>
              <p className="text-xs text-ink-muted leading-relaxed">
                Managed relational database inside private VPC subnets. Stores tenant projects, deployment revisions, and audit logs with Flyway versioning.
              </p>
            </div>

            <div className="p-6 bg-paper-light border border-ink shadow-editorial">
              <div className="font-mono text-xs text-vermilion font-bold mb-1">AMAZON COGNITO</div>
              <h4 className="font-editorial text-lg font-bold text-ink mb-2">Enterprise Identity</h4>
              <p className="text-xs text-ink-muted leading-relaxed">
                User pools for multi-tenant authentication, secure JWT generation, password rotation, and role-based access control.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SaaS Pricing Section */}
      <section id="pricing" className="py-24 border-b border-ink bg-paper">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <PricingSection showTitle={true} />
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="py-20 bg-ink text-paper border-b border-ink">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <span className="text-xs font-mono uppercase tracking-widest text-lime font-bold">
            READY TO DEPLOY?
          </span>
          <h2 className="font-editorial text-4xl sm:text-5xl font-bold tracking-tight text-paper">
            Your Static Sites, Delivered by AWS.
          </h2>
          <p className="text-base text-paper/70 max-w-xl mx-auto">
            Experience the simplicity of ZIP-based static publishing with the rock-solid resilience of Amazon Web Services.
          </p>
          <div className="pt-4 flex justify-center gap-4">
            <Link to="/register">
              <Button variant="lime" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Launch Console
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary" size="lg">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
