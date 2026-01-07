# INFRASTRUCTURE.md — Deployment Guide

> Step-by-step instructions for deploying Libertas infrastructure.

## Overview

Libertas runs on a multi-service architecture optimized for cost, simplicity, and AI-friendliness.

### Service Summary

| Component | Service | Cost | Purpose |
|-----------|---------|------|---------|
| Orchestration | Railway (n8n) | $5-20/mo | Workflows, webhooks, scheduling |
| Database | Supabase | Free-$25/mo | Postgres + pgvector |
| Object Storage | GCP Cloud Storage | $1-10/mo | Raw content, feeds |
| Static Site | Vercel | Free | Next.js app, intake form |
| Email | Resend | Free-$20/mo | Newsletter delivery |
| LLM | Claude API | Usage-based | Classification, summarization |
| Code | GitHub | Free | Issues, PRs, content |

**Estimated Total: $6-75/month**

---

## Prerequisites

Before starting, ensure you have:

- [ ] GCP account with billing enabled
- [ ] GitHub account
- [ ] Anthropic API key (Claude)
- [ ] Node.js 18+ installed locally
- [ ] `gcloud` CLI installed

---

## Step 1: Supabase Setup

### 1.1 Create Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Choose a region close to your users (e.g., `us-east-1`)
3. Save your project credentials:
   - Project URL
   - Anon key (public)
   - Service role key (secret)
   - Database password

### 1.2 Enable pgvector

```sql
-- Run in Supabase SQL Editor
CREATE EXTENSION IF NOT EXISTS vector;
```

### 1.3 Create Database Schema

Run the migrations from `SPEC.md` or use Supabase migrations:

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase login
supabase link --project-ref YOUR_PROJECT_REF

# Push schema
supabase db push
```

### 1.4 Get Connection String

From Supabase Dashboard > Settings > Database, copy the connection string:

```
postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
```

---

## Step 2: GCP Cloud Storage Setup

### 2.1 Create Bucket

```bash
# Set your project
export PROJECT_ID="your-gcp-project"
gcloud config set project $PROJECT_ID

# Create bucket
gsutil mb -l us-central1 gs://libertas-content

# Set up folder structure
echo "" | gsutil cp - gs://libertas-content/raw/.gitkeep
echo "" | gsutil cp - gs://libertas-content/published/.gitkeep
echo "" | gsutil cp - gs://libertas-content/published/posts/.gitkeep
```

### 2.2 Create Service Account

```bash
# Create service account for n8n
gcloud iam service-accounts create libertas-storage \
  --display-name="Libertas Storage Access"

# Grant permissions
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:libertas-storage@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/storage.objectAdmin"

# Generate key file
gcloud iam service-accounts keys create ~/libertas-gcs-key.json \
  --iam-account=libertas-storage@$PROJECT_ID.iam.gserviceaccount.com

# Base64 encode for Railway (optional)
base64 -i ~/libertas-gcs-key.json | tr -d '\n' > ~/libertas-gcs-key-base64.txt
```

---

## Step 3: Railway (n8n) Setup

### 3.1 Create Railway Project

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Create new project
railway init
```

### 3.2 Deploy n8n

