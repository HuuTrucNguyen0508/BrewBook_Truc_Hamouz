@echo off
echo 🚀 Deploying BrewBook with Ansible...

REM Check if Ansible is installed
ansible --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Ansible is not installed!
    echo 📦 Please install Ansible manually:
    echo   1. Install Python from https://python.org
    echo   2. Run: pip install ansible
    echo   3. Or use WSL and run the .sh script
    pause
    exit /b 1
)

REM Install required collections
echo 📦 Installing Ansible collections...
ansible-galaxy collection install -r ansible\requirements.yml

REM Run the playbook
echo 🎯 Running Ansible playbook...
cd ansible
ansible-playbook playbook.yml -v

echo ✅ Deployment completed!
pause
