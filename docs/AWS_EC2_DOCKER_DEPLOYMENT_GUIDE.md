# ================================================================================
# CLOUDDEPLOY — PRODUCTION AWS EC2 & DOCKER DEPLOYMENT MASTER ACTION GUIDE (v2.0)
# ================================================================================
# Solo Developer End-to-End Production Deployment & Troubleshooting Playbook
# Target AWS Region: ap-south-1 (Asia Pacific — Mumbai)
# Platform: CloudDeploy AWS-Native Static Website Deployment SaaS Platform
# Repository: https://github.com/Santa-24/CloudDeploy.git
# Target Architecture: AWS EC2 (Ubuntu 22.04 LTS) + Nginx (TLS 1.3) + Docker Compose
# ================================================================================

This document provides a battle-tested, click-by-click, and command-by-command guide
to deploying, containerizing, running, maintaining, and safely tearing down the
CloudDeploy SaaS platform on AWS using Docker & Docker Compose.

It addresses real-world obstacles encountered during production deployments,
including Let's Encrypt SSL HTTPS provisioning, Nginx 502 Bad Gateway timeouts,
Docker memory exhaustion during Java 21 compilation, Amazon Cognito CORS issues,
S3 Origin Access Control policies, and AWS zero-cost teardown procedures.

--------------------------------------------------------------------------------
TABLE OF CONTENTS
--------------------------------------------------------------------------------
1. Architecture Topology & Network Flow
2. Prerequisites & Credentials Master Mapping Table
3. STEP 1: Launch Production AWS EC2 Instance (Console Setup)
4. STEP 2: Configure RDS MySQL Security Group for EC2
5. STEP 3: Connect to EC2 (1-Click Browser Terminal or SSH)
6. STEP 4: Automated Server Provisioning (Docker, Compose, Git)
7. STEP 5: Production Environment Variables (.env Setup)
8. STEP 6: Build & Launch Production Multi-Container Stack
9. STEP 7: Allocate & Associate AWS Elastic IP (Static Public IPv4)
10. STEP 8: Free Let's Encrypt SSL & DuckDNS Setup (HTTPS Security)
11. STEP 9: Real-World Obstacles Faced & Exact Troubleshooting Solutions
    - Obstacle 1: Git Merge Conflicts During EC2 Code Pulls
    - Obstacle 2: 502 Bad Gateway on Large ZIP Deploys & Timeout Tuning
    - Obstacle 3: Java 21 Memory Exhaustion on Small Instances (2GB Swapfile)
    - Obstacle 4: Amazon Cognito CORS & App Client Secret Gotcha
    - Obstacle 5: CloudFront OAC 403 Forbidden S3 Access Denied
    - Obstacle 6: React Single Page Application (SPA) 404 Refresh Bug
12. STEP 10: Complete Teardown & Billing Protection (Stop vs. Delete)
13. Production Maintenance & Zero-Downtime Update Commands

================================================================================
1. ARCHITECTURE TOPOLOGY & NETWORK FLOW
================================================================================

When fully deployed, the containerized production infrastructure runs according to this topology:

[ Web Browsers / Public Internet ]
                 │
                 ▼
     [ DuckDNS / AWS Elastic IP ]
                 │
       Port 80 (HTTP) -> 301 Redirect to HTTPS
       Port 443 (HTTPS / TLS 1.3)
                 │
                 ▼
  ┌─────────────────────────────────────────────────────────────┐
  │ AWS EC2 INSTANCE: CloudDeploy-Production (Ubuntu 22.04 LTS) │
  │                                                             │
  │   [ Nginx Reverse Proxy Container (TLS 1.3 + Certbot) ]     │
  │   - Port 80: ACME Challenge + 301 Redirect to HTTPS        │
  │   - Port 443: SSL Termination                              │
  │   - Routes `/api/*` and `/actuator/*` -> Backend (8080)     │
  │   - Routes all other traffic `/*` -> Frontend (80)          │
  │   - Proxy Timeouts tuned to 300s for large ZIP extractions  │
  │   - `client_max_body_size 60M;` for static build uploads    │
  │                                                             │
  │        ┌────────────────────────────┴─────────────────────┐ │
  │        ▼                                                  ▼ │
  │   [ React Frontend ]                            [ Spring Boot 3.3 ]
  │   (Port 80, Nginx Alpine)                       (Port 8080, Java 21)
  │   - Static SPA Distribution                     - Sandboxed ZIP Ingestion
  │   - 1-Click Starter Templates                   - Anti-Zip Slip Checker
  │   - Plan Quota Guardrails (Free / Pro)          - S3 Streaming & Cognito Auth
  └────────┼──────────────────────────────────────────────────┼─┘
           │                                                  │
           │                                  ┌───────────────┼───────────────┐
           │                                  ▼               ▼               ▼
           │                          [ Amazon RDS MySQL ] [ Amazon S3 ] [ CloudFront ]
           │                          Port 3306            Staging &     Edge CDN
           │                          `clouddeploy` DB     Sites Buckets OAC Origin
           ▼
