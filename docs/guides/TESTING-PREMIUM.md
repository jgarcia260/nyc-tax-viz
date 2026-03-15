# 🧪 Testing the Premium 3D Borough Map

## Quick Start

```bash
cd ~/code/nyc-tax-viz
pnpm dev
```

Open: `http://localhost:3001/borough-map-premium`

---

## 🎮 Feature Testing Checklist

### 1. Post-Processing Effects

**Bloom**
- [ ] See glowing halos around bright areas
- [ ] Adjust `bloomIntensity` in Leva (0-5)
- [ ] Verify glow spreads with `bloomRadius`

**Depth of Field**
- [ ] Notice background blur
- [ ] Adjust `dofFocusDistance` to change focal plane
- [ ] Increase `dofBokehScale` for stronger blur

**SSAO (Ambient Occlusion)**
- [ ] See subtle shadows in crevices
- [ ] Adjust `ssaoIntensity` (0-100)
- [ ] Notice depth enhancement

**Other Effects**
- [ ] Chromatic aberration on edges (subtle RGB split)
- [ ] Vignette darkening corners
- [ ] Tone mapping balancing colors

### 2. Custom Shaders

**Fresnel Rim Lighting**
- [ ] Rotate camera and see edge glow change
- [ ] Notice rim lighting from viewing angle

**Hover Effects**
- [ ] Hover over borough
- [ ] See wave distortion animation
- [ ] Verify smooth transitions

**Scanline Effect**
- [ ] Look closely at borough surfaces
- [ ] See subtle moving scanlines
- [ ] Verify retro-futuristic aesthetic

### 3. GSAP Animations

**Entry Sequence**
- [ ] Refresh page
- [ ] Watch boroughs bounce up from ground
- [ ] Verify staggered timing (0.2s apart)
- [ ] See elastic bounce effect
- [ ] Check scale animation

**Selection**
- [ ] Click a borough
- [ ] See it elevate smoothly
- [ ] Verify 0.6s duration
- [ ] Click another - see previous lower

**Continuous**
- [ ] Watch gentle floating rotation
- [ ] Verify each borough moves independently

### 4. Particle Systems

**Atmospheric Particles**
- [ ] See 1,000 floating particles in background
- [ ] Watch slow rotation
- [ ] Verify additive blending (glowing)
- [ ] Toggle with Leva `showParticles`

**Hover Sparkles**
- [ ] Hover over borough
- [ ] See 50 sparkles appear
- [ ] Verify borough-color matching
- [ ] Watch sparkles move

### 5. Leva Debug Controls

**Open Leva Panel** (should be top-right corner)
- [ ] See "Visual Effects" section
- [ ] Adjust sliders in real-time
- [ ] Toggle `enableEffects` on/off
- [ ] Toggle `showParticles` on/off

**Test Each Control:**
```
bloomIntensity: Try 0, 2, 5
bloomRadius: Try 0, 1, 2
dofFocusDistance: Try 0, 0.05, 0.5
dofBokehScale: Try 0, 3, 10
ssaoIntensity: Try 0, 50, 100
enableEffects: Toggle to compare
showParticles: Toggle to compare
```

### 6. Lighting & Atmosphere

**Multi-source Lighting**
- [ ] See directional sun from top-right
- [ ] Notice teal point light (left)
- [ ] Notice yellow point light (right)
- [ ] See spotlight from directly above

**Stars**
- [ ] Zoom out to see 5,000 stars
- [ ] Rotate camera - stars should stay fixed

**Environment**
- [ ] See night sky preset reflections
- [ ] Notice metallic ground plane

### 7. UI/UX

**Info Panel (left)**
- [ ] See glassmorphism effect
- [ ] Gradient text animates
- [ ] Borough color badges glow
- [ ] Hover over badges for scale effect

**Feature Badges (right)**
- [ ] See Bloom, DOF, SSAO, Shaders, GSAP badges
- [ ] Verify glassmorphism styling

**Loading Screen**
- [ ] Refresh page
- [ ] See "Loading Premium Experience"
- [ ] See pulsing gradient text
- [ ] See animated dots

### 8. Interactions

**Mouse Controls**
- [ ] Click + drag to rotate
- [ ] Scroll to zoom (in/out)
- [ ] Right-click drag to pan
- [ ] Verify auto-rotation resumes after idle

**Touch Controls (on mobile)**
- [ ] Swipe to rotate
- [ ] Pinch to zoom
- [ ] Two-finger pan
- [ ] See mobile controls hint (bottom-right)

