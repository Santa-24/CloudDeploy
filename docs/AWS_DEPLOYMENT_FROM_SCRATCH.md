# Complete AWS Deployment Guide from Scratch — CloudDeploy

This guide walks you through deploying the complete **CloudDeploy SaaS platform** onto **Amazon Web Services (AWS)** from scratch.

---

## 🏛️ Architecture Overview

```
                          ┌────────────────────────┐
                          │   End User / Browser   │
                          └───────────┬────────────┘
                                      │
               ┌──────────────────────┴──────────────────────┐
               │                                             │
      (CloudDeploy SaaS App)                       (Deployed Tenant Websites)
               │                                             │
               ▼                                             ▼
     ┌───────────────────┐                         ┌───────────────────┐
     │  EC2 Server / ALB │                         │ Amazon CloudFront │
     │  (Nginx Reverse   │                         │     (Edge CDN)    │
     │      Proxy)       │                         └─────────┬─────────┘
     └────┬─────────┬────┘                                   │ Origin Access
          │         │                                        │ Control (OAC)
          ▼         ▼                                        ▼
   ┌───────────┐ ┌───────────────────┐             ┌───────────────────┐
   │ React SPA │ │ Spring Boot App   │             │ S3 Sites Bucket   │
   │ (dist/)   │ │ (:8080)           │             │ (Extracted files) │
   └───────────┘ └────┬─────────┬────┘             └───────────────────┘
                      │         │                            ▲
                      │         └──────── Unzips to ─────────┘
                      │
        ┌─────────────┴─────────────┐
        ▼                           ▼
 ┌──────────────┐            ┌──────────────┐
 │ S3 Uploads   │            │ Amazon RDS   │
 │ Bucket (ZIP) │            │ (MySQL 8.0)  │
 └──────────────┘            └──────────────┘
```

---

## 📋 Prerequisites & Planning

1. **AWS Account**: Active account with administrative privileges.
2. **Target Region**: Choose your preferred region. Recommended:
   - `ap-south-1` (Asia Pacific — Mumbai) or
   - `us-east-1` (US East — N. Virginia).
3. **Local Tools**:
   - Java 21 JDK (`java -version`)
   - Apache Maven (`mvn -v`)
   - Node.js 18+ & npm (`node -v`, `npm -v`)
   - Git & SSH client

---

## Phase 1: IAM Role & Security Foundation

Instead of putting hardcoded secret keys inside server config, EC2 instances should authenticate to AWS services securely via an **IAM Instance Profile Role**.

