# GitHub to VPS Deployment Guide (aaPanel + GitHub Actions)

This guide explains how to set up automatic deployment for **Hishab Kitab**. Every time you push to the `main` branch on GitHub, your changes will automatically be deployed to your VPS.

## Prerequisites

1.  **VPS** with **aaPanel** installed.
2.  **Node.js** installed on your VPS (via aaPanel App Store or terminal).
3.  **Git** installed on your VPS.
4.  **PM2** Manager installed on your VPS (via aaPanel App Store).

---

## Step 1: Prepare the VPS (aaPanel)

1.  **Login to your VPS** via SSH (using Terminal or PowerShell).
    ```bash
    ssh root@your_vps_ip
    ```
2.  **Generate an SSH Key** (if you don't have one already on the server):
    ```bash
    ssh-keygen -t rsa -b 4096 -C "deploy_key"
    # Press Enter for all prompts (no passphrase)
    ```
3.  **Add the Public Key to Authorized Keys**:
    ```bash
    cat ~/.ssh/id_rsa.pub >> ~/.ssh/authorized_keys
    chmod 600 ~/.ssh/authorized_keys
    ```
4.  **Copy the Private Key**:
    You will need this for GitHub later.
    ```bash
    cat ~/.ssh/id_rsa
    ```
    *(Copy the entire block starting with `-----BEGIN OPENSSH PRIVATE KEY-----` and ending with `-----END OPENSSH PRIVATE KEY-----`)*.

---

## Step 2: Clone the Repository on VPS

1.  **Navigate to your website directory**:
    ```bash
    mkdir -p /www/wwwroot/hishabkitab.codteg.com
    cd /www/wwwroot/hishabkitab.codteg.com
    ```
    *(Replace `hishabkitab.codteg.com` with your actual folder name if different)*.

2.  **Clone the repository**:
    ```bash
    git clone https://github.com/mahadebmondal004/hishabkitab.git .
    ```

3.  **Install Dependencies**:
    ```bash
    cd backend
    npm install --production
    ```

4.  **Create/Copy Environment Variables**:
    *   Create a `.env` file in the `backend` folder on your VPS.
    *   Copy the contents from your local `.env` to this file.

5.  **Start the Application with PM2**:
    ```bash
    npx pm2 start src/app.js --name "hishab-kitab"
    npx pm2 save
    ```

---

## Step 3: Configure GitHub Secrets

1.  Go to your GitHub Repository: [https://github.com/mahadebmondal004/hishabkitab](https://github.com/mahadebmondal004/hishabkitab)
2.  Navigate to **Settings** > **Secrets and variables** > **Actions**.
3.  Click **New repository secret**.
4.  Add the following secrets:

    | Name | Value |
    | :--- | :--- |
    | `VPS_HOST` | Your VPS IP Address (e.g., `89.117.188.103`) |
    | `VPS_USERNAME` | `root` (or your SSH username) |
    | `SSH_PRIVATE_KEY` | The private key you copied in Step 1 (starts with `-----BEGIN...`) |
    | `VPS_PORT` | `22` (or your SSH port if different) |

---

## Step 4: Test Deployment

1.  Make a change to your code locally.
2.  Commit and Push to GitHub:
    ```bash
    git add .
    git commit -m "Testing deployment"
    git push origin main
    ```
3.  Go to the **Actions** tab in your GitHub repository.
4.  You should see the "Deploy to VPS" workflow running.
5.  Once green (Success), check your live website!

---

## Troubleshooting

*   **Permission Denied**: Ensure `~/.ssh/authorized_keys` has the correct permissions (`chmod 600`).
*   **Git Pull Failed**: You might need to set up the VPS Git user identity:
    ```bash
    git config --global user.email "you@example.com"
    git config --global user.name "Your Name"
    ```
*   **Env Variables**: Don't forget to create the `.env` file on the server manually; it is **ignored** by Git for security.
