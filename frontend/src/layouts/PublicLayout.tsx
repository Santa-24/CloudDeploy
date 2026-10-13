import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Terminal, Upload, Shield, HelpCircle, ArrowRight, Menu, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';

export const PublicLayout: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-paper flex flex-col font-sans selection:bg-lime selection:text-ink">
      {/* Top Banner for AWS Infrastructure Status */}
      <div className="bg-ink text-paper text-xs px-4 py-1.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 sm:gap-0 border-b border-ink">
        <div className="flex items-center gap-2 font-mono">
          <span className="w-2 h-2 rounded-full bg-lime animate-pulse shrink-0" />
          <span className="truncate">AWS ARCHITECTURE: S3 + CLOUDFRONT + COGNITO (ap-south-1 Mumbai)</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono text-lime flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-lime"></span>
            LIVE AWS READY
          </span>
        </div>
      </div>

      {/* Main Navbar */}
      <header className="border-b border-ink bg-paper-light/95 backdrop-blur-xs sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-7 h-7 bg-vermilion border border-ink flex items-center justify-center text-paper font-bold shadow-[2px_2px_0px_0px_#1D1C19] group-hover:translate-x-[-1px] group-hover:translate-y-[-1px] transition-transform">
                <span className="text-xs font-mono">CD</span>
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

            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              <Link
                to="/#workflow"
                className="text-ink-muted hover:text-ink hover:underline transition-colors"
              >
                Workflow
              </Link>
              <Link
                to="/#architecture"
                className="text-ink-muted hover:text-ink hover:underline transition-colors"
              >
                AWS Engine
              </Link>
              <Link
                to="/pricing"
                className={`transition-colors hover:text-ink ${location.pathname === '/pricing' ? 'text-vermilion font-semibold' : 'text-ink-muted'}`}
              >
                Pricing & Plans
              </Link>
              <Link
                to="/docs"
                className={`transition-colors hover:text-ink ${location.pathname === '/docs' ? 'text-vermilion font-semibold' : 'text-ink-muted'}`}
              >
                Documentation
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button variant="lime" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">
                    Get Started
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
            <nav className="space-y-2 font-mono text-sm">
              <Link
                to="/#workflow"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-1.5 text-ink-muted hover:text-ink"
              >
                // Workflow
              </Link>
              <Link
                to="/#architecture"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-1.5 text-ink-muted hover:text-ink"
              >
                // AWS Engine Architecture
              </Link>
              <Link
                to="/pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-1.5 text-ink-muted hover:text-ink"
              >
                // Pricing & Plans
              </Link>
              <Link
                to="/docs"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-1.5 text-ink-muted hover:text-ink"
              >
                // Documentation
              </Link>
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
                    Create Workspace →
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

      {/* Editorial Footer */}
      <footer className="border-t border-ink bg-paper-dark text-ink py-12 px-4 sm:px-6 lg:px-8 mt-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 bg-vermilion border border-ink flex items-center justify-center text-white text-xs font-mono">
                CD
              </div>
              <span className="font-editorial text-lg font-bold">CloudDeploy</span>
            </div>
            <p className="text-sm text-ink-muted max-w-sm mb-4">
              Enterprise-grade AWS-native static website deployment engine. Upload archives, safely validate contents, publish to private S3, and distribute globally via CloudFront.
            </p>
            <div className="text-xs font-mono text-ink-faint">
              STRICTLY STATIC SITES • ZERO ARBITRARY CODE EXECUTION • AWS IAM LEAST-PRIVILEGE
            </div>
          </div>
          <div>
            <h4 className="text-xs font-mono uppercase tracking-widest text-ink font-semibold mb-3">
              Platform
            </h4>
            <ul className="space-y-2 text-sm text-ink-muted">
              <li><Link to="/dashboard" className="hover:text-vermilion">Console</Link></li>
              <li><Link to="/pricing" className="hover:text-vermilion">Pricing & Plans</Link></li>
              <li><Link to="/docs" className="hover:text-vermilion">AWS Architecture Docs</Link></li>
              <li><Link to="/#workflow" className="hover:text-vermilion">Deployment Engine</Link></li>
              <li><Link to="/docs" className="hover:text-vermilion">API Contracts</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-mono uppercase tracking-widest text-ink font-semibold mb-3">
              Cloud Infrastructure
            </h4>
            <div className="text-xs font-mono text-ink-muted space-y-1">
              <div>• Amazon S3 (Encrypted, BPA)</div>
              <div>• CloudFront CDN (OAC)</div>
              <div>• Amazon Cognito User Pool</div>
              <div>• Amazon RDS MySQL (Multi-AZ)</div>
              <div>• Spring Boot 3.3 / Java 21</div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto border-t border-stone-subtle mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-ink-faint font-mono">
          <div>© 2026 CloudDeploy Inc. Dedicated to AWS Native Excellence.</div>
          <div className="mt-2 sm:mt-0">Warm Editorial Design System // No Generic Blue UI</div>
        </div>
      </footer>
    </div>
  );
};
