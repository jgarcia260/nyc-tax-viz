# Shader Utilities

Reusable GLSL shader utilities for Three.js materials.

## Modules

### `pbr-utils.glsl.ts`
Physically Based Rendering (PBR) functions for realistic materials:
- **Fresnel-Schlick**: Angle-dependent reflectance
- **GGX Distribution**: Microfacet distribution for specular highlights
- **Geometry Shadowing**: Smith's method for self-shadowing
- **Cook-Torrance BRDF**: Complete PBR lighting model

**Use for:** Metallic materials, glass, realistic building surfaces

### `noise-utils.glsl.ts`
Procedural noise and pattern generation:
- **hash()**: Simple pseudo-random values
- **noise()**: 2D Perlin-like noise
- **fbm()**: Fractal Brownian Motion (layered noise)
- **voronoi()**: Cellular/organic patterns
- **simplexNoise()**: Fast smooth noise

**Use for:** Weathering effects, terrain, organic patterns, randomization

## Usage

Import utilities in your shader definitions:

```typescript
import PBR_UTILS from '@/lib/shaders/pbr-utils.glsl';
import NOISE_UTILS from '@/lib/shaders/noise-utils.glsl';

export const MyCustomShader = {
  uniforms: {
    // ... your uniforms
  },
  
  vertexShader: `
    // ... vertex shader
  `,
  
  fragmentShader: `
    ${PBR_UTILS}
    ${NOISE_UTILS}
    
    // ... your shader code can now use these functions
    
    void main() {
      // Example: Use PBR lighting
      vec3 brdf = cookTorranceBRDF(normal, viewDir, lightDir, albedo, metallic, roughness);
      
      // Example: Add weathering noise
      float weathering = fbm(uv * 10.0, 3);
      
      gl_FragColor = vec4(brdf * weathering, 1.0);
    }
  `
};
```

## Benefits

- **Consistency**: Same lighting model across all materials
- **Maintainability**: Fix bugs in one place
- **Performance**: Compiler optimizes unused functions away
- **Readability**: Descriptive function names improve shader clarity

## References

- [PBR Theory](https://learnopengl.com/PBR/Theory)
- [GLSL Noise Algorithms](https://thebookofshaders.com/11/)
- [Real-Time Rendering](https://www.realtimerendering.com/)
