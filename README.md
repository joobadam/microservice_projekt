# URL Shortener Microservice Project

This repository contains a production-lean microservice-based URL Shortener that showcases end-to-end DevOps practices across local development, containerization, CI/CD, Kubernetes on AWS EKS, and infrastructure-as-code with Terraform.

Important note about the demo URL: because we currently use an AWS-managed public Application Load Balancer (ALB) without a custom domain (free/demo setup), the short links appear long. They look like:

```
http://<alb-public-dns>/r/<code>
```

If you attach a custom domain (e.g., `https://sho.rt`), short links become truly short:

```
https://sho.rt/r/<code>
```

This is just a DNS/Ingress configuration step (plus certificate), not an application change. The backend already supports it via the `BASE_URL` environment variable.

## Table of Contents
- [Architecture](#architecture)
- [Services](#services)
- [Local Development](#local-development)
- [Docker Images and CI](#docker-images-and-ci)
- [Kubernetes on AWS EKS](#kubernetes-on-aws-eks)
- [Infrastructure as Code (Terraform)](#infrastructure-as-code-terraform)
- [Deployment Workflow](#deployment-workflow)
- [Ingress, DNS, and Long Demo URL](#ingress-dns-and-long-demo-url)
- [Environment Variables](#environment-variables)
- [HTTP APIs](#http-apis)
- [Troubleshooting](#troubleshooting)
- [License](#license)

## Architecture

Microservices:
- Frontend (React + Tailwind CSS) – served by NGINX
- Shortener Service (Node.js/Express) – create and resolve short codes
- Redirect Service (Node.js/Express) – public `/r/<code>` redirects
- Analytics Service (Node.js/Express) – click tracking and statistics

Infrastructure pieces:
- PostgreSQL (StatefulSet on EKS for the demo)
- AWS Load Balancer Controller + Ingress (ALB)
- GitHub Actions (CI + Deploy), GHCR images
- Terraform for AWS (VPC, EKS, IAM/OIDC)

Local developer experience:
- File-backed mock DB (`file-db.js` + `simple-db.json`) lets Node services share state without external DB for fast iteration.

## Services

- Frontend
  - Modern UI (Tailwind, glassmorphism, animated background)
  - Talks to backend via Ingress in demo, via service URLs locally

- Shortener Service
  - `POST /api/shorten` to create short links
  - `GET /api/url/:shortCode` to resolve the original URL (used by redirect/analytics)
  - Emits links as `${BASE_URL}/r/<code>`

- Redirect Service
  - `GET /r/:shortCode` returns 302/301 Location to the original URL
  - Falls back to `shortener-service` HTTP API if local lookup misses, then caches

- Analytics Service
  - `POST /api/track` persists click events
  - `GET /api/stats/:shortCode` returns stats (clicks, lastClickedAt, etc.)
  - Falls back to `shortener-service` HTTP API to validate codes and return zeroed stats if needed

## Local Development

No Docker required for fast iteration:

```bash
# Frontend
cd frontend && npm install && npm start

# Backends (in separate terminals)
cd shortener-service && npm install && node src/server.js
cd redirect-service && npm install && node src/server.js
cd analytics-service && npm install && node src/server.js
```

- Local services share a simple file-backed data store (`simple-db.json`).
- Frontend defaults to `http://localhost` base; can be overridden with `REACT_APP_API_URL`.

## Docker Images and CI

- Dockerfiles for all services; images are published to GHCR with the `:main` tag.
- GitHub Actions workflows:
  - CI: builds and validates services
  - Docker Publish: builds and pushes images to GHCR

## Kubernetes on AWS EKS

- Namespace: `urlshortener`
- Manifests under `k8s/`: Deployments/Services, Postgres StatefulSet, Ingress
- AWS Load Balancer Controller exposes a public ALB hostname

## Infrastructure as Code (Terraform)

- Files: `infra/terraform/*`
- Provisions VPC, subnets (2 AZs), EKS cluster, IAM roles, OIDC provider
- Outputs feed the Deploy workflow variables (region, cluster name, role ARN)

## Deployment Workflow

1. Push to `main`
2. GitHub Actions:
   - Build and push GHCR images (`:main`)
   - Assume AWS role via OIDC
   - `kubectl apply` manifests in `k8s/`
3. Access the app via the ALB public DNS shown on the Ingress

## Ingress, DNS, and Long Demo URL

Because we use the ALB public DNS in the free demo, short links look long (`http://<alb>/r/<code>`). When you attach your own domain and set `BASE_URL` in the Shortener deployment (plus TLS cert in Ingress), links become truly short (e.g., `https://sho.rt/r/<code>`). The application already supports this; only configuration is needed.

## Environment Variables

Backend (selection):
- `BASE_URL` – public base (ALB or your domain)
- `SHORTENER_SERVICE_URL` – internal URL for shortener (default `http://shortener-service:5000`)
- `ANALYTICS_SERVICE_URL` – internal URL for analytics (default `http://analytics-service:5002`)
- `DB_*` – Postgres connection params (EKS demo)

Frontend:
- `REACT_APP_API_URL` – optional override for API base

## HTTP APIs

Shortener
- `POST /api/shorten` { url } → { shortUrl, originalUrl, shortCode, createdAt }
- `GET /api/url/:shortCode` → { originalUrl, createdAt }

Redirect
- `GET /r/:shortCode` → 302/301 Location: originalUrl

Analytics
- `POST /api/track` → 201
- `GET /api/stats/:shortCode` → { shortCode, originalUrl, clickCount, lastClickedAt }

## Troubleshooting

- ImagePullBackOff
  - Ensure images are public on GHCR or configure `imagePullSecrets`
  - Use the `:main` tag in deployments to match the CI push
- 404 on `/r/<code>`
  - Ingress must route `/r/` to the redirect service
  - Shortener must emit `/r/<code>` links (`BASE_URL` set)
- 404 on `/api/stats/<code>`
  - The analytics service will fall back to the shortener API; ensure the code exists
- Postgres Pending
  - Check storage class (`gp2`) and EBS CSI/IAM permissions

## License

MIT
