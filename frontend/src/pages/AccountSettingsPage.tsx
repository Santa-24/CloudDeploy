import React from 'react';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Shield, Lock, Bell, Terminal } from 'lucide-react';

export const AccountSettingsPage: React.FC = () => {
  return (
    <div className="max-w-3xl space-y-8 font-sans">
      <PageHeader
        category="ACCOUNT SECURITY"
        title="Workspace Security"
        subtitle="Cryptographic controls, session revocation, and security policies."
      />

      <div className="space-y-6">
        <Card variant="flat" className="bg-paper-light">
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-ink shrink-0 mt-0.5" />
            <div>
              <h4 className="font-editorial text-lg font-bold text-ink">Cognito Multi-Factor Authentication</h4>
              <p className="text-xs text-ink-muted mt-1 mb-3">
                Require TOTP or SMS verification codes at login. Configured via the Amazon Cognito User Pool console.
              </p>
              <div className="text-xs font-mono text-ink-faint">Status: Configured via Cognito Policy</div>
            </div>
          </div>
        </Card>

        <Card variant="flat" className="bg-paper-light">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-ink shrink-0 mt-0.5" />
            <div>
              <h4 className="font-editorial text-lg font-bold text-ink">SameSite & Session Protections</h4>
              <p className="text-xs text-ink-muted mt-1 mb-3">
                CloudDeploy enforces CSRF protection, bearer token validation, and least-privilege AWS IAM identity boundaries on every API transaction.
              </p>
              <div className="text-xs font-mono text-ink-faint">Token Mode: Bearer JWT / Cognito Verified</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
