# CloudDeploy System Architecture

## 1. Architectural Overview & Vision
CloudDeploy is an AWS-native, multi-tenant static website deployment platform engineered to bridge the gap between developer ergonomics and enterprise-grade AWS infrastructure ("Upload. Deploy. Go Live."). The architecture prioritizes:
- **Zero Server-Side Code Execution**: Customer-uploaded bundles are strictly static assets (HTML, CSS, JS, images, fonts). No customer code runs within backend compute environments.
- **Strict Multi-Tenant Isolation**: Ownership verification at every layer; tenant identifiers are derived cryptographically from verified JWT tokens, never trusted from client inputs.
- **Direct Edge Delivery**: Published assets are served globally via Amazon CloudFront backed by private Amazon S3 buckets utilizing Origin Access Control (OAC). S3 Block Public Access is enforced 100%.
- **Immutable Versioning**: Deployments create immutable prefixes in S3, facilitating instant rollbacks, historical state inspection, and zero downtime updates.

---

## 2. High-Level Topology Diagram

```mermaid
graph TB
    subgraph Clients["Clients & Edge Tier"]
        Developer["Developer / Browser"]
        Audience["Public Web Audience"]
        CF_Dashboard["CloudFront (Dashboard Distribution)"]
        CF_Sites["CloudFront (Published Sites Distribution)"]
    end

    subgraph AWS_VPC["Amazon VPC (Multi-AZ Network Isolation)"]
        subgraph PublicSubnets["Public Subnets (AZ-A / AZ-B)"]
            ALB["Application Load Balancer (ALB)"]
            NAT["NAT Gateway"]
            IGW["Internet Gateway"]
        end

        subgraph PrivateAppSubnets["Private Compute Subnets (AZ-A / AZ-B)"]
            ASG["EC2 Auto Scaling Group"]
            BackendApp["Spring Boot Backend (Java 21)"]
            IAM_Role["EC2 Instance IAM Role"]
        end

        subgraph PrivateDBSubnets["Isolated Data Subnets (AZ-A / AZ-B)"]
            RDS_MySQL[("Amazon RDS for MySQL 8.0 (Multi-AZ)")]
        end
    end

    subgraph AWSServices["AWS Managed Services"]
        Cognito["Amazon Cognito User Pool"]
        SecretsMgr["AWS Secrets Manager"]
        S3_Staging["S3 Bucket: Upload Staging (Encrypted)"]
        S3_Sites["S3 Bucket: Published Sites (Encrypted)"]
        CloudWatch["Amazon CloudWatch (Logs & Metrics)"]
        SNS["Amazon SNS (Alerts)"]
    end

    %% Flows
    Developer -->|HTTPS / App UI| CF_Dashboard
    Developer -->|REST API Requests| ALB
    Audience -->|HTTPS / Static Assets| CF_Sites

    ALB -->|Port 8080 Target Group| BackendApp
    BackendApp -->|JWT Verification| Cognito
    BackendApp -->|Secret Retrieval| SecretsMgr
    BackendApp -->|Metadata & Migrations| RDS_MySQL
    BackendApp -->|ZIP Upload & Extraction| S3_Staging
    BackendApp -->|Sync Validated Assets| S3_Sites
    BackendApp -->|Create Invalidation| CF_Sites
    BackendApp -->|Structured Logs & Metrics| CloudWatch
    CloudWatch -->|Alarm Trigger| SNS

    CF_Sites -->|Origin Access Control (OAC)| S3_Sites
    NAT --> IGW
    PrivateAppSubnets -->|Egress to AWS APIs| NAT
```

---

## 3. Component Breakdown

### 3.1 Frontend Web Application
- **Framework**: React 18, TypeScript 5.7, Vite 5, Tailwind CSS 3.4.
- **Design System**: Warm editorial palette (`#F5F0E7` Warm Paper, `#1D1C19` Ink Black, `#C65336` Burnt Vermilion, `#D7EE73` Acid Lime), Playfair Display headings, Inter body, JetBrains Mono metadata.
- **Routing & State**: React Router 6, custom hooks, typed API client with centralized Bearer token injection and mockable demo mode adapter.
- **Deployment**: Static SPA bundle hosted in S3 and delivered via CloudFront with HTTP-to-HTTPS redirect.

### 3.2 Backend Service (Spring Boot 3.3.4 & Java 21)
- **Runtime**: OpenJDK 21 LTS running on Amazon Linux 2023 EC2 instances in an Auto Scaling Group.
- **Frameworks**: Spring Boot, Spring Security (Stateless JWT filter), Spring Data JPA, Hibernate, Flyway migration engine.
- **AWS Integration**: AWS SDK for Java v2 (`software.amazon.awssdk:s3`, `cloudfront`, `secretsmanager`, `cloudwatch`).
- **Storage Abstraction**: Pluggable `StorageService` interface allowing local disk virtualization during development and high-throughput S3 execution in production.
- **Validation Engine**: Streams incoming ZIPs, verifying structural safety (ZIP slip prevention, bomb expansion thresholds, executable blocking) and presence of entrypoint `index.html`.

### 3.3 Amazon S3 Storage Architecture
- **Upload Staging Bucket (`clouddeploy-prod-uploads-{accountId}`)**:
  - Retention: Lifecycle rule aborting incomplete multipart uploads after 1 day and auto-expiring temporary staging ZIPs after 3 days.
  - Prefix Layout: `uploads/{userId}/{siteId}/{uploadId}.zip`
  - Access: Private, zero public access, server-side encryption with AWS-KMS or AES-256 (`aws:kms`).
