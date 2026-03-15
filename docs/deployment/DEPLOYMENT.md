# Deployment Guide

## Quick Deploy (Recommended)

### Option 1: Deploy via Vercel Dashboard (1-Click)

1. Visit: **https://vercel.com/new/clone?repository-url=https://github.com/jgarcia260/nyc-tax-viz**

2. Click "Deploy" - Vercel will:
   - Import the repository
   - Auto-detect Next.js configuration
   - Install dependencies with pnpm
   - Build the project
   - Deploy to production

3. **Done!** You'll get 3 URLs:
   - **Production URL:** `https://nyc-tax-viz.vercel.app` (or custom domain)
   - **All routes accessible:**
     - `/` - Landing page with comparison
     - `/policy-comparison` - Policy Dashboard
     - `/borough-impact` - Borough Map
     - `/flow-visualization` - Flow Diagram

### Option 2: Deploy via Vercel CLI

```bash
cd ~/code/nyc-tax-viz

# Login to Vercel (first time only)
vercel login

# Deploy to production
vercel --prod
```

This will:
- Build the project
- Upload to Vercel
- Provide production URL

### Option 3: Deploy via GitHub Integration

1. Go to https://vercel.com/dashboard
2. Click "Add New Project"
3. Select `jgarcia260/nyc-tax-viz` from GitHub
4. Configure:
   - **Framework:** Next.js (auto-detected)
   - **Build Command:** `pnpm build`
   - **Install Command:** `pnpm install`
   - **Output Directory:** `.next` (auto-detected)
5. Click "Deploy"

**Vercel will auto-deploy on every push to main branch.**

---

## Deployment URLs

Once deployed, you'll have:

1. **Main Landing Page**
   - `https://your-project.vercel.app/`
   - Comparison of all three visualization approaches

2. **Policy Comparison Dashboard**
   - `https://your-project.vercel.app/policy-comparison`
   - Side-by-side billionaire tax vs. corporate tax

3. **Borough Impact Map**
   - `https://your-project.vercel.app/borough-impact`
   - Interactive borough selector with local impact

4. **Tax Revenue Flow**
   - `https://your-project.vercel.app/flow-visualization`
   - Visual flow from tax → revenue → improvements

---

## Environment Variables (if needed)

This project has **no environment variables required** for basic deployment.

All data is static JSON files in the `data/` directory.

If you add external APIs later, set them in Vercel dashboard:
1. Go to Project Settings → Environment Variables
2. Add key-value pairs
3. Redeploy

---

## Build Settings (Already Configured)

The `vercel.json` file includes:

```json
{
  "buildCommand": "pnpm build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "installCommand": "pnpm install"
}
```

No manual configuration needed!

---

## Custom Domain (Optional)

To add a custom domain:

1. Go to Project Settings → Domains
2. Add your domain (e.g., `nyc-tax.jorgegar cia.com`)
3. Follow DNS configuration instructions
4. Vercel auto-provisions SSL certificate

---

## Deployment Checklist

- [x] Code pushed to GitHub (`main` branch)
- [x] `README.md` created
- [x] `vercel.json` configured
- [x] Build tested locally (`pnpm build` succeeds)
- [ ] **Deploy to Vercel** (one of the options above)
- [ ] **Verify all routes work** (/, /policy-comparison, /borough-impact, /flow-visualization)
- [ ] **Share URLs** for review

---

## Troubleshooting

### Build fails on Vercel

```bash
# Test build locally first
pnpm build

# Check build logs on Vercel dashboard
```

### Page not found (404)

- Verify routes exist in `src/app/`
- Check `page.tsx` files are present
- Redeploy

### Slow initial load

- Vercel auto-caches static pages
- First visitor may see 1-2s load, subsequent loads are instant
- Use `pnpm build` to pre-render all pages

---

## Performance

Vercel automatically provides:
- Global CDN
- Automatic caching
- Image optimization
- Static page generation
- Instant rollback

Expected performance:
- **First paint:** <1s
- **Interactive:** <1.5s
- **Lighthouse score:** 95+ (all pages are static)

---

## Next Steps After Deployment

1. Test all three visualization routes
2. Share URLs for feedback
3. Monitor analytics (Vercel dashboard)
4. Iterate based on user feedback

**Need help?** Check Vercel docs: https://vercel.com/docs
