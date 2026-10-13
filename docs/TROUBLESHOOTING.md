# CloudDeploy Operations & Troubleshooting Guide

## 1. Quick Diagnostic Checklist
When diagnosing an unexpected state in CloudDeploy:
1. **Check Backend Actuator Health**:
   `curl -i http://localhost:8080/actuator/health`
2. **Review Structured Application Logs**:
   - Local: Check terminal stdout or logs directory.
   - AWS: Amazon CloudWatch Log Group `/aws/clouddeploy/prod/application`.
3. **Inspect Frontend Console**:
   Open browser Developer Tools (F12) -> Console and Network tabs to inspect API responses and CORS headers.
4. **Verify Environment Configurations**:
   Ensure `frontend/.env.local` and `backend/src/main/resources/application.yml` contain correct settings.

---

## 2. Frontend Diagnostic Scenarios

### 2.1 CORS Error: `No 'Access-Control-Allow-Origin' header is present`
- **Symptom**: Frontend browser queries to `/api/*` fail with cross-origin warnings.
- **Root Cause**: The backend `SecurityConfig` does not list the frontend origin in its CORS configuration.
- **Resolution**:
  - In `backend/src/main/resources/application.yml`, verify `app.cors.allowed-origins`:
    ```yaml
    app:
      cors:
        allowed-origins: "http://localhost:5173,https://app.clouddeploy.io"
    ```
  - For local development, ensure your Vite dev server URL matches the origin allowed in `SecurityConfig.java`.

### 2.2 Blank Screen or "Demo Mode" Not Responding
- **Symptom**: Dashboard shows empty or requests fail without error messaging.
- **Root Cause**: `VITE_DEMO_MODE` is unset or improperly toggled.
- **Resolution**:
  - Check `frontend/.env.local`:
    - `VITE_DEMO_MODE=true`: Enables offline simulated data mode (ideal for UI testing without running backend).
    - `VITE_DEMO_MODE=false`: Directs calls to `VITE_API_BASE_URL` (requires backend running on port 8080).

---

## 3. Backend & Database Scenarios

### 3.1 Port 8080 Already in Use
- **Symptom**: `Web server failed to start. Port 8080 was already in use.`
- **Resolution (Windows)**:
  ```powershell
  # Find PID occupying port 8080
  netstat -ano | findstr :8080
  # Terminate conflicting process
  taskkill /PID <PID> /F
  ```
  Or change port in `backend/src/main/resources/application.yml`: `server.port: 8081`.

### 3.2 Flyway Migration Checksum Mismatch
- **Symptom**: `FlywayException: Validate failed: Migrations have failed validation`.
- **Root Cause**: `V1__init_schema.sql` was modified after already executing against the database.
- **Resolution**:
  - In local development with in-memory H2, simply restart the Spring Boot process (H2 memory drops and re-applies migrations cleanly).
  - In persistent MySQL: Execute `mvn flyway:repair` or reset the development schema if unreleased.

### 3.3 Amazon RDS MySQL Connection Timeout
- **Symptom**: Backend startup blocks for 30s and throws `CommunicationsException: Communications link failure`.
- **Root Cause**: Security Group misconfiguration or subnet routing issues.
- **Resolution**:
  - Verify RDS is placed in Private Subnets that have routing paths to the Backend EC2 instances.
  - Verify the **RDS Security Group** has an inbound rule permitting TCP Port 3306 originating from the **EC2 Backend Security Group**.
  - Ensure the RDS instance state is `Available` in the AWS Console.

---

## 4. Archive Upload & Validation Errors

### 4.1 `ARCHIVE_VALIDATION_ERROR: Archive must contain a root index.html file`
- **Symptom**: ZIP upload is rejected with a 400 error.
- **Root Cause**: When creating the ZIP, the user zipped the parent folder rather than the folder contents. As a result, files appear as `my-site/index.html` instead of `index.html`.
- **Resolution**:
  - Ensure files are zipped from within the build folder:
    ```bash
    # Correct method:
    cd dist && zip -r ../website.zip ./*
    ```
  - The root of the ZIP archive must contain `index.html`.

### 4.2 `ARCHIVE_VALIDATION_ERROR: Forbidden executable file detected`
- **Symptom**: Upload rejected due to forbidden file extensions.
- **Root Cause**: Build bundle contains `.sh`, `.php`, `.exe`, or hidden `.git` files.
- **Resolution**: Clean build outputs to ensure only browser-renderable static assets (`.html`, `.css`, `.js`, images, `.svg`, fonts) are present before archiving.

### 4.3 `QUOTA_EXCEEDED: Storage quota exceeded`
- **Symptom**: User receives HTTP 429 when uploading.
- **Root Cause**: User has reached their tier's storage quota (default: 1GB).
- **Resolution**: Delete old unused projects or have an administrator increase the tenant's quota via `/api/admin/users`.

---

## 5. AWS S3 & CloudFront Edge Delivery Issues

### 5.1 CloudFront Returns `403 Forbidden` for Published Sites
- **Symptom**: Navigating to `https://sites.example.com/s/{siteId}/` results in an XML or HTML 403 Forbidden.
- **Root Cause**: S3 bucket policy is missing CloudFront Origin Access Control (OAC) permission.
- **Resolution**:
  - Verify that the S3 bucket policy in `clouddeploy-prod-sites-{accountId}` includes:
    ```json
    {
      "Effect": "Allow",
      "Principal": { "Service": "cloudfront.amazonaws.com" },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::clouddeploy-prod-sites-{accountId}/*",
      "Condition": {
        "StringEquals": {
          "AWS:SourceArn": "arn:aws:cloudfront::{accountId}:distribution/{distributionId}"
        }
      }
    }
    ```
  - Verify that the CloudFront distribution origin is configured to use **Origin Access Control (OAC)** and not legacy Origin Access Identity (OAI).

### 5.2 Single Page Application (SPA) Sub-Routes Return 404 on Refresh
- **Symptom**: Visiting `https://sites.example.com/s/{siteId}/` works, but refreshing `https://sites.example.com/s/{siteId}/about` returns a 404 error from S3.
- **Root Cause**: S3 contains physical files, not dynamic SPA routes.
- **Resolution**:
  - In CloudFront Distribution Settings -> **Error Pages**:
    - HTTP Error Code: `404`
    - Customize Error Response: `Yes`
    - Response Page Path: `/index.html`
    - HTTP Response Code: `200: OK`

### 5.3 Changes Not Visible After New Deployment
- **Symptom**: Upload succeeds, but the browser continues to serve the old version.
- **Root Cause**: Edge CDN cache has not invalidated, or the browser has cached `index.html`.
- **Resolution**:
  - Verify that `index.html` in S3 has metadata `Cache-Control: public, max-age=0, must-revalidate`.
  - Check AWS CloudFront Console -> **Invalidations** to confirm the invalidation request for `/s/{siteId}/*` was created and has reached status `Completed`.
  - In the browser, perform a hard refresh (`Ctrl + Shift + R`).
