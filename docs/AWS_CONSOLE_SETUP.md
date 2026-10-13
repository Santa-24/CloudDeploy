# AWS Console Setup Guide — CloudDeploy

This guide outlines the precise, step-by-step procedure for provisioning and configuring CloudDeploy infrastructure manually using the AWS Management Console. Follow these steps in exact numerical order to respect service dependencies.

---

## 1. Account Security & Region Selection

- **Exact AWS Service**: AWS Global Infrastructure
- **Navigation Path**: Top Navigation Bar > Region Selector
- **Recommended Region**: `ap-south-1` (Asia Pacific, Mumbai)
  > [!NOTE]
  > Regional resources (VPC, Subnets, EC2, RDS, Secrets Manager, S3, Cognito) are deployed in `ap-south-1`. Note that Amazon CloudFront ACM certificates require `us-east-1` for edge distributions.
- **Verification**: Ensure the region selector consistently displays `Mumbai (ap-south-1)` across all subsequent console tabs.

---

## 2. IAM & Security Foundations

### 2.1 Backend EC2 IAM Role
1. **Console Path**: `IAM > Roles > Create role`
2. **Trusted Entity**: AWS Service > `EC2`
3. **Permissions**: Click **Create policy** (JSON) and attach the least-privilege policy:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
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
         "Effect": "Allow",
         "Action": [
           "cloudfront:CreateInvalidation",
           "cloudfront:GetInvalidation"
         ],
         "Resource": "*"
       },
       {
         "Effect": "Allow",
         "Action": [
           "secretsmanager:GetSecretValue",
           "secretsmanager:DescribeSecret"
         ],
         "Resource": "arn:aws:secretsmanager:ap-south-1:*:secret:clouddeploy/*"
       },
       {
         "Effect": "Allow",
         "Action": [
           "logs:CreateLogStream",
           "logs:PutLogEvents",
           "logs:DescribeLogStreams",
           "cloudwatch:PutMetricData"
         ],
         "Resource": "*"
       },
       {
         "Effect": "Allow",
         "Action": "sns:Publish",
         "Resource": "arn:aws:sns:ap-south-1:*:clouddeploy-*"
       }
     ]
   }
   ```
4. **Role Name**: `clouddeploy-prod-backend-ec2-role`
5. **Expected Identifier**: `arn:aws:iam::<account-id>:role/clouddeploy-prod-backend-ec2-role`
6. **Consumer Setting**: Attached to EC2 Launch Template instance profile.

---

## 3. VPC & Network Infrastructure

1. **Console Path**: `VPC > Create VPC`
2. **VPC Settings**:
   - Resources to create: **VPC and more**
   - Name tag: `clouddeploy-prod`
   - IPv4 CIDR: `10.0.0.0/16`
   - Number of Availability Zones: `2`
   - Number of public subnets: `2` (`10.0.1.0/24`, `10.0.2.0/24`)
   - Number of private subnets: `4` (2 for App `10.0.10.0/24`, `10.0.11.0/24`; 2 for DB `10.0.20.0/24`, `10.0.21.0/24`)
   - NAT gateways: **1 per AZ** (or **1 in 1 AZ** for cost savings during development)
   - VPC endpoints: S3 Gateway (Recommended)
3. **Security Groups Creation**:
   - `clouddeploy-prod-alb-sg`: Inbound TCP 80 & 443 from `0.0.0.0/0`.
   - `clouddeploy-prod-app-sg`: Inbound TCP 8080 from `clouddeploy-prod-alb-sg`.
   - `clouddeploy-prod-rds-sg`: Inbound TCP 3306 from `clouddeploy-prod-app-sg`.

---

## 4. Amazon S3 Buckets Setup

### 4.1 Staging Upload Bucket
1. **Console Path**: `S3 > Create bucket`
2. **Bucket Name**: `clouddeploy-prod-uploads-<your-account-id>-ap-south-1`
3. **Block Public Access**: **Keep all 4 checkboxes enabled** (Block Public Access: ON).
4. **Default Encryption**: Server-side encryption with Amazon S3 managed keys (`SSE-S3`).
5. **Lifecycle Rule**: Create rule `CleanOldStagingUploads` expiring non-current objects after 7 days and aborting incomplete multipart uploads after 1 day.
6. **Consumer Setting**: `AWS_S3_UPLOAD_BUCKET` in backend environment.

### 4.2 Published Sites Bucket
1. **Console Path**: `S3 > Create bucket`
2. **Bucket Name**: `clouddeploy-prod-sites-<your-account-id>-ap-south-1`
3. **Block Public Access**: **Keep all 4 checkboxes enabled** (Block Public Access: ON).
4. **Default Encryption**: `SSE-S3`.
5. **Consumer Setting**: `AWS_S3_SITE_BUCKET` in backend environment.

---

## 5. Amazon RDS & AWS Secrets Manager

### 5.1 Secrets Manager Secret
1. **Console Path**: `Secrets Manager > Store a new secret`
2. **Secret Type**: Credentials for Amazon RDS database
3. **Username**: `clouddeploy_admin`
4. **Password**: Generate 32-character password (exclude `/@\"`)
5. **Secret Name**: `clouddeploy/prod/rds/credentials`
6. **Consumer Setting**: `AWS_RDS_SECRET_ARN` in backend environment.

