#!/bin/bash

# CryptonBets SSL Certificate Setup Script

echo "🔐 SSL Sertifika kurulumu başlatılıyor..."

# Update system
sudo apt update && sudo apt upgrade -y

# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Stop nginx temporarily
sudo systemctl stop nginx

# Obtain SSL certificate
sudo certbot certonly --standalone -d cryptonbets.com -d www.cryptonbets.com

# Start nginx
sudo systemctl start nginx

# Test certificate renewal
sudo certbot renew --dry-run

# Setup auto-renewal cron job
echo "0 2 * * 0 certbot renew --nginx --quiet" | sudo tee -a /etc/crontab

echo "✅ SSL sertifikaları başarıyla kuruldu!"
echo "📋 Sertifika yenileme cronjob eklendi (Her Pazar 02:00)"