### Step 1.1: Create IAM Role for EC2
1. Open the **AWS Console** and navigate to **IAM > Roles**.
2. Click **Create role**.
3. Select **AWS service**, and under Use case, choose **EC2**. Click **Next**.
4. In permissions, click **Create policy** (opens a new tab), switch to the **JSON** tab, and paste:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "S3BucketAccess",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::clouddeploy-*",
        "arn:aws:s3:::clouddeploy-*/*"
      ]
    },
    {
      "Sid": "CloudFrontInvalidation",
      "Effect": "Allow",
      "Action": [
        "cloudfront:CreateInvalidation",
        "cloudfront:GetInvalidation"
      ],
      "Resource": "*"
    },
    {
      "Sid": "CloudWatchLogs",
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents",
        "cloudwatch:PutMetricData"
      ],
      "Resource": "*"
    }
  ]
}
```
5. Click **Next**, name the policy `CloudDeployEC2Policy`, and click **Create policy**.
6. Return to the Role creation tab, refresh the list, search and select `CloudDeployEC2Policy`.
7. Name the role: `CloudDeploy-EC2-Backend-Role` and click **Create role**.

---

## Phase 2: S3 Buckets & CloudFront CDN

CloudDeploy uses two distinct S3 buckets:
1. **Uploads Staging Bucket**: Stores raw `.zip` archives uploaded by tenants.
2. **Published Sites Bucket**: Stores unzipped static HTML/CSS/JS files, delivered via CloudFront.

### Step 2.1: Create the Uploads Staging Bucket
1. Go to **S3 Console** > **Create bucket**.
2. **Bucket name**: `clouddeploy-uploads-<your-account-id>-<region>` (e.g., `clouddeploy-uploads-941905484053-ap-south-1`).
3. **Region**: Select your region (e.g., `ap-south-1`).
4. **Block Public Access**: Keep **Block all public access** CHECKED `[x]`.
5. **Encryption**: Server-side encryption with Amazon S3 managed keys (**SSE-S3**).
6. Click **Create bucket**.

### Step 2.2: Create the Published Sites Bucket
1. Click **Create bucket** again.
2. **Bucket name**: `clouddeploy-sites-<your-account-id>-<region>` (e.g., `clouddeploy-sites-941905484053-ap-south-1`).
3. **Region**: Select your region (e.g., `ap-south-1`).
4. **Block Public Access**: Keep **Block all public access** CHECKED `[x]`.
5. **Encryption**: **SSE-S3**.
6. Click **Create bucket**.

---

### Step 2.3: Create CloudFront CDN with Origin Access Control (OAC)
CloudFront distributes user websites globally while keeping the S3 bucket 100% private.

1. Go to **CloudFront Console** > **Create distribution**.
2. **Origin domain**: Click the dropdown and select your **Published Sites Bucket** (`clouddeploy-sites-...s3.amazonaws.com`).
3. **Origin access**: Select **Origin access control settings (recommended)**.
   - Click **Create control setting** > Name: `clouddeploy-sites-oac` > Click **Create**.
4. **Default cache behavior**:
   - **Viewer protocol policy**: Select `Redirect HTTP to HTTPS`.
   - **Allowed HTTP methods**: Select `GET, HEAD, OPTIONS`.
   - **Cache policy**: Select `CachingOptimized`.
5. **Custom error responses** *(CRITICAL for client-side routing / SPAs)*:
   - Click **Add custom error response**:
     - HTTP error code: `404: Not Found`
     - Customize error response: `Yes`
     - Response page path: `/index.html`
     - HTTP response code: `200: OK`
     - Error caching minimum TTL: `10`
6. Click **Create distribution**.
7. **Copy Bucket Policy to S3**:
   - CloudFront will show an alert banner: *"You need to update your S3 bucket policy"*.
   - Click **Copy policy**.
   - Go to **S3** > Click your sites bucket (`clouddeploy-sites-...`) > **Permissions** tab.
   - Scroll down to **Bucket policy** > Click **Edit** > Paste the JSON policy > Click **Save changes**.
8. Note down your:
   - **Distribution ID** (e.g., `E2VP7RB0IJ10UB`)
   - **Distribution Domain Name** (e.g., `d2cxu429uj7b19.cloudfront.net`)

---

## Phase 3: Amazon Cognito User Authentication

Provides SaaS user registration, email verification, and secure JWT issuance.

1. Go to **Cognito Console** > **Create user pool**.
2. **Step 1 (Sign-in experience)**:
   - Check `Email` `[x]`. Click **Next**.
3. **Step 2 (Security requirements)**:
   - Password policy: Default.
   - Multi-factor authentication (MFA): `No MFA` (for simple setup) or `Optional MFA`.
   - User account recovery: Check `Enable self-service account recovery` (Email). Click **Next**.
4. **Step 3 (Sign-up experience)**:
   - Check `Enable self-registration` `[x]`.
   - Required attributes: `email`. Click **Next**.
5. **Step 4 (Message delivery)**:
   - Select `Send email with Cognito`. Click **Next**.
6. **Step 5 (Integrate your app)**:
   - User pool name: `clouddeploy-users`.
   - Hosted authentication pages: Unchecked.
   - Initial app client:
     - App type: **Public client**.
     - App client name: `clouddeploy-client`.
     - Client secret: Select **Don't generate a client secret** *(Required for React frontend)*.
7. Click **Create user pool**.
8. Note down:
   - **User Pool ID**: (e.g., `ap-south-1_xxxxxxxxx` on Pool Overview).
   - **Client ID**: (e.g., `59ofng9j08tj6ftf5rmosqv0m4` on App Integration tab).

---

## Phase 4: Database Setup (Amazon RDS MySQL)

### Step 4.1: Create DB Subnet Group & Security Group
1. Go to **RDS Console** > **Subnet groups** > **Create DB subnet group**:
   - Name: `clouddeploy-db-subnet-group`
   - Select default VPC and choose at least 2 Availability Zones.
2. Go to **EC2 Console** > **Security Groups** > **Create security group**:
   - Name: `clouddeploy-rds-sg`
   - Inbound Rules:
     - Type: `MySQL/Aurora` (Port 3306)
     - Source: Security group of your EC2 instance (or your VPC CIDR `172.31.0.0/16`).

### Step 4.2: Create RDS MySQL Database
1. Go to **RDS Console** > **Databases** > **Create database**.
2. **Engine type**: `MySQL` (version `8.0`).
3. **Templates**: Select **Free tier**.
4. **Settings**:
   - DB instance identifier: `clouddeploy-db`
   - Master username: `clouddeploy_admin`
   - Master password: Enter a strong password (e.g., `CloudDeploy2026Secure!`).
5. **Instance configuration**: `db.t4g.micro` or `db.t3.micro`.
6. **Connectivity**:
   - VPC: Default VPC.
   - DB Subnet group: `clouddeploy-db-subnet-group`.
   - Public access: `No` (keeps database private).
   - Security group: Select `clouddeploy-rds-sg`.
7. **Additional configuration**:
   - Initial database name: `clouddeploy`.
8. Click **Create database** (takes 4–6 minutes to become available).
9. Once available, copy the **Endpoint** (e.g., `clouddeploy-db.xxxxxx.ap-south-1.rds.amazonaws.com`).

---

## Phase 5: Launch & Configure EC2 Server

### Step 5.1: Create EC2 Security Group
1. Go to **EC2 Console** > **Security Groups** > **Create security group**.
2. Name: `clouddeploy-web-sg`.
3. Inbound Rules:
   - **HTTP** (Port 80) -> Source: `0.0.0.0/0`
   - **HTTPS** (Port 443) -> Source: `0.0.0.0/0`
   - **SSH** (Port 22) -> Source: `My IP` (for secure administration)
   - *(Optional for testing)*: **Custom TCP** (Port 8080) -> Source: `0.0.0.0/0`

### Step 5.2: Launch EC2 Instance
1. Go to **EC2 Console** > **Launch instance**.
2. **Name**: `clouddeploy-app-server`.
3. **AMI**: `Amazon Linux 2023 AMI` (or `Ubuntu 24.04 LTS`).
4. **Architecture**: `64-bit (x86)` or `64-bit (Arm)`.
5. **Instance type**: `t3.small` (x86) or `t4g.small` (Arm) — recommended for running Java 21 smoothly.
6. **Key pair**: Select or create a `.pem` key pair for SSH access.
7. **Network settings**:
   - Select default VPC.
   - Auto-assign public IP: **Enable**.
   - Select existing security group: `clouddeploy-web-sg`.
8. **Advanced details**:
   - **IAM instance profile**: Select `CloudDeploy-EC2-Backend-Role` (created in Step 1.1).
9. Click **Launch instance**.

---

## Phase 6: Server Setup & Backend Deployment

SSH into your EC2 instance:
```bash
ssh -i "your-key.pem" ec2-user@<EC2-PUBLIC-IP>
```

### Step 6.1: Install Dependencies (Java 21, Nginx, Git)
Run on EC2:
```bash
# Update packages
sudo dnf update -y

