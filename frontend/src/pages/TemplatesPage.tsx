import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { useAuth } from '../hooks/useAuth';
import {
  Sparkles,
  ArrowRight,
  ExternalLink,
  Code2,
  Layers,
  FileCode,
  CheckCircle2,
  Zap,
  Filter,
  Eye,
  Download,
  FolderGit2,
} from 'lucide-react';

export interface ProjectTemplate {
  id: string;
  name: string;
  category: 'react' | 'astro' | 'nextjs' | 'vue' | 'html';
  frameworkName: string;
  description: string;
  badge: string;
  filesCount: number;
  uncompressedSize: string;
  tags: string[];
  suggestedSlug: string;
  files: string[];
  features: string[];
  previewAccent: string;
}

export const TEMPLATES_DATA: ProjectTemplate[] = [
  {
    id: 'react-portfolio-pro',
    name: 'Developer Portfolio Pro',
    category: 'react',
    frameworkName: 'React 18 + Vite + Tailwind',
    description: 'High-conversion personal developer portfolio featuring dark mode, project showcase grid, interactive resume timeline, and contact section.',
    badge: 'POPULAR',
    filesCount: 24,
    uncompressedSize: '2.1 MB',
    tags: ['React', 'Vite', 'Tailwind CSS', 'TypeScript'],
    suggestedSlug: 'dev-portfolio',
    previewAccent: '#C65336',
    files: ['index.html', 'src/App.tsx', 'src/components/Projects.tsx', 'src/components/Skills.tsx', 'tailwind.config.js'],
    features: ['Dark & Light mode toggle', 'Dynamic filtering for projects', 'Zero-bundle Lucide icons', 'Mobile-first responsive layout'],
  },
  {
    id: 'saas-landing-editorial',
    name: 'SaaS Launchpad & Pricing',
    category: 'react',
    frameworkName: 'React 18 + Vite',
    description: 'Modern editorial SaaS landing page template with hero section, animated terminal mockup, tiered pricing comparison table, and customer FAQ.',
    badge: 'FEATURED',
    filesCount: 32,
    uncompressedSize: '3.4 MB',
    tags: ['SaaS', 'React', 'Pricing Table', 'Responsive'],
    suggestedSlug: 'saas-landing',
    previewAccent: '#D7EE73',
    files: ['index.html', 'src/Hero.tsx', 'src/PricingTiers.tsx', 'src/Testimonials.tsx', 'vite.config.ts'],
    features: ['Tiered billing switch (Monthly/Annual)', 'Interactive product demo mockups', 'Pre-configured SEO meta tags', 'Optimized WebP image assets'],
  },
  {
    id: 'technical-docs-minimal',
    name: 'VitePress Tech Docs',
    category: 'vue',
    frameworkName: 'VitePress / Vue 3 Static',
    description: 'Clean, distraction-free technical documentation template. Markdown-driven structure with full-text search, sidebar hierarchy, and code syntax highlighting.',
    badge: 'DOCS',
    filesCount: 18,
    uncompressedSize: '1.8 MB',
    tags: ['Vue 3', 'Markdown', 'Search', 'Documentation'],
    suggestedSlug: 'tech-documentation',
    previewAccent: '#1D1C19',
    files: ['index.html', 'docs/index.md', 'docs/quickstart.md', 'docs/api.md', '.vitepress/config.js'],
    features: ['Client-side search bar', 'Dark/light theme engine', 'Multi-level nested navigation', 'Accessible typographic rhythm'],
  },
  {
    id: 'astro-superfast-blog',
    name: 'Astro Content Hub',
    category: 'astro',
    frameworkName: 'Astro 4.0 Static',
    description: 'Ultra-fast zero-JavaScript static blog with MDX content collections, RSS feed generation, syntax highlighting, and reading time estimation.',
    badge: 'HIGH SPEED',
    filesCount: 22,
    uncompressedSize: '1.2 MB',
    tags: ['Astro', 'MDX', 'Blog', 'Zero JS'],
    suggestedSlug: 'astro-blog',
    previewAccent: '#C65336',
    files: ['src/pages/index.astro', 'src/pages/blog/[...slug].astro', 'src/content/config.ts', 'astro.config.mjs'],
    features: ['100/100 Google Lighthouse score', 'Automatic RSS feed', 'Optimized typography for long-form reading', 'Dynamic tag filtering'],
  },
  {
    id: 'nextjs-static-marketing',
    name: 'Next.js Static Marketing',
    category: 'nextjs',
    frameworkName: 'Next.js 14 Static Export',
    description: 'Enterprise static export website with App Router, server-rendered static generation (`output: "export"`), and dynamic OpenGraph image templates.',
    badge: 'ENTERPRISE',
    filesCount: 28,
    uncompressedSize: '4.6 MB',
    tags: ['Next.js 14', 'App Router', 'Static Export', 'Tailwind'],
    suggestedSlug: 'marketing-portal',
    previewAccent: '#D7EE73',
    files: ['app/page.tsx', 'app/layout.tsx', 'app/features/page.tsx', 'next.config.mjs', 'public/logo.svg'],
    features: ['Next.js Static HTML export (`out/`)', 'Robots.txt & Sitemap.xml generator', 'Tailwind typography plugin', 'Component-level styles'],
  },
  {
    id: 'creative-agency-studio',
    name: 'Creative Agency Showcase',
    category: 'html',
    frameworkName: 'Vanilla HTML5 + Modern CSS',
    description: 'Lightweight, dependency-free agency template built with modern CSS Grid, smooth scroll triggers, and masonry portfolio gallery.',
    badge: 'LIGHTWEIGHT',
    filesCount: 12,
    uncompressedSize: '850 KB',
    tags: ['Vanilla HTML5', 'CSS Grid', 'Zero Dependencies'],
    suggestedSlug: 'agency-showcase',
    previewAccent: '#1D1C19',
    files: ['index.html', 'about.html', 'work.html', 'css/style.css', 'js/main.js'],
    features: ['Zero build step required', 'CSS Grid masonry layout', 'Pure CSS responsive navbar', 'Deploys in under 1 second'],
  },
];

