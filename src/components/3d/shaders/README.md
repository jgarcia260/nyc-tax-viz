# WebGL Shader Library for NYC Tax Visualizer

A comprehensive collection of custom GLSL shaders for creating cinematic 3D data visualizations of NYC tax data.

## 📦 Shader Categories

### 🌫️ Atmospheric Shaders (`atmospheric/`)
Create depth, atmosphere, and environmental effects:

- **VolumetricFog** - Depth-based fog with customizable density and color
- **GodRays** - Volumetric light rays (crepuscular rays)
- **HeatDistortion** - Heat haze and air distortion effects

**Use cases:** Adding depth to 3D scenes, highlighting important areas, creating mood

### 🎨 Material Shaders (`materials/`)
Advanced surface materials for buildings and UI elements:

- **HolographicUI** - Futuristic holographic interface with scanlines, grids, and glitches
- **Glass** - Realistic glass with refraction, reflection, and Fresnel effects
- **MetallicBuilding** - Metallic surfaces with anisotropic reflections
- **Water** - Animated water with waves, caustics, and reflections
- **Emissive** - Self-illuminating materials with glow effects

**Use cases:** NYC building materials, interactive UI overlays, data containers

### 🎬 Post-Processing Effects (`post-processing/`)
Screen-space effects applied after rendering:

#### Quality Effects
- **Bloom** - Glow effect for bright areas (multiple blur algorithms)
- **DepthOfField** - Bokeh blur based on depth
- **SSAO** - Screen-space ambient occlusion for realistic shadows
- **SSR** - Screen-space reflections

#### Color Grading
- **ColorGrading** - Complete color pipeline (exposure, contrast, saturation, tone mapping)
- **CinematicGrading** - Film-like looks with LUTs (warm/cool/noir)

#### Stylistic Effects
- **ChromaticAberration** - Lens distortion with RGB separation
- **VignetteGrain** - Film grain, vignette, analog film effects
- **CRTShader** - Retro CRT monitor effect with scanlines

**Use cases:** Professional presentation quality, thematic styling, retro aesthetics

### 📊 Data Visualization Shaders (`data-viz/`)
Specialized shaders for visualizing tax and economic data:

#### Gradient Mapping
- **TaxBracketGradient** - Map tax amounts to color gradients
- **MultiDimensionalGradient** - 2D data mapping (e.g., income vs. tax burden)
- **ChoroplethShader** - Geographic data mapping for NYC boroughs
- **RadialGradient** - Circular data visualization

#### Heat Mapping
- **HeatMapShader** - Thermal visualization with fire/thermal/rainbow schemes
- **IsolineHeatMap** - Discrete temperature bands with contour lines
- **VoronoiHeatMap** - Cellular heat map based on data points

#### Flow Visualization
- **FlowFieldShader** - Animated flow fields for money/tax flow
- **ParticleFlowShader** - Particles following flow vectors
- **FlowArrowsShader** - Directional arrows showing flow
- **StreamlineShader** - Continuous flow lines

#### Particle Systems
- **DataParticleShader** - Customizable data point particles (circle/square/diamond/triangle)
- **TaxFlowParticleShader** - Animated particles traveling between regions
- **BarChartParticleShader** - 3D bar chart visualization
- **NetworkNodeShader** - Graph visualization with nodes and importance weighting

**Use cases:** Tax burden visualization, money flow tracking, geographic data, network relationships

## 🚀 Usage Examples

### Basic Shader Usage

```typescript
import { VolumetricFogShader } from '@/components/3d/shaders';
import { ShaderMaterial } from 'three';

// Create material
const fogMaterial = new ShaderMaterial({
  uniforms: VolumetricFogShader.uniforms,
  vertexShader: VolumetricFogShader.vertexShader,
  fragmentShader: VolumetricFogShader.fragmentShader,
  transparent: true,
});

// Update uniforms
fogMaterial.uniforms.time.value = elapsedTime;
fogMaterial.uniforms.density.value = 0.05;
```

### Post-Processing Pipeline

