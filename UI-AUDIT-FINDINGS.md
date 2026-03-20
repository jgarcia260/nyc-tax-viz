# NYC Tax Viz - Comprehensive UI Audit Findings
**Date:** March 20, 2026  
**Task:** b49d282c - 360 Borough Visualization  
**Auditor:** Verne (via Playwright testing)

---

## Executive Summary

Jorge's feedback is **100% accurate**. The 3D visualization has critical rendering issues:

1. **3D building layers are nearly invisible** (buildings exist in code but are too small to see)
2. **Home page has CSS watermark bug** (ghost text bleeding through)
3. **Borough Impact map is completely missing** (empty gray rectangle)
4. **Text contrast issues across all pages** (illegible labels and descriptions)

**Root cause of 3D issue**: Building scale mismatch. Buildings are configured at 0.01-2.0 units tall, but camera is at Y=200 with a scene scale of 400 units. From that distance, even Manhattan's tallest buildings (2 units) appear as tiny dots.

---

## Critical Issues (Blocking "Portfolio-Quality" Goal)

### 1. 3D Building Layers Invisible ⚠️ CRITICAL
**Severity:** P0 (breaks core feature)  
**Status:** Buildings exist in code but aren't visible

**What's happening:**
- Boroughs render as flat land masses with only tiny bumps
- Building instances ARE being created (220 for Manhattan, 120 for Brooklyn, etc.)
- Building heights range: 0.01-2.0 units
- Camera distance: Y=200, looking down from far away
- Scene scale: 400 units

**Why it's broken:**
Building scale is ~100x too small relative to camera distance. Even Manhattan's tallest buildings (2 units) appear as barely-visible dots from Y=200.

**What should happen:**
- Manhattan ($8B revenue) should have dramatically tall skyscraper extrusions
- Brooklyn/Queens/Bronx should have medium-height buildings
- "SimCity-style aesthetics" with clear building skyline
- Buildings should be the dominant visual feature, not the flat borough base

**Evidence:**
- Screenshot: `audit-3d-map.png` shows almost completely flat boroughs
- Playwright test confirmed canvas renders but no visible 3D buildings
- Console shows `Created 220 buildings for Manhattan` but they're invisible to camera

**Code location:**
- Component: `src/components/BoroughMap3DUnified.tsx`
- Building generation: `generateBuildings()` function (lines 140-240)
- Building configs: `BOROUGH_BUILDING_CONFIG` and `RESIDENTIAL_BUILDING_CONFIG`
- Camera: `<PerspectiveCamera position={[80, 200, 100]} />`

**Recommended fix:**
1. **Scale up building heights by 10-20x** (0.01 → 0.1-0.2, 2.0 → 20-40)
2. **OR lower camera** (Y=200 → Y=50-80)
3. **OR increase coordinate scale** (400 → 4000) + adjust all other dimensions proportionally
4. **Test at different zoom levels** to ensure buildings visible at default view

---

### 2. Home Page CSS Watermark Bug ⚠️ HIGH
**Severity:** P1 (looks broken/unprofessional)  
**Status:** Visual bug affecting credibility

**What's happening:**
Giant semi-transparent text ("NYC Tax Visualizer," "Visualization Approaches," "Core Narrative Approaches") bleeds through content, creating ghost/watermark effect that clashes with actual headings.

**Why it's broken:**
CSS z-index/opacity/layering issue. Background decorative text is too prominent and overlaps readable content.

**Evidence:**
- Screenshot: `audit-home.png` shows massive text overlay
- Makes sections hard to read (e.g., "Visualization Approaches" overlaps description paragraph)

**Recommended fix:**
1. **Remove decorative background text entirely** (cleanest solution)
2. **OR** push it much further back with `z-index: -1` + very low opacity (0.03-0.05)
3. **OR** use subtle gradient/pattern instead of text

**Code location:**
- File: `src/app/page.tsx`
- Look for large heading elements with absolute positioning or background text layers

---

### 3. Borough Impact Map Missing ⚠️ HIGH
**Severity:** P1 (core feature non-functional)  
**Status:** Empty gray rectangle instead of map

**What's happening:**
The Borough Impact page (`/borough-impact`) has a large empty gray area where an interactive NYC borough map should be.

**Evidence:**
- Screenshot: `audit-borough-impact.png` shows empty rectangle above borough list
- Borough list renders correctly (Manhattan, Brooklyn, Queens, Bronx, Staten Island)
- Detail panel renders correctly
- **Only the map visualization itself is missing**

**Recommended fix:**
1. Check if map library (Mapbox/Maplibre) is loading
2. Verify GeoJSON data is being passed to map component
3. Check for console errors on that page (may need API key or missing dependency)
4. Ensure `BoroughImpactMap` component is properly importing and rendering map

**Code location:**
- Page: `src/app/borough-impact/page.tsx`
- Component: `src/components/BoroughImpactMap.tsx`

---

## High Priority Issues (User Experience)

### 4. Text Contrast Issues Across All Pages ⚠️ MODERATE
**Severity:** P2 (accessibility + readability)  
**Status:** Pervasive across Policy Comparison, Borough Impact, Flow Visualization

**Specific examples:**
- **Policy Comparison**: Pros/Cons bullet points nearly invisible (light gray on dark card)
- **Borough Impact**: "POPULATION", "TAX POTENTIAL", "REVENUE SHARE BY POLICY" headers low contrast
- **Flow Visualization**: "STEP 1", "STEP 2", "STEP 3" labels barely readable
- **All pages**: Secondary text rendered in colors too close to background