Option A: Use Railway template
1. Go to [railway.app/template/n8n](https://railway.app/template/n8n)
2. Click "Deploy on Railway"
3. Configure environment variables

Option B: Manual deployment
```bash
# In your Railway project
railway add

# Set environment variables
railway variables set N8N_BASIC_AUTH_ACTIVE=true
railway variables set N8N_BASIC_AUTH_USER=admin
railway variables set N8N_BASIC_AUTH_PASSWORD=your-secure-password

# Deploy
railway up
```

### 3.3 Configure Environment Variables

Set these in Railway dashboard or CLI:

```bash
# Database (Supabase)
railway variables set DATABASE_URL="postgresql://postgres:PASSWORD@db.xxx.supabase.co:5432/postgres"
railway variables set DB_TYPE=postgresdb
railway variables set DB_POSTGRESDB_DATABASE=postgres
railway variables set DB_POSTGRESDB_USER=postgres
railway variables set DB_POSTGRESDB_HOST=db.xxx.supabase.co
railway variables set DB_POSTGRESDB_PORT=5432
railway variables set DB_POSTGRESDB_PASSWORD=your-db-password

# n8n Config
railway variables set N8N_ENCRYPTION_KEY="$(openssl rand -base64 42)"
railway variables set N8N_HOST=your-app.up.railway.app
railway variables set N8N_WEBHOOK_URL=https://your-app.up.railway.app
railway variables set N8N_PROTOCOL=https
railway variables set N8N_PORT=5678

# External Services
railway variables set ANTHROPIC_API_KEY=sk-ant-xxx
railway variables set GITHUB_TOKEN=ghp_xxx
railway variables set RESEND_API_KEY=re_xxx

# GCS (paste base64-encoded key or use file path)
railway variables set GOOGLE_APPLICATION_CREDENTIALS_BASE64="..."
```

### 3.4 Verify Deployment

1. Access n8n at your Railway URL
2. Create a test workflow
3. Verify database connection (create a Postgres node)
4. Verify LLM connection (create an HTTP Request to Claude API)

---

## Step 4: Vercel Setup

### 4.1 Create Next.js Project

If starting fresh:
```bash
npx create-next-app@latest libertas-site --typescript --tailwind --app
cd libertas-site
```

### 4.2 Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Login and link
vercel login
vercel link

# Deploy
vercel --prod
```

### 4.3 Configure Environment Variables

In Vercel Dashboard > Settings > Environment Variables:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxx

# n8n Integration
N8N_WEBHOOK_URL=https://your-app.up.railway.app

# GCS (optional, for direct feed access)
GCS_BUCKET_NAME=libertas-content
```

### 4.4 Disable Analytics (Privacy)

In `next.config.js`:
```javascript
module.exports = {
  // Don't add @vercel/analytics package
}
```

---

## Step 5: Resend Setup

### 5.1 Create Account

1. Go to [resend.com](https://resend.com) and sign up
2. Verify your domain (or use their test domain)
3. Get your API key

### 5.2 Configure in Railway

```bash
railway variables set RESEND_API_KEY=re_xxx
```

### 5.3 Test Email Sending

Create a test workflow in n8n with HTTP Request node:

```json
{
  "method": "POST",
  "url": "https://api.resend.com/emails",
  "headers": {
    "Authorization": "Bearer {{ $env.RESEND_API_KEY }}",
    "Content-Type": "application/json"
  },
  "body": {
    "from": "Libertas <libertas@yourdomain.com>",
    "to": "test@example.com",
    "subject": "Test Email",
    "text": "This is a test from Libertas."
  }
}
```

---

## Step 6: GitHub Setup

### 6.1 Create Repository

```bash
# If not already done
gh repo create FGUTech/libertas --public
```

### 6.2 Generate Personal Access Token

1. Go to GitHub > Settings > Developer settings > Personal access tokens
2. Generate a new token with:
   - `repo` (full control)
   - `workflow` (if using Actions)
3. Save the token securely

### 6.3 Configure in Railway

```bash
railway variables set GITHUB_TOKEN=ghp_xxx
```

---

## Step 7: Connect Everything

### 7.1 Import n8n Workflows

1. Access your Railway n8n instance
2. Import workflow JSON files from `/n8n/workflows/`
3. Update credentials in each workflow:
   - Supabase/Postgres credentials
   - Claude API credentials
   - GitHub credentials
   - GCS credentials
   - Resend credentials

### 7.2 Test Integrations

Run these checks:

| Test | Expected Result |
|------|-----------------|
| n8n → Supabase | Query returns empty array (no data yet) |
| n8n → Claude API | LLM responds to test prompt |
| n8n → GCS | Can write and read test file |
| n8n → GitHub | Can create test issue |
| n8n → Resend | Test email delivered |
| Vercel → Supabase | Site can fetch data |
| Vercel → n8n webhook | Intake form triggers workflow |

### 7.3 Configure Webhooks

In n8n, ensure webhook URLs are correctly set:
- Intake webhook: `https://your-railway-app.up.railway.app/webhook/intake`

Update Vercel environment:
```bash
vercel env add N8N_WEBHOOK_URL
# Enter: https://your-railway-app.up.railway.app
```

---

## Monitoring & Maintenance

### Health Checks

Create a simple health check workflow in n8n that runs daily:
1. Check Supabase connection
2. Check GCS access
3. Check Claude API (with minimal token usage)
4. Send alert if any fail

### Cost Monitoring

| Service | Where to Check |
|---------|----------------|
| Railway | Dashboard > Usage |
| Supabase | Dashboard > Settings > Billing |
| GCP | Console > Billing |
| Vercel | Dashboard > Usage |
| Resend | Dashboard > Usage |
| Claude | Console > Usage |

### Backup Strategy

| Data | Backup Method | Frequency |
|------|---------------|-----------|
| Supabase DB | Built-in daily backups | Daily (automatic) |
| n8n workflows | Export JSON to Git | On change |
| GCS content | Cross-region replication (optional) | Continuous |
| Vercel site | Git repo is the source | On commit |

---

## Troubleshooting

### Common Issues

**n8n can't connect to Supabase**
- Check connection string format
- Ensure IP allowlist includes Railway IPs (or use `0.0.0.0/0` for testing)
- Verify password doesn't have special characters that need escaping

**Webhook not triggering**
- Verify webhook URL is publicly accessible
- Check n8n logs for incoming requests
- Ensure workflow is activated (toggle switch)

**GCS permission denied**
- Verify service account has `storage.objectAdmin` role
- Check credentials are correctly base64-encoded
- Ensure bucket name is correct

**Claude API errors**
- Check API key is valid
- Verify you have sufficient credits
- Check rate limits (use backoff on 429 errors)

### Logs

| Service | How to Access |
|---------|---------------|
| Railway | Dashboard > Deployments > Logs |
| Supabase | Dashboard > Logs |
| Vercel | Dashboard > Deployments > Functions |
| n8n | Built-in execution logs |

---

## Security Checklist

Before going live:

- [ ] All secrets stored in environment variables (not code)
- [ ] Supabase RLS policies enabled for all tables
- [ ] n8n has authentication enabled
- [ ] Webhook endpoints have rate limiting
- [ ] GCS bucket is not publicly listable
- [ ] GitHub token has minimal required permissions
- [ ] Vercel analytics disabled (privacy)
- [ ] Resend verified domain configured

---

## AI Infrastructure Management

For AI-assisted infrastructure management, consider adding these MCP servers:

### Pulumi MCP (Infrastructure as Code)

```bash
claude mcp add-json "pulumi" '{"command":"npx","args":["@pulumi/mcp-server@latest","stdio"]}'
```

### n8n MCP (Workflow Management)

Configure via [n8n-mcp.com](https://www.n8n-mcp.com/) for:
- Conversational workflow creation
- Template search
- Debugging assistance

### Supabase MCP (Database Queries)

Community MCP servers available for Supabase integration.

---

*This guide should be updated as infrastructure evolves.*
