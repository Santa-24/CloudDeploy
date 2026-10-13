# CloudDeploy REST API Contract & Specification

## 1. Protocol & Conventions
- **Base URL**: `/api` (Production: `https://api.clouddeploy.io/api` or configured ALB domain)
- **Content-Type**: `application/json` (except multi-part upload endpoint: `multipart/form-data`)
- **Character Encoding**: UTF-8
- **Date/Time Standard**: ISO-8601 Extended Format with UTC timezone (`YYYY-MM-DDTHH:mm:ssZ`)
- **Authentication**: Bearer Token in `Authorization` header (`Authorization: Bearer <jwt_access_token>`)
- **CORS**: Allowed origins configured via `APP_CORS_ALLOWED_ORIGINS` (defaults to frontend domain)

---

## 2. Standard Response Schemas

### 2.1 Success Envelope (`ApiResponse<T>`)
Every successful API invocation yields a consistent wrapper:
```json
{
  "success": true,
  "data": { ... },
  "error": null,
  "timestamp": "2026-10-11T12:00:00Z"
}
```

### 2.2 Error Envelope (`ErrorResponse`)
Error responses comply with RFC 7807 Problem Details semantics:
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "ARCHIVE_VALIDATION_ERROR",
    "message": "Archive must contain a root index.html file",
    "details": ["Missing entrypoint index.html in archive root"],
    "timestamp": "2026-10-11T12:00:00Z",
    "path": "/api/sites/site_abc123/deployments/upload"
  },
  "timestamp": "2026-10-11T12:00:00Z"
}
```

---

## 3. Error Codes Dictionary

| Error Code | HTTP Status | Description |
| :--- | :--- | :--- |
| `BAD_REQUEST` | 400 Bad Request | Malformed payload, invalid syntax, or missing required fields |
| `UNAUTHORIZED` | 401 Unauthorized | Missing, expired, or malformed JWT token |
| `FORBIDDEN` | 403 Forbidden | Access denied; caller does not own the target project or lacks role |
| `NOT_FOUND` | 404 Not Found | Requested site, deployment, or user entity does not exist |
| `QUOTA_EXCEEDED` | 429 Too Many Requests | User has exceeded max project count, storage limit, or rate quota |
| `ARCHIVE_VALIDATION_ERROR` | 400 Bad Request | ZIP traversal, zip bomb, forbidden extension, or missing index.html |
| `DEPLOYMENT_FAILED` | 500 Internal Error | AWS S3 sync error or CloudFront invalidation pipeline failure |
| `INTERNAL_ERROR` | 500 Internal Error | Unhandled server exception |

---

## 4. Authentication Endpoints (`/api/auth`)

### 4.1 Register New User
- **Method**: `POST`
- **Path**: `/api/auth/register`
- **Auth**: None (Public)
- **Request Body**:
```json
{
  "email": "developer@example.com",
  "password": "SecurePassword123!",
  "fullName": "Jane Developer"
}
```
- **Response** (`201 Created`):
```json
{
  "success": true,
  "data": {
    "id": "usr_94b8e3a1",
    "email": "developer@example.com",
    "role": "USER",
    "accountStatus": "ACTIVE",
    "createdAt": "2026-10-11T10:15:30Z"
  },
  "error": null,
  "timestamp": "2026-10-11T10:15:30Z"
}
```

### 4.2 Login / Token Exchange
- **Method**: `POST`
- **Path**: `/api/auth/login`
- **Auth**: None (Public)
- **Request Body**:
```json
{
  "email": "developer@example.com",
  "password": "SecurePassword123!"
}
```
- **Response** (`200 OK`):
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJraWQiOiJ...",
    "idToken": "eyJraWQiOiJ...",
    "refreshToken": "eyJjdHki...",
    "tokenType": "Bearer",
    "expiresIn": 3600,
    "user": {
      "id": "usr_94b8e3a1",
      "email": "developer@example.com",
      "role": "USER"
    }
  },
  "error": null,
  "timestamp": "2026-10-11T10:16:00Z"
}
```

### 4.3 Current Identity (`/me`)
- **Method**: `GET`
- **Path**: `/api/auth/me`
- **Auth**: Bearer Token
- **Response** (`200 OK`): Current authenticated `User` profile.

---

