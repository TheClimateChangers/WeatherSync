# WeatherSync Deployment Guide

This document explains how to set up and use the CI/CD pipeline for deploying WeatherSync to an EC2 instance.

## Prerequisites

1. An AWS EC2 instance running Amazon Linux 2
2. SSH access to the EC2 instance
3. GitHub repository with the WeatherSync codebase

## Initial EC2 Setup

Before your first deployment, you need to set up your EC2 instance with all required dependencies. Follow these steps:

1. SSH into your EC2 instance:
   ```
   ssh -i /path/to/your-key.pem ec2-user@your-ec2-public-ip
   ```

2. Copy the `setup_ec2.sh` script to your EC2 instance:
   ```
   scp -i /path/to/your-key.pem setup_ec2.sh ec2-user@your-ec2-public-ip:~/
   ```

3. Make the script executable and run it:
   ```
   chmod +x setup_ec2.sh
   ./setup_ec2.sh
   ```

This script will:
- Install Git, Python, Node.js, and Nginx
- Set up appropriate permissions
- Create necessary directories
- Clone the repository if it doesn't exist

## GitHub Repository Setup

You need to add the following secrets to your GitHub repository:

1. Go to your GitHub repository → Settings → Secrets and variables → Actions
2. Add the following secrets:
   - `EC2_HOST`: Your EC2 instance's public IP or domain name
   - `EC2_SSH_KEY`: The private SSH key content (the entire key including BEGIN and END lines)

## CI/CD Pipeline Workflow

The CI/CD pipeline consists of two main jobs:

1. **Test**: Runs backend tests and frontend linting
2. **Deploy**: Deploys the application to the EC2 instance if tests pass

The workflow is triggered automatically when:
- Code is pushed to `main` or `mark-dev` branches
- A pull request is created against `main` or `mark-dev` branches

However, deployment only occurs when code is pushed to these branches, not on pull requests.

## What Gets Deployed

The deployment process:

1. Updates the codebase on the EC2 instance to the latest version from GitHub
2. Installs or updates backend dependencies and runs migrations
3. Builds the frontend code
4. Sets up Nginx as a reverse proxy to serve:
   - Frontend static files from `/home/ec2-user/WeatherSync/frontend/dist`
   - Backend API at the `/api` path
   - Django admin at the `/admin` path
5. Configures Gunicorn to run the Django application
6. Sets up systemd services for reliable application management

## Manual Deployment

If needed, you can manually run the deployment by:

1. Going to the GitHub repository → Actions
2. Selecting the "WeatherSync CI/CD Pipeline" workflow
3. Clicking "Run workflow" and selecting the branch to deploy

## Troubleshooting

If deployment fails, check:

1. GitHub Actions logs for error messages
2. EC2 instance logs:
   ```
   sudo systemctl status weathersync
   sudo systemctl status nginx
   sudo journalctl -u weathersync
   ```

3. Application logs in the backend directory:
   ```
   cat ~/WeatherSync/backend/backend.log
   ```

## Architecture

The deployed application uses the following architecture:

```
Client → Nginx (Port 80) → 
  ├── / → Frontend static files (React/Vite)
  └── /api/, /admin/ → Gunicorn (Port 8000) → Django Backend
```

This setup provides:
- Efficient serving of static content
- Robust application hosting with Gunicorn
- Automatic restarts via systemd
- Clean separation of frontend and backend 