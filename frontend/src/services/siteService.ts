import { apiClient } from './apiClient';
import { Site, CreateSitePayload } from '../types';
import { MOCK_SITES } from './mockData';

const STORAGE_KEY = 'clouddeploy_demo_sites';

function getDemoSites(): Site[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Failed to parse cached demo sites:', e);
  }
  return [...MOCK_SITES];
}

function saveDemoSites(sites: Site[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sites));
  } catch (e) {
    console.warn('Failed to persist demo sites to localStorage:', e);
  }
}

export const siteService = {
  async getSites(): Promise<Site[]> {
    if (apiClient.isDemoMode()) {
      return getDemoSites();
    }
    return await apiClient.request<Site[]>('/sites');
  },

  async getSite(siteId: string): Promise<Site> {
    if (apiClient.isDemoMode()) {
      const sites = getDemoSites();
      const site = sites.find(s => s.id === siteId);
      if (!site) {
        throw { status: 404, message: `Site ${siteId} not found in workspace` };
      }
      return site;
    }
    return await apiClient.request<Site>(`/sites/${siteId}`);
  },

  async createSite(payload: CreateSitePayload): Promise<Site> {
    if (apiClient.isDemoMode()) {
      await new Promise(r => setTimeout(r, 400));
      const sites = getDemoSites();
      const newSite: Site = {
        id: `site-${Math.random().toString(36).substring(2, 6)}-${payload.slug}`,
        ownerId: 'usr-8921-prod',
        name: payload.name,
        slug: payload.slug,
        description: payload.description || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deploymentCount: 0,
        storageBytes: 0,
      };
      sites.unshift(newSite);
      saveDemoSites(sites);
      return newSite;
    }
    return await apiClient.request<Site>('/sites', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async deleteSite(siteId: string): Promise<void> {
    if (apiClient.isDemoMode()) {
      const sites = getDemoSites().filter(s => s.id !== siteId);
      saveDemoSites(sites);
      return;
    }
    await apiClient.request<void>(`/sites/${siteId}`, {
      method: 'DELETE',
    });
  }
};