## 5. Site / Project Management Endpoints (`/api/sites`)

### 5.1 List User Projects
- **Method**: `GET`
- **Path**: `/api/sites`
- **Auth**: Bearer Token
- **Query Params**: `page` (default: 0), `size` (default: 20)
- **Response** (`200 OK`):
```json
{
  "success": true,
  "data": [
    {
      "id": "site_9a2b7f1e",
      "name": "Portfolio 2026",
      "slug": "portfolio-2026",
      "description": "Personal design portfolio site",
      "currentDeploymentId": "dep_1f83c09b",
      "liveUrl": "https://sites.clouddeploy.io/s/site_9a2b7f1e/",
      "storageBytes": 1458920,
      "deploymentCount": 4,
      "createdAt": "2026-10-09T08:00:00Z",
      "updatedAt": "2026-10-11T09:30:00Z"
    }
  ],
  "error": null,
  "timestamp": "2026-10-11T12:00:00Z"
}
```

### 5.2 Create New Project
- **Method**: `POST`
- **Path**: `/api/sites`
- **Auth**: Bearer Token
- **Request Body**:
```json
{
  "name": "Docs Portal",
  "slug": "docs-portal",
  "description": "Engineering guidelines and architecture references"
}
```
- **Response** (`201 Created`): Returns created `Site` resource.

### 5.3 Get Project Details
- **Method**: `GET`
- **Path**: `/api/sites/{siteId}`
- **Auth**: Bearer Token
- **Response** (`200 OK`): Detailed `Site` resource with deployment metrics.

### 5.4 Update Project Settings
- **Method**: `PUT`
- **Path**: `/api/sites/{siteId}`
- **Auth**: Bearer Token
- **Request Body**:
```json
{
  "name": "Docs Portal V2",
  "description": "Updated developer portal"
}
```
- **Response** (`200 OK`): Updated `Site` resource.

### 5.5 Delete Project
- **Method**: `DELETE`
- **Path**: `/api/sites/{siteId}`
- **Auth**: Bearer Token
- **Response** (`204 No Content`): Site and associated S3 metadata marked deleted.

---

## 6. Upload & Deployment Engine Endpoints (`/api/sites/{siteId}/deployments`)

### 6.1 Upload ZIP and Trigger Deployment
- **Method**: `POST`
- **Path**: `/api/sites/{siteId}/deployments/upload`
- **Content-Type**: `multipart/form-data`
- **Auth**: Bearer Token
- **Form Parameters**:
  - `file`: Binary ZIP archive (Required, max 50MB by default)
- **Response** (`202 Accepted`):
```json
{
  "success": true,
  "data": {
    "deploymentId": "dep_4b9a12e8",
    "siteId": "site_9a2b7f1e",
    "version": 5,
    "status": "QUEUED",
    "s3DeploymentPrefix": "sites/site_9a2b7f1e/deployments/dep_4b9a12e8/",
    "liveUrl": "https://sites.clouddeploy.io/s/site_9a2b7f1e/",
    "createdAt": "2026-10-11T12:05:00Z"
  },
  "error": null,
  "timestamp": "2026-10-11T12:05:00Z"
}
```

### 6.2 List Deployment History for Site
- **Method**: `GET`
- **Path**: `/api/sites/{siteId}/deployments`
- **Auth**: Bearer Token
- **Response** (`200 OK`): Array of historical `Deployment` objects ordered by `version DESC`.

### 6.3 Get Single Deployment Status & Telemetry
- **Method**: `GET`
- **Path**: `/api/deployments/{deploymentId}`
- **Auth**: Bearer Token
- **Response** (`200 OK`):
```json
{
  "success": true,
  "data": {
    "id": "dep_4b9a12e8",
    "siteId": "site_9a2b7f1e",
    "version": 5,
    "status": "SUCCEEDED",
    "fileCount": 18,
    "totalSizeBytes": 2048590,
    "s3DeploymentPrefix": "sites/site_9a2b7f1e/deployments/dep_4b9a12e8/",
    "liveUrl": "https://sites.clouddeploy.io/s/site_9a2b7f1e/",
    "startedAt": "2026-10-11T12:05:00Z",
    "completedAt": "2026-10-11T12:05:06Z",
    "errorCode": null,
    "errorMessage": null
  },
  "error": null,
  "timestamp": "2026-10-11T12:05:10Z"
}
```