[ Live Deployed Websites (`/sites/{id}/index.html`) ]


================================================================================
2. PREREQUISITES & CREDENTIALS MASTER MAPPING TABLE
================================================================================

Prepare the following AWS resources and credentials in `ap-south-1` (Mumbai)
before launching the containers:

+--------------------------------+-------------------------------------------------------------+------------------------------------+
| RESOURCE / VARIABLE            | VALUE IN YOUR AWS ACCOUNT                                   | STATUS / NOTES                     |
+--------------------------------+-------------------------------------------------------------+------------------------------------+
| AWS Region                     | ap-south-1 (Asia Pacific — Mumbai)                          | Active                             |
| RDS_HOSTNAME                   | clouddeploy-db.xxxxxx.ap-south-1.rds.amazonaws.com          | Amazon RDS MySQL 8.0               |
| RDS_PORT                       | 3306                                                        | Default MySQL port                 |
| RDS_DB_NAME                    | clouddeploy                                                 | Flyway automated schema migrations |
| RDS_USERNAME                   | clouddeploy_admin                                           | Master DB User                     |
| RDS_PASSWORD                   | <YOUR_RDS_MASTER_PASSWORD>                                  | Master DB Password                 |
| AWS_S3_UPLOAD_BUCKET           | clouddeploy-uploads-<account-id>-ap-south-1                 | Private Staging Bucket (SSE-S3)    |
| AWS_S3_SITE_BUCKET             | clouddeploy-sites-<account-id>-ap-south-1                   | Private Published Sites Bucket     |
| AWS_CLOUDFRONT_DISTRIBUTION_ID | E2VP7RB0IJ10UB                                              | Live Edge Distribution             |
| AWS_CLOUDFRONT_DOMAIN          | d2cxu429uj7b19.cloudfront.net                               | Origin Access Control (OAC)        |
| AWS_COGNITO_USER_POOL_ID       | ap-south-1_xxxxxxxxx                                        | User Authentication Pool           |
| AWS_COGNITO_CLIENT_ID          | 59ofng9j08tj6ftf5rmosqv0m4                                  | Public Client (NO client secret)   |
| AWS_ACCESS_KEY_ID              | <YOUR_AWS_ACCESS_KEY_ID>                                    | IAM User Access Key                |
| AWS_SECRET_ACCESS_KEY          | <YOUR_AWS_SECRET_ACCESS_KEY>                                | IAM User Secret Key                |
| DuckDNS Domain                 | clouddeploy.duckdns.org                                     | Free HTTPS Subdomain               |
+--------------------------------+-------------------------------------------------------------+------------------------------------+


================================================================================
3. STEP 1: LAUNCH PRODUCTION AWS EC2 INSTANCE (CONSOLE SETUP)
================================================================================

1. Log in to the AWS Management Console: https://console.aws.amazon.com
2. Verify top-right region is `Asia Pacific (Mumbai) ap-south-1`.
3. In the search bar, type "EC2" and click "EC2".
4. Click "Instances" -> Click the orange "Launch instances" button.

Configure Instance Settings:
- Name: `CloudDeploy-Production`
- OS Image (AMI): `Ubuntu Server 22.04 LTS (HVM), SSD Volume Type` (64-bit x86).
- Instance Type: `t3.small` (2 vCPU, 2 GiB Memory) or `t3.medium` (4 GiB Memory).
  *(A 2GB Linux Swapfile will be configured automatically by `setup-ec2.sh`).*
- Key pair: Choose an existing `.pem` key pair or click "Create new key pair".
- Network settings: Click "Edit":
  * VPC: Default VPC.
  * Auto-assign public IP: `Enable`.
  * Security group: Create security group `clouddeploy-ec2-sg`:
    - Rule 1: SSH (Port 22) -> Source: `My IP` (or `0.0.0.0/0`)
    - Rule 2: HTTP (Port 80) -> Source: `0.0.0.0/0`
    - Rule 3: HTTPS (Port 443) -> Source: `0.0.0.0/0`  <-- REQUIRED FOR SSL!
