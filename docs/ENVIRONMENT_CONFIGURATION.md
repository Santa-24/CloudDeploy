# Environment Configuration Dictionary — CloudDeploy

This dictionary documents all configuration variables across the Frontend, Backend, and AWS Secrets Manager.

---

## 1. Frontend Configuration (`frontend/.env`)

> [!CAUTION]
> The frontend bundle is served publicly to client browsers. **NEVER** expose AWS Access Keys, Secret Keys, or Database Passwords in frontend environment files.

| Variable Name | Purpose | Required / Optional | Secret Classification | Where to Obtain Value | Consumer Component |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Base URL for the Spring Boot REST API | **Required** | **Non-Secret** | AWS ALB DNS Name or custom API domain (e.g. `https://api.clouddeploy.internal/api`) | Typed API Client (`apiClient.ts`) |
| `VITE_DEMO_MODE` | Toggles simulated mock AWS responses for offline preview | Optional (Default: `false`) | **Non-Secret** | Set to `true` for local demonstration, `false` for live AWS | UI Layouts & Mock Services |
| `VITE_COGNITO_USER_POOL_ID` | Amazon Cognito User Pool ID | Required for direct Cognito flow | **Non-Secret** | AWS Console > Cognito > User Pools > Pool ID | Frontend Auth Client |
| `VITE_COGNITO_CLIENT_ID` | Public Cognito App Client ID | Required for direct Cognito flow | **Non-Secret** | AWS Console > Cognito > User Pools > App integration > Client ID | Frontend Auth Client |
| `VITE_COGNITO_REGION` | AWS Region hosting Cognito User Pool | Optional (Default: `ap-south-1`) | **Non-Secret** | AWS Console Region selector | Frontend Auth Client |
 
---
 
## 2. Backend Configuration (`backend/application.yml` / `.env`)
 
| Variable Name | Purpose | Required / Optional | Secret Classification | Where to Obtain Value | Consumer Component |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `SPRING_PROFILES_ACTIVE` | Active Spring profile (`local`, `prod`) | **Required** | **Non-Secret** | Set `local` for offline H2 dev, `prod` for AWS EC2/RDS | Spring Boot Framework |
| `SERVER_PORT` | HTTP port for backend server | Optional (Default: `8080`) | **Non-Secret** | Host network configuration | Spring Web Embedded Tomcat |
| `AWS_REGION` | Target AWS Region for SDK clients | **Required** in Prod | **Non-Secret** | Target deployment region (e.g. `ap-south-1`) | `AwsConfig.java` |
| `AWS_S3_UPLOAD_BUCKET` | S3 bucket name for temporary uploads | **Required** in Prod | **Non-Secret** | S3 Console > Bucket Name | `S3StorageService.java` |
| `AWS_S3_SITE_BUCKET` | S3 bucket name for published websites | **Required** in Prod | **Non-Secret** | S3 Console > Bucket Name | `S3StorageService.java` |
| `AWS_CLOUDFRONT_DISTRIBUTION_ID` | CloudFront Distribution ID | **Required** in Prod | **Non-Secret** | CloudFront Console > Distribution ID (e.g. `E1ABC...`) | `CloudFrontDeliveryService.java` |
| `AWS_CLOUDFRONT_DOMAIN` | CloudFront distribution domain | **Required** in Prod | **Non-Secret** | CloudFront Console > Domain Name (e.g. `dxxx.cloudfront.net`) | `UrlGenerationService.java` |
| `AWS_COGNITO_USER_POOL_ID` | Cognito User Pool ID for JWT verification | **Required** in Prod | **Non-Secret** | Cognito Console > Pool Overview | `JwtAuthFilter.java` |
| `AWS_COGNITO_REGION` | Region for Cognito Identity Provider | Optional (Default: `ap-south-1`) | **Non-Secret** | Cognito Console | `AwsConfig.java` |
| `AWS_RDS_SECRET_ARN` | AWS Secrets Manager ARN storing DB credentials | **Required** in Prod | **Non-Secret ARN** (Secret content managed in AWS) | Secrets Manager Console > Secret ARN | Spring Cloud / Hikari DataSource |
| `RDS_HOSTNAME` | Database endpoint hostname | **Required** in Prod | **Non-Secret** | RDS Console > Databases > Connectivity > Endpoint | `application-prod.yml` |
| `RDS_PORT` | MySQL database listener port | Optional (Default: `3306`) | **Non-Secret** | RDS Console > Connectivity | `application-prod.yml` |
| `RDS_DB_NAME` | Database schema name | Optional (Default: `clouddeploy`) | **Non-Secret** | RDS Initial DB Name | `application-prod.yml` |
| `AWS_CLOUDWATCH_LOG_GROUP` | Centralized log group destination | Optional | **Non-Secret** | CloudWatch Console > Log groups | Spring Logback / AWS Appender |
| `AWS_SNS_ALERTS_TOPIC_ARN` | Operations SNS alerts topic ARN | Optional | **Non-Secret** | SNS Console > Topic ARN | `AwsConfig.java` |
| `APP_BASE_DOMAIN` | Base domain for customer website URLs | Optional | **Non-Secret** | Custom domain (e.g. `sites.example.com`) | `UrlGenerationService.java` |
| `APP_UPLOAD_MAX_BYTES` | Maximum compressed archive size | Optional (Default: `52428800` / 50MB) | **Non-Secret** | Application policy | `ArchiveValidator.java` |
| `APP_MAX_FILES_PER_DEPLOYMENT` | Decompression file count limit | Optional (Default: `1000`) | **Non-Secret** | Application policy | `ArchiveValidator.java` |
| `APP_MAX_EXTRACTED_BYTES` | Decompression size cap | Optional (Default: `262144000` / 250MB) | **Non-Secret** | Application policy | `ArchiveValidator.java` |
| `APP_MAX_PROJECTS_PER_USER` | Maximum website projects per tenant | Optional (Default: `10`) | **Non-Secret** | Tenant tier policy | `SiteService.java` |
| `JWT_SECRET` | Secret key for local token signing in dev | Required for local profile | **Secret (Local only)** | Developer generated 32-character string | `JwtAuthFilter.java` |

---

## 3. AWS Secrets Manager Key-Value Schema

| Secret Name / Identifier | Field Key | Value Type | Purpose | Managed Method |
| :--- | :--- | :--- | :--- | :--- |
| `clouddeploy/prod/rds/credentials` | `username` | String | Master MySQL administrative username (`clouddeploy_admin`) | Populated at initial DB creation |
| `clouddeploy/prod/rds/credentials` | `password` | String | Cryptographically random 32-character database password | Generated by Secrets Manager; rotated via Lambda |
| `clouddeploy/prod/rds/credentials` | `engine` | String | `mysql` | Configuration hint for secret consumers |
| `clouddeploy/prod/rds/credentials` | `host` | String | RDS instance hostname | RDS automated replication attribute |
| `clouddeploy/prod/rds/credentials` | `port` | Number | `3306` | MySQL port |
