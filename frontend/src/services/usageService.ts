import { apiClient } from './apiClient';
import { UsageQuota } from '../types';
import { MOCK_USAGE } from './mockData';

export const usageService = {
  async getUsage(): Promise<UsageQuota> {
    if (apiClient.isDemoMode()) {
      return MOCK_USAGE;
    }
    return await apiClient.request<UsageQuota>('/usage');
  }
};