# Install Amazon Corretto 21 (Java Runtime)
sudo dnf install -y java-21-amazon-corretto-headless git nginx

# Verify Java
java -version

# Start and enable Nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

### Step 6.2: Build & Package the Backend JAR Locally
On your local machine:
```bash
cd backend
mvn clean package -DskipTests
```
This produces `target/clouddeploy-backend-1.0.0.jar`.

Transfer the JAR to your EC2 instance:
```bash
scp -i "your-key.pem" target/clouddeploy-backend-1.0.0.jar ec2-user@<EC2-PUBLIC-IP>:/home/ec2-user/
```

### Step 6.3: Configure Production Environment Variables on EC2
On the EC2 server, create the environment directory:
```bash
sudo mkdir -p /etc/clouddeploy
sudo nano /etc/clouddeploy/application.env
```

Paste the following configuration (replace with your real values):
```ini
SPRING_PROFILES_ACTIVE=prod
SERVER_PORT=8080

# RDS MySQL Connection
RDS_HOSTNAME=clouddeploy-db.xxxxxx.ap-south-1.rds.amazonaws.com
RDS_PORT=3306
RDS_DB_NAME=clouddeploy
RDS_USERNAME=clouddeploy_admin
RDS_PASSWORD=YourRdsPasswordHere

# AWS Services
AWS_REGION=ap-south-1
APP_STORAGE_MODE=s3
AWS_S3_UPLOAD_BUCKET=clouddeploy-uploads-941905484053-ap-south-1
AWS_S3_SITE_BUCKET=clouddeploy-sites-941905484053-ap-south-1

# Amazon Cognito
AWS_COGNITO_USER_POOL_ID=ap-south-1_xxxxxxxxx
AWS_COGNITO_CLIENT_ID=59ofng9j08tj6ftf5rmosqv0m4
AWS_COGNITO_REGION=ap-south-1

# Amazon CloudFront
AWS_CLOUDFRONT_DISTRIBUTION_ID=E2VP7RB0IJ10UB
AWS_CLOUDFRONT_DOMAIN=d2cxu429uj7b19.cloudfront.net

# SaaS Platform Security & Limits
JWT_SECRET=super-secure-production-jwt-token-at-least-32-characters-long
APP_BASE_DOMAIN=d2cxu429uj7b19.cloudfront.net
APP_UPLOAD_MAX_BYTES=52428800
APP_MAX_FILES_PER_DEPLOYMENT=1000
APP_MAX_EXTRACTED_BYTES=262144000
APP_MAX_PROJECTS_PER_USER=3
```
Secure the permissions:
```bash
sudo chmod 600 /etc/clouddeploy/application.env
```

