import { User, Site, Deployment, DeploymentEvent, UsageQuota, AdminOverview } from '../types';

export const MOCK_USER: User = {
  id: 'usr-8921-prod',
  cognitoSub: 'cognito-sub-d018b28f-7cb2-4a02-b2a8-8e6ad12089ef',
  email: 'architect@clouddeploy.internal',
  role: 'ADMIN',
  accountStatus: 'ACTIVE',
  planTier: 'PRO',
  storageQuotaBytes: 5368709120, // 5 GB Pro tier
  maxSites: 25,
  createdAt: '2026-09-01T10:00:00Z',
};

export const MOCK_SITES: Site[] = [
  {
    id: 'site-a7b2-doc',
    ownerId: 'usr-8921-prod',
    name: 'Atelier Portfolio',
    slug: 'atelier-portfolio',
    description: 'Minimalist editorial architecture monograph and studio index.',
    currentDeploymentId: 'dep-9912-v3',
    liveUrl: 'https://sites.clouddeploy.internal/s/site-a7b2-doc/',
    createdAt: '2026-09-12T14:22:00Z',
    updatedAt: '2026-10-10T09:15:00Z',
    deploymentCount: 3,
    storageBytes: 14500000,
    latestStatus: 'SUCCEEDED',
  },
  {
    id: 'site-90c1-mono',
    ownerId: 'usr-8921-prod',
    name: 'DevLog Rust Engine',
    slug: 'devlog-rust-engine',
    description: 'Technical documentation site compiled to static HTML via Zola.',
    currentDeploymentId: 'dep-4402-v1',
    liveUrl: 'https://sites.clouddeploy.internal/s/site-90c1-mono/',
    createdAt: '2026-10-01T18:40:00Z',
    updatedAt: '2026-10-01T18:45:00Z',
    deploymentCount: 1,
    storageBytes: 8200000,
    latestStatus: 'SUCCEEDED',
  },
  {
    id: 'site-31ff-lab',
    ownerId: 'usr-8921-prod',
    name: 'Spatial Computing Notes',
    slug: 'spatial-notes',
    description: 'Experimental three.js interactive canvas preview files.',
    currentDeploymentId: 'dep-1104-v2',
    liveUrl: 'https://sites.clouddeploy.internal/s/site-31ff-lab/',
    createdAt: '2026-10-05T11:10:00Z',
    updatedAt: '2026-10-11T08:20:00Z',
    deploymentCount: 2,
    storageBytes: 23100000,
    latestStatus: 'SUCCEEDED',
  }
];

export const MOCK_DEPLOYMENTS: Record<string, Deployment[]> = {
  'site-a7b2-doc': [
    {
      id: 'dep-9912-v3',
      siteId: 'site-a7b2-doc',
      siteName: 'Atelier Portfolio',
      version: 3,
      status: 'SUCCEEDED',
      s3Prefix: 'sites/site-a7b2-doc/deployments/dep-9912-v3/',
      liveUrl: 'https://sites.clouddeploy.internal/s/site-a7b2-doc/',
      fileCount: 42,
      totalBytes: 14500000,
      startedAt: '2026-10-10T09:12:00Z',
      completedAt: '2026-10-10T09:15:00Z',
    },
    {
      id: 'dep-7821-v2',
      siteId: 'site-a7b2-doc',
      siteName: 'Atelier Portfolio',
      version: 2,
      status: 'SUCCEEDED',
      s3Prefix: 'sites/site-a7b2-doc/deployments/dep-7821-v2/',
      liveUrl: 'https://sites.clouddeploy.internal/s/site-a7b2-doc/',
      fileCount: 38,
      totalBytes: 12100000,
      startedAt: '2026-09-24T16:00:00Z',
      completedAt: '2026-09-24T16:03:00Z',
    },
    {
      id: 'dep-5100-v1',
      siteId: 'site-a7b2-doc',
      siteName: 'Atelier Portfolio',
      version: 1,
      status: 'SUCCEEDED',
      s3Prefix: 'sites/site-a7b2-doc/deployments/dep-5100-v1/',
      liveUrl: 'https://sites.clouddeploy.internal/s/site-a7b2-doc/',
      fileCount: 25,
      totalBytes: 7800000,
      startedAt: '2026-09-12T14:22:00Z',
      completedAt: '2026-09-12T14:25:00Z',
    }
  ],
  'site-90c1-mono': [
    {
      id: 'dep-4402-v1',
      siteId: 'site-90c1-mono',
      siteName: 'DevLog Rust Engine',
      version: 1,
      status: 'SUCCEEDED',
      s3Prefix: 'sites/site-90c1-mono/deployments/dep-4402-v1/',
      liveUrl: 'https://sites.clouddeploy.internal/s/site-90c1-mono/',
      fileCount: 64,
      totalBytes: 8200000,
      startedAt: '2026-10-01T18:40:00Z',
      completedAt: '2026-10-01T18:45:00Z',
    }
  ],
  'site-31ff-lab': [
    {
      id: 'dep-1104-v2',
      siteId: 'site-31ff-lab',
      siteName: 'Spatial Computing Notes',
      version: 2,
      status: 'SUCCEEDED',
      s3Prefix: 'sites/site-31ff-lab/deployments/dep-1104-v2/',
      liveUrl: 'https://sites.clouddeploy.internal/s/site-31ff-lab/',
      fileCount: 19,
      totalBytes: 23100000,
      startedAt: '2026-10-11T08:18:00Z',
      completedAt: '2026-10-11T08:20:00Z',
    },
    {
      id: 'dep-0988-v1',
      siteId: 'site-31ff-lab',
      siteName: 'Spatial Computing Notes',
      version: 1,
      status: 'FAILED',
      s3Prefix: 'sites/site-31ff-lab/deployments/dep-0988-v1/',
      fileCount: 0,
      totalBytes: 0,
      errorCode: 'ZIP_MISSING_INDEX_HTML',
      errorSummary: 'Archive does not contain a root index.html file.',
      startedAt: '2026-10-05T11:10:00Z',
      completedAt: '2026-10-05T11:11:00Z',
    }
  ]
};

