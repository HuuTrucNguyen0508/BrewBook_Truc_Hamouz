# 🔐 Secrets Management Guide

This guide covers how to securely manage sensitive information like API keys and database credentials in your BrewBook project.

## 🚨 **Security First!**

**Never commit sensitive information to version control!** This includes:
- API keys
- Database passwords
- Supabase credentials
- Private keys
- Access tokens

## 📁 **File Structure**

```
brewbook/
├── .env.local              # 🔒 YOUR SECRETS (gitignored)
├── env.template            # 📋 Template for environment variables
├── k8s/secrets/           # 🔐 Kubernetes secrets directory
│   ├── .gitkeep           # Maintains directory structure
│   ├── create-secrets.sh  # Linux/Mac script
│   ├── create-secrets.ps1 # Windows PowerShell script
│   └── brewbook-secrets.yaml # Generated secret manifest
└── helm/brewbook/secrets/ # 🔐 Helm secrets directory
    └── .gitkeep           # Maintains directory structure
```

## 🔐 **Environment Variables Setup**

### 1. Create Your Environment File

```bash
# Copy the template
cp env.template .env.local

# Edit with your real values
nano .env.local  # or use your preferred editor
```

### 2. Fill in Your Values

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_supabase_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
DOCKER_IMAGE_NAME=your-dockerhub-username/brewbook
DOCKER_IMAGE_TAG=latest
K8S_NAMESPACE=default
K8S_REPLICAS=2
```

### 3. Verify .env.local is Ignored

```bash
# Check if .env.local is in .gitignore
grep ".env.local" .gitignore

# Should show: .env.local
```

## 🐳 **Docker Compose Secrets**

Docker Compose automatically reads from `.env.local`:

```yaml
# docker-compose.yml
services:
  brewbook:
    image: ${DOCKER_IMAGE_NAME:-your-dockerhub-username/brewbook}:${DOCKER_IMAGE_TAG:-latest}
    environment:
      - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
      - NODE_ENV=${NODE_ENV:-development}
```

## ☸️ **Kubernetes Secrets**

### Option 1: Automatic Secret Creation

Use the deployment script:

```powershell
# Windows PowerShell
.\deploy-to-k8s.ps1 -DockerHubUsername your-username -ImageTag latest

# The script will:
# 1. Read from .env.local
# 2. Create Kubernetes secrets
# 3. Deploy the application
```

### Option 2: Manual Secret Creation

#### Using PowerShell (Windows)
```powershell
cd k8s/secrets
.\create-secrets.ps1
kubectl apply -f brewbook-secrets.yaml
```

#### Using Bash (Linux/Mac)
```bash
cd k8s/secrets
chmod +x create-secrets.sh
./create-secrets.sh
kubectl apply -f brewbook-secrets.yaml
```

### Option 3: Direct kubectl Command

```bash
kubectl create secret generic brewbook-secrets \
  --from-literal=supabase-url="https://your-project.supabase.co" \
  --from-literal=supabase-anon-key="your_key_here"
```

## 🔍 **Verifying Secrets**

### Check if Secrets Exist
```bash
kubectl get secrets
kubectl get secrets brewbook-secrets
```

### View Secret Details
```bash
kubectl describe secret brewbook-secrets
```

### Decode Secret Values (for debugging)
```bash
# Get the base64 encoded value
kubectl get secret brewbook-secrets -o jsonpath='{.data.supabase-url}'

# Decode it
echo "base64_encoded_value_here" | base64 -d
```

## 🚀 **Deployment Workflow**

### 1. Set Up Environment
```bash
# Copy template
cp env.template .env.local

# Edit with your values
nano .env.local
```

### 2. Deploy to Kubernetes
```bash
# Option A: Use deployment script (recommended)
.\deploy-to-k8s.ps1 -DockerHubUsername your-username -ImageTag latest

# Option B: Manual deployment
cd k8s/secrets
.\create-secrets.ps1
kubectl apply -f brewbook-secrets.yaml
kubectl apply -f ../
```

### 3. Verify Deployment
```bash
kubectl get pods -l app=brewbook
kubectl get secrets -l app=brewbook
```

## 🔒 **Security Best Practices**

### 1. **Never Commit Secrets**
- ✅ `.env.local` is in `.gitignore`
- ✅ `k8s/secrets/` directory is protected
- ✅ All manifests use placeholders or secrets
- ❌ Never commit actual secret values

### 2. **Use Different Values for Different Environments**
```bash
# Development
.env.development.local

# Staging
.env.staging.local

# Production
.env.production.local
```

### 3. **Rotate Secrets Regularly**
- Change Supabase keys periodically
- Use different keys for different environments
- Monitor secret usage

### 4. **Limit Access to Secrets**
```bash
# Create namespaced secrets
kubectl create secret generic brewbook-secrets \
  --namespace=brewbook-prod \
  --from-literal=supabase-url="..." \
  --from-literal=supabase-anon-key="..."
```

## 📝 **Updated Files**

The following files have been updated to use placeholders instead of hardcoded values:

- **`docker-compose.yml`** - Now uses environment variables
- **`k8s/deployment.yaml`** - Uses placeholder image name
- **`helm/brewbook/values.yaml`** - Uses placeholder repository
- **`deploy-to-k8s.ps1`** - Replaces placeholders with actual values

## 🐛 **Troubleshooting**

### Common Issues

**Secret not found:**
```bash
# Check if secret exists
kubectl get secrets brewbook-secrets

# If not, recreate it
cd k8s/secrets
.\create-secrets.ps1
kubectl apply -f brewbook-secrets.yaml
```

**Environment variables not loading:**
```bash
# Check pod environment
kubectl exec -it <pod-name> -- env | grep SUPABASE

# Check secret references
kubectl describe pod <pod-name>
```

**Permission denied:**
```bash
# Check if you have access to secrets
kubectl auth can-i get secrets
kubectl auth can-i create secrets
```

**Docker Compose not reading .env.local:**
```bash
# Verify .env.local exists and has correct format
Get-Content .env.local

# Check if variables are set
echo $env:NEXT_PUBLIC_SUPABASE_URL
```

### Debug Commands
```bash
# Check all resources
kubectl get all -l app=brewbook

# View events
kubectl get events --sort-by='.lastTimestamp'

# Check pod logs
kubectl logs -l app=brewbook

# Check Docker Compose environment
docker-compose config
```

## 📚 **Additional Resources**

- [Kubernetes Secrets Documentation](https://kubernetes.io/docs/concepts/configuration/secret/)
- [Environment Variables Best Practices](https://12factor.net/config)
- [Docker Secrets](https://docs.docker.com/engine/swarm/secrets/)
- [Helm Secrets](https://github.com/jkroepke/helm-secrets)

## 🎯 **Quick Reference**

```bash
# Create secrets from .env.local
cd k8s/secrets
.\create-secrets.ps1

# Deploy with secrets
kubectl apply -f brewbook-secrets.yaml
kubectl apply -f ../

# Check status
kubectl get secrets -l app=brewbook
kubectl get pods -l app=brewbook

# Docker Compose with environment
docker-compose up -d
```

---

**Remember: Security is everyone's responsibility! 🔒✨**
