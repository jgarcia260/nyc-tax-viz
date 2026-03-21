# NYC Tax Dollar Visualizer - Project Context

## What This Project Is

Interactive 3D map showing NYC tax revenue by borough. Users can explore tax data through an immersive Three.js visualization showing each borough as a 3D island with buildings representing tax distribution.

**Live:** https://nyc-tax-viz.vercel.app/borough-map-3d

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **3D Rendering:** Three.js (R3F not used, vanilla Three.js)
- **Styling:** Tailwind CSS
- **Deployment:** Vercel
- **Testing:** Vitest (unit tests), Playwright (E2E tests)
- **Data:** GeoJSON files for borough boundaries

## Architecture Overview

```
src/
├── app/
│   └── borough-map-3d/
│       └── page.tsx              # Main 3D map page
├── components/
│   ├── BoroughMap3DUnified.tsx   # Core 3D visualization component
│   ├── BoroughImpactMap.tsx      # 2D impact map with pie charts
│   └── ...
├── utils/
│   └── format-utils.ts           # Number/currency formatting
public/
└── data/
    └── *.geojson                 # NYC borough boundary data
```

## Key Files & Concepts

### `src/components/BoroughMap3DUnified.tsx`
**THE MOST CRITICAL FILE** - Main 3D map component.

**Critical constants (around line 30):**
```typescript
const BUILDING_SCALE_MULTIPLIER = 25; // MUST stay between 20-40
```

- Controls vertical scaling of 3D buildings
- **Too high (>50):** Massive blocky shapes, unusable
- **Too low (<10):** Buildings invisible
- **Sweet spot:** 20-40 (realistic city density)

**How it works:**
1. Loads GeoJSON borough boundaries from `/public/data/*.geojson`
2. Projects lat/lon coordinates to 3D space (Mercator projection)
3. Generates random buildings within borough boundaries
4. Applies height based on tax revenue data
5. Renders with Three.js (WebGL)

### `screenshot-site.mjs`
Playwright script for visual verification.

- Takes screenshots of localhost or production
- Used for before/after visual testing
- **Critical for catching visual regressions**

## Important Constraints

### Building Scale
- **BUILDING_SCALE_MULTIPLIER must remain 20-40**
- Production has failed multiple times because of scale >100
- Always screenshot before/after when changing scale

### Dev Server
- Runs on port **3005** (not 3000)
- Use `npm run dev` to start
- Visit: `http://localhost:3005/borough-map-3d`

### Visual Changes
- **ALL visual changes require before/after screenshots**
- Localhost screenshots > Vercel previews (saves money)
- Screenshot timeouts happen (fonts loading) - use 60s timeout

### Testing
- Unit tests: Vitest (`npm test`)
- E2E tests: Playwright (in `tests/` directory)
- **Vitest must exclude `tests/**`** (Playwright files) in config

## Data Flow

1. **Static GeoJSON data** → `/public/data/*.geojson`
2. **Tax revenue data** → Hardcoded in component (for now)
3. **3D projection** → Mercator lat/lon → Three.js coordinates
4. **Building generation** → Random placement within borough polygons
5. **Rendering** → Three.js WebGL canvas

## Common Issues

### "Buildings are too large/blocky"
→ Check `BUILDING_SCALE_MULTIPLIER` in `BoroughMap3DUnified.tsx`
→ Should be ~25, not >50

### "Screenshot script times out"
→ Fonts loading slowly
→ Increase timeout to 60s in `screenshot-site.mjs`

### "Tests failing with Playwright errors"
→ Vitest picking up Playwright test files
→ Ensure `vitest.config.ts` excludes `tests/**`

### "Dev server won't start"
→ Port 3005 might be in use
→ Kill process: `lsof -ti:3005 | xargs kill -9`

## Deployment

- **Platform:** Vercel
- **Auto-deploy:** Push to `main` → Vercel builds/deploys
- **Build command:** `npm run build`
- **Output:** `.next/` directory
- **Environment:** Node.js 22.x

## Quality Standards

### For Code Changes
- Tests must pass (`npm test`)
- Build must succeed (`npm run build`)
- No console errors in browser
- No TypeScript errors

### For Visual Changes
- Before/after screenshots required
- Buildings must be visible and realistic
- 3D performance >30fps on average hardware
- Mobile responsive (though primarily desktop experience)

## Project Goals

1. **Education:** Help NYC residents understand tax distribution
2. **Accessibility:** WCAG AA contrast compliance
3. **Performance:** Smooth 3D rendering even on older hardware
4. **Accuracy:** Data must reflect real NYC tax revenue

## Future Enhancements (Potential)

- Real-time tax data integration
- User-adjustable tax scenarios
- Mobile-optimized 3D experience
- Neighborhood-level granularity
- Historical tax data comparison

---

**Last Updated:** 2026-03-21  
**Maintainer:** Jorge Garcia (jgarcia260)