- Storage: `25 GiB gp3` SSD.
- Click "Launch instance". Wait ~45 seconds until status displays `Running`.


================================================================================
4. STEP 2: CONFIGURE RDS MYSQL SECURITY GROUP FOR EC2
================================================================================

Allow the EC2 instance to access the Amazon RDS MySQL database:
1. Open the EC2 / VPC Console -> "Security groups".
2. Select the RDS database security group: `clouddeploy-rds-sg`.
3. Click "Inbound rules" tab -> "Edit inbound rules" -> "Add rule":
   - Type: `MySQL/Aurora` (Port `3306`).
   - Source: Select `clouddeploy-ec2-sg` (the security group created in Step 1).
   - Description: `Allow CloudDeploy EC2 container ingress to MySQL`.
4. Click "Save rules".


================================================================================
5. STEP 3: CONNECT TO EC2 (1-CLICK BROWSER TERMINAL OR SSH)
================================================================================

Option A (Recommended — Direct in AWS Console):
1. In EC2 Console -> Select `CloudDeploy-Production`.
2. Click "Connect" at the top -> Keep "EC2 Instance Connect" tab selected.
3. User name: `ubuntu` -> Click "Connect".
4. A browser terminal opens directly into the server: `ubuntu@ip-172-31-xx-xx:~$ `

Option B (PowerShell SSH on Windows):
```powershell
cd C:\Users\santa\Downloads
icacls.exe clouddeploy-key.pem /reset
icacls.exe clouddeploy-key.pem /grant:r "$($env:username):(R)"
icacls.exe clouddeploy-key.pem /inheritance:r
ssh -i "clouddeploy-key.pem" ubuntu@<YOUR_EC2_PUBLIC_IP>
```


================================================================================
6. STEP 4: AUTOMATED SERVER PROVISIONING (DOCKER, COMPOSE, GIT)
================================================================================

Run these commands in your EC2 terminal:

```bash
# 1. Clone the repository
git clone https://github.com/Santa-24/CloudDeploy.git
cd CloudDeploy

# 2. Run the automated provisioning script
chmod +x infrastructure/deployment/setup-ec2.sh
./infrastructure/deployment/setup-ec2.sh

# 3. Apply Docker group without logging out
newgrp docker

# 4. Verify Docker & Compose
docker --version
docker compose version
```


================================================================================
7. STEP 5: PRODUCTION ENVIRONMENT VARIABLES (.ENV SETUP)
================================================================================

Create the production `.env` file in the root of the project:

```bash
nano .env
```

Paste your active configuration:

```ini
# Core Spring Boot Settings
SPRING_PROFILES_ACTIVE=prod
SERVER_PORT=8080

# Live Amazon RDS MySQL Database Connection
RDS_HOSTNAME=clouddeploy-db.xxxxxx.ap-south-1.rds.amazonaws.com
RDS_PORT=3306
RDS_DB_NAME=clouddeploy
RDS_USERNAME=clouddeploy_admin
RDS_PASSWORD=YourRdsPasswordHere

# AWS Region & Programmatic IAM Credentials
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=<YOUR_AWS_ACCESS_KEY_ID>
AWS_SECRET_ACCESS_KEY=<YOUR_AWS_SECRET_ACCESS_KEY>

# Amazon S3 Storage Buckets
APP_STORAGE_MODE=s3
AWS_S3_UPLOAD_BUCKET=clouddeploy-uploads-941905484053-ap-south-1
AWS_S3_SITE_BUCKET=clouddeploy-sites-941905484053-ap-south-1

# Amazon Cognito Authentication (Public Client)
AWS_COGNITO_USER_POOL_ID=ap-south-1_xxxxxxxxx
AWS_COGNITO_CLIENT_ID=59ofng9j08tj6ftf5rmosqv0m4
AWS_COGNITO_REGION=ap-south-1

# Amazon CloudFront Edge CDN
AWS_CLOUDFRONT_DISTRIBUTION_ID=E2VP7RB0IJ10UB
AWS_CLOUDFRONT_DOMAIN=d2cxu429uj7b19.cloudfront.net

# Platform Security & SaaS Limits
JWT_SECRET=super-secure-production-jwt-token-at-least-32-characters-long
APP_BASE_DOMAIN=d2cxu429uj7b19.cloudfront.net
APP_UPLOAD_MAX_BYTES=52428800
APP_MAX_FILES_PER_DEPLOYMENT=1000
APP_MAX_EXTRACTED_BYTES=262144000
APP_MAX_PROJECTS_PER_USER=3
```

