import { ApiErrorResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
const DEFAULT_DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';

class ApiClient {
  private token: string | null = null;
  private demoMode: boolean = DEFAULT_DEMO_MODE;

  constructor() {
    this.token = localStorage.getItem('clouddeploy_token');
    const storedDemo = localStorage.getItem('clouddeploy_demo_mode');
    if (!DEFAULT_DEMO_MODE) {
      this.demoMode = false;
      localStorage.removeItem('clouddeploy_demo_mode');
    } else if (storedDemo !== null) {
      this.demoMode = storedDemo === 'true';
    }
  }

  public setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('clouddeploy_token', token);
    } else {
      localStorage.removeItem('clouddeploy_token');
    }
  }

  public getToken(): string | null {
    return this.token;
  }

  public setDemoMode(active: boolean) {
    this.demoMode = active;
    localStorage.setItem('clouddeploy_demo_mode', String(active));
  }

  public isDemoMode(): boolean {
    return this.demoMode;
  }

  public async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        let errData: ApiErrorResponse;
        try {
          errData = await response.json();
        } catch {
          errData = {
            status: response.status,
            error: response.statusText,
            message: `HTTP Error ${response.status}: ${response.statusText}`,
            timestamp: new Date().toISOString(),
            path: endpoint,
          };
        }
        throw errData;
      }

      if (response.status === 204) {
        return {} as T;
      }

      return await response.json();
    } catch (error: any) {
      if (error && error.status && error.message) {
        throw error;
      }
      throw {
        status: 0,
        error: 'NetworkError',
        message: error?.message || 'Could not connect to CloudDeploy API backend. Please check network or verify backend service is running on port 8080.',
        timestamp: new Date().toISOString(),
        path: endpoint,
      } as ApiErrorResponse;
    }
  }

  public async uploadArchive<T>(endpoint: string, file: File, queryParams?: Record<string, string>): Promise<T> {
    let url = `${API_BASE_URL}${endpoint}`;
    if (queryParams && Object.keys(queryParams).length > 0) {
      const sp = new URLSearchParams(queryParams);
      url += (url.includes('?') ? '&' : '?') + sp.toString();
    }
    const formData = new FormData();
    formData.append('file', file);

    const headers: Record<string, string> = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      let errData: ApiErrorResponse;
      try {
        errData = await response.json();
      } catch {
        errData = {
          status: response.status,
          error: response.statusText,
          message: `Upload Error: ${response.statusText}`,
          timestamp: new Date().toISOString(),
          path: endpoint,
        };
      }
      throw errData;
    }

    return await response.json();
  }
}

export const apiClient = new ApiClient();