### Step 6.4: Configure Systemd Service for Spring Boot
Create a systemd unit so the backend restarts automatically on reboot or failures:
```bash
sudo nano /etc/systemd/system/clouddeploy.service
```

Paste:
```ini
[Unit]
Description=CloudDeploy SaaS Backend
After=network.target

[Service]
User=ec2-user
WorkingDirectory=/home/ec2-user
EnvironmentFile=/etc/clouddeploy/application.env
ExecStart=/usr/bin/java -Xms256m -Xmx768m -jar /home/ec2-user/clouddeploy-backend-1.0.0.jar
SuccessExitStatus=143
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Reload and start the backend service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable clouddeploy
sudo systemctl start clouddeploy

# Check status
sudo systemctl status clouddeploy
```

Verify backend health check:
```bash
curl http://localhost:8080/actuator/health
# Expected: {"status":"UP"}
```

---

## Phase 7: Building and Deploying Frontend

### Step 7.1: Build Frontend Locally
On your local computer, configure `frontend/.env.production`:
```ini
VITE_API_BASE_URL=http://<EC2-PUBLIC-IP-OR-DOMAIN>/api
VITE_DEMO_MODE=false
VITE_COGNITO_USER_POOL_ID=ap-south-1_xxxxxxxxx
VITE_COGNITO_CLIENT_ID=59ofng9j08tj6ftf5rmosqv0m4
VITE_COGNITO_REGION=ap-south-1
```

Build the optimized production static bundle:
```bash
cd frontend
npm run build
```
This produces the distribution files in `frontend/dist/`.

### Step 7.2: Upload Frontend Bundle to EC2
```bash
# Upload dist files to EC2
scp -i "your-key.pem" -r dist/* ec2-user@<EC2-PUBLIC-IP>:/home/ec2-user/frontend-dist/
```

On EC2, move the files to web root:
```bash
sudo mkdir -p /var/www/clouddeploy
sudo cp -r /home/ec2-user/frontend-dist/* /var/www/clouddeploy/
sudo chown -R nginx:nginx /var/www/clouddeploy
```

---

## Phase 8: Configure Nginx (Reverse Proxy & SPA Router)

On EC2, edit the Nginx configuration:
```bash
sudo nano /etc/nginx/conf.d/clouddeploy.conf
```

Paste:
```nginx
server {
    listen 80;
    server_name _;

    root /var/www/clouddeploy;
    index index.html;

    # Allow up to 60MB file uploads for zip archives
    client_max_body_size 60M;

    # Frontend Single Page Application routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to Spring Boot backend
    location /api/ {
        proxy_pass http://127.0.0.1:8080/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 90;
    }

    # Spring Boot Actuator health endpoint
    location /actuator/health {
        proxy_pass http://127.0.0.1:8080/actuator/health;
    }
}
```

Test and reload Nginx:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## Phase 9: End-to-End Verification Checklist

1. **Access SaaS Dashboard**:
   - Open `http://<EC2-PUBLIC-IP>` in your browser.
   - The modern CloudDeploy editorial landing page and dashboard should load.
2. **Register/Login User**:
   - Click Sign Up / Login. Verify user creation and authentication.
3. **Verify Free Tier Quota**:
   - Observe default plan shows **Free Plan (3 Sites limit)**.
4. **Deploy Your First Live Static Site**:
   - Prepare a sample `website.zip` containing an `index.html`.
   - Create a project: `my-first-site`.
   - Upload `website.zip`.
   - Confirm backend safely extracts files into the S3 published bucket (`clouddeploy-sites-...`).
5. **Visit the Live Site via CloudFront**:
   - Click the generated CloudFront URL (e.g., `https://d2cxu429uj7b19.cloudfront.net/sites/<site-id>/index.html`).
   - Confirm the static site loads with global HTTPS encryption!

---

## 💡 Cost-Optimization & Free Tier Summary

| AWS Component | Free Tier / Cost Strategy | Monthly Cost |
| :--- | :--- | :--- |
| **Amazon S3** | 5 GB standard storage included in Free Tier | $0.00 |
| **Amazon CloudFront** | 1 TB outbound transfer + 10M requests free | $0.00 |
| **Amazon Cognito** | 50,000 monthly active users (MAUs) free | $0.00 |
| **Amazon RDS MySQL** | 750 hours/mo `db.t3.micro` or `db.t4g.micro` free for 12 months | $0.00 |
| **Amazon EC2** | 750 hours/mo `t3.micro` free for 12 months (`t4g.small` is ~$12/mo) | $0.00 – $12.00 |
| **NAT Gateway** | **Bypassed completely** by using single public subnet with IGW | **Saved $32.00/mo** |
| **Total Estimated Cost** | Complete enterprise SaaS deployment | **$0.00 – $12.00/mo** |
