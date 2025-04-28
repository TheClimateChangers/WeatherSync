#!/bin/bash
# Script to set up an EC2 instance for WeatherSync deployment

# Update system packages
sudo yum update -y

# Install Git
sudo yum install git -y

# Install Python and development tools
sudo yum install python3 python3-devel python3-pip -y
sudo alternatives --set python /usr/bin/python3
sudo pip3 install --upgrade pip

# Install Node.js and npm
curl -sL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install nodejs -y

# Install Nginx
sudo amazon-linux-extras install nginx1 -y
sudo systemctl start nginx
sudo systemctl enable nginx

# Create necessary directories for Nginx
sudo mkdir -p /etc/nginx/sites-available
sudo mkdir -p /etc/nginx/sites-enabled

# Configure Nginx to use sites-enabled
if ! grep -q "include /etc/nginx/sites-enabled/\*;" /etc/nginx/nginx.conf; then
    sudo sed -i 's/include \/etc\/nginx\/conf.d\/\*.conf;/include \/etc\/nginx\/conf.d\/\*.conf;\n    include \/etc\/nginx\/sites-enabled\/\*;/' /etc/nginx/nginx.conf
fi

# Allow ec2-user to run sudo commands without password for specific services
echo "ec2-user ALL=(ALL) NOPASSWD: /usr/bin/systemctl restart nginx, /usr/bin/systemctl restart weathersync, /usr/bin/systemctl daemon-reload, /usr/bin/systemctl enable weathersync, /bin/tee /etc/nginx/sites-available/weathersync, /bin/ln -sf /etc/nginx/sites-available/weathersync /etc/nginx/sites-enabled/, /usr/sbin/nginx -t, /bin/tee /etc/systemd/system/weathersync.service" | sudo tee /etc/sudoers.d/weathersync

# Clone the repository if it doesn't exist
if [ ! -d "$HOME/WeatherSync" ]; then
    git clone https://github.com/TheClimateChangers/WeatherSync.git $HOME/WeatherSync
fi

# Set up the Python virtual environment for the backend
cd $HOME/WeatherSync/backend
python3 -m venv env
source env/bin/activate
pip install -r requirements.txt
pip install gunicorn

# Install frontend dependencies
cd $HOME/WeatherSync/frontend
npm ci

echo "====================================================="
echo "EC2 setup completed! You can now run the GitHub Actions workflow."
echo "Make sure to configure your GitHub repository with these secrets:"
echo "- EC2_HOST: Your EC2 instance's public IP or domain"
echo "- EC2_SSH_KEY: Your private SSH key for the EC2 instance"
echo "=====================================================" 