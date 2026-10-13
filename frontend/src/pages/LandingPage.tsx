import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  ExternalLink,
  Copy,
  Check,
  Play,
  RotateCw,
  Cpu,
  FileCode,
  HardDrive,
  Eye,
} from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { TEMPLATES_DATA } from './TemplatesPage';
import { useAuth } from '../hooks/useAuth';

interface FrameworkOption {
  id: string;
  name: string;
  sampleSite: string;
  filesCount: number;
  archiveSize: string;
  slug: string;
}

const FRAMEWORKS: FrameworkOption[] = [
  { id: 'react', name: 'React 18 + Vite', sampleSite: 'vite-dashboard-app', filesCount: 38, archiveSize: '4.2 MB', slug: 'vite-dashboard' },
  { id: 'nextjs', name: 'Next.js 14 (SSG)', sampleSite: 'next-marketing-portal', filesCount: 46, archiveSize: '6.8 MB', slug: 'next-marketing' },
  { id: 'astro', name: 'Astro 4 Content', sampleSite: 'astro-tech-blog', filesCount: 22, archiveSize: '1.4 MB', slug: 'astro-tech-blog' },
  { id: 'portfolio', name: 'Tailwind Portfolio', sampleSite: 'dev-resume-2026', filesCount: 18, archiveSize: '2.1 MB', slug: 'dev-resume' },
  { id: 'html', name: 'HTML5 & CSS Grid', sampleSite: 'agency-landing-site', filesCount: 12, archiveSize: '850 KB', slug: 'agency-landing' },
];

