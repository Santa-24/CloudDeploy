-- CloudDeploy Initial Schema Migration (Flyway V1)
-- Multi-Tenant Static Website Deployment Platform

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    cognito_sub VARCHAR(128) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(32) NOT NULL DEFAULT 'USER',
    account_status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    storage_quota_bytes BIGINT NOT NULL DEFAULT 104857600, -- 100 MB default
    max_sites INT NOT NULL DEFAULT 10,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sites (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    owner_id VARCHAR(36) NOT NULL,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    description TEXT,
    current_deployment_id VARCHAR(36),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    CONSTRAINT fk_sites_owner FOREIGN KEY (owner_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT uk_sites_slug UNIQUE (slug)
);

CREATE TABLE IF NOT EXISTS deployments (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    site_id VARCHAR(36) NOT NULL,
    version INT NOT NULL,
    status VARCHAR(32) NOT NULL,
    s3_prefix VARCHAR(512) NOT NULL,
    live_url VARCHAR(512),
    file_count INT NOT NULL DEFAULT 0,
    total_bytes BIGINT NOT NULL DEFAULT 0,
    error_code VARCHAR(64),
    error_summary VARCHAR(1024),
    started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    CONSTRAINT fk_deployments_site FOREIGN KEY (site_id) REFERENCES sites (id) ON DELETE CASCADE,
    CONSTRAINT uk_site_version UNIQUE (site_id, version)
);

CREATE TABLE IF NOT EXISTS deployment_events (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    deployment_id VARCHAR(36) NOT NULL,
    event_type VARCHAR(64) NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    message VARCHAR(1024) NOT NULL,
    CONSTRAINT fk_events_deployment FOREIGN KEY (deployment_id) REFERENCES deployments (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS usage_records (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    owner_id VARCHAR(36) NOT NULL,
    storage_bytes BIGINT NOT NULL DEFAULT 0,
    deployment_count INT NOT NULL DEFAULT 0,
    project_count INT NOT NULL DEFAULT 0,
    measured_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_usage_owner FOREIGN KEY (owner_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS audit_events (
    id VARCHAR(64) NOT NULL PRIMARY KEY,
    actor VARCHAR(255) NOT NULL,
    action VARCHAR(64) NOT NULL,
    resource VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    metadata TEXT
);

-- Indexes for high-performance multi-tenant lookups
CREATE INDEX idx_sites_owner ON sites (owner_id);
CREATE INDEX idx_deployments_site_status ON deployments (site_id, status);
CREATE INDEX idx_deployments_site_version ON deployments (site_id, version DESC);
CREATE INDEX idx_events_deployment_time ON deployment_events (deployment_id, timestamp ASC);
CREATE INDEX idx_usage_owner_time ON usage_records (owner_id, measured_at DESC);
CREATE INDEX idx_audit_time ON audit_events (timestamp DESC);
