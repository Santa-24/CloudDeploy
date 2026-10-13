import { apiClient } from './apiClient';
import { Deployment, DeploymentEvent } from '../types';
import { MOCK_DEPLOYMENTS, MOCK_EVENTS } from './mockData';

let demoDeploymentsMap: Record<string, Deployment[]> = { ...MOCK_DEPLOYMENTS };

export const deploymentService = {
  async getDeployments(siteId: string): Promise<Deployment[]> {
    if (apiClient.isDemoMode()) {
      return demoDeploymentsMap[siteId] || [];
    }
    return await apiClient.request<Deployment[]>(`/sites/${siteId}/deployments`);
  },

  async getDeployment(deploymentId: string): Promise<Deployment> {
    if (apiClient.isDemoMode()) {
      for (const siteId in demoDeploymentsMap) {
        const found = demoDeploymentsMap[siteId].find(d => d.id === deploymentId);
        if (found) return found;
      }
      throw { status: 404, message: `Deployment ${deploymentId} not found` };
    }
    return await apiClient.request<Deployment>(`/deployments/${deploymentId}`);
  },

  async getEvents(deploymentId: string): Promise<DeploymentEvent[]> {
    if (apiClient.isDemoMode()) {
      return MOCK_EVENTS[deploymentId] || [
        { id: 'ev-1', deploymentId, eventType: 'INITIALIZED', timestamp: new Date().toISOString(), message: 'Deployment initialized' }
      ];
    }
    return await apiClient.request<DeploymentEvent[]>(`/deployments/${deploymentId}/events`);
  },

  async deployArchive(siteId: string, file: File): Promise<Deployment> {
    if (apiClient.isDemoMode()) {
      await new Promise(r => setTimeout(r, 600));
      const newVersion = ((demoDeploymentsMap[siteId] || [])[0]?.version || 0) + 1;
      const depId = `dep-${Math.random().toString(36).substring(2, 6)}-v${newVersion}`;
      const newDep: Deployment = {
        id: depId,
        siteId,
        version: newVersion,
        status: 'SUCCEEDED',
        s3Prefix: `sites/${siteId}/deployments/${depId}/`,
        liveUrl: `https://sites.clouddeploy.internal/s/${siteId}/`,
        fileCount: 14,
        totalBytes: file.size,
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
      };
      if (!demoDeploymentsMap[siteId]) {
        demoDeploymentsMap[siteId] = [];
      }
      demoDeploymentsMap[siteId].unshift(newDep);
      return newDep;
    }

    return await apiClient.uploadArchive<Deployment>(`/sites/${siteId}/deployments`, file);
  },

  async rollback(siteId: string, targetDeploymentId: string): Promise<Deployment> {
    if (apiClient.isDemoMode()) {
      await new Promise(r => setTimeout(r, 500));
      const target = (demoDeploymentsMap[siteId] || []).find(d => d.id === targetDeploymentId);
      if (!target) {
        throw { status: 404, message: 'Target deployment not found' };
      }
      const newVersion = (demoDeploymentsMap[siteId][0]?.version || 1) + 1;
      const rollbackDep: Deployment = {
        ...target,
        id: `dep-rb-${Math.random().toString(36).substring(2, 6)}-v${newVersion}`,
        version: newVersion,
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        status: 'SUCCEEDED',
      };
      demoDeploymentsMap[siteId].unshift(rollbackDep);
      return rollbackDep;
    }

    return await apiClient.request<Deployment>(`/sites/${siteId}/rollback`, {
      method: 'POST',
      body: JSON.stringify({ targetDeploymentId }),
    });
  }
};
