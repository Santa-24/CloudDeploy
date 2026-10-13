import React from 'react';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { useAuth } from '../hooks/useAuth';
import { User, Shield, KeyRound, Clock } from 'lucide-react';

export const ProfileSettingsPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-3xl space-y-8 font-sans">
      <PageHeader
        category="TENANT PROFILE"
        title="User Settings"
        subtitle="Manage your identity credentials, Cognito attributes, and authentication preferences."
      />

      <Card variant="editorial" className="bg-paper-light">
        <div className="flex items-center gap-4 pb-6 mb-6 border-b border-ink">
          <div className="w-16 h-16 bg-ink text-paper border border-ink flex items-center justify-center font-editorial text-2xl font-bold shadow-editorial">
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <h3 className="font-editorial text-2xl font-bold text-ink">
              {user?.email}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge status={user?.role || 'USER'} />
              <Badge status={user?.accountStatus || 'ACTIVE'} />
            </div>
          </div>
        </div>

        <div className="space-y-4 text-xs font-mono">
          <div>
            <span className="text-ink-faint block text-[10px]">INTERNAL USER ID</span>
            <span className="text-ink font-semibold">{user?.id || 'usr-local-dev'}</span>
          </div>
          <div>
            <span className="text-ink-faint block text-[10px]">AMAZON COGNITO SUB</span>
            <span className="text-ink break-all">{user?.cognitoSub || 'cognito-identity-sub-mock-pool-dev'}</span>
          </div>
          <div>
            <span className="text-ink-faint block text-[10px]">INITIALIZED AT</span>
            <span className="text-ink">{user?.createdAt ? new Date(user.createdAt).toLocaleString() : 'Recent'}</span>
          </div>
          <div>
            <span className="text-ink-faint block text-[10px]">STORAGE QUOTA</span>
            <span className="text-ink">{((user?.storageQuotaBytes || 52428800) / 1024 / 1024).toFixed(0)} MB</span>
          </div>
          <div>
            <span className="text-ink-faint block text-[10px]">ACTIVE PLAN TIER</span>
            <div className="flex items-center justify-between">
              <span className="text-ink font-bold">{user?.planTier || 'FREE'} PLAN</span>
              <a href="/pricing" className="text-vermilion hover:underline text-xs">
                Change Plan →
              </a>
            </div>
          </div>
          <div>
            <span className="text-ink-faint block text-[10px]">MAX PROJECTS</span>
            <span className="text-ink">{user?.maxSites || 3} Sites</span>
          </div>
        </div>
      </Card>
    </div>
  );
};
