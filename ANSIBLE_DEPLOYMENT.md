# 🚀 Ansible Deployment Guide for BrewBook

This guide covers deploying your BrewBook application using Ansible, which is **cross-platform** and works on Windows, macOS, and Linux.

## 🌍 **Why Ansible Instead of OS-Specific Scripts?**

- ✅ **Cross-platform** - Works on Windows, macOS, Linux
- ✅ **Idempotent** - Safe to run multiple times
- ✅ **Declarative** - Describe what you want, not how to do it
- ✅ **Extensible** - Easy to add more deployment steps
- ✅ **Industry standard** - Used by DevOps professionals worldwide

## 📋 **Prerequisites**

### 1. **Install Ansible**

#### **Windows:**
```bash
# Option 1: Use WSL (recommended)
wsl
sudo apt-get update && sudo apt-get install -y ansible

# Option 2: Install via Python
pip install ansible
```

#### **macOS:**
```bash
# Using Homebrew
brew install ansible

# Using Python
pip install ansible
```

#### **Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install -y ansible
```

#### **Linux (CentOS/RHEL/Fedora):**
```bash
# CentOS/RHEL
sudo yum install -y ansible

# Fedora
sudo dnf install -y ansible
```

### 2. **Install Required Collections**
```bash
ansible-galaxy collection install -r ansible/requirements.yml
```

## 🚀 **Quick Start**

### **Option 1: Use the provided scripts**

#### **Linux/macOS/WSL:**
```bash
chmod +x deploy-with-ansible.sh
./deploy-with-ansible.sh
```

#### **Windows:**
```cmd
deploy-with-ansible.bat
```

### **Option 2: Run manually**
```bash
cd ansible
ansible-playbook playbook.yml -v
```

## 📁 **Ansible Structure**

```
brewbook/
├── ansible/
│   ├── playbook.yml          # Main deployment playbook
│   ├── inventory.yml         # Host definitions
│   ├── ansible.cfg          # Ansible configuration
│   └── requirements.yml      # Required collections
├── deploy-with-ansible.sh    # Linux/macOS/WSL script
├── deploy-with-ansible.bat   # Windows script
└── .env.local               # Your environment variables
```

## 🔐 **Environment Variables**

Your `.env.local` file should contain:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SUPABASE_SERVICE_KEY=your_supabase_service_key
DOCKER_IMAGE_NAME=your-dockerhub-username/brewbook
DOCKER_IMAGE_TAG=latest
K8S_NAMESPACE=default
K8S_REPLICAS=2
```

## 🎯 **What the Playbook Does**

### 1. **Environment Setup**
- Loads variables from `.env.local`
- Validates required variables
- Sets defaults for missing values

### 2. **Docker Operations**
- Builds Docker image
- Tags image as latest
- Pushes to DockerHub (if credentials provided)

### 3. **Kubernetes Deployment**
- Creates namespace
- Creates secrets from environment variables
- Updates manifests with your image
- Applies all Kubernetes resources
- Waits for pods to be ready

### 4. **Verification**
- Checks pod status
- Displays deployment summary
- Shows access instructions

## 🔧 **Customization**

### **Add DockerHub Credentials**
```bash
# Add to .env.local
DOCKER_USERNAME=your_username
DOCKER_PASSWORD=your_password
```

### **Change Kubernetes Namespace**
```bash
# Add to .env.local
K8S_NAMESPACE=brewbook-prod
```

### **Modify Replica Count**
```bash
# Add to .env.local
K8S_REPLICAS=3
```

## 🐛 **Troubleshooting**

### **Common Issues**

#### **Ansible not found:**
```bash
# Check if installed
ansible --version

# Install if missing
pip install ansible
```

#### **Collections not found:**
```bash
# Install required collections
ansible-galaxy collection install -r ansible/requirements.yml
```

#### **Docker permission denied:**
```bash
# Add user to docker group
sudo usermod -aG docker $USER
# Log out and back in
```

#### **Kubernetes connection failed:**
```bash
# Check kubectl connection
kubectl cluster-info

# Ensure kubectl is configured
kubectl config current-context
```

### **Debug Commands**
```bash
# Run with verbose output
ansible-playbook playbook.yml -vvv

# Check syntax
ansible-playbook playbook.yml --syntax-check

# Dry run (what-if)
ansible-playbook playbook.yml --check
```

## 🔄 **Advanced Usage**

### **Run specific tasks**
```bash
# Only build Docker image
ansible-playbook playbook.yml --tags docker

# Only deploy to Kubernetes
ansible-playbook playbook.yml --tags k8s
```

### **Override variables**
```bash
# Override image tag
ansible-playbook playbook.yml -e "docker_image_tag=v2.0.0"

# Override namespace
ansible-playbook playbook.yml -e "k8s_namespace=staging"
```

### **Use different inventory**
```bash
# Use production inventory
ansible-playbook playbook.yml -i production-inventory.yml
```

## 📚 **Additional Resources**

- [Ansible Documentation](https://docs.ansible.com/)
- [Kubernetes Collection](https://docs.ansible.com/ansible/latest/collections/kubernetes/core/)
- [Docker Collection](https://docs.ansible.com/ansible/latest/collections/community/docker/)

## 🎯 **Quick Reference**

```bash
# Install Ansible
pip install ansible

# Install collections
ansible-galaxy collection install -r ansible/requirements.yml

# Deploy
./deploy-with-ansible.sh          # Linux/macOS/WSL
deploy-with-ansible.bat           # Windows
ansible-playbook ansible/playbook.yml -v  # Manual

# Check status
kubectl get pods -l app=brewbook
kubectl get services -l app=brewbook
```

---

**Happy deploying with Ansible! 🚀✨**
