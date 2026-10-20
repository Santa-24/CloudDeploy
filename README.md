<div align="center">

# 🚀 CloudDeploy

**Upload. Deploy. Go Live.**
A multi-tenant static website deployment platform, built natively on AWS.

![Java](https://img.shields.io/badge/Java-21-ED8B00?logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.4-6DB33F?logo=springboot&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)
![AWS](https://img.shields.io/badge/AWS-S3%20%7C%20CloudFront%20%7C%20RDS%20%7C%20Cognito-FF9900?logo=amazonaws&logoColor=white)
![IaC](https://img.shields.io/badge/IaC-CloudFormation-FF4F8B)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)

[Features](#-features) · [Architecture](#-architecture) · [Quick Start](#-quick-start) · [Testing](#-testing) · [AWS Deployment](#-aws-deployment) · [Docs](#-documentation)

<!-- 📸 Add a screenshot or demo GIF: docs/assets/dashboard.png -->
<!-- <img src="docs/assets/dashboard.png" alt="CloudDeploy dashboard" width="90%"> -->

</div>

---

## 🎯 Overview

CloudDeploy lets developers publish static sites (HTML, CSS, JS, fonts, images) to AWS infrastructure without creating S3 buckets or configuring CDN distributions by hand. Upload a ZIP, and the platform validates it, stores it as an immutable version, and serves it through CloudFront.

---

## ✨ Features

| | Feature | Details |
|---|---|---|
| 🔒 | **Static-only by design** | No customer-supplied code ever runs on backend compute |
| 🏢 | **Multi-tenancy** | Tenant isolation enforced at the database and object-storage layers, using Cognito JWT verification |
| ♻️ | **Immutable versions & instant rollback** | Each upload lives under its own S3 prefix. Rollback swaps a database pointer and invalidates the CDN cache. No re-upload needed. |
| 🛡️ | **Hardened upload pipeline** | Archive validator rejects ZIP Slip, zip bombs, executables and archives missing `index.html` |
| 🌍 | **Global edge delivery** | CloudFront with Origin Access Control (OAC), so S3 is never publicly exposed |
| 📊 | **Quotas & audit trail** | Per-tenant storage accounting, admin dashboard, audit events and failure triage |
| 🧪 | **Demo mode** | Run the full UI with simulated data, no backend or AWS account required |

---

## 🏗️ Architecture

```
                 ┌──────────────┐
   Developer ──► │ React SPA    │
                 └──────┬───────┘
                        │ REST + Cognito JWT
                 ┌──────▼───────────────────────┐
                 │  Spring Boot API (EC2 ASG)   │
                 │  behind Application LB       │
                 │  • 14-step deploy engine     │
                 │  • Archive validator         │
                 │  • Rollback service          │
                 └───┬───────────┬──────────┬───┘
                     │           │          │
              ┌──────▼──┐  ┌─────▼────┐  ┌──▼─────────────┐
              │ RDS     │  │ S3       │  │ CloudFront     │
              │ MySQL   │  │ staging  │  │ (OAC) ◄── viewers
              │         │  │ + public │  │ cache invalidation
              └─────────┘  └──────────┘  └────────────────┘
```

### Tech stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite 5, TypeScript, Tailwind CSS |
| **Backend** | Java 21, Spring Boot 3.3.4, Spring Security, Flyway, JUnit 5, Maven |
| **AWS** | S3, CloudFront (OAC), RDS for MySQL, Cognito, EC2 Auto Scaling, ALB, Secrets Manager, CloudWatch, SNS |
| **IaC** | AWS CloudFormation (modular nested stacks) |

---

## 📁 Project Structure

```
CloudDeploy/
├── frontend/          # React + Vite + TypeScript SPA (18 pages, demo-mode data engine)
├── backend/           # Spring Boot service
│   └── src/main/java/com/clouddeploy/
│       ├── auth/ users/ sites/        # Cognito JWT filter, tenants, ownership checks
│       ├── deployments/               # Deployment orchestrator + rollback engine
│       ├── validation/                # ZIP Slip / bomb / executable checks
│       ├── storage/ delivery/         # S3 + local fallback, CloudFront invalidation
│       └── usage/ admin/ audit/       # Quotas, admin tools, audit log
├── infrastructure/    # CloudFormation: network, security, database, storage-cdn, compute, monitoring
├── docs/              # Architecture, API contract, security, testing, troubleshooting
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js **18+**
- JDK **21**
- Maven **3.9+**

### Mode A: Frontend demo (no backend needed)

```bash
cd frontend
cp .env.example .env.local     # keep VITE_DEMO_MODE=true
npm install
npm run dev
```

Open <http://localhost:5173>. All pages work with clearly labeled simulated data.

### Mode B: Full local stack (no AWS account needed)

Runs the real backend on in-memory H2 (MySQL mode) with local filesystem storage.

```bash
# Terminal 1: backend
cd backend
mvn spring-boot:run            # http://localhost:8080

# Terminal 2: frontend
cd frontend
cp .env.example .env.local
# set VITE_DEMO_MODE=false and VITE_API_BASE_URL=http://localhost:8080/api
npm install
npm run dev
```

Flyway applies `V1__init_schema.sql` automatically, and uploads are staged under `./storage/sites/`.

---

## 🧪 Testing

```bash
cd backend
mvn test
```

The suite has 10 tests covering:

- **`ArchiveValidatorTest`**: valid archives, ZIP Slip rejection, missing `index.html`, forbidden extensions (`.sh`, `.exe`)
- **`SiteOwnershipSecurityTest`**: cross-tenant (IDOR) isolation, owner access, admin access
- **`RollbackServiceTest`**: atomic version-pointer swap, audit emission, rejection of unverified releases
- **`CloudDeployApplicationTests`**: Spring context loads

**Production builds**

```bash
cd frontend && npm run build                 # → dist/
cd backend  && mvn clean package -DskipTests # → target/clouddeploy-backend-1.0.0.jar
```

---

## ☁️ AWS Deployment

| Option | How |
|---|---|
| **Infrastructure as Code** | Deploy [`infrastructure/main.yaml`](infrastructure/main.yaml) with the AWS CLI or CloudFormation console. It orchestrates VPC, security, RDS, S3 + CloudFront, compute and monitoring stacks. |
| **Manual console setup** | Follow [`docs/AWS_CONSOLE_SETUP.md`](docs/AWS_CONSOLE_SETUP.md) step by step. |

Track live resources in [`docs/AWS_RESOURCE_INVENTORY.md`](docs/AWS_RESOURCE_INVENTORY.md).

> 💰 These resources (NAT Gateways, RDS, ALB) cost money while running. Delete the stack when you finish testing.

---

## 📚 Documentation

| Document | Description |
|---|---|
| [Architecture](docs/ARCHITECTURE.md) | Topology and component breakdown |
| [API Contract](docs/API_CONTRACT.md) | REST endpoints and JSON schemas |
| [Deployment Workflow](docs/DEPLOYMENT_WORKFLOW.md) | 14-step deploy pipeline and rollback |
| [Security](docs/SECURITY.md) | Threat model, ZIP Slip defense, OAC and IAM hardening |
| [Testing](docs/TESTING.md) | Test matrix and commands |
| [Troubleshooting](docs/TROUBLESHOOTING.md) | CORS, DB, S3 OAC and ZIP errors |
| [Environment Configuration](docs/ENVIRONMENT_CONFIGURATION.md) | Environment variable reference |
| [AWS Console Setup](docs/AWS_CONSOLE_SETUP.md) | Manual provisioning guide |
| [AWS Resource Inventory](docs/AWS_RESOURCE_INVENTORY.md) | Planned and provisioned resources |

---

## 🗺️ Roadmap

- [ ] CI/CD pipeline (GitHub Actions) for build, test and deploy
- [ ] Custom domains with ACM certificates
- [ ] Deployment previews per version
- [ ] Docker setup for one-command local run

*(Edit to match your real plans.)*

---

## 📄 License

Released under the **Apache License 2.0**. See [`LICENSE`](LICENSE).

<div align="center">

If this project helped you, consider giving it a ⭐

</div>
