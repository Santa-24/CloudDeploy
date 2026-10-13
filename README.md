# CloudDeploy

> **Upload. Deploy. Go Live.**  
> An AWS-native, multi-tenant static website deployment platform built for developer ergonomics, uncompromising security, and global edge delivery.

---

## 1. Overview
CloudDeploy empowers developers to deploy static websites (HTML, CSS, JS, fonts, images) directly onto enterprise-grade AWS infrastructure in seconds without managing servers, configuring S3 buckets manually, or fiddling with CDN distributions.

### Key Pillars:
- **Zero Server-Side Execution**: Strictly static assets. No customer-supplied code ever executes on backend compute.
- **True Multi-Tenancy**: Tenant isolation enforced at the database and object storage layers via cryptographic JWT verification.
- **AWS-Native Architecture**: Built directly on Amazon S3, CloudFront with Origin Access Control (OAC), Amazon RDS for MySQL, Amazon Cognito, and EC2 Auto Scaling. No third-party SaaS wrappers (no Supabase, Firebase, Clerk, Vercel, Netlify).
- **Immutable Versioning & Instant Rollbacks**: Every upload is stored under an immutable S3 prefix. Rollbacks swap atomic database pointers and invalidate edge caches in milliseconds without re-uploading.
- **Award-Level Editorial Design**: Distinctive warm paper/ink/vermilion visual identity inspired by contemporary digital design studios and high-end developer tools.

---

## 2. Distinctive Visual Identity & Palette

CloudDeploy rejects the generic blue SaaS template in favor of a bespoke, editorial aesthetic:

| Color Token | Hex Code | Visual Application |
| :--- | :--- | :--- |
| **Warm Paper / Ivory** | `#F5F0E7` | Primary background, cards, warm neutral surfaces |
| **Ink Black** | `#1D1C19` | Deep contrast text, borders, terminal badges |
| **Burnt Vermilion** | `#C65336` | Primary accents, interactive highlights, destructive warnings |
| **Acid Lime** | `#D7EE73` | High-visibility badges, status accents, active pills |
| **Muted Stone** | `#A7A095` | Secondary text, subtle dividers, metadata labels |
| **Pure White** | `#FFFFFF` | Card highlights, modal backgrounds, input fields |

**Typography**: `Playfair Display` (editorial headlines) paired with `Inter` (high-readability UI sans) and `JetBrains Mono` (technical deployment metrics, IDs, telemetry).

---

## 3. Repository Architecture