**Borough Selection**
- [ ] Click Manhattan - see info panel
- [ ] Click Brooklyn - previous deselects
- [ ] Hover different boroughs
- [ ] See population & area data

### 9. Performance

**FPS Test**
- [ ] Open DevTools Performance monitor
- [ ] Should maintain 60fps on desktop
- [ ] Should maintain 30fps+ on mobile
- [ ] No dropped frames during animations

**Memory Test**
- [ ] Check DevTools Memory tab
- [ ] Initial: ~100-200MB
- [ ] After 5 minutes: No significant growth
- [ ] No memory leaks

### 10. Browser Compatibility

**Desktop**
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (14+)
- [ ] Edge (latest)

**Mobile**
- [ ] iOS Safari
- [ ] Chrome Android
- [ ] Samsung Internet

---

## 🐛 Common Issues & Solutions

### Issue: Leva panel not showing
**Solution**: Check browser console, might be z-index issue. Panel should be top-right.

### Issue: Performance lag
**Solution**: 
1. Disable effects with Leva `enableEffects: false`
2. Disable particles with `showParticles: false`
3. Check GPU acceleration in browser settings

### Issue: Black screen
**Solution**:
1. Check browser console for WebGL errors
2. Verify WebGL 2.0 support: `https://get.webgl.org/webgl2/`
3. Update graphics drivers

### Issue: Shaders not working
**Solution**: Browser may not support custom shaders. Check console for shader compilation errors.

### Issue: GeoJSON not loading
**Solution**: Check network tab - `borough-boundaries.geojson` should load (2.9MB). Verify file in `/public`.

---

## 📊 Expected Results

### Visual Quality
- **Glow**: Soft bloom around all bright areas
- **Depth**: Clear foreground/background separation with DOF
- **Shadows**: Subtle contact shadows from SSAO
- **Materials**: Shiny, metallic appearance with rim lighting
- **Particles**: Hundreds of glowing points floating

### Animation Quality
- **Entry**: Smooth elastic bounce (no jank)
- **Selection**: Buttery 60fps elevation
- **Floating**: Gentle, organic motion
- **Particles**: Constant smooth rotation

### Interaction Quality
- **Response**: <16ms input lag
- **Feedback**: Immediate visual changes
- **Smoothness**: Lerp-based transitions
- **Precision**: Accurate click/hover detection

---

## 🎯 Success Criteria

### Must Have ✅
- [ ] All 6 post-processing effects visible
- [ ] Custom shaders render correctly
- [ ] GSAP animations smooth and timed
- [ ] Leva panel functional
- [ ] Particles visible and animated
- [ ] 60fps on desktop
- [ ] Mobile-responsive
- [ ] Error handling works

### Nice to Have 🌟
- [ ] 60fps on mobile
- [ ] No console warnings
- [ ] Perfect visual quality across all browsers
- [ ] Zero memory leaks over 10min
- [ ] Sub-1s load time

---

## 🎬 Demo Script

**30-Second Demo:**
1. Load page - watch elastic entry (5s)
2. Rotate camera - show depth and bloom (5s)
3. Hover Manhattan - sparkles + glow (5s)
4. Click Brooklyn - elevation + info (5s)
5. Open Leva - adjust bloom to 5 (5s)
6. Zoom out - show stars + particles (5s)

**Result**: Should look like an AAA game cutscene! 🎮

---

## 📸 Screenshot Checklist

Capture these moments:
1. **Wide shot** - All boroughs, particles, stars
2. **Close-up** - Single borough with bloom
3. **Hover state** - Sparkles + glow + scanlines
4. **Selected state** - Elevated with info panel
5. **Leva panel** - Debug controls visible
6. **Mobile view** - Touch-optimized layout

---

## ✅ Final Verification

Run this checklist before showing to Jorge:

- [ ] No console errors
- [ ] All effects toggle on/off with Leva
- [ ] Smooth 60fps performance
- [ ] Mobile works (test on real device)
- [ ] Loading screen displays
- [ ] All boroughs clickable
- [ ] Info panels show correct data
- [ ] Auto-rotation works
- [ ] Shaders compile successfully
- [ ] Particles render
- [ ] Stars visible when zoomed out
- [ ] Ground plane + grid visible
- [ ] Shadows cast correctly

**If all checked: Ship it! 🚀**

---

_Last updated: March 15, 2026_
