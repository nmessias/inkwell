#!/bin/bash
#
# GCP e2-micro Deployment Script for Tome
# 
# This script sets up a fresh Debian/Ubuntu VM with:
# - Docker + Docker Compose
# - fail2ban for SSH protection
# - UFW firewall (only 22, 80, 443 open)
# - Automatic security updates
# - 1GB swap file (for e2-micro's limited RAM)
#
# Usage: sudo ./scripts/deploy.sh
#

set -e

echo "=== Tome GCP Deployment Script ==="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo "Please run as root: sudo ./scripts/deploy.sh"
    exit 1
fi

# Get the non-root user (whoever called sudo)
DEPLOY_USER=${SUDO_USER:-$USER}
DEPLOY_HOME=$(eval echo ~$DEPLOY_USER)

echo "[1/8] Updating system packages..."
apt-get update && apt-get upgrade -y

echo "[2/8] Creating 1GB swap file..."
if [ ! -f /swapfile ]; then
    fallocate -l 1G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
    # Optimize swap settings for low-memory systems
    sysctl vm.swappiness=10
    echo 'vm.swappiness=10' >> /etc/sysctl.conf
    sysctl vm.vfs_cache_pressure=50
    echo 'vm.vfs_cache_pressure=50' >> /etc/sysctl.conf
    echo "Swap configured:"
    swapon --show
else
    echo "Swap already exists, skipping..."
fi

echo "[3/8] Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com | sh
    usermod -aG docker $DEPLOY_USER
    systemctl enable docker
    systemctl start docker
else
    echo "Docker already installed, skipping..."
fi

echo "[4/8] Installing Docker Compose plugin..."
apt-get install -y docker-compose-plugin

echo "[5/8] Setting up UFW firewall..."
apt-get install -y ufw
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp comment 'SSH'
ufw allow 80/tcp comment 'HTTP'
ufw allow 443/tcp comment 'HTTPS'
ufw --force enable
echo ""
echo "Firewall status:"
ufw status

echo "[6/8] Installing and configuring fail2ban..."
apt-get install -y fail2ban

# Create fail2ban jail config
cat > /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
bantime = 1h
findtime = 10m
maxretry = 5
ignoreip = 127.0.0.1/8

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 24h
EOF

systemctl enable fail2ban
systemctl restart fail2ban
echo ""
echo "fail2ban status:"
fail2ban-client status

echo "[7/8] Enabling automatic security updates..."
apt-get install -y unattended-upgrades
cat > /etc/apt/apt.conf.d/20auto-upgrades << 'EOF'
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
APT::Periodic::AutocleanInterval "7";
EOF

echo "[8/8] Setting up app directory..."
APP_DIR="$DEPLOY_HOME/tome"
if [ -d "$APP_DIR" ]; then
    echo "App directory exists at $APP_DIR"
    echo "Starting Tome..."
    cd "$APP_DIR"
    # Need to run as the deploy user for docker permissions
    sudo -u $DEPLOY_USER docker compose --profile production up -d --build
else
    echo ""
    echo "App directory not found at $APP_DIR"
    echo "Clone your repository first, then run this script again."
fi

echo ""
echo "=============================================="
echo "           Setup Complete!"
echo "=============================================="
echo ""
echo "System info:"
echo "  - Swap:      $(swapon --show --noheadings | awk '{print $3}')"
echo "  - Firewall:  UFW enabled (22, 80, 443)"
echo "  - fail2ban:  Active (3 failed SSH = 24h ban)"
echo "  - Updates:   Automatic security updates enabled"
echo ""
echo "External IP: $(curl -s ifconfig.me 2>/dev/null || echo 'Could not detect')"
echo ""
echo "Next steps:"
echo "  1. If not done: git clone <your-repo> $APP_DIR"
echo "  2. If not done: cd $APP_DIR && sudo ./scripts/deploy.sh"
echo "  3. Point DNS: Set tome.ink A record to this VM's IP"
echo "  4. Point DNS: Set www.tome.ink A record to this VM's IP"
echo "  5. Wait for DNS propagation (~5 min to 48 hours)"
echo "  6. Verify: curl -I https://tome.ink"
echo ""
echo "Useful commands:"
echo "  View logs:         cd $APP_DIR && docker compose logs -f"
echo "  Restart:           cd $APP_DIR && docker compose --profile production restart"
echo "  Rebuild & deploy:  cd $APP_DIR && git pull && docker compose --profile production up -d --build"
echo "  fail2ban status:   sudo fail2ban-client status sshd"
echo "  Banned IPs:        sudo fail2ban-client status sshd | grep 'Banned IP'"
echo ""