export const MOCK_EVENTS: Record<string, DeploymentEvent[]> = {
  'dep-9912-v3': [
    { id: 'ev-1', deploymentId: 'dep-9912-v3', eventType: 'ARCHIVE_RECEIVED', timestamp: '2026-10-10T09:12:05Z', message: 'ZIP archive received (13.8 MB). Enqueued for validation.' },
    { id: 'ev-2', deploymentId: 'dep-9912-v3', eventType: 'VALIDATION_PASSED', timestamp: '2026-10-10T09:12:45Z', message: 'Verified 42 files. Path traversal and decompression bomb checks passed.' },
    { id: 'ev-3', deploymentId: 'dep-9912-v3', eventType: 'S3_PUBLISHED', timestamp: '2026-10-10T09:14:10Z', message: 'Published 42 assets to s3://clouddeploy-sites-prod/sites/site-a7b2-doc/deployments/dep-9912-v3/.' },
    { id: 'ev-4', deploymentId: 'dep-9912-v3', eventType: 'CLOUDFRONT_INVALIDATED', timestamp: '2026-10-10T09:14:50Z', message: 'Invalidation submitted for /s/site-a7b2-doc/*.' },
    { id: 'ev-5', deploymentId: 'dep-9912-v3', eventType: 'SUCCEEDED', timestamp: '2026-10-10T09:15:00Z', message: 'Deployment live at https://sites.clouddeploy.internal/s/site-a7b2-doc/' },
  ]
};

export const MOCK_USAGE: UsageQuota = {
  ownerId: 'usr-8921-prod',
  planTier: 'PRO',
  storageBytes: 45800000, // 45.8 MB
  storageQuotaBytes: 5368709120, // 5 GB
  projectCount: 3,
  maxSites: 25,
  deploymentCount: 6,
  storagePercent: 0.9,
  projectPercent: 12.0,
};

export const MOCK_ADMIN_OVERVIEW: AdminOverview = {
  totalUsers: 142,
  totalSites: 388,
  totalDeployments: 1204,
  activeSites: 365,
  failedDeployments: 18,
  totalStorageBytes: 14820000000,
  storageFormatted: '14.82 GB',
  recentDeployments: [
    {
      id: 'dep-9912-v3',
      siteId: 'site-a7b2-doc',
      siteName: 'Atelier Portfolio',
      version: 3,
      status: 'SUCCEEDED',
      s3Prefix: 'sites/site-a7b2-doc/deployments/dep-9912-v3/',
      liveUrl: 'https://sites.clouddeploy.internal/s/site-a7b2-doc/',
      fileCount: 42,
      totalBytes: 14500000,
      startedAt: '2026-10-10T09:12:00Z',
      completedAt: '2026-10-10T09:15:00Z',
    },
    {
      id: 'dep-0988-v1',
      siteId: 'site-31ff-lab',
      siteName: 'Spatial Computing Notes',
      version: 1,
      status: 'FAILED',
      s3Prefix: 'sites/site-31ff-lab/deployments/dep-0988-v1/',
      fileCount: 0,
      totalBytes: 0,
      errorCode: 'ZIP_MISSING_INDEX_HTML',
      errorSummary: 'Archive does not contain a root index.html file.',
      startedAt: '2026-10-05T11:10:00Z',
      completedAt: '2026-10-05T11:11:00Z',
    }
  ],
  failedList: [
    {
      id: 'dep-0988-v1',
      siteId: 'site-31ff-lab',
      siteName: 'Spatial Computing Notes',
      version: 1,
      status: 'FAILED',
      s3Prefix: 'sites/site-31ff-lab/deployments/dep-0988-v1/',
      fileCount: 0,
      totalBytes: 0,
      errorCode: 'ZIP_MISSING_INDEX_HTML',
      errorSummary: 'Archive does not contain a root index.html file.',
      startedAt: '2026-10-05T11:10:00Z',
      completedAt: '2026-10-05T11:11:00Z',
    }
  ]
};
