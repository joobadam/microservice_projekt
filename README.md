# 🚀 URL Shortener Microservice Project

> A production-lean microservice-based URL Shortener that showcases end-to-end DevOps practices across local development, containerization, CI/CD, Kubernetes on AWS EKS, and infrastructure-as-code with Terraform.

[![Kubernetes](https://img.shields.io/badge/kubernetes-%23326ce5.svg?style=for-the-badge&logo=kubernetes&logoColor=white)](https://kubernetes.io/)
[![AWS](https://img.shields.io/badge/AWS-%23FF9900.svg?style=for-the-badge&logo=amazon-aws&logoColor=white)](https://aws.amazon.com/)
[![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![Terraform](https://img.shields.io/badge/terraform-%235835CC.svg?style=for-the-badge&logo=terraform&logoColor=white)](https://www.terraform.io/)
[![GitHub Actions](https://img.shields.io/badge/github%20actions-%232671E5.svg?style=for-the-badge&logo=githubactions&logoColor=white)](https://github.com/features/actions)
[![Node.js](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)](https://reactjs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

> 💡 **Important Note**: Because we currently use an AWS-managed public Application Load Balancer (ALB) without a custom domain (free/demo setup), the short links appear long: `http://<alb-public-dns>/r/<code>`. If you attach a custom domain (e.g., `https://sho.rt`), short links become truly short: `https://sho.rt/r/<code>`. This is just a DNS/Ingress configuration step (plus certificate), not an application change. The backend already supports it via the `BASE_URL` environment variable.

---

## 📋 Table of Contents

- [About The Project](#-about-the-project)
  - [Architecture](#-architecture)
  - [Services](#-services)
- [Getting Started](#-getting-started)
  - [Local Development](#-local-development)
  - [Docker Images and CI](#-docker-images-and-ci)
  - [Kubernetes on AWS EKS](#-kubernetes-on-aws-eks)
  - [Infrastructure as Code](#-infrastructure-as-code-terraform)
  - [Deployment Workflow](#-deployment-workflow)
- [Configuration](#-configuration)
  - [Environment Variables](#-environment-variables)
  - [Ingress, DNS, and Long Demo URL](#-ingress-dns-and-long-demo-url)
- [API Reference](#-api-reference)
- [Troubleshooting](#-troubleshooting)
- [License](#-license)

---

## 🎯 About The Project

This repository contains a production-lean microservice-based URL Shortener that showcases end-to-end DevOps practices across local development, containerization, CI/CD, Kubernetes on AWS EKS, and infrastructure-as-code with Terraform.

**Key Features:**
- ✅ Microservices architecture with independent services
- ✅ Kubernetes orchestration on AWS EKS
- ✅ Infrastructure as Code with Terraform
- ✅ Automated CI/CD with GitHub Actions
- ✅ Containerized with Docker and published to GHCR
- ✅ Production-ready with PostgreSQL database

### 🏗️ Architecture

**Microservices:**
- 🎨 **Frontend** (React + Tailwind CSS) – served by NGINX
- 🔗 **Shortener Service** (Node.js/Express) – create and resolve short codes
- 🔄 **Redirect Service** (Node.js/Express) – public `/r/<code>` redirects
- 📊 **Analytics Service** (Node.js/Express) – click tracking and statistics

**Infrastructure:**
- 💾 **PostgreSQL** (StatefulSet on EKS for the demo)
- 🌐 **AWS Load Balancer Controller** + Ingress (ALB)
- 🤖 **GitHub Actions** (CI + Deploy), GHCR images
- 🏗️ **Terraform** for AWS (VPC, EKS, IAM/OIDC)

**Local Developer Experience:**
- 📁 File-backed mock DB (`file-db.js` + `simple-db.json`) lets Node services share state without external DB for fast iteration.

### 🔧 Services

| Service | Description | Endpoints |
|---------|-------------|-----------|
| 🎨 **Frontend** | Modern UI (Tailwind, glassmorphism, animated background) | Talks to backend via Ingress in demo, via service URLs locally |
| 🔗 **Shortener Service** | Create and resolve short codes | `POST /api/shorten`, `GET /api/url/:shortCode` |
| 🔄 **Redirect Service** | Public `/r/<code>` redirects | `GET /r/:shortCode` → 302/301 Location |
| 📊 **Analytics Service** | Click tracking and statistics | `POST /api/track`, `GET /api/stats/:shortCode` |

**Service Details:**

- **Shortener Service**
  - `POST /api/shorten` to create short links
  - `GET /api/url/:shortCode` to resolve the original URL (used by redirect/analytics)
  - Emits links as `${BASE_URL}/r/<code>`

- **Redirect Service**
  - `GET /r/:shortCode` returns 302/301 Location to the original URL
  - Falls back to `shortener-service` HTTP API if local lookup misses, then caches

- **Analytics Service**
  - `POST /api/track` persists click events
  - `GET /api/stats/:shortCode` returns stats (clicks, lastClickedAt, etc.)
  - Falls back to `shortener-service` HTTP API to validate codes and return zeroed stats if needed

---

## 🚀 Getting Started

### 💻 Local Development

No Docker required for fast iteration:

```bash
# Frontend
cd frontend && npm install && npm start

# Backends (in separate terminals)
cd shortener-service && npm install && node src/server.js
cd redirect-service && npm install && node src/server.js
cd analytics-service && npm install && node src/server.js
```

> 💡 **Note**: Local services share a simple file-backed data store (`simple-db.json`). Frontend defaults to `http://localhost` base; can be overridden with `REACT_APP_API_URL`.

### 🐳 Docker Images and CI

- 🐳 Dockerfiles for all services; images are published to GHCR with the `:main` tag.
- 🤖 **GitHub Actions workflows:**
  - **CI**: builds and validates services
  - **Docker Publish**: builds and pushes images to GHCR

### ☸️ Kubernetes on AWS EKS

- 📦 **Namespace**: `urlshortener`
- 📁 **Manifests** under `k8s/`: Deployments/Services, Postgres StatefulSet, Ingress
- 🌐 **AWS Load Balancer Controller** exposes a public ALB hostname

### 🏗️ Infrastructure as Code (Terraform)

- 📁 **Files**: `infra/terraform/*`
- 🏗️ **Provisions**: VPC, subnets (2 AZs), EKS cluster, IAM roles, OIDC provider
- 📤 **Outputs** feed the Deploy workflow variables (region, cluster name, role ARN)

### 🔄 Deployment Workflow

1. 📤 Push to `main`
2. 🤖 **GitHub Actions:**
   - Build and push GHCR images (`:main`)
   - Assume AWS role via OIDC
   - `kubectl apply` manifests in `k8s/`
3. 🌐 Access the app via the ALB public DNS shown on the Ingress

---

## ⚙️ Configuration

### 🌐 Environment Variables

**Backend (selection):**
- `BASE_URL` – public base (ALB or your domain)
- `SHORTENER_SERVICE_URL` – internal URL for shortener (default `http://shortener-service:5000`)
- `ANALYTICS_SERVICE_URL` – internal URL for analytics (default `http://analytics-service:5002`)
- `DB_*` – Postgres connection params (EKS demo)

**Frontend:**
- `REACT_APP_API_URL` – optional override for API base

### 🌍 Ingress, DNS, and Long Demo URL

Because we use the ALB public DNS in the free demo, short links look long (`http://<alb>/r/<code>`). When you attach your own domain and set `BASE_URL` in the Shortener deployment (plus TLS cert in Ingress), links become truly short (e.g., `https://sho.rt/r/<code>`). The application already supports this; only configuration is needed.

---

## 📡 API Reference

### Shortener Service

| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| `POST` | `/api/shorten` | `{ url }` | `{ shortUrl, originalUrl, shortCode, createdAt }` |
| `GET` | `/api/url/:shortCode` | - | `{ originalUrl, createdAt }` |

### Redirect Service

| Method | Endpoint | Response |
|--------|----------|----------|
| `GET` | `/r/:shortCode` | 302/301 Location: originalUrl |

### Analytics Service

| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| `POST` | `/api/track` | - | 201 |
| `GET` | `/api/stats/:shortCode` | - | `{ shortCode, originalUrl, clickCount, lastClickedAt }` |

---

## 🔧 Troubleshooting

| Issue | Solution |
|-------|----------|
| 🐳 **ImagePullBackOff** | Ensure images are public on GHCR or configure `imagePullSecrets`<br>Use the `:main` tag in deployments to match the CI push |
| 🔗 **404 on `/r/<code>`** | Ingress must route `/r/` to the redirect service<br>Shortener must emit `/r/<code>` links (`BASE_URL` set) |
| 📊 **404 on `/api/stats/<code>`** | The analytics service will fall back to the shortener API; ensure the code exists |
| 💾 **Postgres Pending** | Check storage class (`gp2`) and EBS CSI/IAM permissions |

---

## 📄 License

Distributed under the MIT License. See `LICENSE` file for more information.

---

<p align="right">(<a href="#-url-shortener-microservice-project">back to top</a>)</p>
