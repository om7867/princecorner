# KelvionTech — Complete Project Architecture & Oracle Cloud Deployment Guide

This document provides a comprehensive technical breakdown of how **KelvionTech** is designed, structured, and built, as well as an exhaustive, step-by-step operational guide on how it is deployed on **Oracle Cloud Infrastructure (OCI)** using an Always Free Ampere VM with Docker Compose, Nginx, and automated Let's Encrypt TLS encryption.

---

## Table of Contents

1. [Project Overview & Architecture](#1-project-overview--architecture)
   - [Monorepo Directory Structure](#monorepo-directory-structure)
   - [Backend Architecture & Tech Stack](#backend-architecture--tech-stack)
   - [Frontend Architecture & WebGL 3D Portfolio](#frontend-architecture--webgl-3d-portfolio)
   - [Admin CMS & Management Suite](#admin-cms--management-suite)
   - [Authentication, RBAC & Security System](#authentication-rbac--security-system)
   - [Database, Schema Patching & Seeding](#database-schema-patching--seeding)
2. [Deploying KelvionTech on Oracle Cloud Infrastructure (OCI)](#2-deploying-kelviontech-on-oracle-cloud-infrastructure-oci)
   - [High-Level Architecture Diagram](#high-level-architecture-diagram)
   - [Step 1: Provisioning the Oracle Cloud VM](#step-1-provisioning-the-oracle-cloud-vm)
   - [Step 2: Dual Firewall Configuration (Cloud & OS)](#step-2-dual-firewall-configuration-cloud--os)
   - [Step 3: Docker & Host Environment Setup](#step-3-docker--host-environment-setup)
   - [Step 4: Cloning Code & Environment Configuration](#step-4-cloning-code--environment-configuration)
   - [Step 5: Launching the Stack](#step-5-launching-the-stack)
   - [Step 6: Domain & Automated HTTPS (SSL) Setup](#step-6-domain--automated-https-ssl-setup)
   - [Step 7: Production Hardening & Network Isolation](#step-7-production-hardening--network-isolation)
3. [Day-2 Operations & Maintenance](#3-day-2-operations--maintenance)
   - [Operational Command Reference (Makefile)](#operational-command-reference-makefile)
   - [Automated Database Backups & Offsite Sync](#automated-database-backups--offsite-sync)
4. [Troubleshooting Common Production Issues](#4-troubleshooting-common-production-issues)

---

## 1. Project Overview & Architecture

**KelvionTech** ([kelviontech.in](https://kelviontech.in)) is a full-stack digital software engineering studio in Ahmedabad, Gujarat, India, combining an immersive WebGL/Three.js 3D portfolio website with a comprehensive back-office content management system (CMS) and business CRM suite.

- **Live Production Domain**: [`https://kelviontech.in`](https://kelviontech.in)
- **Tagline**: *"We build what others dream."*
- **Contact Email**: `kelviontech@gmail.com`
- **Social Profiles**: [LinkedIn](https://www.linkedin.com/company/kelviontech) · [GitHub](https://github.com/kelviontech) · [X / Twitter](https://x.com/kelviontech) · [Instagram](https://instagram.com/kelviontech)
- **Services Offered**: Web, Mobile, Cloud Infrastructure, AI / ML Systems, Product Design, & Technical Consulting.

### Monorepo Directory Structure

```
kelviontech/
├── backend/                  # FastAPI (Python 3.11/3.12) REST API & Business Logic
│   ├── app/
│   │   ├── api/v1/          # Modular API Endpoint Routers
│   │   ├── auth/            # JWT Token, Password Hashing, Permission Checkers
│   │   ├── core/            # Exceptions, Pagination, Custom Response Utilities
│   │   ├── middleware/      # Rate Limiting & Host Header Security Middleware
│   │   ├── models/          # SQLAlchemy 2.0 ORM Models
│   │   ├── repositories/    # Database Data Access Layer
│   │   ├── schemas/         # Pydantic v2 Request/Response Schemas
│   │   ├── services/        # Business Logic Services (Email, Media Storage, etc.)
│   │   ├── config.py        # Centralized Pydantic BaseSettings Configuration
│   │   ├── database.py      # Async SQLAlchemy Engine & Session Factory
│   │   └── main.py          # FastAPI App Lifespan, Middleware & Schema Patcher
│   ├── seed.py              # Idempotent Database Initial Seeder
│   ├── migrate.py           # Dry-run / Manual Schema Synchronization Utility
│   ├── Dockerfile           # Python 3.11 Slim Production Image
│   └── requirements.txt     # Backend Dependencies
│
├── frontend/                 # Next.js 14 Web Application (WebGL Site + Admin CMS)
│   ├── app/
│   │   ├── (public)/        # Root WebGL 3D Portfolio Page Router
│   │   └── admin/           # Admin CMS Dashboard Route Group (/admin)
│   ├── components/          # Three.js / WebGL Canvas & 3D Interactive Nodes
│   ├── src/
│   │   ├── components/      # Admin Panel UI Components (Shadcn + Radix UI)
│   │   ├── services/        # API Client Services (TanStack Query integrations)
│   │   ├── store/           # Zustand Client-side State Stores
│   │   └── types/           # TypeScript Types & Interfaces
│   ├── lib/                 # Shared Utilities (API Origin, Server API client, SEO)
│   ├── Dockerfile           # Multi-stage Next.js Node 18 Production Image
│   └── package.json
│
├── nginx/                    # Production Reverse Proxy Configuration & Templates
│   ├── nginx.conf           # Rendered Nginx Configuration
│   ├── templates/           # Nginx Configuration Templates (HTTP / HTTPS)
│   └── conf.d/              # Location & Upstream Proxy Blocks
│
├── scripts/                  # Automated Operational & Deployment Scripts
│   ├── render-nginx.sh      # Generates nginx.conf from templates based on .env
│   ├── enable-ssl.sh        # Executes Certbot staging test & issues production SSL cert
│   ├── healthcheck.sh       # Comprehensive post-deployment verification script
│   ├── backup.sh            # Database dump & media tarball creator (retains 14 days)
│   └── restore.sh           # Safe snapshot restoration script
│
├── docker-compose.yml        # Production Docker Stack (Postgres, Backend, Frontend, Nginx, Certbot)
├── docker-compose.dev.yml    # Development Overrides (Hot-reload, published dev ports)
├── Makefile                  # Task Runner for operations, deployments, backups, and shell access
├── .env.example              # Central Environment Template
└── DEPLOYMENT.md             # Production Deployment Runbook
```

---

### Backend Architecture & Tech Stack

The backend is built with high-performance, asynchronous **FastAPI** running on Python 3.11/3.12 with **SQLAlchemy 2.0** for database ORM operations over `asyncpg`.

- **Framework**: FastAPI (Asynchronous Python REST API framework).
- **Database Engine**: PostgreSQL 16 managed via `asyncpg` async connection pools.
- **Data Validation**: Pydantic v2 schemas for strict input/output verification.
- **ORM & Models**: SQLAlchemy 2.0 Declarative ORM.
- **Authentication**: JWT (JSON Web Tokens) with dual token architecture:
  - Short-lived Access Tokens (30 minutes default).
  - Long-lived Refresh Tokens (1 to 7 days).
- **Security & Password Hashing**: Argon2 / Passlib Bcrypt password hashing.
- **Rate Limiting**: Custom sliding-window memory rate-limiting middleware (`RateLimiterMiddleware`).
- **Dynamic Schema Self-Healing**: `backend/app/main.py` contains a built-in boot-time patcher (`_SCHEMA_PATCHES`) that inspects PostgreSQL schema and automatically adds missing columns and default values on boot, preventing database drift errors without complex migration locks.

---

### Frontend Architecture & WebGL 3D Portfolio

The frontend is a **Next.js 14 App Router** application serving two distinct user experiences from a single unified codebase:

1. **Public WebGL 3D Portfolio (`/`)**:
   - Built with **Three.js** and WebGL canvas components (`KelvionExperience`).
   - Implements dynamic 3D particle starfields, interactive floating nodes, ambient lighting, and high-performance WebGL shaders.
   - Smooth scrolling powered by **Lenis**.
   - Server-Side Rendered (SSR) with dynamic SEO metadata generation (`generateMetadata()`) and automatic Schema.org Organization JSON-LD generation for optimal local and global search engine visibility.

2. **Admin CMS Panel (`/admin`)**:
   - Modern dashboard interface utilizing **Shadcn UI** and **Tailwind CSS**.
   - Data fetching and caching powered by **TanStack Query v5 (React Query)**.
   - Global client state managed via **Zustand** stores.
   - Form state management and schema validation via **React Hook Form** + **Zod**.

---

### Admin CMS & Management Suite

The embedded CMS allows administrators to control and operate the entire system live without rebuilding code:

- **Dynamic Content Manager**: Edit titles, copy, images, and section visibility for Hero, About, Services, Process, Work/Portfolio, and Contact sections.
- **Dynamic Form Builder**: Construct custom public forms, define required fields, field types, submission labels, and notification recipient emails (`notify_email`).
- **Lead Capture & CRM**: Receives and logs enquiries, tracks sender IP, unread states, and allows replying directly from the dashboard.
- **Business Operations**:
  - **Clients & Pipeline**: CRM lead stages, deal values, follow-up dates.
  - **Projects & Milestones**: Client project tracking, progress bars, tech stack tags, portfolio toggles.
  - **Invoicing & Payments**: Business invoice creation, tax calculations, payment status, PDF receipts.
  - **Expenses & Finance**: Categorized business expense tracking.
  - **Team & Tasks**: Internal team member directory, task assignments, time logging.
  - **Testimonials & Blog**: Customer reviews and public blog post editor.
  - **Daily Briefings**: Executive summary briefs and daily metrics.

---

### Authentication, RBAC & Security System

Access to the API and Admin CMS is secured by a fine-grained Role-Based Access Control (**RBAC**) system:

- **Permissions**: 34 granular system permissions covering pages, sections, media, users, roles, forms, analytics, audit logs, clients, projects, invoices, and settings.
- **Seeded System Roles**:
  1. `super_admin`: Full system access across all 34 permissions.
  2. `admin`: Full administrative access (excluding role management).
  3. `editor`: Content editing, media uploads, navigation, forms, and SEO.
  4. `content_writer`: Content modification and media uploads only.
  5. `viewer`: Read-only access to content and analytics.
- **Audit Logging**: Every sensitive action (login, content modification, user deletion, settings changes) is recorded in the `audit_logs` table with timestamp, user ID, IP address, and payload diffs.

---

### Database, Schema Patching & Seeding

- **PostgreSQL 16 Engine**: Stores relational site content, user accounts, security tokens, CRM records, and media metadata.
- **Automatic Schema Patching**: At application boot in `backend/app/main.py`, `_SCHEMA_PATCHES` runs schema statements safely across isolated transactions. If new model columns are added, existing database schemas heal automatically without requiring manual SQL commands.
- **Idempotent Seeding (`seed.py`)**: Populates default site configurations, system permissions, 5 standard roles, default admin user, standard contact form definition, and initial page sections if missing.

---

## 2. Deploying KelvionTech on Oracle Cloud Infrastructure (OCI)

This section details the exact production deployment architecture on an **Oracle Cloud Always Free** Ampere VM instance.

---

### High-Level Architecture Diagram

```
                              Internet
                                 │
                         Ports 80 & 443 (HTTP/HTTPS)
                                 │
                       ┌─────────▼─────────┐
                       │   Oracle VCN /    │  (Security List Firewall)
                       │   Ubuntu IPtables │
                       └─────────┬─────────┘
                                 │
                       ┌─────────▼─────────┐
                       │       Nginx       │  (Reverse Proxy & SSL Termination)
                       └─────────┬─────────┘
            ┌────────────────────┼────────────────────┐
            │ /api/*             │ /uploads/*         │ (All other paths)
            │                    │                    │
     ┌──────▼──────┐      ┌──────▼──────┐      ┌──────▼──────┐
     │   Backend   │      │ Media Volume│      │  Frontend   │
     │  (FastAPI)  │      │  (/uploads) │      │  (Next.js)  │
     └──────┬──────┘      └─────────────┘      └─────────────┘
            │ (Port 5432 Internal Docker Network)
     ┌──────▼──────┐
     │ PostgreSQL  │
     │     16      │
     └─────────────┘

 * ONLY Nginx exposes public host ports (80/443).
 * PostgreSQL and FastAPI are strictly internal to the Docker network.
```

---

### Step 1: Provisioning the Oracle Cloud VM

1. Log in to the **Oracle Cloud Console**.
2. Navigate to **Compute → Instances → Create Instance**.
3. Configure the VM parameters:
   - **Name**: `kelviontech-prod`
   - **Image**: **Ubuntu 24.04 LTS** (Canonical, Always Free Eligible).
   - **Shape**: **Ampere → VM.Standard.A1.Flex** (Set to **4 OCPU** and **24 GB RAM**).
   - **Networking**: Select your default Virtual Cloud Network (VCN) and public subnet. Ensure **Assign a public IPv4 address** is checked.
   - **SSH Keys**: Select **Generate a key pair for me** and download both private and public key files immediately.
   - **Boot Volume**: Default (50 GB) or up to 200 GB Always Free allocation.
4. Click **Create**.
   *(Note: If you encounter an `Out of host capacity` message in regions like `ap-mumbai-1`, retry periodically or select a different Availability Domain).*
5. Record the assigned **Public IP Address**.

---

### Step 2: Dual Firewall Configuration (Cloud & OS)

Oracle Cloud requires opening ports in **two separate layers**. Failing to configure either will render the site unreachable.

#### Layer 1: Oracle Cloud Security List (VCN Level)
1. Go to **Compute → Instances → click your instance → Subnet link**.
2. Click on the **Default Security List**.
3. Click **Add Ingress Rules** and add the following rules:

| Source | IP Protocol | Destination Port Range | Description |
| :--- | :--- | :--- | :--- |
| `0.0.0.0/0` | TCP | `80` | HTTP Web Traffic |
| `0.0.0.0/0` | TCP | `443` | HTTPS Encrypted Traffic |
| `0.0.0.0/0` | TCP | `22` | SSH Administration (Default) |

#### Layer 2: Ubuntu OS Firewall (`iptables`)
Connect via SSH to your VM:

```bash
chmod 600 /path/to/ssh-private-key.key
ssh -i /path/to/ssh-private-key.key ubuntu@<YOUR_PUBLIC_IP>
```

Run the following commands inside the VM to permit web traffic through the host OS firewall:

```bash
sudo iptables -I INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT -p tcp --dport 443 -j ACCEPT
sudo netfilter-persistent save
```

---

### Step 3: Docker & Host Environment Setup

Update host packages and install Docker, Docker Compose, Git, and Make:

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git make curl net-tools

# Install official Docker Engine & Docker Compose Plugin
curl -fsSL https://get.docker.com | sudo sh

# Grant docker group permissions to ubuntu user
sudo usermod -aG docker $USER
newgrp docker

# Verify installation
docker --version && docker compose version
```

---

### Step 4: Cloning Code & Environment Configuration

1. Clone the project repository:

```bash
git clone https://github.com/kelviontech-solution/KelvionTech.git
cd KelvionTech
```

2. Create the production `.env` file from `.env.example`:

```bash
cp .env.example .env
nano .env
```

3. Configure minimum required environment variables:

```env
# Database Credentials
POSTGRES_DB=kelviontech
POSTGRES_USER=kelvion
POSTGRES_PASSWORD=<generate-strong-password>

# JWT Security
SECRET_KEY=<generate-64-char-hex-string>

# Administrative Account
ADMIN_EMAIL=kelviontech@gmail.com
ADMIN_PASSWORD=<your-secure-admin-password>

# Domain & URLs
PUBLIC_URL=http://<YOUR_PUBLIC_IP>
ALLOWED_HOSTS=*

# SMTP Email Settings (Gmail App Password)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=kelviontech@gmail.com
SMTP_PASSWORD=<your-16-char-gmail-app-password>
SMTP_FROM=kelviontech@gmail.com
SMTP_TLS=true

# Environment
ENVIRONMENT=production
```

> **Security Rule**: The FastAPI backend will intentionally reject startup if `ADMIN_PASSWORD` is left as `Admin@123456` or if `SECRET_KEY` is missing.

---

### Step 5: Launching the Stack

Build containers, render Nginx configuration, and bring up the service stack using `Make`:

```bash
make deploy
```

What `make deploy` executes automatically:
1. `git pull` (Pulls latest production branch code).
2. `./scripts/render-nginx.sh` (Processes Nginx template into `nginx/nginx.conf`).
3. `docker compose up -d --build` (Builds Next.js and FastAPI images and launches containers).
4. `docker compose up -d --force-recreate nginx` (Rebinds Nginx configuration mounts).

Verify that all services are healthy:

```bash
make check
```

Output checks:
- Configuration validation (`.env` values populated).
- Container health status (PostgreSQL, Backend, Frontend, Nginx, Certbot).
- API HTTP routing (`/health` returns 200 OK).
- Uploads folder access (`/uploads/` endpoint routing).
- Contact form integration.

Your site is now live at `http://<YOUR_PUBLIC_IP>` and the Admin panel is accessible at `http://<YOUR_PUBLIC_IP>/admin/login`.

---

### Step 6: Domain & Automated HTTPS (SSL) Setup

To attach a domain (e.g., `kelviontech.com`) and secure it with Let's Encrypt SSL:

1. **Configure DNS Records** at your domain registrar pointing to your Oracle VM Public IP:
   - Type `A`: `@` → `<YOUR_PUBLIC_IP>`
   - Type `A`: `www` → `<YOUR_PUBLIC_IP>`

2. **Update `.env` on the VM**:

```bash
nano .env
```
Set:
```env
DOMAIN=kelviontech.com
ACME_EMAIL=your-email@example.com
PUBLIC_URL=https://kelviontech.com
```

3. **Provision SSL Certificate**:

```bash
make ssl
```

The `make ssl` script (`scripts/enable-ssl.sh`):
- Runs an ACME staging dry-run against Let's Encrypt to ensure DNS resolution is active without hitting rate limits.
- Obtains the live SSL certificate via ACME webroot challenge.
- Switches Nginx to HTTPS configuration, enables HTTP/2, HSTS headers, and HTTP-to-HTTPS 301 redirects.
- Restarts Nginx cleanly.

4. **Automatic Certificate Renewal**:
   The stack includes a background `certbot` container in `docker-compose.yml` that checks certificate expiration every 12 hours and auto-renews certificates before they expire.

---

### Step 7: Production Hardening & Network Isolation

The KelvionTech deployment enforces strict network isolation principles:

1. **No Exposed Database Port**: PostgreSQL (Port 5432) has **no `ports:` definition** in `docker-compose.yml`. Docker bypasses OS iptables rules when ports are published; omitting `ports:` guarantees PostgreSQL is accessible **only** within the internal Docker bridge network or via `make db-shell`.
2. **No Exposed API Port**: FastAPI (Port 8000) is also unexposed to the host internet. All public client requests enter through Nginx on Port 80/443.
3. **Internal Server-Side Rendering (SSR)**: Next.js SSR requests communicate directly with FastAPI using internal container DNS (`http://backend:8000`), ensuring server rendering traffic never traverses external networks.
4. **Log Rotation**: Container logs are capped at `10 MB` per file with a maximum of 3 rotation files (`max-size: "10m"`, `max-file: "3"`), preventing host disk saturation.

---

## 3. Day-2 Operations & Maintenance

### Operational Command Reference (Makefile)

All routine administration commands are wrapped in `Makefile` targets:

| Command | Action |
| :--- | :--- |
| `make deploy` | Pulls latest code, rebuilds containers, re-renders Nginx, and applies updates safely. |
| `make check` | Runs full environment, container health, HTTP routing, and SSL diagnostic tests. |
| `make ps` | Displays container status and health check outcomes. |
| `make logs` | Tails live container output for all services. |
| `make logs-backend` | Tails backend FastAPI container logs. |
| `make logs-frontend` | Tails frontend Next.js container logs. |
| `make restart` | Restarts all containers without rebuilding (used after `.env` modifications). |
| `make db-shell` | Opens an interactive `psql` shell inside the running PostgreSQL container. |
| `make seed` | Re-runs `seed.py` (idempotent; restores default roles, permissions, or missing forms). |
| `make prune` | Reclaims host disk space by removing unused Docker images and build caches. |

---

### Automated Database Backups & Offsite Sync

#### 1. Server-Side Automated Backup
To configure automated daily database and media backups at 3:00 AM:

```bash
crontab -e
```

Add the following cron entry:
```cron
0 3 * * * cd /home/ubuntu/KelvionTech && make backup >> backups/cron.log 2>&1
```

`make backup` creates a compressed timestamped archive in `backups/kelviontech_YYYYMMDD_HHMMSS.tar.gz` (retaining the last 14 snapshots automatically).

#### 2. Offsite Backup Download (From your local computer)
To fetch the latest server backup to your local machine:

1. Configure your local SSH config (`~/.ssh/config`):
```config
Host kelvion
    HostName <YOUR_ORACLE_PUBLIC_IP>
    User ubuntu
    IdentityFile ~/.ssh/oracle_key.pem
```

2. Run from your local terminal inside the repo directory:
```bash
make pull-backup
```
This downloads the newest database snapshot directly to your local `backups/` directory.

#### 3. Database Restoration
To restore a snapshot archive on the server:

```bash
make restore FILE=backups/kelviontech_20260803_030000.tar.gz
```

---

## 4. Troubleshooting Common Production Issues

### Issue 1: Uploaded Media / Images Return 404
- **Cause**: Nginx configuration template was not rendered after updating `.env`, or Nginx container did not reload location mounts.
- **Solution**: Run `./scripts/render-nginx.sh && make reload-nginx`.

### Issue 2: Contact Form Missing on Frontend
- **Cause**: Default contact form record missing in database table.
- **Solution**: Execute `make seed` to restore default form schemas and settings.

### Issue 3: Email Notifications Not Arriving
- **Cause**: Invalid Gmail App Password or incorrect SMTP configuration.
- **Solution**: Check backend email logs using `make logs-backend | grep -i email`. Verify `SMTP_USER` and `SMTP_PASSWORD` in `.env` (ensure 16-character app password has no spaces), then run `make restart`.

### Issue 4: Backend Container in Crash Loop
- **Cause**: Unchanged default `ADMIN_PASSWORD` in production `.env`, or mismatch between `POSTGRES_PASSWORD` and `DATABASE_URL`.
- **Solution**: Inspect errors with `make logs-backend`. Update `ADMIN_PASSWORD` in `.env` to a custom string and execute `make restart`.

### Issue 5: Server Out of Disk Space
- **Cause**: Accumulated Docker build cache or old untagged container images.
- **Solution**: Execute `make prune` to safely purge build cache and unused image layers.

---
*Documented for KelvionTech Infrastructure & Operations.*
