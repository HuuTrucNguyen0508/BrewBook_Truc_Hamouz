# 🚀 BrewBook Kubernetes Deployment Guide

## 📋 Prerequisites

- ✅ Docker installed and running
- ✅ DockerHub account
- ✅ Kubernetes cluster (local or cloud)
- ✅ kubectl configured
- ✅ Helm (optional, for advanced deployment)

## 🐳 Step 1: Build and Push to DockerHub

### **Option A: Automated Script (Recommended)**
```powershell
# Run the deployment script
.\deploy-to-k8s.ps1 -DockerHubUsername "your-dockerhub-username"
```

### **Option B: Manual Commands**
```bash
# 1. Build the image
docker build -t brewbook:latest .

# 2. Tag for DockerHub
docker tag brewbook:latest YOUR_USERNAME/brewbook:latest

# 3. Push to DockerHub
docker push YOUR_USERNAME/brewbook:latest
```

## 🔧 Step 2: Update Configuration

**Replace placeholders in these files:**
- `k8s/deployment.yaml` - Replace `YOUR_DOCKERHUB_USERNAME`
- `helm/brewbook/values.yaml` - Replace `YOUR_DOCKERHUB_USERNAME`

## 🚀 Step 3: Deploy to Kubernetes

### **Option A: Direct kubectl**
```bash
kubectl apply -f k8s/
```

### **Option B: Helm Chart**
```bash
helm install brewbook ./helm/brewbook
```

## 📊 Step 4: Verify Deployment

```bash
# Check pods
kubectl get pods -l app=brewbook

# Check services
kubectl get services -l app=brewbook

# Check ingress
kubectl get ingress -l app=brewbook

# View logs
kubectl logs -l app=brewbook
```

## 🌐 Step 5: Access Your App

### **Port Forward (for testing)**
```bash
kubectl port-forward service/brewbook 3000:3000
# Access at http://localhost:3000
```

### **Ingress (if configured)**
- Check your ingress controller
- Update DNS if needed
- Access via the configured hostname

## 🔍 Troubleshooting

### **Common Issues:**

1. **Image Pull Errors**
   ```bash
   kubectl describe pod <pod-name>
   # Check for image pull issues
   ```

2. **Environment Variables**
   ```bash
   kubectl exec -it <pod-name> -- env | grep SUPABASE
   # Verify environment variables are set
   ```

3. **Database Connection**
   ```bash
   kubectl logs <pod-name>
   # Check for database connection errors
   ```

### **Useful Commands:**
```bash
# Delete and redeploy
kubectl delete -f k8s/
kubectl apply -f k8s/

# Scale deployment
kubectl scale deployment brewbook --replicas=3

# Update image
kubectl set image deployment/brewbook brewbook=YOUR_USERNAME/brewbook:new-tag
```

## 📈 Scaling and Monitoring

### **Horizontal Pod Autoscaler**
```bash
# Check HPA status
kubectl get hpa

# Manual scaling
kubectl scale deployment brewbook --replicas=5
```

### **Resource Monitoring**
```bash
# Resource usage
kubectl top pods -l app=brewbook

# Describe resources
kubectl describe deployment brewbook
```

## 🎯 Production Considerations

1. **Resource Limits**: Adjust CPU/memory limits in deployment
2. **Health Checks**: Verify liveness/readiness probes
3. **Security**: Use Kubernetes secrets for sensitive data
4. **Monitoring**: Set up Prometheus/Grafana
5. **Logging**: Configure centralized logging

## 🔄 Updating Your App

```bash
# 1. Build new image
docker build -t brewbook:v2 .

# 2. Tag and push
docker tag brewbook:v2 YOUR_USERNAME/brewbook:v2
docker push YOUR_USERNAME/brewbook:v2

# 3. Update deployment
kubectl set image deployment/brewbook brewbook=YOUR_USERNAME/brewbook:v2

# 4. Monitor rollout
kubectl rollout status deployment/brewbook
```

## 📚 Additional Resources

- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Helm Documentation](https://helm.sh/docs/)
- [Docker Documentation](https://docs.docker.com/)

---

**🎉 Your BrewBook app is now running on Kubernetes!**

For support, check the logs and use the troubleshooting commands above.
