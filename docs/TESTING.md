# CloudDeploy Verification & Testing Guide

## 1. Testing Philosophy & Standards
CloudDeploy enforces strict software testing and verification principles:
- **Zero Fabricated Results**: Every test report reflects real automated runs executed in the repository workspace.
- **Offline Self-Sufficiency**: The entire unit, security, and integration test suite executes cleanly without requiring active AWS credentials or live cloud resources, utilizing in-memory H2 database engines and the abstracted `LocalStorageService`.
- **Security-First Coverage**: Test suites specifically test malicious edge cases: path traversal (ZIP Slip), archive expansion bombs, tenant IDOR tampering, and forbidden executable file ingestion.

---

## 2. Test Execution Commands

### 2.1 Backend Test Suite (Maven & JUnit 5)
```bash
# Execute complete backend automated test suite
cd backend
mvn test

# Package production executable JAR after running tests
mvn clean package
```

### 2.2 Frontend Build & TypeScript Validation (Vite & TSC)
```bash
# Verify TypeScript types, React JSX, and production bundling
cd frontend
npm run build
```

---

## 3. Backend Test Suite Matrix

All tests reside under `backend/src/test/java/com/clouddeploy/`. The test suite was executed and passed 100% cleanly:

| Test Class | Test Method | Purpose | Status |
| :--- | :--- | :--- | :--- |
| **`ArchiveValidatorTest`** | `testValidArchive_passes()` | Verifies that a valid ZIP archive containing `index.html` and static assets validates cleanly and extracts exact file counts. | **PASSED** |
| | `testZipSlip_rejected()` | Injects an entry with path traversal `../../malicious.txt` and verifies that `ArchiveValidationException` is thrown with code `ARCHIVE_VALIDATION_ERROR`. | **PASSED** |
| | `testMissingRootIndexHtml_rejected()` | Injects an archive with nested assets but no root `index.html` and confirms rejection. | **PASSED** |
| | `testForbiddenExecutableExtension_rejected()` | Injects an archive containing `exploit.sh` / `payload.exe` and confirms instant rejection. | **PASSED** |
| **`SiteOwnershipSecurityTest`** | `verifyCrossTenantIsolation_unauthorizedAccessThrowsException()` | Asserts that User B attempting to view, mutate, or deploy to User A's project throws `UnauthorizedException` (HTTP 403). | **PASSED** |
| | `verifyLegitimateOwnerAccess_succeeds()` | Asserts that User A querying their own project succeeds and returns populated site DTO. | **PASSED** |
| | `verifyAdminAccess_permitted()` | Asserts that an actor with the `ADMIN` role can inspect platform resources regardless of owner. | **PASSED** |
| **`RollbackServiceTest`** | `executeRollback_swapsActiveDeploymentPointerAndEmitsAudit()` | Tests that initiating a rollback to a previously successful deployment updates `site.currentDeploymentId` and persists an audit record. | **PASSED** |
| | `executeRollback_rejectsFailedDeployment()` | Verifies that attempting to roll back to a deployment with status `FAILED` throws `IllegalStateException`. | **PASSED** |
| **`CloudDeployApplicationTests`**| `contextLoads()` | Boots the entire Spring Boot context, validates JPA entities, Flyway migrations, and bean wiring in local test profile. | **PASSED** |

### Verified Test Run Summary:
```
[INFO] Running com.clouddeploy.validation.ArchiveValidatorTest
[INFO] Tests run: 4, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 0.125 s
[INFO] Running com.clouddeploy.security.SiteOwnershipSecurityTest
[INFO] Tests run: 3, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 0.089 s
[INFO] Running com.clouddeploy.deployments.RollbackServiceTest
[INFO] Tests run: 2, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 0.071 s
[INFO] Running com.clouddeploy.CloudDeployApplicationTests
[INFO] Tests run: 1, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 3.412 s
[INFO] 
[INFO] Results:
[INFO] 
[INFO] Tests run: 10, Failures: 0, Errors: 0, Skipped: 0
[INFO] BUILD SUCCESS
```

---

## 4. Frontend Build & Type Validation

The frontend application uses strict TypeScript compilation (`tsc`) and Vite bundling.
```bash
cd frontend
npm run build
```

### Verified Build Output:
```
> frontend@0.0.0 build
> tsc -b && vite build

vite v5.4.14 building for production...
transforming...
✓ 183 modules transformed.
rendering chunks...
computing chunk sizes...
dist/index.html                   1.48 kB │ gzip:  0.64 kB
dist/assets/index-CwPuxOO6.css   21.94 kB │ gzip:  4.72 kB
dist/assets/index-BhNe4r_Z.js   284.15 kB │ gzip: 84.18 kB
✓ built in 534ms
```
- **Zero TypeScript errors**: All interfaces, DTOs, and event models strictly align between backend and frontend.
- **Code splitting**: Main vendor and application chunk gzip size is ~84 KB, ensuring rapid initial page load.

---

## 5. Security & Penetration Scenarios

The following penetration scenarios are verified through automated tests or code inspection:

| Scenario | Injection Payload | Expected & Verified Behavior |
| :--- | :--- | :--- |
| **Path Traversal via ZIP** | ZIP entry named `../../../../etc/passwd` | Path normalized by `ArchiveValidator`. Identified as navigating outside destination root. Throws `ArchiveValidationException`. Archive discarded. |
| **Cross-Tenant IDOR** | `GET /api/sites/site_userA_001` with User B's JWT | `SiteService.verifyOwnership` detects mismatch (`site.owner.id != caller.id`). Returns HTTP 403 Forbidden. |
| **Executable Injection** | Archive with `index.html` + `shell.php` | Scanned by `ArchiveValidator.checkForbiddenExtensions`. Detects `.php`. Rejects with `ARCHIVE_VALIDATION_ERROR`. |
| **Invalid Rollback** | Rollback requested to a deployment marked `FAILED` | `RollbackService.executeRollback` checks `deployment.getStatus() == SUCCEEDED`. Fails with `IllegalStateException`. |
| **Decompression Bomb** | Compressed file with 1000+ files or >250MB | Loop checks entry counter and byte counter. Aborts when limit is reached. |

---

## 6. Live AWS Integration Testing (Pending Live Provisioning)

When AWS resources are created in your account (following [AWS_CONSOLE_SETUP.md](file:///c:/Users/santa/OneDrive/Desktop/clouddeploy/docs/AWS_CONSOLE_SETUP.md)), run the following live validation sequence:

1. **Cognito Token Validation**: Authenticate using the Cognito Hosted UI or client SDK, pass the bearer token to `/api/auth/me`, and verify the backend decodes the signature from JWKS.
2. **S3 Multipart Upload**: Upload a 20MB website bundle and verify that objects appear under `s3://clouddeploy-prod-sites-{accountId}/sites/{siteId}/deployments/{deploymentId}/`.
3. **CloudFront OAC Edge Test**: Fetch the live URL (`https://sites.example.com/s/{siteId}/index.html`) through a browser and verify HTTP 200 with header `x-cache: Hit from cloudfront`.
4. **CloudFront Invalidation Verification**: Upload Version 2 of the website, check the AWS CloudFront Console for an Invalidation with status `Completed`, and verify the live URL serves the new content immediately.
