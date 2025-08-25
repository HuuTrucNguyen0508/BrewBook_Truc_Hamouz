# BrewBook Kubernetes Deployment Script
# Usage: .\deploy-to-k8s.ps1 -DockerHubUsername "your-username"

param(
    [Parameter(Mandatory=$true)]
    [string]$DockerHubUsername,
    
    [string]$ImageTag = "latest",
    
    [string]$SupabaseUrl = "https://lxicmxufvsftmhyzqkkn.supabase.co",
    
    [string]$SupabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4aWNteHVmdnNmdG1oeXpxa2tuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxNDA0NjIsImV4cCI6MjA3MTcxNjQ2Mn0.a3zfvDl_gxOOUW406pgExRqkzHJXWnd6isXO67bam4g"
)

Write-Host "🚀 Starting BrewBook Kubernetes Deployment..." -ForegroundColor Green

# Step 1: Build Docker Image
Write-Host "📦 Building Docker image..." -ForegroundColor Yellow
docker build -t brewbook:$ImageTag .
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker build failed!" -ForegroundColor Red
    exit 1
}

# Step 2: Tag for DockerHub
Write-Host "🏷️ Tagging image for DockerHub..." -ForegroundColor Yellow
$FullImageName = "$DockerHubUsername/brewbook:$ImageTag"
docker tag brewbook:$ImageTag $FullImageName

# Step 3: Push to DockerHub
Write-Host "⬆️ Pushing to DockerHub..." -ForegroundColor Yellow
docker push $FullImageName
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker push failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Image pushed to DockerHub successfully!" -ForegroundColor Green

# Step 4: Update Kubernetes manifests with your image
Write-Host "🔧 Updating Kubernetes manifests..." -ForegroundColor Yellow

# Update deployment.yaml
$DeploymentContent = Get-Content "k8s/deployment.yaml" -Raw
$DeploymentContent = $DeploymentContent -replace "YOUR_DOCKERHUB_USERNAME", $DockerHubUsername
$DeploymentContent = $DeploymentContent -replace "YOUR_SUPABASE_URL", $SupabaseUrl
$DeploymentContent = $DeploymentContent -replace "YOUR_SUPABASE_ANON_KEY", $SupabaseAnonKey
Set-Content "k8s/deployment.yaml" $DeploymentContent

# Update Helm values.yaml
$HelmValuesContent = Get-Content "helm/brewbook/values.yaml" -Raw
$HelmValuesContent = $HelmValuesContent -replace "YOUR_DOCKERHUB_USERNAME", $DockerHubUsername
$HelmValuesContent = $HelmValuesContent -replace "YOUR_SUPABASE_URL", $SupabaseUrl
$HelmValuesContent = $HelmValuesContent -replace "YOUR_SUPABASE_ANON_KEY", $SupabaseAnonKey
Set-Content "helm/brewbook/values.yaml" $HelmValuesContent

Write-Host "✅ Kubernetes manifests updated!" -ForegroundColor Green

# Step 5: Deploy to Kubernetes
Write-Host "🚀 Deploying to Kubernetes..." -ForegroundColor Yellow

# Check if kubectl is available
try {
    kubectl version --client | Out-Null
} catch {
    Write-Host "❌ kubectl not found! Please install kubectl first." -ForegroundColor Red
    exit 1
}

# Apply Kubernetes manifests
Write-Host "📋 Applying Kubernetes manifests..." -ForegroundColor Yellow
kubectl apply -f k8s/
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Kubernetes deployment failed!" -ForegroundColor Red
    exit 1
}

# Step 6: Deploy with Helm (optional)
Write-Host "🎯 Deploying with Helm..." -ForegroundColor Yellow
try {
    helm install brewbook ./helm/brewbook --wait --timeout 5m
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Helm deployment successful!" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Helm deployment had issues, but Kubernetes deployment succeeded" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️ Helm not available, but Kubernetes deployment succeeded" -ForegroundColor Yellow
}

# Step 7: Show deployment status
Write-Host "📊 Checking deployment status..." -ForegroundColor Yellow
kubectl get pods -l app=brewbook
kubectl get services -l app=brewbook
kubectl get ingress -l app=brewbook

Write-Host "🎉 Deployment completed!" -ForegroundColor Green
Write-Host "🌐 Your app should be accessible via the service or ingress" -ForegroundColor Cyan
Write-Host "📝 Run 'kubectl get all -l app=brewbook' to see all resources" -ForegroundColor Cyan
