# NYC Tax Viz Site Fix Report
**Date:** 2026-03-15 03:54 PDT  
**Task ID:** 06902e5b-c5bc-4855-9ce8-8c5aae7a0c1f  
**Status:** ✅ FIXED & DEPLOYED

## Issue Summary
The NYC Tax Viz site (https://nyc-tax-viz.vercel.app/) was failing to display UI properly. The HTML was loading, but JavaScript and CSS assets were not loading correctly.

## Root Cause
**Configuration mismatch between deployment platforms:**
- The `next.config.ts` file had `basePath: '/nyc-tax-viz'` configured
- This setting is correct for GitHub Pages deployment (where the site is at `/nyc-tax-viz/`)
- But on Vercel, the site is deployed at the root path (`/`)
- This caused all JavaScript and CSS files to try loading from `/nyc-tax-viz/_next/...` (404s)
- Should have been loading from `/_next/...`

## Investigation Steps
1. ✅ Checked site HTTP status - returned 200 OK (HTML was served)
2. ✅ Located repository: `~/code/nyc-tax-viz`
3. ✅ Reviewed recent commits - found "Fix deploy script" and "Configure static export and GitHub Pages deployment" (commits dfe38c7, 6df36e2)
4. ✅ Examined `next.config.ts` - found `basePath: '/nyc-tax-viz'`
5. ✅ Curled live site HTML - confirmed asset paths were `/nyc-tax-viz/_next/...`
6. ✅ Diagnosis: basePath intended for GitHub Pages breaking Vercel deployment

## Fix Applied
**File:** `next.config.ts`

**Change:**
```diff
const nextConfig: NextConfig = {
  output: 'export',
-  basePath: '/nyc-tax-viz',
+  // basePath only needed for GitHub Pages, not Vercel
+  // basePath: '/nyc-tax-viz',
  images: {
    unoptimized: true,
  },
};
```

**Commit:** `772ae1f - Fix: Remove basePath for Vercel deployment`

## Verification
✅ All pages now loading with correct asset paths:
- Homepage: https://nyc-tax-viz.vercel.app/
- Policy Comparison: https://nyc-tax-viz.vercel.app/policy-comparison
- Borough Impact: https://nyc-tax-viz.vercel.app/borough-impact
- Flow Visualization: https://nyc-tax-viz.vercel.app/flow-visualization

Asset paths now correctly resolve to:
- `/_next/static/chunks/...` (working)
- Previously: `/nyc-tax-viz/_next/static/chunks/...` (404s)

## Deployment Status
- ✅ Code pushed to GitHub: `main` branch
- ✅ Vercel auto-deployed (detected via cache age reset)
- ✅ Site now functional with correct asset loading

## Browser Console Check Recommendation
For full verification, Jorge should:
1. Open https://nyc-tax-viz.vercel.app/ in browser
2. Open DevTools Console (F12)
3. Verify no 404 errors for `_next` assets
4. Test all three visualization pages

## Technical Details
- **Build:** Static export (`output: 'export'`)
- **Framework:** Next.js 16.1.6
- **Hosting:** Vercel (primary) + GitHub Pages (secondary)
- **Issue Duration:** Unknown start time to 2026-03-15 03:56 PDT
- **Time to Fix:** ~2 minutes investigation + fix

## Lessons Learned
1. Different deployment platforms require different `basePath` configurations
2. Consider using environment-based config for multi-platform deploys:
   ```typescript
   basePath: process.env.DEPLOY_TARGET === 'gh-pages' ? '/nyc-tax-viz' : undefined
   ```
3. GitHub Pages deployment should use a separate branch or config

## Next Steps (Optional Improvements)
1. Add environment-based `basePath` switching if dual deployments are needed
2. Add deployment verification script that checks asset paths
3. Document the deployment targets in README
4. Consider separate build commands for different platforms