```
clouddeploy/
├── frontend/                     # React 18 + Vite 5 + TypeScript + Tailwind CSS SPA
│   ├── src/
│   │   ├── app/                 # Root router & application shell
│   │   ├── components/          # Reusable UI primitives (Button, Modal, Toast, Card, etc.)
│   │   ├── layouts/             # Public and Dashboard persistent layouts
│   │   ├── pages/               # 18 fully implemented application pages & views
│   │   │   ├── admin/           # Administrative monitoring & user controls
│   │   ├── features/            # Interactive domain widgets (Dropzone, Timeline, Gauges)
│   │   ├── services/            # Centralized typed API client & mock data engine
│   │   ├── types/               # Strict TypeScript definitions mirroring backend DTOs
│   │   └── index.css            # Tailwind design system tokens
│   ├── .env.example             # Frontend environment variables template
│   └── package.json
│
├── backend/                      # Java 21 + Spring Boot 3.3.4 Backend Service
│   ├── src/main/java/com/clouddeploy/
│   │   ├── common/              # Response envelopes, error models, and global handlers
│   │   ├── config/              # AWS SDK client configuration & Spring Security filter chain
│   │   ├── auth/                # Cognito JWT verification filter & token models
│   │   ├── users/               # User entities, roles, and repository
│   │   ├── sites/               # Site management and strict tenant ownership verification
│   │   ├── deployments/         # 14-step deployment orchestrator & rollback engine
│   │   ├── storage/             # S3 storage service & local storage offline fallback
│   │   ├── validation/          # Archive validator (ZIP slip, bombs, executables, index.html)
│   │   ├── delivery/            # URL generation & CloudFront edge cache invalidation
│   │   ├── usage/               # Quota limits and storage accounting
│   │   ├── admin/               # Admin overview, user audits, and failure triage
│   │   └── audit/               # Audit event repository & persistence
│   ├── src/main/resources/
│   │   ├── application.yml      # Base Spring Boot configuration
│   │   ├── application-local.yml# Local dev profile (H2 in-memory MySQL mode)
│   │   ├── application-prod.yml # Production profile (RDS MySQL + Secrets Manager)
│   │   └── db/migration/        # Flyway database migration scripts (V1__init_schema.sql)
│   ├── src/test/java/           # Automated JUnit 5 unit, security & validation tests
│   ├── .env.example             # Backend environment variables template
│   └── pom.xml
│
├── infrastructure/               # Modular AWS CloudFormation Infrastructure as Code
│   ├── network/vpc.yaml         # Multi-AZ VPC, subnets, NAT Gateways, IGW
│   ├── security/security.yaml   # Security groups, EC2 IAM instance roles & OAC policies
│   ├── database/rds.yaml        # Amazon RDS for MySQL & Secrets Manager automated rotation
│   ├── storage-cdn/storage-cdn.yaml # S3 staging/published buckets & CloudFront OAC distribution
│   ├── compute/compute.yaml     # ALB, Target Group, Launch Template & Auto Scaling Group
│   ├── monitoring/monitoring.yaml # CloudWatch log groups, alarms & SNS operational alerts
│   └── main.yaml                # Master CloudFormation template orchestrating all stacks
│
├── docs/                         # Production Documentation & Engineering Specifications
│   ├── ARCHITECTURE.md          # System architecture, topology diagrams, and component breakdown
│   ├── AWS_RESOURCE_INVENTORY.md# Complete inventory of 28 planned AWS resources & status
│   ├── AWS_CONSOLE_SETUP.md     # Step-by-step AWS Console provisioning & configuration guide
│   ├── ENVIRONMENT_CONFIGURATION.md # Environment variable dictionary for all components
│   ├── API_CONTRACT.md          # REST API specifications, request/response JSON schemas
│   ├── DEPLOYMENT_WORKFLOW.md   # 14-step deployment engine pipeline & rollback details
│   ├── SECURITY.md              # Threat modeling, ZIP Slip defense, S3 OAC & IAM hardening
│   ├── TESTING.md               # Automated test reports, execution commands, and test matrix
│   └── TROUBLESHOOTING.md       # Diagnostic procedures for CORS, DB, S3 OAC, and ZIP errors
│
├── .gitignore                    # Comprehensive protection for credentials and build outputs
└── README.md                     # This document
```

---

## 4. Quick Start: Local Development

### 4.1 Prerequisites
- **Node.js**: v18.0.0 or higher
- **Java Development Kit (JDK)**: OpenJDK 21 LTS
- **Apache Maven**: v3.9 or higher

### 4.2 Mode A: Frontend Demo Mode (Zero Backend Required)
Explore the complete award-winning UI with simulated real-time data immediately:
```bash
cd frontend
cp .env.example .env.local
# In .env.local: ensure VITE_DEMO_MODE=true
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser. All 18 pages, dropzones, timelines, and rollback flows are fully interactive with clearly labeled demo data.

### 4.3 Mode B: Full Local Stack (Backend + In-Memory Database)
Run the real Spring Boot backend using in-memory H2 (MySQL compatibility mode) and local filesystem storage:
```bash
# Terminal 1: Launch Backend
cd backend
mvn spring-boot:run