Save and exit nano: `Ctrl + O` -> `Enter` -> `Ctrl + X`.


================================================================================
8. STEP 6: BUILD & LAUNCH PRODUCTION MULTI-CONTAINER STACK
================================================================================

Build and launch the complete stack with Docker Compose:

```bash
docker compose -f infrastructure/docker/docker-compose.prod.yml up -d --build
```

Verify containers are running:
```bash
docker compose -f infrastructure/docker/docker-compose.prod.yml ps
```

All 3 containers should display `Up` or `running`:
- `clouddeploy-nginx` (Ports 80 & 443)
- `clouddeploy-backend` (Port 8080 internal)
- `clouddeploy-frontend` (Port 80 internal)

Test internal backend health check:
```bash
curl http://localhost/actuator/health
# Expected Output: {"status":"UP"}
```


================================================================================
9. STEP 7: ALLOCATE & ASSOCIATE AWS ELASTIC IP (STATIC PUBLIC IP)
================================================================================

EC2 instances change public IPs when stopped and restarted. An Elastic IP ensures a permanent IP address for your domain:
1. In EC2 Console -> Left menu -> "Elastic IPs" (under Network & Security).
2. Click "Allocate Elastic IP address" -> Click "Allocate".
3. Select the allocated IP -> Click "Actions" -> "Associate Elastic IP address".
4. Resource type: `Instance` -> Select `CloudDeploy-Production` -> Click "Associate".
5. Note the Elastic IP address (e.g., `13.127.253.31`).


================================================================================
10. STEP 8: FREE LET'S ENCRYPT SSL & DUCKDNS SETUP (HTTPS SECURITY)
================================================================================

1. Visit https://www.duckdns.org (Sign in with GitHub/Google).
2. Create subdomain: `clouddeploy` (Full domain: `clouddeploy.duckdns.org`).
3. Set the IP address to your EC2 Elastic IP -> Click "update ip".
4. Confirm Port 443 (HTTPS) is open in your EC2 Security Group `clouddeploy-ec2-sg`.
5. Run the automated SSL setup script on EC2:

```bash
cd ~/CloudDeploy
chmod +x infrastructure/deployment/setup-ssl.sh
./infrastructure/deployment/setup-ssl.sh clouddeploy.duckdns.org your-email@gmail.com
```

Your CloudDeploy platform is now live and fully secured at:
https://clouddeploy.duckdns.org/


================================================================================
11. STEP 9: REAL-WORLD OBSTACLES FACED & EXACT TROUBLESHOOTING SOLUTIONS
================================================================================

--------------------------------------------------------------------------------
Obstacle 1: Git Merge Conflicts During EC2 Code Pulls
--------------------------------------------------------------------------------
Symptom:
  `error: Your local changes to the following files would be overwritten by merge:`
  `  infrastructure/docker/nginx.conf`
Cause:
  The `setup-ssl.sh` script or manual edits touched `nginx.conf` directly on the server.
Resolution:
  Discard local changes before pulling the clean repository:
  ```bash
  git stash
  git pull origin main
  ```

--------------------------------------------------------------------------------
Obstacle 2: 502 Bad Gateway on Large ZIP Deploys & Timeout Tuning
--------------------------------------------------------------------------------
Symptom:
  Uploading large archives (30MB+) or extracting complex templates returned `502 Bad Gateway`.
Cause:
  1. Default Nginx `client_max_body_size` is only 1MB.
  2. Default `proxy_read_timeout` is 60s, dropping connections during S3 chunk streaming.
Resolution:
  Tuned Nginx configuration in `infrastructure/docker/nginx.conf`:
  ```nginx
  client_max_body_size 60M;
  proxy_connect_timeout 300s;
  proxy_send_timeout 300s;
  proxy_read_timeout 300s;
  ```

--------------------------------------------------------------------------------
Obstacle 3: Java 21 Memory Exhaustion on Small Instances (2GB Swapfile)
--------------------------------------------------------------------------------
Symptom:
  Building the backend container on a `t3.small` or `t3.micro` instance hung or was terminated by `Killed` (OOM Killer).
Cause:
  Maven + Java 21 compiler requires ~1.8GB memory during package compilation.
Resolution:
  Configured a 2GB Linux swapfile in `setup-ec2.sh`:
  ```bash
  sudo fallocate -l 2G /swapfile
  sudo chmod 600 /swapfile
  sudo mkswap /swapfile
  sudo swapon /swapfile
  echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
  ```

