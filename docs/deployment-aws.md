# AWS S3 + CloudFront Deployment

This guide covers deploying the Breakdown frontend to AWS using S3 for storage and CloudFront as the CDN.

## S3 Bucket Setup

Create an S3 bucket with the following configuration:

1. **Enable Website Hosting Mode**
   - Go to the S3 bucket → Properties → Static website hosting
   - Enable static website hosting
   - Set Index document to `index.html`
   - Set Error document to `index.html` (for client-side routing)

2. **Public Read Access**
   - Create a bucket policy allowing public read access for `s3:GetObject`
   - Policy should allow `Principal: "*"` with Action `s3:GetObject` on all objects

3. **CORS Configuration**
   - Configure CORS rules to support PWA and cross-origin requests
   - Allow methods: GET, HEAD, PUT, POST, DELETE
   - Allow origins matching your domain patterns

## CloudFront CDN Distribution

Set up CloudFront to serve content from your S3 bucket with caching and compression:

1. **Create Distribution**
   - Origin: point to your S3 bucket
   - Enable Origin Access Identity (OAI) to restrict direct S3 access
   - Behavior settings: Allow GET, HEAD, OPTIONS methods

2. **Enable Compression**
   - Compress: Yes (automatically compresses CSS, JavaScript, JSON, XML)
   - Reduces payload size for faster delivery

3. **Cache Invalidation**
   - Configure cache behaviors with appropriate TTLs
   - Use Origin Cache Headers when possible
   - Set default TTL to 86400 seconds (1 day) for flexibility

## GitHub Actions Deployment Workflow

Create `.github/workflows/ci.yml` with the following deployment steps:

```yaml
name: Deploy to AWS

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
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      
      - name: Deploy to S3
        run: aws s3 sync dist/ s3://${{ secrets.S3_BUCKET }} --delete
      
      - name: Invalidate CloudFront cache
        run: |
          aws cloudfront create-invalidation \
            --distribution-id ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }} \
            --paths "/*"
```

## Environment Variables

Configure these secrets in your GitHub repository settings:

- `AWS_ACCESS_KEY_ID`: IAM user access key with S3 and CloudFront permissions
- `AWS_SECRET_ACCESS_KEY`: IAM user secret key
- `S3_BUCKET`: Name of your S3 bucket (e.g., `breakdown-app-prod`)
- `CLOUDFRONT_DISTRIBUTION_ID`: CloudFront distribution ID (found in CloudFront console)

## Cache Headers Strategy

Implement strategic caching to balance freshness with performance:

**Long-lived (1 year)** for content with hashes:
- `*.js` (bundled with content hash in filename)
- `*.css` (bundled with content hash in filename)
- Fonts (versioned, rarely change)
- Images (hashed by build system)
- Set Cache-Control: `public, max-age=31536000, immutable`

**Short-lived (5 minutes)** for entry point:
- `index.html` (no content hash, controls app version)
- Set Cache-Control: `public, max-age=300, must-revalidate`

This strategy ensures users always get the latest app version while aggressively caching static assets.

## Rollback Strategy

Maintain deployment history for quick rollbacks:

1. **Keep Old Versions in S3**
   - Enable S3 versioning on your bucket
   - Previous deployments are automatically retained
   - Access via version ID in S3 console

2. **Re-deploy Previous Version**
   - Identify the desired version timestamp from S3 version history
   - Retrieve the previous version's object metadata
   - Update CloudFront origin to point to the specific version
   - Or re-run the deployment workflow against a previous git commit tag

3. **Invalidate Cache After Rollback**
   - Always invalidate CloudFront cache with `/*` after rollback
   - Ensures users receive the rolled-back version
   - Takes ~1-2 minutes for full propagation

This approach allows safe rollbacks without redeployment from source code, minimizing downtime during incidents.
