import { apiClient } from './apiClient';
import { AdminOverview, User, Deployment } from '../types';
import { MOCK_ADMIN_OVERVIEW, MOCK_USER } from './mockData';

export const adminService = {
  async getOverview(): Promise<AdminOverview> {
    if (apiClient.isDemoMode()) {
      return MOCK_ADMIN_OVERVIEW;
    }
    return await apiClient.request<AdminOverview>('/admin/overview');
  },

  async getUsers(): Promise<User[]> {
    if (apiClient.isDemoMode()) {
      return [
        MOCK_USER,
        {
          id: 'usr-4412-team',
          cognitoSub: 'cognito-sub-aa81-9921',
          email: 'designer@studio-north.org',
          role: 'USER',
          accountStatus: 'ACTIVE',
          storageQuotaBytes: 104857600,
          maxSites: 10,
          createdAt: '2026-09-18T11:00:00Z',
        },
        {
          id: 'usr-1903-test',
          cognitoSub: 'cognito-sub-0044-3312',
          email: 'qa@clouddeploy.internal',
          role: 'USER',
          accountStatus: 'SUSPENDED',
          storageQuotaBytes: 52428800,
          maxSites: 5,
          createdAt: '2026-10-02T16:30:00Z',
        }
      ];
    }
    return await apiClient.request<User[]>('/admin/users');
  },

  async getDeployments(): Promise<Deployment[]> {
    if (apiClient.isDemoMode()) {
      return MOCK_ADMIN_OVERVIEW.recentDeployments;
    }
    return await apiClient.request<Deployment[]>('/admin/deployments');
  },

  async getFailedDeployments(): Promise<Deployment[]> {
    if (apiClient.isDemoMode()) {
      return MOCK_ADMIN_OVERVIEW.failedList;
    }
    return await apiClient.request<Deployment[]>('/admin/deployments/failed');
  }
};
