import { apiClient } from './apiClient';
import { User } from '../types';
import { MOCK_USER } from './mockData';

export interface LoginPayload {
  email: string;
  password?: string;
}

export interface RegisterPayload {
  email: string;
  password?: string;
  role?: string;
}

export const authService = {
  async login(payload: LoginPayload): Promise<{ token: string; user: User }> {
    if (apiClient.isDemoMode()) {
      await new Promise(r => setTimeout(r, 400));
      const demoUser = { ...MOCK_USER, email: payload.email || MOCK_USER.email };
      const demoToken = 'demo-jwt-token-clouddeploy-aws-cognito-simulated';
      apiClient.setToken(demoToken);
      return { token: demoToken, user: demoUser };
    }

    const data = await apiClient.request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    apiClient.setToken(data.token);
    return data;
  },

  async register(payload: RegisterPayload): Promise<{ token: string; user: User }> {
    if (apiClient.isDemoMode()) {
      await new Promise(r => setTimeout(r, 500));
      const demoUser: User = {
        id: `usr-${Math.random().toString(36).substring(2, 7)}`,
        email: payload.email,
        role: 'USER',
        accountStatus: 'ACTIVE',
        storageQuotaBytes: 104857600,
        maxSites: 10,
        createdAt: new Date().toISOString(),
      };
      const demoToken = 'demo-jwt-token-new-user';
      apiClient.setToken(demoToken);
      return { token: demoToken, user: demoUser };
    }

    const data = await apiClient.request<{ token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    apiClient.setToken(data.token);
    return data;
  },

  async getCurrentUser(): Promise<User> {
    if (apiClient.isDemoMode()) {
      return MOCK_USER;
    }
    return await apiClient.request<User>('/auth/me');
  },

  async requestPasswordReset(email: string): Promise<{ message: string }> {
    if (apiClient.isDemoMode()) {
      await new Promise(r => setTimeout(r, 400));
      return { message: `Cognito password recovery confirmation code dispatched to ${email}` };
    }
    return await apiClient.request<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  logout(): void {
    apiClient.setToken(null);
  }
};