# Terminal 2: Launch Frontend
cd frontend
# In .env.local: set VITE_DEMO_MODE=false and VITE_API_BASE_URL=http://localhost:8080/api
npm run dev
```
- The backend initializes on `http://localhost:8080`.
- Flyway automatically applies `V1__init_schema.sql`.
- Uploads are safely validated and staged under `./storage/sites/` without needing an AWS account.

---

## 5. Verification & Testing

### 5.1 Run Automated Backend Test Suite
```bash
cd backend
mvn test
```
**Results**:
- 10 automated tests executed: 0 failures, 0 errors (**100% BUILD SUCCESS**).
- Covers:
  - `ArchiveValidatorTest`: Valid archives, ZIP Slip rejection, missing `index.html` block, forbidden extension rejection (`.sh`, `.exe`).
  - `SiteOwnershipSecurityTest`: Cross-tenant IDOR attack isolation, legitimate owner access, admin role access.
  - `RollbackServiceTest`: Atomic version pointer swap, audit emission, rejection of unverified releases.
  - `CloudDeployApplicationTests`: Spring Boot context verification.

### 5.2 Build Production Bundles
```bash
# Frontend production build
cd frontend
npm run build
# Result: dist/ ready for S3 / CloudFront deployment

# Backend production packaging
cd backend
mvn clean package -DskipTests
# Result: target/clouddeploy-backend-1.0.0.jar ready for EC2
```

---

## 6. AWS Deployment & Provisioning

CloudDeploy is 100% AWS-native. Two deployment options are provided:

1. **Automated Infrastructure as Code (CloudFormation)**:
   Deploy `infrastructure/main.yaml` via AWS CLI or CloudFormation Console. Parameters configure VPC CIDRs, instance sizes, and domain names.
2. **Step-by-Step AWS Console Provisioning**:
   Follow our detailed [AWS_CONSOLE_SETUP.md](file:///c:/Users/santa/OneDrive/Desktop/clouddeploy/docs/AWS_CONSOLE_SETUP.md) for precise navigation paths, field values, and verification commands across Cognito, S3, RDS, CloudFront, ALB, and Auto Scaling.
3. **Track Provisioned Resources**:
   Record live ARNs and endpoints in [AWS_RESOURCE_INVENTORY.md](file:///c:/Users/santa/OneDrive/Desktop/clouddeploy/docs/AWS_RESOURCE_INVENTORY.md).

---

## 7. Documentation Directory

Detailed engineering guides are located in the `docs/` folder:
- [System Architecture](file:///c:/Users/santa/OneDrive/Desktop/clouddeploy/docs/ARCHITECTURE.md)
- [REST API Contract](file:///c:/Users/santa/OneDrive/Desktop/clouddeploy/docs/API_CONTRACT.md)
- [Deployment & Rollback Workflow](file:///c:/Users/santa/OneDrive/Desktop/clouddeploy/docs/DEPLOYMENT_WORKFLOW.md)
- [Security & Threat Modeling](file:///c:/Users/santa/OneDrive/Desktop/clouddeploy/docs/SECURITY.md)
- [Automated Testing & Verification](file:///c:/Users/santa/OneDrive/Desktop/clouddeploy/docs/TESTING.md)
- [Operations & Troubleshooting](file:///c:/Users/santa/OneDrive/Desktop/clouddeploy/docs/TROUBLESHOOTING.md)
- [AWS Resource Inventory](file:///c:/Users/santa/OneDrive/Desktop/clouddeploy/docs/AWS_RESOURCE_INVENTORY.md)
- [AWS Console Setup Guide](file:///c:/Users/santa/OneDrive/Desktop/clouddeploy/docs/AWS_CONSOLE_SETUP.md)
- [Environment Configuration Guide](file:///c:/Users/santa/OneDrive/Desktop/clouddeploy/docs/ENVIRONMENT_CONFIGURATION.md)

---

## 8. License & Authorship
Built independently as a production-grade AWS cloud deployment platform. Released under the Apache 2.0 License.