export const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Interactive Live Simulator State
  const [selectedFramework, setSelectedFramework] = useState<FrameworkOption>(FRAMEWORKS[0]);
  const [deployStep, setDeployStep] = useState<number>(0); // 0: idle, 1: validating, 2: uploading s3, 3: cloudfront, 4: complete
  const [isDeploying, setIsDeploying] = useState<boolean>(false);
  const [deployDuration, setDeployDuration] = useState<string>('1.94s');
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);
  const [activeEdgeTab, setActiveEdgeTab] = useState<string>('mumbai');

  // Deployment simulation trigger
  const runSimulation = () => {
    setIsDeploying(true);
    setDeployStep(1);

    setTimeout(() => {
      setDeployStep(2);
    }, 700);

    setTimeout(() => {
      setDeployStep(3);
    }, 1400);

    setTimeout(() => {
      setDeployStep(4);
      setIsDeploying(false);
      const randSec = (1.6 + Math.random() * 0.6).toFixed(2);
      setDeployDuration(`${randSec}s`);
    }, 2100);
  };

  const copySimulatedUrl = () => {
    const url = `https://sites.clouddeploy.internal/s/${selectedFramework.slug}/`;
    navigator.clipboard.writeText(url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const simulatedUrl = `https://sites.clouddeploy.internal/s/${selectedFramework.slug}/`;

  return (
    <div className="bg-paper text-ink font-sans selection:bg-lime selection:text-ink">
      {/* =========================================================================
          1. HERO SECTION: INTERACTIVE SIMULATOR + EDITORIAL HEADLINE
         ========================================================================= */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 border-b border-ink bg-grid-editorial overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Value Proposition */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-ink text-paper text-xs font-mono tracking-wider uppercase border border-ink shadow-[2px_2px_0px_0px_#C65336]">
                <span className="w-2 h-2 rounded-full bg-lime animate-pulse" />
                AWS NATIVE • S3 + CLOUDFRONT OAC • 2.1s GLOBAL DEPLOY
              </div>

              <h1 className="font-editorial text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-ink leading-[1.05]">
                Deploy static sites. <br />
                <span className="italic font-normal text-vermilion">Direct to AWS edge.</span>
              </h1>

              <p className="text-lg md:text-xl text-ink-muted max-w-xl font-normal leading-relaxed">
                The opinionated platform designed to take your React, Vite, Next.js, and Astro builds straight to private Amazon S3 and deliver them globally through Amazon CloudFront. No slow Docker containers. No $32/mo NAT Gateways.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link to={isAuthenticated ? '/projects/new' : '/register'}>
                  <Button variant="vermilion" size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
                    Deploy Free (3 Projects)
                  </Button>
                </Link>
                <Link to="/templates">
                  <Button variant="secondary" size="lg" leftIcon={<Sparkles className="w-4 h-4 text-vermilion" />}>
                    Browse 1-Click Starters
                  </Button>
                </Link>
              </div>

              {/* Technical Security Pill Strip */}
              <div className="pt-6 border-t border-ink/20 flex flex-wrap gap-4 text-xs font-mono text-ink-faint">
                <div className="flex items-center gap-1.5">
                  <span className="text-vermilion font-bold">✓</span> ANTI-ZIP SLIP SANDBOX
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-vermilion font-bold">✓</span> 100% PRIVATE S3 BUCKETS
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-vermilion font-bold">✓</span> CLOUDFRONT OAC & SSL
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-vermilion font-bold">✓</span> ZERO DOWNTIME ROLLBACKS
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Live Deployment Sandbox */}
            <div className="lg:col-span-5">
              <div className="bg-ink text-paper p-6 border-2 border-ink shadow-[8px_8px_0px_0px_#C65336] space-y-4">
                
                {/* Simulator Header */}
                <div className="flex items-center justify-between pb-3 border-b border-paper/20 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#C65336]" />
                    <span className="w-3 h-3 rounded-full bg-[#D7EE73]" />
                    <span className="w-3 h-3 rounded-full bg-paper/60" />
                    <span className="text-paper/80 font-bold ml-1">LIVE PIPELINE SIMULATOR</span>
                  </div>
                  <span className="text-lime text-[11px] animate-pulse">// READY</span>
                </div>

                {/* Framework Selector Pills */}
                <div>
                  <div className="text-[11px] font-mono text-paper/60 uppercase tracking-wider mb-2">
                    Choose Build Target:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {FRAMEWORKS.map(fw => (
                      <button
                        key={fw.id}
                        disabled={isDeploying}
                        onClick={() => {
                          setSelectedFramework(fw);
                          setDeployStep(0);
                        }}
                        className={`px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider transition-all border ${
                          selectedFramework.id === fw.id
                            ? 'bg-lime text-ink border-lime font-bold'
                            : 'bg-paper/10 text-paper/80 border-paper/20 hover:border-paper/40'
                        }`}
                      >
                        {fw.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Interactive Dropzone / Trigger Area */}
                <div className="p-4 bg-paper/5 border border-dashed border-paper/30 space-y-3 text-center">
                  <div className="flex items-center justify-between text-left text-xs font-mono">
                    <span className="text-paper/60">Archive Target:</span>
                    <span className="text-lime font-semibold">{selectedFramework.sampleSite}.zip ({selectedFramework.archiveSize})</span>
                  </div>

                  {deployStep === 0 && (
                    <div className="py-3 space-y-3">
                      <p className="text-xs text-paper/70 font-mono">
                        Click below to simulate real-time ingestion, Zip-Slip safety scanning, and Amazon S3 + CloudFront publication.
                      </p>
                      <Button
                        variant="lime"
                        size="sm"
                        onClick={runSimulation}
                        leftIcon={<Play className="w-3.5 h-3.5" />}
                        className="w-full justify-center"
                      >
                        Run Instant Deployment Simulation
                      </Button>
                    </div>
                  )}

                  {/* Deploying progress steps */}
                  {deployStep > 0 && (
                    <div className="space-y-2.5 text-left font-mono text-xs pt-1">
                      {/* Step 1: Zip Slip validation */}
                      <div className={`flex items-start gap-2 ${deployStep >= 1 ? 'text-lime' : 'text-paper/40'}`}>
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <div>
                          <span>[1/3] Security Inspection:</span>
                          <span className="text-paper/60 block text-[11px]">
                            Canonical path verified • Anti-Zip Slip check passed ({selectedFramework.filesCount} files)
                          </span>
                        </div>
                      </div>

                      {/* Step 2: S3 Staging */}
                      <div className={`flex items-start gap-2 ${deployStep >= 2 ? 'text-lime' : 'text-paper/40'}`}>
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <div>
                          <span>[2/3] Amazon S3 Staging:</span>
                          <span className="text-paper/60 block text-[11px]">
                            Streamed to private bucket (ap-south-1 Mumbai) • SSE-S3 encrypted
                          </span>
                        </div>
                      </div>

                      {/* Step 3: CloudFront Distribution */}
                      <div className={`flex items-start gap-2 ${deployStep >= 3 ? 'text-lime' : 'text-paper/40'}`}>
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <div>
                          <span>[3/3] CloudFront OAC Edge:</span>
                          <span className="text-paper/60 block text-[11px]">
                            Origin Access Control active • Edge cache invalidation triggered
                          </span>
                        </div>
                      </div>

                      {/* Step 4: Succeeded Banner */}
                      {deployStep === 4 && (
                        <div className="pt-2 border-t border-paper/20 space-y-2">
                          <div className="flex items-center justify-between text-xs text-lime font-bold">
                            <span>✓ DEPLOYED SUCCESSFULLY</span>
                            <span className="text-paper/70 font-mono text-[11px]">Time: {deployDuration}</span>
                          </div>

                          <div className="p-2.5 bg-paper/10 border border-paper/30 flex items-center justify-between gap-2">
                            <span className="text-[11px] font-mono text-lime truncate">
                              {simulatedUrl}
                            </span>
                            <button
                              onClick={copySimulatedUrl}
                              className="p-1 hover:bg-paper/20 text-paper/80 hover:text-paper shrink-0"
                              title="Copy Live URL"
                            >
                              {copiedUrl ? <Check className="w-3.5 h-3.5 text-lime" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>

                          <div className="flex items-center gap-2 pt-1">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-paper border-paper/40 hover:bg-paper/10 text-xs flex-1"
                              onClick={runSimulation}
                              leftIcon={<RotateCw className="w-3 h-3" />}
                            >
                              Re-run
                            </Button>
                            <Link to={isAuthenticated ? '/projects/new' : '/register'} className="flex-1">
                              <Button
                                variant="lime"
                                size="sm"
                                className="w-full text-xs"
                                rightIcon={<ArrowRight className="w-3 h-3" />}
                              >
                                Deploy Real Site
                              </Button>
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. LIVE GLOBAL EDGE NETWORK LATENCY RADAR
         ========================================================================= */}
      <section className="py-16 border-b border-ink bg-paper-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-vermilion font-bold">
                // EDGE ACCELERATION
              </span>
              <h2 className="font-editorial text-3xl sm:text-4xl font-bold tracking-tight text-ink mt-1">
                Sub-50ms Global Edge Response Times
              </h2>
            </div>
            <p className="text-xs font-mono text-ink-muted max-w-md">
              Powered by Amazon CloudFront with 600+ Points of Presence and Origin Access Control (OAC). Direct S3 access is blocked, serving cached assets with microsecond latency.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { id: 'mumbai', city: 'Mumbai (BOM)', ttfb: '12ms', origin: 'Primary Origin', flag: '🇮🇳' },
              { id: 'singapore', city: 'Singapore (SIN)', ttfb: '26ms', origin: 'Edge Cache', flag: '🇸🇬' },
              { id: 'frankfurt', city: 'Frankfurt (FRA)', ttfb: '38ms', origin: 'Edge Cache', flag: '🇩🇪' },
              { id: 'london', city: 'London (LHR)', ttfb: '41ms', origin: 'Edge Cache', flag: '🇬🇧' },
              { id: 'virginia', city: 'Virginia (IAD)', ttfb: '48ms', origin: 'Edge Cache', flag: '🇺🇸' },
              { id: 'tokyo', city: 'Tokyo (NRT)', ttfb: '32ms', origin: 'Edge Cache', flag: '🇯🇵' },
            ].map(node => (
              <div
                key={node.id}
                className="p-4 bg-paper border border-ink shadow-editorial flex flex-col justify-between space-y-3"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="text-base">{node.flag}</span>
                  <span className="flex items-center gap-1 text-[10px] font-mono text-lime font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-lime animate-pulse" />
                    LIVE
                  </span>
                </div>
                <div>
                  <div className="font-editorial text-2xl font-bold text-ink">{node.ttfb}</div>
                  <div className="text-[11px] font-mono text-ink-muted leading-tight mt-0.5">{node.city}</div>
                </div>
                <div className="text-[10px] font-mono text-ink-faint border-t border-ink/10 pt-2">
                  {node.origin}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. STARTER TEMPLATES SHOWCASE (1-CLICK DEPLOY)
         ========================================================================= */}
      <section className="py-20 border-b border-ink bg-paper">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-vermilion font-bold">
                // RAPID PROTOTYPING
              </span>
              <h2 className="font-editorial text-3xl sm:text-4xl font-bold tracking-tight text-ink mt-1">
                Deploy Ready-to-Use Starters
              </h2>
              <p className="text-sm text-ink-muted mt-2 max-w-xl">
                Skip zero-state configuration. Launch popular frontends with automated build structure, pre-configured SPA fallbacks, and clean Tailwind styling.
              </p>
            </div>
            <Link to="/templates">
              <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                View All 6 Starters
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TEMPLATES_DATA.slice(0, 3).map(template => (
              <div
                key={template.id}
                className="bg-paper-light border-2 border-ink shadow-editorial flex flex-col justify-between group hover:-translate-y-1 transition-all"
              >
                <div className="p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 bg-ink text-paper">
                      {template.frameworkName}
                    </span>
                    <span
                      className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 border border-ink"
                      style={{ backgroundColor: template.previewAccent, color: template.previewAccent === '#D7EE73' ? '#1D1C19' : '#FFFFFF' }}
                    >
                      {template.badge}
                    </span>
                  </div>

                  <h3 className="font-editorial text-2xl font-bold text-ink group-hover:text-vermilion transition-colors">
                    {template.name}
                  </h3>

                  <p className="text-xs text-ink-muted leading-relaxed min-h-[44px]">
                    {template.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {template.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="text-[10px] font-mono px-2 py-0.5 bg-paper border border-ink/20 text-ink-muted">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-6 pt-3 border-t border-ink/10 bg-paper-light flex items-center justify-between">
                  <div className="text-[11px] font-mono text-ink-faint">
                    {template.filesCount} files ({template.uncompressedSize})
                  </div>
                  <Link
                    to={isAuthenticated ? `/projects/new?template=${template.id}&name=${encodeURIComponent(template.name)}&slug=${template.suggestedSlug}` : `/register?redirect=/projects/new`}
                  >
                    <Button variant="vermilion" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                      Deploy Starter
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. ARCHITECTURE & SECURITY GUARDRAILS MATRIX
         ========================================================================= */}
      <section className="py-20 border-b border-ink bg-paper-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-mono uppercase tracking-widest text-vermilion font-bold">
              // ARCHITECTURAL SECURITY
            </span>
            <h2 className="font-editorial text-3xl sm:text-4xl font-bold tracking-tight text-ink">
              Multi-Layered Ingestion Defense
            </h2>
            <p className="text-sm text-ink-muted">
              Every deployment archive is processed within an isolated Java 21 streamed pipeline that guarantees zero malicious file execution and enforces strict isolation between tenant environments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 bg-paper border-2 border-ink shadow-editorial space-y-3">
              <div className="w-8 h-8 bg-ink text-lime border border-ink flex items-center justify-center font-mono font-bold text-xs">
                01
              </div>
              <h4 className="font-editorial text-lg font-bold text-ink">
                Anti-Zip Slip Defense
              </h4>
              <p className="text-xs text-ink-muted leading-relaxed">
                Canonical path inspection rejects directory traversal payloads (<code>../../etc/passwd</code>) and prevents archive decompression outside target bounds.
              </p>
            </div>

            <div className="p-6 bg-paper border-2 border-ink shadow-editorial space-y-3">
              <div className="w-8 h-8 bg-vermilion text-paper border border-ink flex items-center justify-center font-mono font-bold text-xs">
                02
              </div>
              <h4 className="font-editorial text-lg font-bold text-ink">
                Decompression Bomb Caps
              </h4>
              <p className="text-xs text-ink-muted leading-relaxed">
                Rejects high-compression ratio traps by enforcing maximum extracted byte caps (250 MB) and hard file counts (1,000 files per project).
              </p>
            </div>

            <div className="p-6 bg-paper border-2 border-ink shadow-editorial space-y-3">
              <div className="w-8 h-8 bg-lime text-ink border border-ink flex items-center justify-center font-mono font-bold text-xs">
                03
              </div>
              <h4 className="font-editorial text-lg font-bold text-ink">
                Executable Blacklisting
              </h4>
              <p className="text-xs text-ink-muted leading-relaxed">
                Zero server-side runtime code. Binary executables (<code>.exe</code>, <code>.sh</code>) and server backends (<code>.php</code>, <code>.py</code>) are automatically rejected.
              </p>
            </div>

            <div className="p-6 bg-paper border-2 border-ink shadow-editorial space-y-3">
              <div className="w-8 h-8 bg-paper-dark text-ink border border-ink flex items-center justify-center font-mono font-bold text-xs">
                04
              </div>
              <h4 className="font-editorial text-lg font-bold text-ink">
                Origin Access Control
              </h4>
              <p className="text-xs text-ink-muted leading-relaxed">
                S3 Block Public Access is strictly enabled. Only CloudFront with AWS SigV4 signed requests can read website files from private origins.
              </p>
            </div>
          </div>

          <div className="text-center pt-4">
            <Link to="/features" className="inline-flex items-center gap-2 text-xs font-mono text-vermilion font-bold hover:underline">
              <span>Explore deep-dive technical features</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. SAAS PRICING TEASER (FREE TIER FIRST)
         ========================================================================= */}
      <section className="py-20 border-b border-ink bg-paper">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-mono uppercase tracking-widest text-vermilion font-bold">
              // TRANSPARENT SAAS TIERS
            </span>
            <h2 className="font-editorial text-3xl sm:text-4xl font-bold tracking-tight text-ink">
              Deploy Free Forever. Upgrade as You Scale.
            </h2>
            <p className="text-sm text-ink-muted">
              Start with up to 3 static websites completely free. Upgrade seamlessly to Pro or Team when you need custom domains, team collaboration, or larger storage quotas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Free Plan Card */}
            <div className="p-8 bg-paper-light border-2 border-ink shadow-editorial flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-ink-muted">
                    COMMUNITY
                  </span>
                  <span className="px-2 py-0.5 bg-ink text-paper text-[10px] font-mono uppercase">
                    100% FREE
                  </span>
                </div>
                <h3 className="font-editorial text-3xl font-bold text-ink">Free Tier</h3>
                <div className="font-mono text-3xl font-bold text-ink">
                  $0 <span className="text-xs font-normal text-ink-muted">/ forever</span>
                </div>
                <p className="text-xs text-ink-muted">
                  Ideal for personal portfolios, hobby experiments, and open-source documentation.
                </p>
                <ul className="space-y-2 text-xs text-ink font-mono border-t border-ink/10 pt-4">
                  <li className="flex items-center gap-2">✓ <strong>Up to 3 Active Websites</strong></li>
                  <li className="flex items-center gap-2">✓ 50 MB Total S3 Storage</li>
                  <li className="flex items-center gap-2">✓ Global CloudFront CDN</li>
                  <li className="flex items-center gap-2">✓ Anti-Zip Slip Protection</li>
                </ul>
              </div>
              <Link to={isAuthenticated ? '/dashboard' : '/register'}>
                <Button variant="outline" size="md" className="w-full">
                  Start Free
                </Button>
              </Link>
            </div>

            {/* Pro Plan Card */}
            <div className="p-8 bg-paper-light border-2 border-vermilion shadow-editorial-vermilion flex flex-col justify-between space-y-6 relative">
              <div className="absolute -top-3 right-6 px-3 py-0.5 bg-vermilion text-white text-[10px] font-mono font-bold uppercase border border-ink">
                MOST POPULAR
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-vermilion">
                    PROFESSIONAL
                  </span>
                </div>
                <h3 className="font-editorial text-3xl font-bold text-ink">Pro Plan</h3>
                <div className="font-mono text-3xl font-bold text-ink">
                  $19 <span className="text-xs font-normal text-ink-muted">/ month</span>
                </div>
                <p className="text-xs text-ink-muted">
                  For freelance developers, digital creators, and growing web agencies.
                </p>
                <ul className="space-y-2 text-xs text-ink font-mono border-t border-ink/10 pt-4">
                  <li className="flex items-center gap-2">✓ <strong>Up to 25 Active Websites</strong></li>
                  <li className="flex items-center gap-2">✓ 5 GB S3 Storage Capacity</li>
                  <li className="flex items-center gap-2">✓ Custom Domain Linking</li>
                  <li className="flex items-center gap-2">✓ Instant 1-Click Rollbacks</li>
                </ul>
              </div>
              <Link to="/pricing">
                <Button variant="vermilion" size="md" className="w-full">
                  View Pro Features
                </Button>
              </Link>
            </div>

            {/* Team Plan Card */}
            <div className="p-8 bg-paper-light border-2 border-ink shadow-editorial flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-ink-muted">
                    SCALE
                  </span>
                </div>
                <h3 className="font-editorial text-3xl font-bold text-ink">Team Plan</h3>
                <div className="font-mono text-3xl font-bold text-ink">
                  $49 <span className="text-xs font-normal text-ink-muted">/ month</span>
                </div>
                <p className="text-xs text-ink-muted">
                  For high-velocity engineering organizations requiring massive throughput.
                </p>
                <ul className="space-y-2 text-xs text-ink font-mono border-t border-ink/10 pt-4">
                  <li className="flex items-center gap-2">✓ <strong>Up to 100 Active Websites</strong></li>
                  <li className="flex items-center gap-2">✓ 50 GB S3 Storage Capacity</li>
                  <li className="flex items-center gap-2">✓ Dedicated Origin Routing</li>
                  <li className="flex items-center gap-2">✓ Priority 24/7 SLA Support</li>
                </ul>
              </div>
              <Link to="/pricing">
                <Button variant="outline" size="md" className="w-full">
                  Explore Enterprise
                </Button>
              </Link>
            </div>
          </div>

          <div className="text-center pt-4">
            <Link to="/pricing" className="text-xs font-mono text-ink underline hover:text-vermilion">
              Compare complete feature matrix and FAQs on the Pricing Page →
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          6. CALL TO ACTION FOOTER BANNER
         ========================================================================= */}
      <section className="py-20 bg-ink text-paper border-b border-ink">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <span className="text-xs font-mono uppercase tracking-widest text-lime font-bold">
            // LIVE IN SECONDS
          </span>
          <h2 className="font-editorial text-4xl sm:text-5xl font-bold tracking-tight text-paper">
            Deploy your first website today.
          </h2>
          <p className="text-base text-paper/70 max-w-xl mx-auto">
            Experience the simplicity of ZIP-based static publishing with the rock-solid resilience of Amazon Web Services.
          </p>
          <div className="pt-4 flex flex-wrap justify-center gap-4">
            <Link to={isAuthenticated ? '/dashboard' : '/register'}>
              <Button variant="lime" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Launch Console Free
              </Button>
            </Link>
            <Link to="/docs">
              <Button variant="secondary" size="lg">
                Read Architecture Docs
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