### 5.2 RDS MySQL Database
1. **Console Path**: `RDS > Databases > Create database`
2. **Database Engine**: `MySQL 8.0`
3. **Template**: Production (or Free tier for testing)
4. **DB Instance Identifier**: `clouddeploy-prod-mysql`
5. **Master Credentials**: Manage in AWS Secrets Manager (select secret created above)
6. **Instance Configuration**: `db.t4g.micro` or `db.t4g.small`
7. **Storage**: 20 GB gp3 with storage autoscaling enabled
8. **Connectivity**:
   - Virtual Private Cloud: `clouddeploy-prod-vpc`
   - DB Subnet Group: Create group containing Private DB Subnets 1 & 2
   - Public Access: **No**
   - VPC Security Group: `clouddeploy-prod-rds-sg`
9. **Initial Database Name**: `clouddeploy`
10. **Consumer Setting**: `RDS_HOSTNAME` in backend environment.

---

## 6. Amazon Cognito User Pool

1. **Console Path**: `Cognito > User pools > Create user pool`
2. **Step 1 (Sign-in experience)**: Cognito user pool sign-in options: **Email**.
3. **Step 2 (Security requirements)**: Password policy: Minimum 8 characters with numbers and symbols. MFA: Optional or Required.
4. **Step 3 (Sign-up experience)**: Self-service sign-up enabled. Attribute verification: Send email message.
5. **Step 4 (Message delivery)**: Send email with Cognito (or SES for production).
6. **Step 5 (Integrate your app)**:
   - User pool name: `clouddeploy-prod-users`
   - App client name: `clouddeploy-prod-spa-client`
   - Client secret: **Don't generate a client secret** (Public client).
7. **Expected Values**:
   - User Pool ID: e.g. `ap-south-1_aBcDeFg12` (`AWS_COGNITO_USER_POOL_ID` / `VITE_COGNITO_USER_POOL_ID`)
   - Client ID: e.g. `7a8b9c0d1e2f3g4h5i6j` (`VITE_COGNITO_CLIENT_ID`)

---

## 7. Amazon CloudFront & Origin Access Control (OAC)

1. **Console Path**: `CloudFront > Create distribution`
2. **Origin Domain**: Select `clouddeploy-prod-sites-...s3.amazonaws.com`.
3. **Origin Access**: Choose **Origin access control settings (recommended)** > Create new OAC (`clouddeploy-prod-s3-oac`).
4. **Default Cache Behavior**:
   - Viewer protocol policy: **Redirect HTTP to HTTPS**.
   - Allowed HTTP methods: `GET, HEAD, OPTIONS`.
   - Cache policy: **CachingOptimized**.
