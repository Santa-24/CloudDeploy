# CloudDeploy Security Architecture & Hardening Guide

## 1. Security Philosophy & Threat Model
CloudDeploy processes untrusted archives uploaded by internet users. As a multi-tenant platform, the system enforces **Zero Trust** internally:
1. **Zero Execution of Customer Code**: Customer files are strictly static assets. Backend compute runs only the trusted Spring Boot application in a hardened Java virtual machine. Customer files are never executed via shells, runtimes (Node, Python, PHP), or template engines.
2. **Untrusted Website Origin Separation**: Customer static sites are delivered from a dedicated domain or path structure served directly via Amazon CloudFront from S3. Customer HTML is **never rendered or injected** inside the CloudDeploy dashboard, eliminating cross-site scripting (XSS) attacks against platform administration.
3. **Cryptographic Identity Verification**: All operations verify user identity via signed JWT tokens issued by Amazon Cognito. No client-supplied tenant ID is trusted.
4. **Defense-in-Depth**: Layers of isolation span edge WAF, VPC network boundaries, IAM least-privilege policies, S3 Origin Access Control, and application validation filters.

---

## 2. Threat Vector Mitigations Matrix

| Threat Vector | Attack Mechanism | CloudDeploy Defense & Enforcement |
| :--- | :--- | :--- |
| **ZIP Slip** | `../../etc/passwd` entry paths designed to write outside target extraction directory | `ArchiveValidator` normalizes every path via `Path.normalize()`. Entries with `..`, leading `/`, or resolving outside target base directory are immediately rejected. |
| **Decompression Bomb** | 42KB archive that decompresses into 4.5 Petabytes of null bytes | Aggregated uncompressed byte accumulator monitored on stream. Capped at 250 MB (`app.validation.max-extracted-bytes`). Processing halts if ratio exceeds 100:1. |
| **Server-Side Execution** | Uploading `.php`, `.jsp`, `.py`, `.sh`, `.exe` to run on compute | Denylist filter rejects any archive containing executable extensions. Backend treats all files as static byte streams pushed directly to S3. |
| **Tenant IDOR** | Manipulating URL parameter `/api/sites/{siteId}` to view/mutate competitor projects | Backend database queries always include `WHERE site_id = :siteId AND owner_id = :callerId`. Unmatched queries return HTTP 403. |
| **S3 Data Leak** | Direct public access to S3 storage buckets | 100% S3 Block Public Access enabled on all buckets. Read access is granted exclusively to CloudFront service principal via Origin Access Control (OAC). |
| **Privilege Escalation** | Regular user asserting `role: ADMIN` in request payload | Roles are managed exclusively via Cognito Groups and database constraints. User registration endpoints force `role: USER`. Administrative APIs enforce `@PreAuthorize("hasRole('ADMIN')")`. |
| **Secret Exfiltration** | Database passwords or AWS keys leaked into Git or logs | Zero hardcoded credentials. RDS password stored in AWS Secrets Manager; compute authenticates via EC2 IAM Role. Local credentials protected by `.gitignore`. |

---

## 3. Storage Security & S3 Origin Access Control (OAC)

### 3.1 S3 Block Public Access
Both the Upload Staging bucket and the Published Sites bucket have the four S3 Block Public Access settings enabled:
- `BlockPublicAcls: true`
- `IgnorePublicAcls: true`
- `BlockPublicPolicy: true`
- `RestrictPublicBuckets: true`

### 3.2 CloudFront Origin Access Control Policy
The published sites bucket grants read permission solely to CloudFront through a signed policy:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowCloudFrontServicePrincipalReadOnly",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::clouddeploy-prod-sites/*",
      "Condition": {
        "StringEquals": {
          "AWS:SourceArn": "arn:aws:cloudfront::{accountId}:distribution/{distributionId}"
        }
      }
    }
  ]
}
```
No anonymous or internet traffic can bypass CloudFront to reach S3 directly.

---

## 4. Network Isolation & Boundary Controls

```
[ INTERNET ]
     │
     ▼
[ AWS WAF Web ACL ] (Rate Limiting, Common Rule Set, SQLi/XSS inspection)
     │
     ▼
[ CloudFront & Application Load Balancer ] (Public Subnet, TLS 1.3 only)
     │
     │ (Port 8080 restricted to ALB Security Group)
     ▼
[ EC2 Auto Scaling Instances ] (Private Subnet, No Public IPs, Outbound via NAT)
     │
     │ (Port 3306 restricted to EC2 Security Group)
     ▼
[ Amazon RDS for MySQL ] (Isolated DB Subnet, No Internet Routing)
```

- **Security Groups**:
  - `ALB Security Group`: Inbound 80/443 from `0.0.0.0/0`; outbound 8080 to App SG.
  - `App Security Group`: Inbound 8080 strictly from ALB SG; outbound 3306 to DB SG and 443 to AWS endpoints.
  - `DB Security Group`: Inbound 3306 strictly from App SG; zero outbound rules.

---

## 5. IAM Least Privilege Policies

The backend EC2 instances assume an IAM Role (`CloudDeployBackendInstanceRole`) scoped to the minimum required actions:
- `s3:PutObject`, `s3:GetObject`, `s3:DeleteObject` restricted to `arn:aws:s3:::clouddeploy-prod-uploads/*` and `arn:aws:s3:::clouddeploy-prod-sites/*`.
- `cloudfront:CreateInvalidation` restricted to `arn:aws:cloudfront::{accountId}:distribution/{distributionId}`.
- `secretsmanager:GetSecretValue` restricted to `arn:aws:secretsmanager:{region}:{accountId}:secret:clouddeploy/prod/rds/*`.
- `logs:CreateLogStream`, `logs:PutLogEvents` restricted to `/aws/clouddeploy/prod/application`.

**No wildcard permissions (`*`) on IAM actions or resources are permitted in production.**

---

## 6. Authentication & Token Management
- **Cognito Integration**: Tokens are generated by AWS Cognito using the RS256 algorithm.
- **Verification**: The Spring Security backend caches and validates signatures using the Cognito User Pool JWKS endpoint:
  `https://cognito-idp.{region}.amazonaws.com/{userPoolId}/.well-known/jwks.json`.
- **Token Claims Validated**:
  - `iss` (Issuer matches designated User Pool)
  - `aud` (Audience matches Client ID)
  - `exp` (Token is unexpired)
  - `token_use` (Must be `access` or `id`)
- **Frontend Storage**:
  - Access tokens are retained in memory during execution.
  - For browser persistence in demo/local mode, tokens are stored in `localStorage` with clear labeling.
  - For production, a Backend-For-Frontend (BFF) session with `HttpOnly`, `Secure`, `SameSite=Strict` cookies is supported to eliminate XSS token theft vectors.

---

## 7. Audit & Tamper Evidence
All state-modifying actions write records to the `audit_events` table:
- User registration and login
- Project creation, configuration update, and deletion
- Archive upload and validation results
- Deployment state transitions (`QUEUED` -> `VALIDATING` -> `PUBLISHING` -> `SUCCEEDED` / `FAILED`)
- Rollback execution (including initiating user, target version, and previous version)
- Administrative account changes

Audit records include timestamp, actor ID, action type, resource ID, client IP, and diagnostic metadata, enabling forensic analysis in the event of an incident.
