# ==============================================================================
# CloudDeploy - Full Project Resources Cleanup Script
# Region: ap-south-1 | Account: 941905484053
# ==============================================================================
$ErrorActionPreference = "Continue"
$Region = "ap-south-1"

Write-Host "--- [1/7] Deleting S3 Buckets ---" -ForegroundColor Yellow
$buckets = @(
    "clouddeploy-uploads-941905484053-ap-south-1",
    "clouddeploy-sites-941905484053-ap-south-1"
)
foreach ($b in $buckets) {
    Write-Host "Force deleting bucket $b..."
    aws s3 rb "s3://$b" --force 2>&1
}

Write-Host "`n--- [2/7] Deleting VPC Subnets & Security Groups ---" -ForegroundColor Yellow
$vpcId = "vpc-01c37a36d109b9935"

# Security groups in the custom VPC
$sgs = @(
    "sg-06bbfc02e25db53bc",
    "sg-051016a624358c072",
    "sg-0aa2b793c75151928",
    "sg-03f22cb7b530af882"
)

# Also check default VPC clouddeploy security group
$defaultVpcSg = "sg-0fcb8f78529c9dfcd"

foreach ($sg in ($sgs + @($defaultVpcSg))) {
    Write-Host "Revoking rules for $sg..."
    # Revoke ingress
    $ingressJson = aws ec2 describe-security-groups --group-ids $sg --region $Region --query "SecurityGroups[0].IpPermissions" --output json
    if ($ingressJson -and $ingressJson.Trim() -ne "[]") {
        aws ec2 revoke-security-group-ingress --group-id $sg --ip-permissions $ingressJson --region $Region 2>&1 | Out-Null
    }
    # Revoke egress
    $egressJson = aws ec2 describe-security-groups --group-ids $sg --region $Region --query "SecurityGroups[0].IpPermissionsEgress" --output json
    if ($egressJson -and $egressJson.Trim() -ne "[]") {
        aws ec2 revoke-security-group-egress --group-id $sg --ip-permissions $egressJson --region $Region 2>&1 | Out-Null
    }
}

foreach ($sg in ($sgs + @($defaultVpcSg))) {
    Write-Host "Deleting security group $sg..."
    aws ec2 delete-security-group --group-id $sg --region $Region 2>&1
}

$subnets = @(
    "subnet-042d126492cba6163",
    "subnet-05276642492b1605b",
    "subnet-06df79f2339b7c8bc",
    "subnet-0bee7ed3eff1d77e5",
    "subnet-05b630527841be94a",
    "subnet-01e1d5c918aa81913"
)
foreach ($sub in $subnets) {
    Write-Host "Deleting subnet $sub..."
    aws ec2 delete-subnet --subnet-id $sub --region $Region 2>&1
}

Write-Host "Deleting VPC $vpcId..."
aws ec2 delete-vpc --vpc-id $vpcId --region $Region 2>&1

Write-Host "`n--- [3/7] Deleting Key Pair ---" -ForegroundColor Yellow
aws ec2 delete-key-pair --key-name clouddeploy-key --region $Region 2>&1

Write-Host "`n--- [4/7] Deleting Cognito User Pool ---" -ForegroundColor Yellow
aws cognito-idp delete-user-pool --user-pool-id ap-south-1_lM8ZvZyah --region $Region 2>&1

Write-Host "`n--- [5/7] Deleting Secrets Manager Secret ---" -ForegroundColor Yellow
aws secretsmanager delete-secret --secret-id "arn:aws:secretsmanager:ap-south-1:941905484053:secret:clouddeploy/prod/rds/credentials-3wChku" --force-delete-without-recovery --region $Region 2>&1

Write-Host "`n--- [6/7] Deleting SNS Alert Topic ---" -ForegroundColor Yellow
aws sns delete-topic --topic-arn "arn:aws:sns:ap-south-1:941905484053:clouddeploy-ops-alerts" --region $Region 2>&1

Write-Host "`n--- [7/7] Disabling CloudFront Distribution ---" -ForegroundColor Yellow
$cfId = "E2VP7RB0IJ10UB"
$distConfigOutput = aws cloudfront get-distribution-config --id $cfId --output json 2>&1
if ($LASTEXITCODE -eq 0) {
    $etag = aws cloudfront get-distribution --id $cfId --query "ETag" --output text
    $distObj = $distConfigOutput | ConvertFrom-Json
    $distObj.DistributionConfig.Enabled = $false
    $newConfigJson = $distObj.DistributionConfig | ConvertTo-Json -Depth 10
    $tempFile = Join-Path $PSScriptRoot "cf-disable-config.json"
    $newConfigJson | Set-Content -Path $tempFile -Encoding utf8
    aws cloudfront update-distribution --id $cfId --distribution-config "file://$tempFile" --if-match $etag 2>&1
    if (Test-Path $tempFile) { Remove-Item $tempFile -Force }
    Write-Host "CloudFront distribution $cfId disabled (transitioning to disabled)."
}

Write-Host "`n==========================================================" -ForegroundColor Green
Write-Host " All CloudDeploy resources deletion routine finished." -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
