#!/bin/bash

# CryptonBets Production Deployment Script

set -e

echo "🚀 CryptonBets Production Deployment Başlatılıyor..."

# Configuration
PROJECT_DIR="/var/www/cryptonbets"
NGINX_CONFIG="/etc/nginx/sites-available/cryptonbets"
BACKUP_DIR="/var/backups/cryptonbets/pre-deploy"

# Create backup before deployment
echo "📦 Deployment öncesi yedek oluşturuluyor..."
mkdir -p $BACKUP_DIR
pg_dump -U cryptonbets_user cryptonbets_production | gzip > "$BACKUP_DIR/pre-deploy-$(date +%Y%m%d_%H%M%S).sql.gz"

# Update system packages
echo "📦 Sistem paketleri güncelleniyor..."
sudo apt update && sudo apt upgrade -y

# Install Node.js 18 (if not installed)
if ! command -v node &> /dev/null; then
    echo "📦 Node.js kuruluyor..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Install PM2 globally (if not installed)
if ! command -v pm2 &> /dev/null; then
    echo "📦 PM2 kuruluyor..."
    sudo npm install -g pm2
fi

# Install PostgreSQL (if not installed)
if ! command -v psql &> /dev/null; then
    echo "📦 PostgreSQL kuruluyor..."
    sudo apt install postgresql postgresql-contrib -y
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
fi

# Install Nginx (if not installed)
if ! command -v nginx &> /dev/null; then
    echo "📦 Nginx kuruluyor..."
    sudo apt install nginx -y
    sudo systemctl start nginx
    sudo systemctl enable nginx
fi

# Create project directory
sudo mkdir -p $PROJECT_DIR
sudo chown -R $USER:$USER $PROJECT_DIR

# Copy application files
echo "📁 Uygulama dosyaları kopyalanıyor..."
cp -r ./* $PROJECT_DIR/

# Install dependencies
echo "📦 Dependencies kuruluyor..."
cd $PROJECT_DIR
npm ci --only=production

# Build application
echo "🔨 Uygulama build ediliyor..."
npm run build

# Setup database
echo "🗄️ Veritabanı ayarlanıyor..."
sudo -u postgres createuser -s cryptonbets_user 2>/dev/null || true
sudo -u postgres createdb cryptonbets_production 2>/dev/null || true
sudo -u postgres psql -c "ALTER USER cryptonbets_user PASSWORD 'secure_password_here';" 2>/dev/null || true

# Import database schema
psql -U cryptonbets_user -d cryptonbets_production -f database-export.sql

# Setup Nginx
echo "🌐 Nginx ayarlanıyor..."
sudo cp nginx.conf $NGINX_CONFIG
sudo ln -sf $NGINX_CONFIG /etc/nginx/sites-enabled/cryptonbets
sudo nginx -t
sudo systemctl reload nginx

# Setup SSL certificates
echo "🔐 SSL sertifikaları ayarlanıyor..."
sudo ./setup-ssl.sh

# Setup file permissions
echo "🔐 Dosya izinleri ayarlanıyor..."
sudo chown -R $USER:www-data $PROJECT_DIR
sudo chmod -R 755 $PROJECT_DIR
sudo mkdir -p $PROJECT_DIR/uploads $PROJECT_DIR/logs
sudo chmod -R 775 $PROJECT_DIR/uploads $PROJECT_DIR/logs

# Setup log rotation
echo "📄 Log rotation ayarlanıyor..."
sudo tee /etc/logrotate.d/cryptonbets > /dev/null <<EOF
$PROJECT_DIR/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    sharedscripts
    postrotate
        pm2 reload cryptonbets
    endscript
}
EOF

# Setup backup cron job
echo "🕐 Backup cron job ayarlanıyor..."
(crontab -l 2>/dev/null; echo "0 2 * * * $PROJECT_DIR/backup-database.sh") | crontab -

# Start application with PM2
echo "🚀 Uygulama başlatılıyor..."
pm2 delete cryptonbets 2>/dev/null || true
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup

# Setup firewall
echo "🔥 Firewall ayarlanıyor..."
sudo ufw --force enable
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443

echo "✅ Deployment tamamlandı!"
echo "🌐 Site: https://cryptonbets.com"
echo "📊 Monitoring: pm2 monit"
echo "📋 Logs: pm2 logs cryptonbets"
echo "🔄 Restart: pm2 restart cryptonbets"
