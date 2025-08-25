#!/bin/bash

# Deploy BrewBook using Ansible
# This script works on Linux, macOS, and Windows (WSL)

echo "🚀 Deploying BrewBook with Ansible..."

# Check if Ansible is installed
if ! command -v ansible &> /dev/null; then
    echo "❌ Ansible is not installed!"
    echo "📦 Installing Ansible..."
    
    # Detect OS and install Ansible
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        if command -v apt-get &> /dev/null; then
            sudo apt-get update
            sudo apt-get install -y ansible
        elif command -v yum &> /dev/null; then
            sudo yum install -y ansible
        elif command -v dnf &> /dev/null; then
            sudo dnf install -y ansible
        else
            echo "❌ Unsupported Linux distribution. Please install Ansible manually."
            exit 1
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v brew &> /dev/null; then
            brew install ansible
        else
            echo "❌ Homebrew not found. Please install Ansible manually."
            exit 1
        fi
    else
        echo "❌ Unsupported OS. Please install Ansible manually."
        exit 1
    fi
fi

# Install required collections
echo "📦 Installing Ansible collections..."
ansible-galaxy collection install -r ansible/requirements.yml

# Run the playbook
echo "🎯 Running Ansible playbook..."
cd ansible
ansible-playbook playbook.yml -v

echo "✅ Deployment completed!"
