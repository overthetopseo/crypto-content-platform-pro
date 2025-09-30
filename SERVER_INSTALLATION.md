# 🚀 Server Installation Guide

This guide provides step-by-step instructions for deploying the AI Content Generation Platform on a production server.

## 📋 Prerequisites

Before you begin, ensure you have:

- **Server Requirements:**
  - Ubuntu 20.04+ or CentOS 8+ (recommended)
  - Minimum 2GB RAM, 4GB+ recommended
  - Minimum 20GB storage, 50GB+ recommended
  - 2+ CPU cores, 4+ recommended
  - Stable internet connection

- **Software Requirements:**
  - Node.js 18+ (Node.js 20.x LTS recommended)
  - npm or yarn package manager
  - Git version control
  - Nginx (recommended for reverse proxy)
  - SSL certificate (Let's Encrypt recommended)
  - PM2 process manager (recommended)

- **API Keys:**
  - OpenAI API key (optional but recommended)
  - Anthropic (Claude) API key (optional but recommended)
  - Google AI API key (optional but recommended)
  - Grok (xAI) API key (optional)
  - Deepseek API key (optional)

## 🛠 Step 1: Server Setup

### 1.1 Update System Packages

```bash
# For Ubuntu/Debian
sudo apt update && sudo apt upgrade -y

# For CentOS/RHEL
sudo yum update -y
```

### 1.2 Install Required Software

```bash
# Install Node.js 20.x LTS (recommended method)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version  # Should show v20.x.x
npm --version   # Should show 9.x.x or higher

# Install Git
sudo apt install git -y

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx for reverse proxy
sudo apt install nginx -y

# Install Certbot for SSL certificates
sudo apt install certbot python3-certbot-nginx -y
```

### 1.3 Configure Firewall

```bash
# Allow necessary ports
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

## 📁 Step 2: Deploy Application

### 2.1 Clone Repository

```bash
# Create application directory
sudo mkdir -p /var/www/ai-content-platform
sudo chown $USER:$USER /var/www/ai-content-platform

# Navigate to directory
cd /var/www/ai-content-platform

# Clone your repository (replace with your actual repository URL)
git clone https://github.com/your-username/ai-content-platform.git .

# Or if you have the code locally, you can upload it using scp/rsync
```

### 2.2 Install Dependencies

```bash
# Install Node.js dependencies
npm install --production

# If you encounter permission issues, you might need to fix npm permissions
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

### 2.3 Configure Environment Variables

```bash
# Copy the environment template
cp .env.example .env.local

# Edit the environment file
nano .env.local
```

**Critical: Add your actual API keys to `.env.local`:**

```env
# AI Provider API Keys
OPENAI_API_KEY=sk-proj-YOUR_ACTUAL_OPENAI_KEY_HERE
XAI_API_KEY=your_actual_xai_key_here
DEEPSEEK_API_KEY=your_actual_deepseek_key_here
GOOGLE_AI_API_KEY=your_actual_google_ai_key_here
ANTHROPIC_API_KEY=sk-ant-YOUR_ACTUAL_ANTHROPIC_KEY_HERE

# Database (if using)
DATABASE_URL=your_database_url_here

# Next.js Configuration
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=generate_a_long_random_string_here

# Production Settings
NODE_ENV=production
```

**Generate a secure NEXTAUTH_SECRET:**

```bash
# Generate a secure random string
openssl rand -base64 32
```

### 2.4 Build Application

```bash
# Build the Next.js application
npm run build

# Verify build was successful (should create .next directory)
ls -la .next/
```

## ⚙ Step 3: Configure PM2

### 3.1 Create PM2 Configuration File

```bash
nano ecosystem.config.js
```

**Add the following configuration:**

```javascript
module.exports = {
  apps: [{
    name: 'ai-content-platform',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/ai-content-platform',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/pm2/ai-content-platform-error.log',
    out_file: '/var/log/pm2/ai-content-platform-out.log',
    log_file: '/var/log/pm2/ai-content-platform.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
};
```

### 3.2 Create Log Directory

```bash
sudo mkdir -p /var/log/pm2
sudo chown $USER:$USER /var/log/pm2
```

### 3.3 Start Application with PM2

```bash
# Start the application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp $HOME
```

### 3.4 Monitor Application

```bash
# Check application status
pm2 status

# View logs
pm2 logs ai-content-platform

# Restart application
pm2 restart ai-content-platform

# Stop application
pm2 stop ai-content-platform
```

## 🌐 Step 4: Configure Nginx Reverse Proxy

### 4.1 Create Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/ai-content-platform
```

**Add the following configuration (replace your-domain.com):**

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL Configuration (will be updated by Certbot)
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # SSL Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_session_timeout 10m;
    ssl_session_cache shared:SSL:10m;

    # Security Headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Rate Limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req zone=api burst=20 nodelay;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # API rate limiting
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;
}
```

### 4.2 Enable Site Configuration

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/ai-content-platform /etc/nginx/sites-enabled/

# Remove default site if it exists
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

## 🔒 Step 5: Setup SSL Certificate

### 5.1 Obtain SSL Certificate

```bash
# Make sure your domain is pointing to your server's IP address
# Then run Certbot
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Follow the prompts to configure SSL
```

### 5.2 Setup Auto-Renewal

```bash
# Test auto-renewal
sudo certbot renew --dry-run

# Add cron job for auto-renewal
sudo crontab -e
```

**Add this line to crontab:**

```bash
0 12 * * * /usr/bin/certbot renew --quiet
```

## 📊 Step 6: Monitoring and Maintenance

### 6.1 Setup Monitoring Script

```bash
nano monitor.sh
```

**Add the following monitoring script:**

```bash
#!/bin/bash

# Check if the application is running
if ! pm2 describe ai-content-platform > /dev/null 2>&1; then
    echo "$(date): Application is not running. Restarting..."
    pm2 start ecosystem.config.js
    echo "$(date): Application restarted."
fi

# Check disk space
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
    echo "$(date): Warning: Disk usage is ${DISK_USAGE}%"
fi

# Check memory usage
MEMORY_USAGE=$(free | awk 'NR==2{printf "%.2f", $3*100/$2}')
if (( $(echo "$MEMORY_USAGE > 80" | bc -l) )); then
    echo "$(date): Warning: Memory usage is ${MEMORY_USAGE}%"
fi

# Check Nginx status
if ! systemctl is-active --quiet nginx; then
    echo "$(date): Nginx is not running. Restarting..."
    sudo systemctl restart nginx
    echo "$(date): Nginx restarted."
fi
```

**Make the script executable and add to cron:**

```bash
chmod +x monitor.sh
crontab -e
```

**Add to crontab for every 5 minutes:**

```bash
*/5 * * * * /var/www/ai-content-platform/monitor.sh >> /var/log/pm2/monitor.log 2>&1
```

### 6.2 Log Rotation

```bash
sudo nano /etc/logrotate.d/ai-content-platform
```

**Add log rotation configuration:**

```
/var/log/pm2/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 0644 $USER $USER
    postrotate
        pm2 reloadLogs
    endscript
}
```

## 🔧 Step 7: Security Hardening

### 7.1 Basic Security

```bash
# Create a dedicated user for the application (optional but recommended)
sudo adduser aiapp
sudo usermod -aG sudo aiapp

# Set proper permissions
sudo chown -R aiapp:aiapp /var/www/ai-content-platform
sudo chmod -R 755 /var/www/ai-content-platform

# Secure .env.local file
sudo chmod 600 /var/www/ai-content-platform/.env.local
sudo chown aiapp:aiapp /var/www/ai-content-platform/.env.local
```

### 7.2 Setup Fail2Ban

```bash
# Install Fail2Ban
sudo apt install fail2ban -y

# Create custom configuration
sudo nano /etc/fail2ban/jail.local
```

**Add basic protection:**

```ini
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3

[sshd]
enabled = true
port = ssh
logpath = /var/log/auth.log

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
logpath = /var/log/nginx/error.log

[nginx-limit-req]
enabled = true
filter = nginx-limit-req
logpath = /var/log/nginx/error.log
maxretry = 5
```

```bash
# Restart Fail2Ban
sudo systemctl restart fail2ban
sudo systemctl enable fail2ban
```

## 🚀 Step 8: Final Verification

### 8.1 Test Application

```bash
# Check if application is running
pm2 status

# Check logs for any errors
pm2 logs ai-content-platform --lines 50

# Test API endpoint locally
curl http://localhost:3000/api/ai/generate

# Test from external (replace with your domain)
curl https://your-domain.com/api/ai/generate
```

### 8.2 Verify All Services

```bash
# Check PM2 status
pm2 status

# Check Nginx status
sudo systemctl status nginx

# Check SSL certificate
sudo certbot certificates

# Check firewall status
sudo ufw status
```

## 📝 Step 9: Backup Strategy

### 9.1 Setup Backup Script

```bash
nano backup.sh
```

```bash
#!/bin/bash

BACKUP_DIR="/var/backups/ai-content-platform"
DATE=$(date +%Y%m%d_%H%M%S)
APP_DIR="/var/www/ai-content-platform"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup application files
tar -czf "$BACKUP_DIR/app_$DATE.tar.gz" -C "$APP_DIR" .

# Backup PM2 configuration
cp "$APP_DIR/ecosystem.config.js" "$BACKUP_DIR/ecosystem_$DATE.js"

# Backup environment file (securely)
sudo cp "$APP_DIR/.env.local" "$BACKUP_DIR/env_$DATE.local"
sudo chmod 600 "$BACKUP_DIR/env_$DATE.local"

# Remove backups older than 30 days
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete
find $BACKUP_DIR -name "*.js" -mtime +30 -delete
find $BACKUP_DIR -name "*.local" -mtime +30 -delete

echo "Backup completed: $DATE"
```

```bash
chmod +x backup.sh
```

### 9.2 Schedule Backups

```bash
crontab -e
```

**Add daily backup at 2 AM:**

```bash
0 2 * * * /var/www/ai-content-platform/backup.sh >> /var/log/pm2/backup.log 2>&1
```

## 🎯 Troubleshooting

### Common Issues and Solutions

1. **Application won't start:**
   ```bash
   # Check logs
   pm2 logs ai-content-platform
   
   # Verify environment variables
   cat .env.local
   
   # Check Node.js version
   node --version
   ```

2. **Nginx 502 Bad Gateway:**
   ```bash
   # Check if application is running
   pm2 status
   
   # Check Nginx error logs
   sudo tail -f /var/log/nginx/error.log
   
   # Restart Nginx
   sudo systemctl restart nginx
   ```

3. **SSL Certificate Issues:**
   ```bash
   # Check certificate status
   sudo certbot certificates
   
   # Renew certificate manually
   sudo certbot renew
   
   # Test Nginx configuration
   sudo nginx -t
   ```

4. **High Memory Usage:**
   ```bash
   # Monitor memory usage
   pm2 monit
   
   # Restart application
   pm2 restart ai-content-platform
   
   # Adjust max memory in ecosystem.config.js
   ```

5. **API Keys Not Working:**
   ```bash
   # Verify environment variables
   pm2 env 0
   
   # Restart application after updating .env.local
   pm2 restart ai-content-platform
   ```

## 📞 Support

If you encounter issues during deployment:

1. Check application logs: `pm2 logs ai-content-platform`
2. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. Verify all services are running: `pm2 status`, `sudo systemctl status nginx`
4. Test API endpoints locally first: `curl http://localhost:3000/api/ai/generate`

Your AI Content Generation Platform is now deployed and ready for production use! 🎉