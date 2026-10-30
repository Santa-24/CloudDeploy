export type UserRole = 'USER' | 'ADMIN';
export type AccountStatus = 'ACTIVE' | 'SUSPENDED';
export type PlanTier = 'FREE' | 'PRO' | 'TEAM';

export type DeploymentStatus = 'QUEUED' | 'VALIDATING' | 'PUBLISHING' | 'SUCCEEDED' | 'FAILED';

export interface User {
  id: string;
  cognitoSub?: string;
  email: string;
  role: UserRole;
  accountStatus: AccountStatus;
  planTier?: PlanTier;
  storageQuotaBytes: number;
  maxSites: number;
  createdAt: string;
}

export interface PricingPlan {
  id: PlanTier;
  name: string;
  tagline: string;
  priceMonthly: number;
  priceAnnual: number;
  maxSites: number;
  storageMb: number;
  badge?: string;
  popular?: boolean;
  features: string[];
  ctaLabel: string;
}

export interface UserPlanResponse {
  userId: string;
  email: string;
  planTier: PlanTier;
  maxSites: number;
  storageQuotaBytes: number;
  storageQuotaMb: number;
  priceMonthlyUsd: number;
}

export interface Site {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  description?: string;
  region?: string;
  currentDeploymentId?: string;
  liveUrl?: string;
  createdAt: string;
  updatedAt: string;
  deploymentCount?: number;
  storageBytes?: number;
  latestStatus?: DeploymentStatus;
}

export interface Deployment {
  id: string;
  siteId: string;
  siteName?: string;
  version: number;
  status: DeploymentStatus;
  region?: string;
  s3Prefix: string;
  liveUrl?: string;
  fileCount: number;
  totalBytes: number;
  errorCode?: string;
  errorSummary?: string;
  startedAt: string;
  completedAt?: string;
}

export interface DeploymentEvent {
  id: string;
  deploymentId: string;
  eventType: string;
  timestamp: string;
  message: string;
}

export interface UsageQuota {
  ownerId: string;
  planTier?: PlanTier;
  storageBytes: number;
  storageQuotaBytes: number;
  projectCount: number;
  maxSites: number;
  deploymentCount: number;
  storagePercent: number;
  projectPercent: number;
}

export interface AdminOverview {
  totalUsers: number;
  totalSites: number;
  totalDeployments: number;
  activeSites: number;
  failedDeployments: number;
  totalStorageBytes: number;
  storageFormatted: string;
  recentDeployments: Deployment[];
  failedList: Deployment[];
}

export interface AwsRegion {
  id: string;
  name: string;
  flag: string;
  description: string;
}

export const AVAILABLE_REGIONS: AwsRegion[] = [
  { id: 'ap-south-1', name: 'Asia Pacific (Mumbai)', flag: '🇮🇳', description: 'Lowest latency for South Asia & India' },
  { id: 'us-east-1', name: 'US East (N. Virginia)', flag: '🇺🇸', description: 'Standard primary US region with global CDN origin' },
  { id: 'us-west-2', name: 'US West (Oregon)', flag: '🇺🇸', description: 'US Pacific & West Coast edge proximity' },
  { id: 'eu-west-1', name: 'Europe (Ireland)', flag: '🇮🇪', description: 'European low-latency primary hub' },
  { id: 'eu-central-1', name: 'Europe (Frankfurt)', flag: '🇩🇪', description: 'Central European data privacy & low latency' },
  { id: 'ap-southeast-1', name: 'Asia Pacific (Singapore)', flag: '🇸🇬', description: 'Southeast Asia & Pacific hub' },
  { id: 'ap-northeast-1', name: 'Asia Pacific (Tokyo)', flag: '🇯🇵', description: 'East Asia & Japan edge performance' },
];

export const DEFAULT_REGION = 'ap-south-1';

export interface CreateSitePayload {
  name: string;
  slug: string;
  description?: string;
  region?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  demoMode: boolean;
}

export interface ApiErrorResponse {
  status: number;
  error: string;
  message: string;
  timestamp: string;
  path: string;
  details?: Record<string, string>;
}