5. **Custom Error Responses**:
   - HTTP Error code: `404` > Customize error response > Response page path: `/index.html` > HTTP Response code: `200`.
6. **Attach S3 Bucket Policy**:
   - Copy the provided policy banner from CloudFront and paste into `SiteAssetsBucket > Permissions > Bucket Policy`.
7. **Consumer Settings**:
   - Distribution ID: `AWS_CLOUDFRONT_DISTRIBUTION_ID`
   - Distribution Domain: `AWS_CLOUDFRONT_DOMAIN`

---

## 8. Compute: ALB, Launch Template & Auto Scaling Group

1. **Target Group**:
   - Path: `EC2 > Target Groups > Create target group`
   - Target type: Instances > Protocol: HTTP > Port: 8080 > VPC: `clouddeploy-prod-vpc`
   - Health check path: `/actuator/health`
2. **Application Load Balancer**:
   - Path: `EC2 > Load Balancers > Create Application Load Balancer`
   - Name: `clouddeploy-prod-alb` > Scheme: Internet-facing > VPC & Public Subnets
   - Security Group: `clouddeploy-prod-alb-sg`
   - Listener HTTP:80 forwarding to Target Group.
3. **Launch Template**:
   - Name: `clouddeploy-prod-lt` > AMI: Amazon Linux 2023 ARM64 > Type: `t4g.small`
   - IAM Instance Profile: `clouddeploy-prod-backend-profile`
   - Security Group: `clouddeploy-prod-app-sg`
4. **Auto Scaling Group**:
   - Name: `clouddeploy-prod-asg` > VPC & Private App Subnets 1 & 2
   - Capacity: Min 1, Desired 1, Max 3 > Attached to Target Group.

---

## 9. Observability: CloudWatch & SNS

1. **Log Group**: `CloudWatch > Logs > Log groups > Create log group`
   - Name: `/aws/clouddeploy/prod/application` (Retention: 30 days)
2. **SNS Topic**: `SNS > Topics > Create topic`
   - Name: `clouddeploy-prod-ops-alerts`
   - Create subscription with your operations email address.
3. **CloudWatch Alarm**: Create alarm on Metric `AWS/ApplicationELB > UnHealthyHostCount` threshold >= 1, sending notification to SNS topic.

---

## 10. Verification & Production Cutover

1. Access the ALB DNS name or custom domain in browser: `http://<alb-dns-name>/actuator/health` -> verify status is `UP`.
2. Open CloudDeploy Frontend, register an administrative account.
3. Create project `atelier-test`, upload sample static ZIP archive.
4. Verify backend extracts files, uploads to S3 prefix `sites/<siteId>/deployments/<depId>/`, invalidates CloudFront, and returns live URL.
5. Visit the live URL to confirm global CDN delivery.

---

## 11. Cost Drivers & Cleanup Guidance

| Service | Cost Drivers | Optimization Strategy | Cleanup Command / Console Action |
| :--- | :--- | :--- | :--- |
| **NAT Gateway** | $0.045/hour + $0.045/GB data processed | Use 1 NAT GW for non-critical stages, delete when idle. | `VPC > NAT gateways > Delete NAT gateway` |
| **Amazon RDS** | Instance runtime ($0.016/hr for t4g.micro) + gp3 storage | Stop instance when inactive; take snapshot before termination. | `RDS > Databases > Select DB > Actions > Delete` |
| **EC2 / ASG** | Instance compute hours ($0.0168/hr for t4g.small) | Set ASG desired/min capacity to 0 when not running tests. | `Auto Scaling Groups > Edit capacity to 0` |
| **ALB** | $0.0225/hour + LCU usage | Delete ALB if staging environment is paused. | `EC2 > Load Balancers > Delete` |
| **S3 Buckets** | $0.023/GB-month storage | Empty staging and site buckets prior to bucket deletion. | `S3 > Empty bucket > Delete bucket` |