```typescript
import { EffectComposer } from '@react-three/postprocessing';
import { BloomShader, SSAOShader, ColorGradingShader } from '@/components/3d/shaders';

<EffectComposer>
  <ShaderPass shader={SSAOShader} />
  <ShaderPass shader={BloomShader} />
  <ShaderPass shader={ColorGradingShader} />
</EffectComposer>
```

### Data Visualization

```typescript
import { TaxBracketGradientShader } from '@/components/3d/shaders';

// Color a building based on tax bracket
const buildingMaterial = new ShaderMaterial({
  uniforms: {
    ...TaxBracketGradientShader.uniforms,
    value: { value: taxAmount / maxTax }, // Normalize to 0-1
  },
  vertexShader: TaxBracketGradientShader.vertexShader,
  fragmentShader: TaxBracketGradientShader.fragmentShader,
});
```

### Particle System

```typescript
import { TaxFlowParticleShader } from '@/components/3d/shaders';
import { Points, BufferGeometry } from 'three';

const particleGeometry = new BufferGeometry();
// Set attributes: position, destination, travelTime, startTime, particleColor

const particleMaterial = new ShaderMaterial({
  uniforms: { time: { value: 0 }, particleSize: { value: 10 } },
  vertexShader: TaxFlowParticleShader.vertexShader,
  fragmentShader: TaxFlowParticleShader.fragmentShader,
  transparent: true,
});

const particles = new Points(particleGeometry, particleMaterial);
```

## 📋 Shader Inventory

| Category | Shader | Files | Status |
|----------|--------|-------|--------|
| Atmospheric | VolumetricFog, GodRays, HeatDistortion | 3 | ✅ Complete |
| Materials | Holographic, Glass, Metallic, Water, Emissive | 5 | ✅ Complete |
| Post-Processing | Bloom, DOF, SSAO, SSR, Color Grading, Chromatic, Vignette, CRT | 7+ | ✅ Complete |
| Data Viz | Gradients, Heat Maps, Flow Fields, Particles | 16+ | ✅ Complete |

**Total:** 30+ custom shaders

## 🎯 NYC Tax Visualizer Use Cases

### 1. Building Visualization
- **Glass** shader for modern buildings
- **MetallicBuilding** for commercial towers
- **TaxBracketGradient** to color by tax amount

### 2. Tax Flow Animation
- **TaxFlowParticleShader** for money moving between boroughs
- **FlowFieldShader** for overall tax flow patterns
- **StreamlineShader** for continuous flow visualization

### 3. Geographic Heat Maps
- **HeatMapShader** for tax burden by region
- **ChoroplethShader** for borough-level data
- **IsolineHeatMap** for tax bracket boundaries

### 4. Atmospheric Effects
- **VolumetricFog** to add depth to 3D NYC map
- **GodRays** for dramatic lighting
- **HeatDistortion** for "money burning" effect in high-tax areas

### 5. Cinematic Presentation
- **Bloom** for glowing high-value areas
- **DepthOfField** for focus control
- **CinematicGrading** for professional film look

## 🛠️ Development Notes

### Performance Tips
- Use SSAO/SSR sparingly (expensive on mobile)
- Batch particle systems when possible
- Use LOD for complex shaders
- Consider downsampling for post-processing effects

### Browser Compatibility
- All shaders tested on WebGL 2.0
- Fallback to simpler effects for WebGL 1.0
- Mobile optimization recommended for particle counts >1000

### Future Enhancements
- [ ] Temporal anti-aliasing (TAA)
- [ ] Global illumination approximation
- [ ] Animated texture support for data updates
- [ ] Shader hot-reload for development

## 📚 Resources

- [Three.js Shader Documentation](https://threejs.org/docs/#api/en/materials/ShaderMaterial)
- [The Book of Shaders](https://thebookofshaders.com/)
- [Shadertoy](https://www.shadertoy.com/) for shader inspiration

---

**Built for NYC Tax Visualizer** | Premium WebGL shader library for data-driven 3D visualization
