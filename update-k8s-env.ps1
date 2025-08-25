# PowerShell script to update Kubernetes deployment with .env.local values
# Run this script from the brewbook directory

Write-Host "Reading .env.local file..." -ForegroundColor Green

# Read .env.local file
$envContent = Get-Content ".env.local" -ErrorAction SilentlyContinue

if (-not $envContent) {
    Write-Host "Error: .env.local file not found!" -ForegroundColor Red
    exit 1
}

# Parse environment variables
$envVars = @{}
foreach ($line in $envContent) {
    if ($line -match '^([^#][^=]+)=(.*)$') {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        $envVars[$key] = $value
    }
}

Write-Host "Found environment variables:" -ForegroundColor Green
$envVars.GetEnumerator() | ForEach-Object { Write-Host "  $($_.Key)" -ForegroundColor Yellow }

# Update the deployment.yaml file
Write-Host "`nUpdating k8s/deployment.yaml..." -ForegroundColor Green

$deploymentPath = "k8s/deployment.yaml"
$deploymentContent = Get-Content $deploymentPath -Raw

# Replace placeholder values with actual values from .env.local
$deploymentContent = $deploymentContent -replace 'https://your-project\.supabase\.co', $envVars['NEXT_PUBLIC_SUPABASE_URL']
$deploymentContent = $deploymentContent -replace 'your_supabase_anon_key_here', $envVars['NEXT_PUBLIC_SUPABASE_ANON_KEY']
$deploymentContent = $deploymentContent -replace 'your_supabase_service_role_key_here', $envVars['SUPABASE_SERVICE_ROLE_KEY']

# Write updated deployment file
Set-Content -Path $deploymentPath -Value $deploymentContent

Write-Host "Deployment file updated successfully!" -ForegroundColor Green
Write-Host "`nNow you can apply the updated deployment:" -ForegroundColor Cyan
Write-Host "kubectl apply -f k8s/deployment.yaml -n brewbook" -ForegroundColor White
