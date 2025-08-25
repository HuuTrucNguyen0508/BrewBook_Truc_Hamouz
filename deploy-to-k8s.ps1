param(
    [Parameter(Mandatory=$false)]
    [string]$ImageTag,
    
    [Parameter(Mandatory=$false)]
    [string]$SupabaseUrl,
    
    [Parameter(Mandatory=$false)]
    [string]$SupabaseAnonKey
)

Write-Host "🚀 Deploying BrewBook to Kubernetes..." -ForegroundColor Green

# Read DockerHub username from .env.local
if (Test-Path ".env.local") {
    $envContent = Get-Content ".env.local"
    $envVars = @{}
    
    foreach ($line in $envContent) {
        if ($line -match "^([^#][^=]+)=(.*)$") {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            $envVars[$key] = $value
        }
    }
    
    $DockerHubUsername = $envVars["DOCKER_IMAGE_NAME"].Split('/')[0]
    if (-not $ImageTag) { $ImageTag = $envVars["DOCKER_IMAGE_TAG"] }
    if (-not $SupabaseUrl) { $SupabaseUrl = $envVars["NEXT_PUBLIC_SUPABASE_URL"] }
    if (-not $SupabaseAnonKey) { $SupabaseAnonKey = $envVars["NEXT_PUBLIC_SUPABASE_ANON_KEY"] }
}

# Validate required values
if (-not $DockerHubUsername -or -not $ImageTag -or -not $SupabaseUrl -or -not $SupabaseAnonKey) {
    Write-Host "❌ Missing required values!" -ForegroundColor Red
    Write-Host "Please ensure .env.local contains: DOCKER_IMAGE_NAME, DOCKER_IMAGE_TAG, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY" -ForegroundColor Yellow
    exit 1
}

Write-Host "📦 Using DockerHub username: $DockerHubUsername" -ForegroundColor Cyan
Write-Host "🏷️ Using image tag: $ImageTag" -ForegroundColor Cyan

# Step 1: Build and push Docker image
Write-Host "📦 Building Docker image..." -ForegroundColor Yellow
docker build -t $DockerHubUsername/brewbook:$ImageTag .

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "🏷️ Tagging image..." -ForegroundColor Yellow
docker tag $DockerHubUsername/brewbook:$ImageTag $DockerHubUsername/brewbook:latest

Write-Host "⬆️ Pushing to DockerHub..." -ForegroundColor Yellow
docker push $DockerHubUsername/brewbook:$ImageTag
docker push $DockerHubUsername/brewbook:latest

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker push failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Docker image pushed successfully!" -ForegroundColor Green

# Step 2: Update Kubernetes manifests
Write-Host "📝 Updating Kubernetes manifests..." -ForegroundColor Yellow

# Update deployment.yaml with new image
$deploymentContent = Get-Content "k8s/deployment.yaml" -Raw
$deploymentContent = $deploymentContent -replace "Huu_Truc_Nguyen/brewbook:latest", "$DockerHubUsername/brewbook:$ImageTag"
Set-Content "k8s/deployment.yaml" $deploymentContent

# Update Helm values.yaml
$helmValuesContent = Get-Content "helm/brewbook/values.yaml" -Raw
$helmValuesContent = $helmValuesContent -replace "Huu_Truc_Nguyen/brewbook", "$DockerHubUsername/brewbook"
Set-Content "helm/brewbook/values.yaml" $helmValuesContent

Write-Host "✅ Kubernetes manifests updated!" -ForegroundColor Green

# Step 3: Create secrets from environment variables
Write-Host "🔐 Creating Kubernetes secrets..." -ForegroundColor Yellow

# Create the secret
$secretYaml = @"
apiVersion: v1
kind: Secret
metadata:
  name: brewbook-secrets
  labels:
    app: brewbook
type: Opaque
data:
  supabase-url: $([Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($SupabaseUrl)))
  supabase-anon-key: $([Convert]::ToBase64String([Text.Encoding::UTF8.GetBytes($SupabaseAnonKey)))
"@

# Write secret to file
$secretYaml | Out-File -FilePath "k8s/secrets/brewbook-secrets.yaml" -Encoding UTF8

Write-Host "✅ Kubernetes secret created!" -ForegroundColor Green

# Step 4: Deploy to Kubernetes
Write-Host "☸️ Deploying to Kubernetes..." -ForegroundColor Yellow

# Apply secrets first
kubectl apply -f k8s/secrets/brewbook-secrets.yaml

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to create secrets!" -ForegroundColor Red
    exit 1
}

# Apply all other manifests
kubectl apply -f k8s/

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Kubernetes deployment failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Kubernetes deployment successful!" -ForegroundColor Green

# Step 5: Optional Helm deployment
$useHelm = Read-Host "Would you like to deploy with Helm as well? (y/n)"
if ($useHelm -eq "y" -or $useHelm -eq "Y") {
    Write-Host "🎯 Deploying with Helm..." -ForegroundColor Yellow
    
    # Check if Helm is installed
    try {
        helm version
    } catch {
        Write-Host "❌ Helm is not installed. Please install Helm first." -ForegroundColor Red
        exit 1
    }
    
    # Deploy with Helm
    helm upgrade --install brewbook ./helm/brewbook \
        --set image.repository=$DockerHubUsername/brewbook \
        --set image.tag=$ImageTag
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Helm deployment failed!" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ Helm deployment successful!" -ForegroundColor Green
}

# Step 6: Show deployment status
Write-Host "📊 Deployment Status:" -ForegroundColor Cyan
kubectl get pods -l app=brewbook
kubectl get services -l app=brewbook
kubectl get secrets -l app=brewbook

Write-Host "🎉 Deployment completed successfully!" -ForegroundColor Green
Write-Host "🌐 Access your app with: kubectl port-forward service/brewbook 8080:80" -ForegroundColor Cyan
Write-Host "🔒 Secrets are stored securely in Kubernetes" -ForegroundColor Green