--------------------------------------------------------------------------------
Obstacle 4: Amazon Cognito CORS & App Client Secret Gotcha
--------------------------------------------------------------------------------
Symptom:
  Login failed with `Cognito authentication error: Unable to verify secret hash for client`.
Cause:
  Single Page Applications (React) run in the user's browser and cannot securely hold a Client Secret.
Resolution:
  When creating the Cognito App Client, select **Public client** and select **Don't generate a client secret**.

--------------------------------------------------------------------------------
Obstacle 5: CloudFront OAC 403 Forbidden S3 Access Denied
--------------------------------------------------------------------------------
Symptom:
  Live deployment URL returned `403 AccessDenied` from CloudFront.
Cause:
  The Published Sites S3 bucket has Block Public Access enabled, but the CloudFront OAC bucket policy was not attached.
Resolution:
  Attach the S3 Bucket Policy generated by CloudFront:
  ```json
  {
    "Version": "2012-10-17",
    "Statement": {
      "Sid": "AllowCloudFrontServicePrincipalReadOnly",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::clouddeploy-sites-*/*",
      "Condition": {
        "StringEquals": {
          "AWS:SourceArn": "arn:aws:cloudfront::<account-id>:distribution/<dist-id>"
        }
      }
    }
  }
  ```

--------------------------------------------------------------------------------
Obstacle 6: React Single Page Application (SPA) 404 Refresh Bug
--------------------------------------------------------------------------------
Symptom:
  Navigating directly to `/features` or `/pricing` and pressing `F5` returned Nginx `404 Not Found`.
Cause:
  Nginx looked for a physical file `/features/index.html` on disk.
Resolution:
  Configured SPA fallback in `frontend/nginx.conf`:
  ```nginx
  location / {
      try_files $uri $uri/ /index.html;
  }
  ```


================================================================================
12. STEP 10: COMPLETE TEARDOWN & BILLING PROTECTION (STOP VS. DELETE)
================================================================================

To avoid unintended AWS charges when you finish testing, follow the appropriate procedure:

--------------------------------------------------------------------------------
PROCEDURE A: TEMPORARILY STOP (PAUSE BILLING, PRESERVE ALL DATA)
--------------------------------------------------------------------------------
1. In EC2 Terminal:
   ```bash
   cd ~/CloudDeploy
   docker compose -f infrastructure/docker/docker-compose.prod.yml down
   sudo shutdown -h now
   ```
2. In AWS RDS Console -> Databases -> Select `clouddeploy-db` -> Actions -> "Stop".
3. In AWS EC2 Console -> Elastic IPs -> Disassociate and Release Elastic IP
   *(Crucial: AWS charges $0.005/hr for unattached Elastic IPs!)*
4. Cost while stopped: **$0.00 compute charges** (only pennies for dormant storage).

--------------------------------------------------------------------------------
PROCEDURE B: COMPLETE TEARDOWN / PERMANENT DELETION ($0.00 COST FOREVER)
--------------------------------------------------------------------------------
1. EC2: Select `CloudDeploy-Production` -> Instance state -> **Terminate instance**.
2. Elastic IP: Select IP -> Actions -> **Disassociate** -> **Release Elastic IP address**.
3. RDS: Select `clouddeploy-db` -> Actions -> **Delete**:
   - Uncheck "Create final snapshot".
   - Check "Acknowledge deletion".
   - Type `delete me` -> Click Delete.
4. S3 Buckets:
   - For `clouddeploy-uploads-...` and `clouddeploy-sites-...`:
   - Click **Empty** -> Type `permanently delete` -> Empty.
   - Click **Delete** -> Type bucket name -> Delete bucket.
5. CloudFront: Disable distribution -> Delete distribution.
6. Cognito: Delete User Pool `clouddeploy-users`.


================================================================================
13. PRODUCTION MAINTENANCE & ZERO-DOWNTIME UPDATE COMMANDS
================================================================================

When you push code updates to GitHub `main`, deploy to EC2 with zero downtime:

```bash
# 1. Pull latest code from GitHub
cd ~/CloudDeploy
git stash
git pull origin main

# 2. Rebuild and restart container services
docker compose -f infrastructure/docker/docker-compose.prod.yml up -d --build

# 3. View live backend logs
docker compose -f infrastructure/docker/docker-compose.prod.yml logs -f backend

# 4. View live Nginx proxy logs
docker compose -f infrastructure/docker/docker-compose.prod.yml logs -f nginx
```

================================================================================
END OF CLOUDDEPLOY PRODUCTION AWS EC2 & DOCKER DEPLOYMENT MASTER ACTION GUIDE (v2.0)
================================================================================