export const TemplatesPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const filteredTemplates = selectedCategory === 'all'
    ? TEMPLATES_DATA
    : TEMPLATES_DATA.filter(t => t.category === selectedCategory);

  const handleDeployTemplate = (template: ProjectTemplate) => {
    // Navigate to Create Project page with template pre-filled
    const params = new URLSearchParams({
      template: template.id,
      name: template.name,
      slug: template.suggestedSlug,
      desc: template.description,
    });

    if (isAuthenticated) {
      navigate(`/projects/new?${params.toString()}`);
    } else {
      navigate(`/register?redirect=/projects/new?${encodeURIComponent(params.toString())}`);
    }
  };

  return (
    <div className="bg-paper min-h-screen py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-ink text-paper text-xs font-mono tracking-wider uppercase border border-ink shadow-[2px_2px_0px_0px_#C65336]">
            <Sparkles className="w-3.5 h-3.5 text-lime" />
            1-Click Starter Templates
          </div>
          <h1 className="font-editorial text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-ink">
            Launch Fast with <span className="italic text-vermilion font-normal">Pre-Built Starters</span>
          </h1>
          <p className="text-base sm:text-lg text-ink-muted leading-relaxed">
            Jumpstart your static website on AWS without writing infrastructure boilerplate. Choose a pre-configured template, deploy with one click, and go live worldwide on Amazon CloudFront.
          </p>
        </div>

        {/* Filter categories bar */}
        <div className="flex flex-wrap items-center justify-center gap-2 border-y border-ink/20 py-4">
          {[
            { id: 'all', label: 'All Starters' },
            { id: 'react', label: 'React & Vite' },
            { id: 'astro', label: 'Astro' },
            { id: 'nextjs', label: 'Next.js (SSG)' },
            { id: 'vue', label: 'Vue & VitePress' },
            { id: 'html', label: 'Vanilla HTML5' },
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-1.5 text-xs font-mono uppercase tracking-wider transition-all border ${
                selectedCategory === cat.id
                  ? 'bg-ink text-paper border-ink shadow-[2px_2px_0px_0px_#C65336]'
                  : 'bg-paper-light text-ink-muted border-ink/30 hover:border-ink hover:text-ink'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTemplates.map(template => (
            <div
              key={template.id}
              className="bg-paper-light border-2 border-ink shadow-editorial flex flex-col justify-between group hover:-translate-y-1 transition-all"
            >
              {/* Template Top Header */}
              <div>
                <div className="p-6 border-b border-ink/10 space-y-3">
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

                  <p className="text-xs text-ink-muted leading-relaxed min-h-[48px]">
                    {template.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {template.tags.map(tag => (
                      <span key={tag} className="text-[11px] font-mono px-2 py-0.5 bg-paper border border-ink/20 text-ink-muted">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* File list preview */}
                <div className="p-4 bg-paper/60 border-b border-ink/10 space-y-2">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-ink-faint flex items-center justify-between">
                    <span>Key Files Included:</span>
                    <span>{template.filesCount} files ({template.uncompressedSize})</span>
                  </div>
                  <div className="bg-ink text-paper p-3 font-mono text-[11px] space-y-1 border border-ink">
                    {template.files.slice(0, 3).map((f, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-paper/80">
                        <FileCode className="w-3 h-3 text-lime shrink-0" />
                        <span className="truncate">{f}</span>
                      </div>
                    ))}
                    {template.files.length > 3 && (
                      <div className="text-paper/40 text-[10px] pl-4">
                        + {template.files.length - 3} more files...
                      </div>
                    )}
                  </div>
                </div>

                {/* Features Highlights */}
                <div className="p-4 space-y-1.5">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-ink-faint">
                    Highlights:
                  </div>
                  {template.features.slice(0, 3).map((feat, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-ink-muted">
                      <CheckCircle2 className="w-3.5 h-3.5 text-vermilion shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-6 pt-4 border-t border-ink/10 bg-paper-light flex items-center gap-3">
                <Button
                  variant="vermilion"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleDeployTemplate(template)}
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  Deploy Template
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedTemplate(template)}
                  aria-label="Inspect template details"
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Modal: Template Detail View */}
        {selectedTemplate && (
          <div className="fixed inset-0 z-50 bg-ink/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-paper border-2 border-ink shadow-editorial max-w-2xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between border-b border-ink/20 pb-4">
                <div>
                  <span className="text-xs font-mono uppercase text-vermilion font-bold">
                    // TEMPLATE SPECIFICATION
                  </span>
                  <h3 className="font-editorial text-2xl font-bold text-ink mt-1">
                    {selectedTemplate.name}
                  </h3>
                  <p className="text-xs font-mono text-ink-muted mt-0.5">
                    {selectedTemplate.frameworkName} • {selectedTemplate.filesCount} files ({selectedTemplate.uncompressedSize})
                  </p>
                </div>
                <button
                  onClick={() => setSelectedTemplate(null)}
                  className="p-1 border border-ink text-ink hover:bg-stone-faint font-mono text-xs"
                >
                  [✕ CLOSE]
                </button>
              </div>

              <div className="space-y-4 text-sm">
                <p className="text-ink-muted leading-relaxed">
                  {selectedTemplate.description}
                </p>

                <div>
                  <h4 className="font-mono text-xs uppercase font-bold text-ink mb-2">
                    Included Architecture & Files:
                  </h4>
                  <div className="bg-ink text-paper p-4 font-mono text-xs border border-ink space-y-1">
                    {selectedTemplate.files.map((file, i) => (
                      <div key={i} className="text-paper/90 flex items-center gap-2">
                        <span className="text-lime">→</span>
                        <span>{file}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-mono text-xs uppercase font-bold text-ink mb-2">
                    Key Template Features:
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedTemplate.features.map((feat, i) => (
                      <div key={i} className="p-2.5 bg-paper-light border border-ink/20 flex items-center gap-2 text-xs text-ink">
                        <CheckCircle2 className="w-3.5 h-3.5 text-lime shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-ink/20">
                <Button variant="outline" size="sm" onClick={() => setSelectedTemplate(null)}>
                  Cancel
                </Button>
                <Button
                  variant="vermilion"
                  size="sm"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                  onClick={() => {
                    handleDeployTemplate(selectedTemplate);
                    setSelectedTemplate(null);
                  }}
                >
                  Deploy This Template Now
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Callout */}
        <div className="p-8 bg-ink text-paper border-2 border-ink shadow-editorial flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs font-mono uppercase tracking-widest text-lime font-bold">
              // CUSTOM REPOSITORIES
            </span>
            <h3 className="font-editorial text-2xl font-bold text-paper">
              Have your own ZIP archive ready?
            </h3>
            <p className="text-xs text-paper/70 font-mono">
              Upload any static project build folder (React, Vue, Astro, HTML) directly into your private S3 workspace.
            </p>
          </div>
          <Link to={isAuthenticated ? '/projects/new' : '/register'}>
            <Button variant="lime" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Create Custom Project
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