- **Published Sites Bucket (`clouddeploy-prod-sites-{accountId}`)**:
  - Retention: Retained according to site lifecycle; immutable deployment folders.
  - Prefix Layout: `sites/{siteId}/deployments/{deploymentId}/{assetPath}`
  - Access: Origin Access Control (OAC) policy granting read privileges solely to the designated CloudFront service principal `cloudfront.amazonaws.com`.

### 3.4 Amazon CloudFront CDN Distribution
- **Distribution Profile**: Global edge caching with HTTP/2 and HTTP/3 support.
- **Security**: Origin Access Control (OAC), TLS 1.3 enforced, custom error pages mapping `404` to `index.html` with HTTP 200 for Single Page Application routing where enabled.
- **Path Routing Pattern**:
  - Default route / live site URL: `https://sites.example.com/s/{siteId}/` mapped via CloudFront Function or path rewrite to origin prefix `/sites/{siteId}/deployments/{activeDeploymentId}/`.
- **Invalidations**: Automated surgical edge cache invalidations (`/s/{siteId}/*`) dispatched upon release publication or rollback.

### 3.5 Database & Metadata Layer (Amazon RDS for MySQL)
- **Engine**: MySQL 8.0 on `db.t4g.micro` / `db.m6g.large` (Multi-AZ in production).
- **Subnet Placement**: Isolated Private Database Subnets across two Availability Zones without public IP assignment or internet gateways.
- **Credentials**: Generated and rotated automatically via AWS Secrets Manager (`clouddeploy/prod/rds/credentials`). The backend IAM instance role assumes permissions to fetch secrets on startup.
- **Schema Management**: Flyway database migrations execute on application bootstrap (`V1__init_schema.sql`).

### 3.6 Authentication & Identity (Amazon Cognito)
- **User Pool**: `clouddeploy-prod-users` enforcing email-based registration, MFA support, and password policies.
- **JWT Flow**:
  - Frontend authenticates with Cognito via SRP or Hosted UI to obtain ID, Access, and Refresh tokens.
  - Backend `JwtAuthFilter` extracts and validates the Bearer JWT against the Cognito JWKS endpoint (`https://cognito-idp.{region}.amazonaws.com/{userPoolId}/.well-known/jwks.json`).
  - Claims `sub`, `email`, and `cognito:groups` are mapped to Spring Security `AuthenticationToken` and local `User` entities.

---

## 4. Multi-Tenant Isolation Model

CloudDeploy implements a **Logical Multi-Tenancy Architecture** where all customer data shares the metadata database and S3 buckets, but is strictly isolated by cryptographic identity verification:

1. **Token Invariant**: The backend never accepts client-provided user IDs. The caller's identity is extracted from the cryptographic `sub` (subject identifier) inside the verified JWT signature.
2. **Database Row-Level Isolation**:
   ```sql
   SELECT * FROM sites WHERE site_id = :siteId AND owner_id = :authenticatedUserId;
   ```
   Every query mutating or retrieving site, deployment, or event resources joins against the owner's primary key. Access attempts across tenant boundaries throw `UnauthorizedException` (HTTP 403 Forbidden).
3. **S3 Object Path Isolation**: S3 keys strictly encode the tenant's `siteId`:
   ```
   sites/{siteId}/deployments/{deploymentId}/...
   ```
   The backend orchestrator verifies that `site.getOwner().getId()` matches the caller before any S3 PutObject, GetObject, or CloudFront invalidation action is issued.
4. **Administrative Separation**: Platform administrators belong to the Cognito `ADMIN` group. Administrative endpoints (`/api/admin/*`) require `@PreAuthorize("hasRole('ADMIN')")`.

---

## 5. Network & Security Topology

| Zone / Tier | Subnet Type | Route Table Destination | Inbound Rules | Outbound Rules |
| :--- | :--- | :--- | :--- | :--- |
| **Edge** | CloudFront Edge | Global AWS Backbone | HTTPS (443) from 0.0.0.0/0 | S3 OAC, ALB Origin |
| **Ingress** | Public Subnet | `0.0.0.0/0` -> Internet Gateway | TCP 80/443 from Internet | TCP 8080 to App Security Group |
| **Compute** | Private App Subnet | `0.0.0.0/0` -> NAT Gateway | TCP 8080 from ALB SG | TCP 3306 to DB SG, HTTPS 443 to AWS APIs |
| **Data** | Private DB Subnet | Local VPC Only (No IGW/NAT) | TCP 3306 from App SG | None (Local VPC traffic only) |

---

## 6. Resilience & High Availability
- **Stateless Compute**: Backend EC2 instances maintain zero in-memory session state; horizontal scaling across Availability Zones is handled autonomously by the Auto Scaling Group governed by target tracking CPU utilization (70%).
- **Database Failover**: RDS Multi-AZ synchronously replicates transactions to a standby instance in a secondary AZ, enabling automatic failover in <60 seconds without data loss.
- **Deployment Idempotency**: Deployment IDs (`dep_xxx`) are unique UUIDs. Incomplete or failed deployments do not alter the site's `currentDeploymentId` reference, ensuring the existing live version continues serving without disruption.
- **Circuit Breaking & Fallback**: S3 network disconnects or CloudFront throttling trigger explicit failure transitions (`FAILED`) and record diagnostic events in `deployment_events`, preserving audit integrity.