### 6.4 Get Deployment Event Stream / Audit Logs
- **Method**: `GET`
- **Path**: `/api/deployments/{deploymentId}/events`
- **Auth**: Bearer Token
- **Response** (`200 OK`):
```json
{
  "success": true,
  "data": [
    {
      "id": "evt_001",
      "deploymentId": "dep_4b9a12e8",
      "eventType": "QUEUED",
      "message": "Deployment package received and queued for processing",
      "timestamp": "2026-10-11T12:05:01Z"
    },
    {
      "id": "evt_002",
      "deploymentId": "dep_4b9a12e8",
      "eventType": "VALIDATING",
      "message": "Archive validated: 18 files, 2.05 MB, index.html confirmed",
      "timestamp": "2026-10-11T12:05:02Z"
    },
    {
      "id": "evt_003",
      "deploymentId": "dep_4b9a12e8",
      "eventType": "PUBLISHING",
      "message": "Published 18 static assets to Amazon S3 origin",
      "timestamp": "2026-10-11T12:05:04Z"
    },
    {
      "id": "evt_004",
      "deploymentId": "dep_4b9a12e8",
      "eventType": "SUCCEEDED",
      "message": "Deployment live and edge cache invalidated",
      "timestamp": "2026-10-11T12:05:06Z"
    }
  ],
  "error": null,
  "timestamp": "2026-10-11T12:05:10Z"
}
```

### 6.5 Version Rollback
- **Method**: `POST`
- **Path**: `/api/sites/{siteId}/rollback/{deploymentId}`
- **Auth**: Bearer Token
- **Description**: Atomically repoints the live website reference to a previous successfully published deployment and invalidates the edge cache.
- **Response** (`200 OK`):
```json
{
  "success": true,
  "data": {
    "siteId": "site_9a2b7f1e",
    "activeDeploymentId": "dep_1f83c09b",
    "restoredVersion": 4,
    "liveUrl": "https://sites.clouddeploy.io/s/site_9a2b7f1e/",
    "rolledBackAt": "2026-10-11T12:10:00Z"
  },
  "error": null,
  "timestamp": "2026-10-11T12:10:00Z"
}
```

---

## 7. Quotas & Usage Accounting (`/api/usage`)

### 7.1 Get User Quota & Utilization Metrics
- **Method**: `GET`
- **Path**: `/api/usage`
- **Auth**: Bearer Token
- **Response** (`200 OK`):
```json
{
  "success": true,
  "data": {
    "userId": "usr_94b8e3a1",
    "currentProjects": 3,
    "maxProjects": 10,
    "storageUsedBytes": 14589200,
    "maxStorageBytes": 1073741824,
    "deploymentsThisMonth": 24,
    "maxDeploymentsPerMonth": 500,
    "storagePercentage": 1.36,
    "projectPercentage": 30.0
  },
  "error": null,
  "timestamp": "2026-10-11T12:12:00Z"
}
```

---

## 8. Administrative APIs (`/api/admin`)
*Requires caller to hold the `ADMIN` role in their verified JWT.*

### 8.1 Administrative Platform Overview
- **Method**: `GET`
- **Path**: `/api/admin/overview`
- **Response** (`200 OK`): Aggregated statistics on total users, total sites, total deployments, active storage bytes, and 24h failure rates.

### 8.2 Platform Users Directory
- **Method**: `GET`
- **Path**: `/api/admin/users`
- **Response** (`200 OK`): Paginated directory of platform tenants with project counts and account status.

### 8.3 Global Deployment Activity & Failure Triage
- **Method**: `GET`
- **Path**: `/api/admin/deployments`
- **Query Params**: `status` (optional filter: `FAILED`, `SUCCEEDED`)
- **Response** (`200 OK`): Real-time deployment feed with root cause diagnostic summaries.

---

## 9. Observability & Health Endpoints

### 9.1 Liveness Probe
- **Method**: `GET`
- **Path**: `/actuator/health/liveness`
- **Response** (`200 OK`): `{"status": "UP"}`

### 9.2 Readiness Probe
- **Method**: `GET`
- **Path**: `/actuator/health/readiness`
- **Response** (`200 OK`): Verifies database connectivity, Flyway migration parity, and local/S3 storage accessibility.
