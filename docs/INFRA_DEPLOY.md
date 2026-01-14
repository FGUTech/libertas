# Setup Commands

## Prerequisites

```bash
# Set your project (used throughout all steps)
export PROJECT_ID=your-gcp-project-id
export REGION=us-central1

gcloud config set project $PROJECT_ID
```

---

## 1. GCP Cloud SQL (Postgres + pgvector)

```bash
# Enable Cloud SQL API
gcloud services enable sqladmin.googleapis.com

# Create instance (shared across projects)
gcloud sql instances create libertas-db \
  --database-version=POSTGRES_15 \
  --tier=db-g1-small \
  --region=$REGION \
  --storage-size=20GB \
  --storage-type=SSD \
  --availability-type=ZONAL \
  --backup-start-time=04:00

# Create n8n database
gcloud sql databases create n8n --instance=libertas-db

# Create libertas database (for app data)
gcloud sql databases create libertas --instance=libertas-db

# Create user (save this password for step 2)
gcloud sql users create n8n-user \
  --instance=libertas-db \
  --password="INPUT_PASSWORD_HERE"
```

### Enable pgvector

```bash
# Connect to instance
gcloud sql connect libertas-db --user=postgres

# In psql, run:
CREATE EXTENSION IF NOT EXISTS vector;
\q
```

### Run Migrations

```bash
# Connect and run migration file
gcloud sql connect libertas-db --user=n8n-user --database=libertas

# Paste contents of migrations/001_initial_schema.sql
# Or use a migration tool
```

---

## 2. n8n on GCP Cloud Run

```bash
# Enable required APIs
gcloud services enable run.googleapis.com secretmanager.googleapis.com
```

### Store Secrets

```bash
# Generate encryption key (save this - needed for credential recovery)
openssl rand -base64 42 > n8n-encryption-key.txt

# Store secrets in Secret Manager (use password from step 1)
echo -n "your-cloud-sql-password" | gcloud secrets create n8n-db-password --data-file=-
gcloud secrets create n8n-encryption-key --data-file=n8n-encryption-key.txt
echo -n "your-anthropic-key" | gcloud secrets create anthropic-api-key --data-file=-
echo -n "your-github-token" | gcloud secrets create github-token --data-file=-
echo -n "your-resend-key" | gcloud secrets create resend-api-key --data-file=-

# Clean up local file
rm n8n-encryption-key.txt
```

### Create Service Account

```bash
gcloud iam service-accounts create n8n-sa --display-name="n8n Service Account"

# Grant secret access
for SECRET in n8n-db-password n8n-encryption-key anthropic-api-key github-token resend-api-key; do
  gcloud secrets add-iam-policy-binding $SECRET \
    --member="serviceAccount:n8n-sa@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"
done
```

### Deploy n8n

```bash
# Grant Cloud SQL access to service account
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:n8n-sa@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/cloudsql.client"

# Deploy with Cloud SQL connection
gcloud run deploy n8n \
  --image=n8nio/n8n:latest \
  --region=$REGION \
  --allow-unauthenticated \
  --port=5678 \
  --memory=2Gi \
  --cpu=1 \
  --min-instances=1 \
  --no-cpu-throttling \
  --set-env-vars="N8N_PORT=5678,N8N_PROTOCOL=https,DB_TYPE=postgresdb,DB_POSTGRESDB_DATABASE=n8n,DB_POSTGRESDB_USER=n8n-user,DB_POSTGRESDB_HOST=/cloudsql/$PROJECT_ID:$REGION:libertas-db,DB_POSTGRESDB_PORT=5432,GENERIC_TIMEZONE=UTC,EXECUTIONS_MODE=regular" \
  --set-secrets="DB_POSTGRESDB_PASSWORD=n8n-db-password:latest,N8N_ENCRYPTION_KEY=n8n-encryption-key:latest,ANTHROPIC_API_KEY=anthropic-api-key:latest,GITHUB_TOKEN=github-token:latest,RESEND_API_KEY=resend-api-key:latest" \
  --add-cloudsql-instances=$PROJECT_ID:$REGION:libertas-db \
  --service-account=n8n-sa@$PROJECT_ID.iam.gserviceaccount.com
```

### Configure Webhook URL

After deploy, Cloud Run provides a URL. Update the service with it:

