# ==============================================================================
# CloudDeploy — Automated AWS CLI Resource Provisioning Script
# Region: ap-south-1 (Mumbai) | Account: 941905484053
# ==============================================================================
param(
    [string]$Region = "ap-south-1",
    [string]$AccountId = "941905484053"
)

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " CloudDeploy -- Automated AWS CLI Provisioning" -ForegroundColor Cyan
Write-Host " Region: $Region | Account: $AccountId" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$UploadBucket = "clouddeploy-uploads-$AccountId-$Region"
$SitesBucket = "clouddeploy-sites-$AccountId-$Region"
$PoolName = "clouddeploy-users"
$ClientName = "clouddeploy-client"

# 1. S3 Uploads Bucket
Write-Host "`n[1/4] Creating S3 Uploads Bucket: $UploadBucket..." -ForegroundColor Yellow
$createUploadArgs = @("s3api", "create-bucket", "--bucket", $UploadBucket, "--region", $Region, "--create-bucket-configuration", "LocationConstraint=$Region")
$res1 = & aws $createUploadArgs 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  [OK] Uploads Bucket created: $UploadBucket" -ForegroundColor Green
} else {
    Write-Host "  [!] Uploads bucket message: $res1" -ForegroundColor Yellow
}

# 2. S3 Sites Bucket
Write-Host "`n[2/4] Creating S3 Sites Bucket: $SitesBucket..." -ForegroundColor Yellow
$createSitesArgs = @("s3api", "create-bucket", "--bucket", $SitesBucket, "--region", $Region, "--create-bucket-configuration", "LocationConstraint=$Region")
$res2 = & aws $createSitesArgs 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  [OK] Sites Bucket created: $SitesBucket" -ForegroundColor Green
} else {
    Write-Host "  [!] Sites bucket message: $res2" -ForegroundColor Yellow
}

# 3. Cognito User Pool
Write-Host "`n[3/4] Creating Amazon Cognito User Pool: $PoolName..." -ForegroundColor Yellow
$UserPoolId = ""
$cognitoPoolArgs = @("cognito-idp", "create-user-pool", "--pool-name", $PoolName, "--auto-verified-attributes", "email", "--username-attributes", "email", "--region", $Region)
$poolOutput = & aws $cognitoPoolArgs 2>&1
if ($LASTEXITCODE -eq 0) {
    try {
        $poolObj = $poolOutput | ConvertFrom-Json
        $UserPoolId = $poolObj.UserPool.Id
        Write-Host "  [OK] Created User Pool ID: $UserPoolId" -ForegroundColor Green
    } catch {
        Write-Host "  [!] Parse error: $_" -ForegroundColor Red
    }
} else {
    Write-Host "  [!] Cognito User Pool message: $poolOutput" -ForegroundColor Yellow
}

# 4. Cognito App Client
$ClientId = ""
if ($UserPoolId) {
    Write-Host "`n[4/4] Creating Cognito App Client: $ClientName..." -ForegroundColor Yellow
    $cognitoClientArgs = @("cognito-idp", "create-user-pool-client", "--user-pool-id", $UserPoolId, "--client-name", $ClientName, "--no-generate-secret", "--explicit-auth-flows", "ALLOW_USER_PASSWORD_AUTH", "ALLOW_REFRESH_TOKEN_AUTH", "ALLOW_USER_SRP_AUTH", "--region", $Region)
    $clientOutput = & aws $cognitoClientArgs 2>&1
    if ($LASTEXITCODE -eq 0) {
        try {
            $clientObj = $clientOutput | ConvertFrom-Json
            $ClientId = $clientObj.UserPoolClient.ClientId
            Write-Host "  [OK] Created App Client ID: $ClientId" -ForegroundColor Green
        } catch {
            Write-Host "  [!] Parse error: $_" -ForegroundColor Red
        }
    } else {
        Write-Host "  [!] Cognito App Client message: $clientOutput" -ForegroundColor Yellow
    }
}

# 5. Update .env files
Write-Host "`n[5/5] Updating environment files..." -ForegroundColor Yellow

$backendEnvPath = Join-Path $PSScriptRoot "backend\.env"
$rootEnvPath = Join-Path $PSScriptRoot ".env"
$frontendEnvPath = Join-Path $PSScriptRoot "frontend\.env.local"

if (Test-Path $backendEnvPath) {
    $content = Get-Content $backendEnvPath -Raw
    $content = $content -replace "AWS_S3_UPLOAD_BUCKET=.*", "AWS_S3_UPLOAD_BUCKET=$UploadBucket"
    $content = $content -replace "AWS_S3_SITE_BUCKET=.*", "AWS_S3_SITE_BUCKET=$SitesBucket"
    if ($UserPoolId) {
        $content = $content -replace "AWS_COGNITO_USER_POOL_ID=.*", "AWS_COGNITO_USER_POOL_ID=$UserPoolId"
    }
    if ($ClientId) {
        $content = $content -replace "AWS_COGNITO_CLIENT_ID=.*", "AWS_COGNITO_CLIENT_ID=$ClientId"
    }
    Set-Content -Path $backendEnvPath -Value $content -NoNewline
    Set-Content -Path $rootEnvPath -Value $content -NoNewline
    Write-Host "  [OK] Updated backend/.env and .env" -ForegroundColor Green
}

if (Test-Path $frontendEnvPath) {
    $frontContent = Get-Content $frontendEnvPath -Raw
    if ($UserPoolId) {
        $frontContent = $frontContent -replace "VITE_COGNITO_USER_POOL_ID=.*", "VITE_COGNITO_USER_POOL_ID=$UserPoolId"
    }
    if ($ClientId) {
        $frontContent = $frontContent -replace "VITE_COGNITO_CLIENT_ID=.*", "VITE_COGNITO_CLIENT_ID=$ClientId"
    }
    Set-Content -Path $frontendEnvPath -Value $frontContent -NoNewline
    Write-Host "  [OK] Updated frontend/.env.local" -ForegroundColor Green
}

Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host " Provisioning Status Summary:" -ForegroundColor Cyan
Write-Host " Upload Bucket: $UploadBucket" -ForegroundColor White
Write-Host " Sites Bucket:  $SitesBucket" -ForegroundColor White
Write-Host " User Pool ID:  $UserPoolId" -ForegroundColor White
Write-Host " App Client ID: $ClientId" -ForegroundColor White
Write-Host " Region:        $Region" -ForegroundColor White
Write-Host "==========================================================" -ForegroundColor Cyan
