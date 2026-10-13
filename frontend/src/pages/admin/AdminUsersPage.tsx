import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../components/PageHeader';
import { Badge } from '../../components/Badge';
import { Skeleton } from '../../components/Skeleton';
import { User } from '../../types';
import { adminService } from '../../services/adminService';
import { ArrowLeft, Users, Shield, HardDrive } from 'lucide-react';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    adminService.getUsers()
      .then(setUsers)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <Skeleton className="h-64" />;
  }

  return (
    <div className="space-y-6 font-sans">
      <Link
        to="/admin"
        className="inline-flex items-center gap-1.5 text-xs font-mono text-ink-muted hover:text-ink"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Admin Overview
      </Link>

      <PageHeader
        category="PLATFORM TENANTS"
        title="User & Tenant Directory"
        subtitle="Catalog of all registered accounts, IAM role privileges, and assigned storage quotas."
      />

      <div className="border border-ink overflow-x-auto bg-paper-light shadow-editorial">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-paper-dark border-b border-ink uppercase tracking-wider text-ink">
            <tr>
              <th className="p-3.5">Email / Identifier</th>
              <th className="p-3.5">Role</th>
              <th className="p-3.5">Account Status</th>
              <th className="p-3.5">Storage Quota</th>
              <th className="p-3.5">Max Sites</th>
              <th className="p-3.5">Cognito Sub</th>
              <th className="p-3.5">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-subtle">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-stone-faint/50">
                <td className="p-3.5">
                  <span className="font-bold text-ink block">{u.email}</span>
                  <span className="text-[10px] text-ink-faint">ID: {u.id}</span>
                </td>
                <td className="p-3.5">
                  <Badge status={u.role} />
                </td>
                <td className="p-3.5">
                  <Badge status={u.accountStatus} />
                </td>
                <td className="p-3.5 text-ink-muted">
                  {(u.storageQuotaBytes / 1024 / 1024).toFixed(0)} MB
                </td>
                <td className="p-3.5 text-ink-muted">
                  {u.maxSites} sites
                </td>
                <td className="p-3.5 text-ink-faint truncate max-w-[140px]">
                  {u.cognitoSub || 'n/a'}
                </td>
                <td className="p-3.5 text-ink-faint">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
