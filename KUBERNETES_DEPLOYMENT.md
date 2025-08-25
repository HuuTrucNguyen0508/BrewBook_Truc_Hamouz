# ☸️ Kubernetes Deployment Guide

This guide covers deploying your BrewBook application to Kubernetes using both kubectl and Helm.

## 🛠️ Prerequisites

- **Kubernetes cluster** (local or cloud)
- **kubectl** configured and connected to your cluster
- **Docker** for building images
- **DockerHub account** for image registry
- **Helm** (optional, for advanced deployments)

## 🚀 Quick Start

### 1. Build and Push Docker Image

```bash
# Build the image
docker build -t your-username/brewbook:latest .

# Tag for DockerHub
docker tag your-username/brewbook:latest your-username/brewbook:latest

# Push to DockerHub
docker push your-username/brewbook:latest
```

### 2. Update Configuration

Edit `k8s/deployment.yaml` and `helm/brewbook/values.yaml` with your:
- DockerHub username
- Supabase credentials
- Image tag

### 3. Deploy to Kubernetes

```bash
# Apply all manifests
kubectl apply -f k8s/

# Or deploy with Helm
helm upgrade --install brewbook ./helm/brewbook
```

## 📋 Manual Deployment

### Apply Kubernetes Manifests

```bash
# Deploy the application
kubectl apply -f k8s/deployment.yaml

# Create the service
kubectl apply -f k8s/service.yaml

# Set up ingress (if using)
kubectl apply -f k8s/ingress.yaml
```

### Check Deployment Status

```bash
# View pods
kubectl get pods -l app=brewbook

# View services
kubectl get services -l app=brewbook

# View ingress
kubectl get ingress -l app=brewbook
```

### Access Your Application

```bash
# Port forward to access locally
kubectl port-forward service/brewbook 8080:80

# Access at http://localhost:8080
```

## 🎯 Helm Deployment

### Install Helm Chart

```bash
# Install/upgrade the chart
helm upgrade --install brewbook ./helm/brewbook

# With custom values
helm upgrade --install brewbook ./helm/brewbook \
  --set image.repository=your-username/brewbook \
  --set image.tag=latest
```

### Customize Values

Edit `helm/brewbook/values.yaml`:
- Replica count
- Resource limits
- Environment variables
- Service type
- Ingress configuration

### Helm Commands

```bash
# List releases
helm list

# Get release status
helm status brewbook

# Uninstall release
helm uninstall brewbook

# Rollback to previous version
helm rollback brewbook 1
```

## 🔧 Service Types

### ClusterIP (Default)
- Internal cluster access only
- Use with port-forwarding for local access

### LoadBalancer
- External access via cloud load balancer
- Good for production deployments

```bash
kubectl apply -f k8s/service-loadbalancer.yaml
```

### NodePort
- Direct access on node ports
- Good for development/testing

```bash
kubectl apply -f k8s/service-nodeport.yaml
# Access at http://localhost:30080
```

## 🌐 Ingress Configuration

### Basic Ingress
```bash
kubectl apply -f k8s/ingress.yaml
```

### Custom Host
Edit `k8s/ingress.yaml`:
```yaml
spec:
  rules:
  - host: your-domain.com  # Change this
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: brewbook
            port:
              number: 80
```

## 📊 Monitoring and Scaling

### Check Pod Status
```bash
# View pod details
kubectl describe pod -l app=brewbook

# View logs
kubectl logs -l app=brewbook

# Follow logs
kubectl logs -f -l app=brewbook
```

### Scaling
```bash
# Scale deployment
kubectl scale deployment brewbook --replicas=3

# Or edit deployment
kubectl edit deployment brewbook
```

### Resource Monitoring
```bash
# View resource usage
kubectl top pods -l app=brewbook

# View node resources
kubectl top nodes
```

## 🔒 Security Considerations

### Secrets Management
```bash
# Create secret for sensitive data
kubectl create secret generic brewbook-secrets \
  --from-literal=supabase-url=your-url \
  --from-literal=supabase-key=your-key

# Reference in deployment
env:
- name: NEXT_PUBLIC_SUPABASE_URL
  valueFrom:
    secretKeyRef:
      name: brewbook-secrets
      key: supabase-url
```

### Network Policies
```bash
# Restrict pod-to-pod communication
kubectl apply -f - <<EOF
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: brewbook-network-policy
spec:
  podSelector:
    matchLabels:
      app: brewbook
  policyTypes:
  - Ingress
  - Egress
EOF
```

## 🚨 Troubleshooting

### Common Issues

**Pods not starting:**
```bash
# Check pod events
kubectl describe pod <pod-name>

# Check pod logs
kubectl logs <pod-name>
```

**Service not accessible:**
```bash
# Check service endpoints
kubectl get endpoints brewbook

# Test service connectivity
kubectl run test --image=busybox --rm -it --restart=Never -- wget -O- http://brewbook
```

**Image pull errors:**
```bash
# Check image pull policy
kubectl get pod <pod-name> -o yaml | grep imagePullPolicy

# Verify image exists
docker pull your-username/brewbook:latest
```

### Debug Commands
```bash
# Get all resources
kubectl get all -l app=brewbook

# View events
kubectl get events --sort-by='.lastTimestamp'

# Check cluster info
kubectl cluster-info
```

## 🔄 Update Deployment

### Rolling Update
```bash
# Update image
kubectl set image deployment/brewbook brewbook=your-username/brewbook:v2.0.0

# Check rollout status
kubectl rollout status deployment/brewbook

# Rollback if needed
kubectl rollout undo deployment/brewbook
```

### Helm Update
```bash
# Update with new values
helm upgrade brewbook ./helm/brewbook \
  --set image.tag=v2.0.0

# Check release history
helm history brewbook
```

## 📚 Additional Resources

- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Helm Documentation](https://helm.sh/docs/)
- [Kubectl Cheat Sheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)

---

**Happy deploying! ☸️✨**