**Recommended fix:**
1. Audit and update design tokens/CSS variables for text colors
2. Ensure WCAG AA contrast ratio (4.5:1 for normal text, 3:1 for large text)
3. Replace dark gray cards on light backgrounds with consistent theme (all-dark or all-light)
4. Test in browser DevTools with contrast checker

**Code locations:**
- Global styles: `src/app/globals.css`
- Component-specific styles in each page file
- Tailwind config: `tailwind.config.js` (if using custom colors)

---

### 5. Flow Visualization Static/Underwhelming ⚠️ MODERATE
**Severity:** P2 (doesn't meet "interactive visualization" expectation)  
**Status:** Functional but not engaging

**What's happening:**
Flow Visualization page is static cards with thin dotted lines. Doesn't feel like a true "flow" or Sankey diagram. Lacks animation or visual energy.

**Issues:**
- Dotted connecting lines are minimal and hard to see
- No animation of "flow" from tax → revenue → improvements
- "Partially funded (7%)" appears identically on all cards (should be per-category percentages)
- Cards feel disconnected rather than part of a cohesive flow

**Recommended fix:**
1. Replace dotted lines with animated Sankey diagram (D3.js or Visx)
2. Show proportional flow widths (bigger flow = more money)
3. Calculate per-category funding percentages (not hardcoded 7% everywhere)
4. Add subtle animations (flow particles moving along paths)

**Code location:**
- Page: `src/app/flow-visualization/page.tsx`
- Component: `src/components/FlowVisualization.tsx` (likely)

---

## Minor Issues (Polish)

### 6. "StatenIsland" Missing Space
**Location:** Borough Impact page  
**Fix:** Add space → "Staten Island"

### 7. Chart Legends Hard to Read
**Location:** Policy Comparison page (line chart and bar chart legends)  
**Fix:** Increase legend text size or contrast

### 8. Color Scheme Inconsistency
**Location:** All pages  
**Fix:** Establish unified design system with consistent accent colors

---

## What's Working ✅

### Pages That Render Correctly:
- **Policy Comparison**: Charts (line + bar) render, toggle buttons work
- **Borough Impact**: Borough list, detail panel, revenue progress bars all functional
- **Flow Visualization**: Card structure, progress bars, funding amounts display correctly
- **3D Map**: Borough shapes render, colors work, legend displays, auto-rotate/zoom/click interactions functional

### Data & Structure:
- GeoJSON data loads successfully (all 5 boroughs)
- Building generation logic is sophisticated (exclusions for Central Park, water, landmarks)
- Tax revenue data accurate
- Component architecture is solid

**The fundamentals are strong. The issues are visual/scale problems, not architectural.**

---

## Performance Notes

### Console Warnings (Non-Critical):
- `THREE.Clock deprecated` → Use `THREE.Timer` instead (minor)
- `GPU stall due to ReadPixels` → Performance hit but not blocking (WebGL optimization opportunity)

### Screenshots Generated:
- ✅ Home page: `audit-home.png`
- ✅ 3D map: `audit-3d-map.png`
- ✅ Policy comparison: `audit-policy-comparison.png`
- ✅ Borough impact: `audit-borough-impact.png`
- ✅ Flow visualization: `audit-flow-viz.png`

---

## Testing Summary

**Playwright Tests Run:** 8 tests  
**Status:** 8 passed  
**Duration:** 31.2s  
**Browser:** Chromium  
**Deployed URL:** https://nyc-tax-viz.vercel.app

**Key test findings:**
- Canvas element confirmed present
- All 5 borough labels found (Manhattan, Brooklyn, Queens, Bronx, Staten Island)
- Charts rendering (5 SVG charts on Policy Comparison)
- No JavaScript console errors
- Auto-rotate/zoom/click interactions functional
- **BUT: Visual verification shows buildings invisible**

---

## Recommended Action Plan

### Phase 1: Critical Fixes (Block Portfolio Quality)
1. **Fix 3D building scale** (scale buildings 10-20x OR lower camera OR increase scene scale)
2. **Remove/fix home page watermark** (CSS layering bug)
3. **Restore Borough Impact map** (investigate why map component isn't rendering)

### Phase 2: UX Polish
4. **Fix text contrast globally** (audit all pages, ensure WCAG AA)
5. **Enhance Flow Visualization** (replace static cards with animated Sankey)
6. **Minor text fixes** ("StatenIsland" → "Staten Island", legend readability)

### Phase 3: Optimization (After Visual Issues Resolved)
7. **Address THREE.Clock deprecation**
8. **Optimize WebGL rendering** (reduce GPU stalls)
9. **Add visual regression tests** (screenshot comparison in CI)

---

## Next Steps

1. **Create AI Flow tasks** for each critical/high issue (6 tasks total)
2. **Assign priorities** (P0 → P1 → P2)
3. **Spawn sub-agents** to implement fixes in parallel
4. **Visual verification** after each fix (Playwright screenshot comparison)
5. **Jorge review** when all critical issues resolved

---

**Report Generated:** March 20, 2026, 10:45 AM EST  
**Audit Duration:** ~15 minutes (automated testing + manual screenshot review)  
**Tools Used:** Playwright, image analysis, code review
