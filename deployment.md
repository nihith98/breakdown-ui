# breakDown-ui — Deployment Pipeline

Deploy Next.js 14+ web + PWA to Vercel (recommended), AWS, or Google Cloud.

---

## Vercel Deployment (Recommended)

Vercel is optimized for Next.js and provides automatic deployments on every push to `main`.

### 1. Connect Repository

```bash
vercel link
```

Follow prompts to connect your GitHub repository to a Vercel project.

### 2. Environment Variables

Set in Vercel project settings:

```
NEXT_PUBLIC_API_URL=https://api.breakdown.app
NODE_ENV=production
```

### 3. Deploy

Push to `main` branch:

```bash
git push origin main
```

Vercel automatically:
- Builds: `npm run build`
- Tests: `npm run test`
- Deploys to production
- Generates preview URLs for pull requests

### 4. Monitor Deployments

```bash
vercel list                    # View all deployments
vercel logs                    # Stream production logs
```

---

## AWS Deployment

### Prerequisites

- AWS account with S3 and CloudFront access
- AWS CLI configured: `aws configure`
- S3 bucket created: `breakdown-app-bucket`

### Build and Deploy

```bash
npm run build
aws s3 sync .next/static s3://breakdown-app-bucket/ --delete
aws cloudfront create-invalidation --distribution-id [DISTRIBUTION_ID] --paths "/*"
```

### CloudFront Configuration

- Origin: S3 bucket
- Cache behavior: 24-hour cache for static assets, 5-minute for HTML
- HTTPS: CloudFront SSL certificate (included)
- WAF: Enable to block malicious requests

See [`docs/deployment-aws.md`](docs/deployment-aws.md) for detailed setup.

---

## Google Cloud Deployment

### Prerequisites

- Google Cloud account
- `gcloud` CLI installed and authenticated
- Cloud Storage bucket created: `breakdown-app-bucket`

### Build and Deploy

```bash
npm run build
gsutil -m rsync -r -d .next/static gs://breakdown-app-bucket/
gcloud compute backend-buckets update breakdown-backend --cloud-cdn-enabled
```

### Cloud CDN Configuration

- Origin: Cloud Storage bucket
- Cache policy: 24-hour cache for static assets
- HTTPS: Google-managed SSL certificate (included)

See [`docs/deployment-gcp.md`](docs/deployment-gcp.md) for detailed setup.

---

## GitHub Actions CI/CD Workflow

Automated pipeline runs on every push to `main` branch:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run lint

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run test:ci

  build:
    runs-on: ubuntu-latest
    needs: [lint, test]
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build

  deploy:
    runs-on: ubuntu-latest
    needs: build
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install && npm run build
      - uses: vercel/action@v4
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

---

## Environment Variables

### Development (.env.local)

```
NEXT_PUBLIC_API_URL=http://localhost:8080
NODE_ENV=development
```

### Production (Vercel/AWS/GCP)

```
NEXT_PUBLIC_API_URL=https://api.breakdown.app
NODE_ENV=production
```

Client-side variables use `NEXT_PUBLIC_` prefix. Server-side variables are hidden from client.

---

## Local Build & Test

```bash
npm run build       # Build for production
npm run start       # Start production server
npm run test:ci     # Run tests with coverage
npm run lint        # Check code quality
```

---

## Rollback & Hotfixes

### Vercel Rollback

```bash
vercel rollback
```

Or revert git commit and push:

```bash
git revert HEAD
git push origin main
```

### Hotfix Process

1. Create hotfix branch: `git checkout -b hotfix/critical-bug`
2. Fix bug and test locally: `npm run dev`
3. Commit and push: `git push origin hotfix/critical-bug`
4. Create pull request for review
5. Merge to main when approved
6. Vercel automatically deploys

---

## Monitoring Deployments

### Vercel

```bash
vercel logs                      # Stream production logs
vercel analytics                 # View performance metrics
```

### Performance Monitoring

- **Web Vitals**: Vercel Analytics dashboard
- **API Performance**: Use backend `/health` endpoint
- **Error Tracking**: Set up Sentry for error reporting

---

## PWA Configuration

Next.js PWA features:

1. **Service Worker**: Generated automatically
2. **Web App Manifest**: Create `public/manifest.json`
3. **Icons**: Place in `public/` directory (192x192, 512x512)
4. **Install Prompt**: Shown on supported browsers after 3 visits

Enable PWA by adding to `next.config.js`:

```javascript
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
});

module.exports = withPWA({
  // ... other config
});
```

---

## See Also

- [`docs/deployment-aws.md`](docs/deployment-aws.md) — AWS S3 + CloudFront setup, WAF rules
- [`docs/deployment-gcp.md`](docs/deployment-gcp.md) — Google Cloud Run + Cloud Storage + Cloud CDN
