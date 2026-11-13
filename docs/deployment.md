# Deployment & Hosting Guide

This guide describes how to deploy, host, and configure custom domains for MinKoi Studio.

---

## 1. Vercel Production Deployment (Recommended)

MinKoi Studio is designed as a zero-build static web application. Every commit pushed to `main` triggers an automatic edge deployment on Vercel.

### Continuous Deployment via GitHub
1. Connect your repository to Vercel:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard) → **Add New** → **Project**.
   - Import `minhkhoi1516/profilecardwaifu`.
2. Configure project settings:
   - **Framework Preset**: `Other` (Static Site).
   - **Build Command**: None (leave empty).
   - **Output Directory**: `.` (Root directory).
3. Click **Deploy**. Subsequent pushes to `main` will build and publish automatically within seconds.

---

## 2. Vercel Deployment Protection & Bypass

If Vercel Deployment Protection (SSO or Password protection) is enabled on Preview or Production deployments:
- Configure a protection bypass secret in **Project Settings** → **Deployment Protection**.
- To verify deployments via automation or API, pass the HTTP header:
  ```http
  x-vercel-protection-bypass: <YOUR_BYPASS_SECRET>
  ```
- Or access the site using the share link parameter:
  ```text
  https://<your-project>.vercel.app/?_vercel_share=<YOUR_BYPASS_SECRET>
  ```

---

## 3. Custom Domain Configuration

MinKoi Studio can run on a custom domain (such as `minkoi.moe` or `minkoi.dev`) with automated SSL certificate provisioning.

1. Navigate to **Vercel** → **Project** → **Settings** → **Domains**.
2. Click **Add** and enter your domain name.
3. In your DNS provider (e.g., Cloudflare, Porkbun, Namecheap), add the corresponding records:
   - **Apex domain** (`example.com`): `A` record pointing to `76.76.21.21`.
   - **Subdomain** (`www.example.com` or `studio.example.com`): `CNAME` record pointing to `cname.vercel-dns.com`.
4. Vercel automatically issues and renews Let's Encrypt SSL/TLS certificates.

---

## 4. Alternative: GitHub Pages

The repository is fully compatible with GitHub Pages:
1. Navigate to your repository on GitHub → **Settings** → **Pages**.
2. Under **Build and deployment** → **Source**, select **Deploy from a branch**.
3. Select branch `main` and folder `/ (root)`.
4. Click **Save**.

*Note: Vercel is the primary recommended platform due to global CDN edge caching for audio streaming and custom cache headers defined in `vercel.json`.*

---

## 5. Local Testing Before Deployment

To verify changes locally before pushing:
```powershell
# Run asset and dependency verification
powershell -ExecutionPolicy Bypass -File scripts/qa/verify-assets.ps1

# Run automated lyrics engine regression tests
powershell -ExecutionPolicy Bypass -File scripts/qa/verify-lyrics.ps1
```
