-- CloudDeploy Migration V3: Add Multi-Region Deployment Support
ALTER TABLE sites ADD COLUMN IF NOT EXISTS region VARCHAR(32) NOT NULL DEFAULT 'ap-south-1';
ALTER TABLE deployments ADD COLUMN IF NOT EXISTS region VARCHAR(32) NOT NULL DEFAULT 'ap-south-1';

