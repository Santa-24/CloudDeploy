-- CloudDeploy Migration V2: Add Plan Tier and Free Tier Quotas
ALTER TABLE users ADD COLUMN IF NOT EXISTS plan_tier VARCHAR(32) NOT NULL DEFAULT 'FREE';
UPDATE users SET max_sites = 3 WHERE role != 'ADMIN' AND (max_sites = 10 OR max_sites IS NULL);
UPDATE users SET storage_quota_bytes = 52428800 WHERE role != 'ADMIN' AND (storage_quota_bytes = 104857600 OR storage_quota_bytes IS NULL);