```bash
export SERVICE_URL="https://n8n-xxxxx-uc.a.run.app"  # Your actual URL

gcloud run services update n8n \
  --region=$REGION \
  --update-env-vars="N8N_HOST=$(echo $SERVICE_URL | sed 's/https:\/\///'),WEBHOOK_URL=$SERVICE_URL,N8N_EDITOR_BASE_URL=$SERVICE_URL"
```

### Configure n8n Credentials

Before importing workflows, set up the required credentials in n8n:

#### Anthropic API (Claude)

1. Go to **Settings → Credentials → Add Credential**
2. Search for **Header Auth** and select it
3. Configure:
   - **Name**: `Anthropic API Key`
   - **Header Name**: `x-api-key`
   - **Header Value**: Your Anthropic API key (or use `$ANTHROPIC_API_KEY` if using env var)
4. Save the credential

The workflow nodes reference this credential by name. The credential ID in the workflow JSON (`ANTHROPIC_CREDENTIAL_ID`) is a placeholder - n8n will update it when you assign the credential to the HTTP Request nodes.

#### Postgres Database

1. Go to **Settings → Credentials → Add Credential**
2. Search for **Postgres** and select it
3. Configure:
   - **Name**: `Postgres account`
   - **Host**: `/cloudsql/PROJECT_ID:REGION:libertas-db` (Cloud SQL socket path)
   - **Database**: `libertas`
   - **User**: `n8n-user`
   - **Password**: Your database password
4. Save the credential

### Import Workflows

1. Open n8n at your Cloud Run URL
2. Go to Settings → Import from File
3. Import each from `/n8n/workflows/`:
   - workflow-a-ingestion.json
   - workflow-b-digest.json
   - workflow-c-intake.json
   - workflow-d-ideas.json
4. After importing, open each workflow and:
   - Assign the **Anthropic API Key** credential to Claude HTTP Request nodes
   - Assign the **Postgres account** credential to database nodes
5. Re-activate workflows

---

## 3. Firebase Auth

Firebase provides user authentication for the website (accounts, login, reactions, comments).

### Enable Firebase

```bash
# Enable Firebase API
gcloud services enable firebase.googleapis.com

# Add Firebase to your GCP project
firebase projects:addfirebase $PROJECT_ID
```

If you don't have the Firebase CLI:
```bash
npm install -g firebase-tools
firebase login
```

### Create Web App

```bash
# Create a web app for the Libertas website
firebase apps:create WEB libertas-website --project=$PROJECT_ID

# Get the config (save these for Vercel env vars)
firebase apps:sdkconfig WEB --project=$PROJECT_ID
```

This outputs config like:
```javascript
{
  apiKey: "...",
  authDomain: "PROJECT_ID.firebaseapp.com",
  projectId: "PROJECT_ID",
  // ...
}
```

### Enable Auth Providers

1. Go to [Firebase Console](https://console.firebase.google.com) → Select project
2. Build → Authentication → Get Started
3. Sign-in method → Enable:
   - Email/Password (enable both email/password and email link)
   - (Optional) Google, GitHub for OAuth

### Configure Auth Settings

In Firebase Console → Authentication → Settings:

1. **Authorized domains**: Add your Vercel domains
   - `libertas.vercel.app`
   - `your-custom-domain.com`
   - `localhost` (for development)

2. **User actions**: Enable email enumeration protection

### Environment Variables for Vercel

After setup, you'll need these env vars (from `firebase apps:sdkconfig` output):

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

---

## 4. Vercel

```bash
# In your Next.js project directory
vercel link

# Set environment variables
vercel env add N8N_WEBHOOK_URL

# Firebase Auth (from step 3)
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY
vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID
vercel env add NEXT_PUBLIC_FIREBASE_APP_ID

# Deploy
vercel --prod
```

```bash
# In Vercel, connect to GitHub repo for auto-deploys
vercel git connect
```

---

## Environment Variables Summary

```bash
# Cloud Run (n8n) - managed via Secret Manager
# - DB_POSTGRESDB_PASSWORD (Cloud SQL)
# - N8N_ENCRYPTION_KEY
# - ANTHROPIC_API_KEY
# - GITHUB_TOKEN
# - RESEND_API_KEY

# Vercel (Next.js)
N8N_WEBHOOK_URL=...                    # Cloud Run URL for intake form
DATABASE_URL=...                       # Cloud SQL connection (if needed)
# Format: postgresql://n8n-user:PASSWORD@/libertas?host=/cloudsql/PROJECT:REGION:libertas-db
```
