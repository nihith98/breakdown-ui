# breakDown-ui — Deployment Pipeline

Deployment splits three ways: native builds (iOS/Android via EAS) and web build (static bundle for Vercel/AWS/GCP).

---

## Native Builds: EAS (Expo Application Services)

### Prerequisites
- `eas-cli` installed globally: `npm install -g eas-cli`
- Expo account configured with app credentials
- App Store Connect and Google Play Console accounts

### Build Command
```bash
eas build --platform all --profile production
```

This single command:
1. **iOS**: Builds for App Store, handles code signing with provisioning profiles
2. **Android**: Builds for Google Play Store, handles keystore signing

EAS manages:
- Certificate generation and renewal
- Keystore management
- App Store Connect submission (iOS)
- Google Play Console integration (Android)
- Build artifacts (`.ipa` for iOS, `.aab` for Android)

### Production Build Process
```bash
eas build --platform ios --profile production   # iOS App Store
eas build --platform android --profile production # Android Play Store
```

After build succeeds:
- **iOS**: Submit to App Store Review via `eas submit --platform ios`
- **Android**: Submit to Google Play via `eas submit --platform android`

---

## Web Build: Static Bundle for Hosting

### Build Command
```bash
npx expo export --platform web
```

Output:
- Static bundle generated in `dist/` directory
- Ready to deploy to: **Vercel**, **AWS S3 + CloudFront**, **Google Cloud Storage**
- Zero server-side rendering required

### Deployment Targets

#### Vercel (Recommended)
```bash
npx expo export --platform web
vercel deploy dist/
```

#### AWS S3 + CloudFront
```bash
npx expo export --platform web
aws s3 sync dist/ s3://breakdown-app-bucket/ --delete
aws cloudfront create-invalidation --distribution-id [ID] --paths "/*"
```

#### Google Cloud Storage
```bash
npx expo export --platform web
gsutil -m rsync -r -d dist/ gs://breakdown-app-bucket/
```

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
      - run: npm run test

  build-web:
    runs-on: ubuntu-latest
    needs: [lint, test]
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npx expo export --platform web
      - uses: vercel/action@v4
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}

  build-native:
    runs-on: ubuntu-latest
    needs: [lint, test]
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: eas build --platform all --profile production
        env:
          EXPO_TOKEN: ${{ secrets.EXPO_TOKEN }}
```

---

## Environment Variables

### Required for All Builds
```
EXPO_PUBLIC_API_URL=https://api.breakdown.app
EXPO_PUBLIC_ENV=production
```

### Web Build (Vercel)
```
EXPO_PUBLIC_API_URL=https://api.breakdown.app
EXPO_PUBLIC_ENV=production
```

Store in Vercel project settings → Environment Variables.

### Native Build (EAS)
```
EXPO_TOKEN=<your-expo-token>
EXPO_PUBLIC_API_URL=https://api.breakdown.app
EXPO_PUBLIC_ENV=production
```

Store in GitHub Secrets:
- `EXPO_TOKEN` — for EAS authentication
- `EXPO_PUBLIC_API_URL` — backend endpoint
- `EXPO_PUBLIC_ENV` — environment name

### App Store & Play Store Secrets (GitHub)
- `APPLE_ID` — Apple ID email for App Store Connect
- `APPLE_PASSWORD` — app-specific password
- `GOOGLE_PLAY_JSON_KEY` — service account JSON for Play Console
- `FASTLANE_SESSION` — Fastlane session token (optional, for automated submission)

---

## Platform-Specific Deployment Steps

### Web Deployment
1. `npm run lint && npm run test` — verify code quality
2. `npx expo export --platform web` — generate static bundle
3. Deploy `dist/` to Vercel/AWS/GCP (handled by CI/CD)
4. Verify PWA works on: desktop, tablet, mobile browsers

### iOS App Store
1. EAS builds and signs `.ipa` with production certificate
2. `eas submit --platform ios` submits to App Store for review
3. Apple reviews and approves (1-3 days typical)
4. App automatically released to users in App Store

### Android Play Store
1. EAS builds and signs `.aab` with production keystore
2. `eas submit --platform android` uploads to Play Console
3. Review required; publish manually in Play Console (24-48 hours review)
4. Released to Google Play Store

---

## Rollback & Hotfixes

### Web Rollback
```bash
vercel rollback                    # Revert to last successful deployment
git revert HEAD                    # Revert code changes
git push                           # Trigger CI/CD redeploy
```

### Native Hotfix (iOS/Android)
1. Create hotfix branch: `git checkout -b hotfix/critical-bug`
2. Fix bug and test locally
3. Merge to main and push
4. CI/CD automatically runs: `eas build --platform all --profile production`
5. Test in EAS review build, then submit to stores
6. Stores may expedited review for critical bug fixes

---

## Monitoring Deployments

Check build status:
```bash
eas build:list                     # View all EAS builds
eas build:view [build-id]          # Details on specific build
vercel list                        # View Vercel deployments
```

View production logs:
- **Web**: Vercel Analytics dashboard
- **iOS**: TestFlight or App Analytics (Apple)
- **Android**: Play Console Analytics (Google)

---

## See Also

- [`docs/deployment-aws.md`](docs/deployment-aws.md) — AWS-specific configuration, S3 + CloudFront setup, WAF rules
- [`docs/deployment-gcp.md`](docs/deployment-gcp.md) — Google Cloud-specific configuration, Cloud Storage + Cloud CDN, security policies
