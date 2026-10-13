import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Terminal, Upload, Shield, HelpCircle, ArrowRight, Menu, X, Sparkles, Plus, Layers, Globe2, FileCode2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';

export const PublicLayout: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Features', path: '/features' },
    { label: 'Templates', path: '/templates' },
    { label: 'Pricing & Plans', path: '/pricing' },
    { label: 'Documentation', path: '/docs' },
  ];

  const isLinkActive = (path: string) => {
    return location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
  };

  return (
    <div className="min-h-screen bg-paper flex flex-col font-sans selection:bg-lime selection:text-ink">
      {/* Top Banner for AWS Infrastructure Status */}
      <div className="bg-ink text-paper text-xs px-4 py-1.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 sm:gap-0 border-b border-ink">
        <div className="flex items-center gap-2 font-mono">
          <span className="w-2 h-2 rounded-full bg-lime animate-pulse shrink-0" />
          <span className="truncate">AWS ARCHITECTURE: S3 + CLOUDFRONT OAC + COGNITO (ap-south-1 Mumbai)</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono text-lime flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-lime"></span>
            SUB-2S GLOBAL DEPLOY
          </span>
        </div>
      </div>

      {/* Main Navbar: Dedicated Page Navigation */}
      <header className="border-b border-ink bg-paper-light/95 backdrop-blur-xs sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            {/* Brand Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 bg-paper border border-ink flex items-center justify-center p-0.5 shadow-[2px_2px_0px_0px_#1D1C19] group-hover:translate-x-[-1px] group-hover:translate-y-[-1px] transition-transform">
                <img src="/logo.png" alt="CloudDeploy" className="w-full h-full object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="font-editorial text-xl font-bold tracking-tight text-ink leading-none">
                  CloudDeploy
                </span>
                <span className="text-[10px] font-mono tracking-widest text-ink-faint uppercase leading-tight mt-0.5">
                  AWS Static Platform
                </span>
              </div>
            </Link>

            {/* Separate Page Links */}
            <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
              {navItems.map(item => {
                const active = isLinkActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-3 py-1.5 transition-all font-mono text-xs uppercase tracking-wider ${
                      active
                        ? 'text-vermilion font-bold bg-paper border border-ink shadow-[2px_2px_0px_0px_#1D1C19]'
                        : 'text-ink-muted hover:text-ink hover:bg-stone-faint'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Action CTA Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link to="/projects/new">
                  <Button variant="outline" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />} className="hidden sm:inline-flex text-xs">
                    New Deploy
                  </Button>
                </Link>
                <Link to="/dashboard">
                  <Button variant="lime" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    Dashboard
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="hidden sm:inline-flex text-xs">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="vermilion" size="sm">
                    Deploy Free
                  </Button>
                </Link>
              </>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 border border-ink bg-paper text-ink hover:bg-stone-faint"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-ink bg-paper-light p-4 space-y-3 shadow-editorial">
            <nav className="space-y-1 font-mono text-xs uppercase">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 border ${
                  location.pathname === '/' ? 'bg-ink text-paper border-ink' : 'text-ink-muted border-transparent hover:bg-stone-faint'
                }`}
              >
                // Home Showcase
              </Link>
              {navItems.map(item => {
                const active = isLinkActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-3 py-2 border ${
                      active ? 'bg-ink text-paper border-ink' : 'text-ink-muted border-transparent hover:bg-stone-faint'
                    }`}
                  >
                    // {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="pt-3 border-t border-stone-subtle flex items-center justify-between">
              {!isAuthenticated ? (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-xs font-mono font-bold text-ink hover:underline"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-xs font-mono font-bold text-vermilion hover:underline"
                  >
                    Deploy Free (3 Projects) →
                  </Link>
                </>
              ) : (
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-xs font-mono font-bold text-vermilion"
                >
                  Open Dashboard Console →
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Page Body */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Editorial Multi-Page Footer */}
      <footer className="border-t border-ink bg-paper-dark text-ink py-12 px-4 sm:px-6 lg:px-8 mt-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 bg-paper border border-ink flex items-center justify-center p-0.5">
                <img src="/logo.png" alt="CloudDeploy" className="w-full h-full object-contain" />
              </div>
              <span className="font-editorial text-lg font-bold">CloudDeploy</span>
            </div>
            <p className="text-xs text-ink-muted max-w-sm mb-4 leading-relaxed">
              Enterprise-grade AWS-native static website deployment engine. Upload archives, safely validate contents, publish to private S3, and distribute globally via CloudFront.
            </p>
            <div className="text-[11px] font-mono text-ink-faint">
              STRICTLY STATIC • ZERO ARBITRARY CODE EXECUTION • AWS S3 & CLOUDFRONT OAC
            </div>
          </div>

          <div>
            <h4 className="text-xs font-mono uppercase tracking-widest text-ink font-bold mb-3">
              Separate Pages
            </h4>
            <ul className="space-y-2 text-xs font-mono text-ink-muted">
              <li><Link to="/features" className="hover:text-vermilion transition-colors">→ Features & Engine</Link></li>
              <li><Link to="/templates" className="hover:text-vermilion transition-colors">→ 1-Click Templates</Link></li>
              <li><Link to="/pricing" className="hover:text-vermilion transition-colors">→ Pricing & Free Tier</Link></li>
              <li><Link to="/docs" className="hover:text-vermilion transition-colors">→ Technical Docs</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-mono uppercase tracking-widest text-ink font-bold mb-3">
              Deployment Console
            </h4>
            <ul className="space-y-2 text-xs font-mono text-ink-muted">
              <li><Link to={isAuthenticated ? '/projects/new' : '/register'} className="hover:text-vermilion transition-colors">→ Deploy New Website</Link></li>
              <li><Link to="/dashboard" className="hover:text-vermilion transition-colors">→ Project Dashboard</Link></li>
              <li><Link to="/usage" className="hover:text-vermilion transition-colors">→ Storage Quotas</Link></li>
              <li><Link to="/docs" className="hover:text-vermilion transition-colors">→ API & CLI Guide</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-mono uppercase tracking-widest text-ink font-bold mb-3">
              AWS Infrastructure
            </h4>
            <div className="text-xs font-mono text-ink-muted space-y-1">
              <div>• Amazon S3 (AES-256, BPA)</div>
              <div>• CloudFront CDN (OAC Edge)</div>
              <div>• Amazon Cognito (User Pool)</div>
              <div>• Amazon RDS MySQL (Metadata)</div>
              <div>• Spring Boot 3.3 / Java 21</div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto border-t border-stone-subtle mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-ink-faint font-mono">
          <div>© 2026 CloudDeploy Inc. Built for AWS Native Velocity.</div>
          <div className="mt-2 sm:mt-0">Warm Editorial Design System // Free Tier Enabled</div>
        </div>
      </footer>
    </div>
  );
};
