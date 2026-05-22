# GCP Cloud Storage + CDN Deployment

This guide covers deploying the Breakdown frontend to Google Cloud Platform using Cloud Storage and Cloud CDN.

## Cloud Storage Bucket Setup

Configure a GCS bucket for serving web content:

1. **Enable Uniform Bucket-Level Access**
   - Go to GCS bucket → Permissions
   - Enable uniform bucket-level access
   - Disables ACL-based access control, uses IAM policies exclusively
   - Simplifies permission management and security auditing

2. **Set Public Read Permission**
   - Add IAM binding: `roles/storage.objectViewer`
   - Principal: `allUsers`
   - Allows public read access to all objects
   - Restrict if needed by object path or through CDN only

3. **Configure for Web Serving**
   - Set bucket CORS rules to support PWA requests
   - Allow methods: GET, HEAD, PUT, POST, DELETE
   - Allow origins for your domain

## Cloud CDN + Load Balancer

Set up Cloud CDN fronted by a Load Balancer:

1. **Create Load Balancer**
   - Type: HTTP(S) Load Balancer
   - Protocol: HTTPS (enable automatic SSL certificate via Google-managed)
   - Backend: Cloud Storage bucket as backend bucket

2. **Attach Cloud CDN**
   - Enable Cloud CDN on the load balancer backend
   - Set cache policies:
     - Default TTL: 3600 seconds (1 hour)
     - Client TTL: 3600 seconds
     - Max TTL: 86400 seconds (24 hours)
   - Enable compression (gzip)

3. **Configure Cache Policies**
   - Set origin response headers as primary cache control
   - Override headers if origin headers are absent
   - Respect Cache-Control headers from objects

## GitHub Actions Deployment Workflow

Create `.github/workflows/ci.yml` with GCP deployment steps:

```yaml
name: Deploy to GCP

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Build step
        run: npm ci && npx expo export --platform web
      
      - name: Setup GCP credentials
        uses: google-github-actions/auth@v1
        with:
          credentials_json: ${{ secrets.GCP_SERVICE_ACCOUNT_KEY }}
      
      - name: Set up Cloud SDK
        uses: google-github-actions/setup-gcloud@v1
      
      - name: Deploy to Cloud Storage
        run: |
          gsutil -m rsync -r -d dist/ gs://${{ secrets.GCP_BUCKET_NAME }}/
      
      - name: Purge Cloud CDN cache
        run: |
          gcloud compute url-maps invalidate-cdn-cache ${{ secrets.GCP_URL_MAP_NAME }} \
            --path="/*" \
            --project=${{ secrets.GCP_PROJECT_ID }}
```

## Environment Variables

Configure these secrets in your GitHub repository settings:

- `GCP_PROJECT_ID`: Your GCP project ID (e.g., `breakdown-prod-12345`)
- `GCP_SERVICE_ACCOUNT_KEY`: Base64-encoded service account JSON key with Storage and Compute permissions
  - Export from GCP IAM → Service Accounts
  - Encode: `cat key.json | base64 -w 0`
  - Paste into GitHub Secrets
- `GCP_BUCKET_NAME`: Cloud Storage bucket name (e.g., `breakdown-app-prod`)
- `GCP_URL_MAP_NAME`: Load Balancer URL Map name (find in Compute → Load balancing)

## Cache Headers Strategy

Implement the same caching strategy as AWS for consistency:

**Long-lived (1 year)** for hashed assets:
- `*.js` (bundled with content hash)
- `*.css` (bundled with content hash)
- Fonts and images (versioned)
- Set Cache-Control: `public, max-age=31536000, immutable`

**Short-lived (5 minutes)** for entry point:
- `index.html` (no hash, controls app version)
- Set Cache-Control: `public, max-age=300, must-revalidate`

Set these headers on objects during upload:
```bash
gsutil -h "Cache-Control:public, max-age=31536000, immutable" -m cp dist/js/* gs://bucket/js/
gsutil -h "Cache-Control:public, max-age=300, must-revalidate" cp dist/index.html gs://bucket/
```

## Rollback Strategy

Perform rollbacks using GCS versioning:

1. **Enable GCS Versioning**
   - GCS bucket → Lifecycle → enable object versioning
   - All overwritten objects are retained with version IDs
   - Storage cost increases with version count; consider deletion policies

2. **List Previous Versions**
   - View in GCS console: bucket → Objects → show versions
   - Identify desired version by timestamp and version ID
   - Note the generation number for scripting

3. **Re-deploy Previous Version**
   - Use `gsutil -m copy` to restore version to current:
     ```bash
     gsutil -m cp -r gs://bucket/*#VERSION_ID dist/
     gsutil -m rsync -r -d dist/ gs://bucket/
     ```
   - Or re-run deployment workflow against previous git tag
   - Always invalidate CDN cache after rollback

4. **Invalidate CDN Cache**
   - Run the cache purge command after rollback
   - Ensures global users receive the rolled-back version
   - Propagation takes ~2-5 minutes depending on region

This approach provides rapid rollback capability with minimal downtime and clear audit trail via GCS versioning.
