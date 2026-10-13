import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FolderKanban,
  UploadCloud,
  HardDrive,
  User as UserIcon,
  Settings,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  ExternalLink,
  Plus,
  Sparkles,
  Layers,
  FileCode2,
  Zap,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';

export const DashboardLayout: React.FC = () => {
  const { user, logout, demoMode, toggleDemoMode } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { label: 'Overview', path: '/dashboard', icon: Layers },
    { label: 'Projects', path: '/projects', icon: FolderKanban },
    { label: 'New Project', path: '/projects/new', icon: Plus },
    { label: 'Starter Templates', path: '/templates', icon: Sparkles },
    { label: 'Pricing & Plans', path: '/pricing', icon: Zap },
    { label: 'Usage & Quotas', path: '/usage', icon: HardDrive },
    { label: 'Documentation', path: '/docs', icon: FileCode2 },
  ];

  const adminLinks = [
    { label: 'Admin Console', path: '/admin', icon: ShieldCheck },
  ];

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-paper flex flex-col md:flex-row font-sans selection:bg-lime selection:text-ink">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-ink bg-paper-light shrink-0 min-h-screen sticky top-0 h-screen overflow-y-auto">
        {/* Brand Header */}
        <div className="p-6 border-b border-ink">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-vermilion border border-ink flex items-center justify-center text-paper font-bold shadow-[2px_2px_0px_0px_#1D1C19]">
              <span className="text-xs font-mono">CD</span>
            </div>
            <div>
              <span className="font-editorial text-lg font-bold tracking-tight text-ink block leading-none">
                CloudDeploy
              </span>
              <span className="text-[10px] font-mono tracking-widest text-ink-faint uppercase">
                Console
              </span>
            </div>
          </Link>
        </div>

        {/* User Workspace Info */}
        <div className="px-6 py-4 border-b border-stone-subtle bg-paper-dark/30">
          <div className="text-[10px] font-mono uppercase tracking-wider text-ink-faint mb-1">
            Workspace
          </div>
          <div className="text-xs font-semibold truncate text-ink">
            {user?.email || 'authenticated-user'}
          </div>
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-vermilion text-white uppercase border border-ink">
              {user?.planTier || 'FREE'} PLAN
            </span>
            <Badge status={user?.role || 'USER'} />
            {demoMode && <Badge status="DEMO" label="Demo" />}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-1.5">
          <div className="text-[11px] font-mono uppercase tracking-widest text-ink-faint px-3 mb-2">
            Deployments
          </div>
          {navLinks.map(link => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 px-3 py-2 text-sm font-medium transition-all ${
                  active
                    ? 'bg-ink text-paper border border-ink shadow-[2px_2px_0px_0px_#C65336]'
                    : 'text-ink-muted hover:bg-stone-faint hover:text-ink border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-lime' : 'text-ink-faint'}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}

          {user?.role === 'ADMIN' && (
            <>
              <div className="text-[11px] font-mono uppercase tracking-widest text-vermilion px-3 pt-6 mb-2">
                Administration
              </div>
              {adminLinks.map(link => {
                const Icon = link.icon;
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center gap-3 px-3 py-2 text-sm font-medium transition-all ${
                      active
                        ? 'bg-vermilion text-white border border-ink shadow-[2px_2px_0px_0px_#1D1C19]'
                        : 'text-ink-muted hover:bg-stone-faint hover:text-ink border border-transparent'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-white" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </>
          )}
        </nav>

        {/* Live Architecture Status Card */}
        <div className="p-4 border-t border-stone-subtle">
          <div className="bg-paper p-3 border border-stone-subtle text-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono text-[11px] font-semibold text-ink">AWS Production Engine</span>
              <span className="w-2 h-2 rounded-full bg-lime animate-pulse" />
            </div>
            <p className="text-[11px] text-ink-faint">
              Connected to Mumbai (ap-south-1) S3 and CloudFront CDN.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-ink flex items-center justify-between text-xs">
          <Link
            to="/profile"
            className="flex items-center gap-2 text-ink-muted hover:text-ink font-mono"
          >
            <UserIcon className="w-4 h-4" />
            <span>Profile</span>
          </Link>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 text-vermilion hover:text-vermilion-hover font-mono font-medium cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden border-b border-ink bg-paper-light px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-vermilion border border-ink flex items-center justify-center text-paper font-bold shadow-[1px_1px_0px_0px_#1D1C19]">
            <span className="text-xs font-mono">CD</span>
          </div>
          <span className="font-editorial text-lg font-bold">CloudDeploy</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-ink-faint bg-paper px-2 py-1 border border-stone-subtle">
            ap-south-1
          </span>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 border border-ink bg-paper text-ink hover:bg-stone-faint"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-ink bg-paper-light p-4 space-y-3 shadow-editorial">
          <div className="text-xs font-mono text-ink-faint pb-2 border-b border-stone-subtle flex items-center justify-between">
            <span className="truncate max-w-[200px]">{user?.email || 'Authenticated User'}</span>
            <Badge status={user?.role || 'USER'} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {navLinks.map(link => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 p-2.5 text-xs font-mono font-medium border ${
                    active
                      ? 'bg-ink text-paper border-ink shadow-[1px_1px_0px_0px_#C65336]'
                      : 'bg-paper text-ink border-stone-subtle hover:border-ink'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${active ? 'text-lime' : 'text-ink-muted'}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>
          {user?.role === 'ADMIN' && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block p-2 text-center text-xs font-mono font-bold bg-vermilion text-paper border border-ink"
            >
              Admin Console
            </Link>
          )}
          <div className="pt-2 border-t border-stone-subtle flex items-center justify-between">
            <Link
              to="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="text-xs font-mono text-ink hover:text-vermilion"
            >
              Workspace Profile
            </Link>
            <button
              onClick={handleSignOut}
              className="text-xs font-mono text-vermilion hover:underline font-bold"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <main className="flex-1 p-4 sm:p-6 md:p-10 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
