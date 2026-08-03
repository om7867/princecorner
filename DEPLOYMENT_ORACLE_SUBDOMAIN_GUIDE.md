# Deployment Guide — `restaurent.kelviontech.in` on Oracle Cloud VM

This guide provides step-by-step instructions to deploy the **Restaurant QR Ordering & CRM Platform** on your existing Oracle Cloud Infrastructure (OCI) server alongside your primary **KelvionTech** website.

---

## 1. What Has Been Automatically Configured in the Project

The project has been fully containerized and configured for multi-site deployment on a single server without port conflicts:

* **`backend/Dockerfile`**: Optimized Python 3.11 container runner with automatic database schema seeding.
* **`frontend/Dockerfile`**: Multi-stage standalone Next.js 16 container runner.
* **`docker-compose.yml`**: Configured to run on isolated host ports:
  * **Database (`restaurant-db`)**: PostgreSQL 16 on Host Port `5433` *(No conflict with KelvionTech 5432)*
  * **Backend (`restaurant-backend`)**: FastAPI on Host Port `8001` *(No conflict with KelvionTech 8000)*
  * **Frontend (`restaurant-frontend`)**: Next.js on Host Port `3001` *(No conflict with KelvionTech 3000)*
* **`nginx/restaurent.kelviontech.in.conf`**: Complete Nginx virtual host proxy for HTTP/HTTPS & WebSockets.
* **`Makefile`**: Operational tasks runner (`make deploy`, `make logs`, `make stop`, `make check`).

---

## 2. Step-by-Step Operational Instructions (Your Action Required)

Follow these steps on your domain registrar and Oracle Cloud VM:

### Step 1: Add Subdomain DNS Record
Go to your DNS provider (Cloudflare / GoDaddy / Namecheap / Hostinger where `kelviontech.in` is managed):
1. Add a new **A Record**:
   * **Type**: `A`
   * **Name / Host**: `restaurent` (or `restaurant`)
   * **Target / IP Address**: `<YOUR_ORACLE_VM_PUBLIC_IP>`
   * **TTL**: Auto or 300 seconds

---

### Step 2: SSH into Your Oracle Cloud VM & Clone/Pull Code
Connect to your VM via SSH:
```bash
ssh -i /path/to/oracle_key.pem ubuntu@<YOUR_ORACLE_VM_PUBLIC_IP>
```

Navigate to your web root or project directory (e.g. `/home/ubuntu/`) and clone this repository:
```bash
cd /home/ubuntu
git clone <YOUR_RESTAURANT_GITHUB_REPO_URL> restaurant-app
cd restaurant-app
```

---

### Step 3: Create & Configure Production `.env`
Copy the environment template:
```bash
cp .env.production.example .env
nano .env
```

Set your production secrets:
```env
POSTGRES_PASSWORD=SetAStrongRandomPassword2026!
JWT_SECRET=SetAStrong64CharRandomSecretKey2026!
SEED_OWNER_EMAIL=owner@kelviontech.in
SEED_OWNER_PASSWORD=YourSecureOwnerPassword!
```

---

### Step 4: Build & Launch Docker Containers
Run the deployment command:
```bash
make deploy
```
*(This will build the frontend & backend containers and start PostgreSQL, FastAPI, and Next.js in detached mode).*

Check that all 3 containers are healthy:
```bash
docker compose ps
```
Verify local backend response:
```bash
curl http://127.0.0.1:8001/health
# Expected Output: {"status":"ok"}
```

---

### Step 5: Configure Host Nginx
Copy the Nginx configuration file to your system Nginx directory:

```bash
# 1. Copy config file to Nginx sites-available
sudo cp nginx/restaurent.kelviontech.in.conf /etc/nginx/sites-available/restaurent.kelviontech.in.conf

# 2. Create symbolic link to enable the site
sudo ln -s /etc/nginx/sites-available/restaurent.kelviontech.in.conf /etc/nginx/sites-enabled/

# 3. Test Nginx syntax
sudo nginx -t
```

---

### Step 6: Issue SSL Certificate via Certbot
Provision a free Let's Encrypt SSL certificate for `restaurent.kelviontech.in`:

```bash
sudo certbot --nginx -d restaurent.kelviontech.in
```

When prompted:
- Enter your email address.
- Select `Redirect` to force all HTTP traffic to HTTPS automatically.

After Certbot completes, reload Nginx:
```bash
sudo systemctl reload nginx
```

---

### Step 7: Final Verification & Access Points

Your restaurant ordering platform is now live!

* **Public Guest Website & Digital Menu**: [`https://restaurent.kelviontech.in`](https://restaurent.kelviontech.in)
* **Admin & KDS Panel**: [`https://restaurent.kelviontech.in/admin/login`](https://restaurent.kelviontech.in/admin/login)
* **API Health Check**: [`https://restaurent.kelviontech.in/api/public/health`](https://restaurent.kelviontech.in/api/public/health)

#### Initial Admin Login Credentials:
- **Email**: `owner@kelviontech.in` (or your configured `SEED_OWNER_EMAIL`)
- **Password**: `ChangeMeProduction123!` (or your configured `SEED_OWNER_PASSWORD`)

> 🔒 **Security Note**: Immediately log into the admin panel and change your password!

---

## 3. Useful Day-2 Maintenance Commands

* **View Live Container Logs**: `make logs`
* **Restart Services**: `make restart`
* **Stop Services**: `make stop`
* **Update Code & Rebuild**: `git pull && make deploy`
