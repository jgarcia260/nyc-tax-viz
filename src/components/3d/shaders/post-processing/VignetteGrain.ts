import * as THREE from 'three';

// Vignette Effect
export const VignetteShader = {
  uniforms: {
    tDiffuse: { value: null },
    intensity: { value: 0.5 },
    smoothness: { value: 0.5 },
    roundness: { value: 1.0 },
    color: { value: new THREE.Color(0x000000) },
  },

  vertexShader: `
    varying vec2 vUv;
    
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float intensity;
    uniform float smoothness;
    uniform float roundness;
    uniform vec3 color;
    
    varying vec2 vUv;
    
    void main() {
      vec4 texel = texture2D(tDiffuse, vUv);
      
      // Calculate vignette
      vec2 uv = vUv - 0.5;
      uv.x *= roundness;
      
      float dist = length(uv);
      float vignette = smoothstep(0.8, 0.8 - smoothness, dist);
      
      // Mix with vignette color
      vec3 finalColor = mix(color, texel.rgb, vignette);
      finalColor = mix(texel.rgb, finalColor, intensity);
      
      gl_FragColor = vec4(finalColor, texel.a);
    }
  `
};

// Film Grain Effect
export const FilmGrainShader = {
  uniforms: {
    tDiffuse: { value: null },
    time: { value: 0.0 },
    intensity: { value: 0.5 },
    grainSize: { value: 1.0 },
    coloredNoise: { value: false },
  },

  vertexShader: `
    varying vec2 vUv;
    
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float time;
    uniform float intensity;
    uniform float grainSize;
    uniform bool coloredNoise;
    
    varying vec2 vUv;
    
    // 2D random noise
    float random(vec2 co) {
      return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
    }
    
    // Value noise
    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      
      float a = random(i);
      float b = random(i + vec2(1.0, 0.0));
      float c = random(i + vec2(0.0, 1.0));
      float d = random(i + vec2(1.0, 1.0));
      
      vec2 u = f * f * (3.0 - 2.0 * f);
      
      return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
    }
    
    void main() {
      vec4 color = texture2D(tDiffuse, vUv);
      
      // Grain calculation
      vec2 grainCoord = vUv * grainSize * 100.0 + time * 10.0;
      
      if (coloredNoise) {
        // RGB noise
        float r = noise(grainCoord);
        float g = noise(grainCoord + 100.0);
        float b = noise(grainCoord + 200.0);
        
        vec3 grain = vec3(r, g, b) * 2.0 - 1.0;
        color.rgb += grain * intensity;
      } else {
        // Monochrome noise
        float grain = noise(grainCoord) * 2.0 - 1.0;
        color.rgb += vec3(grain) * intensity;
      }
      
      gl_FragColor = color;
    }
  `
};

// Analog Film Effect (combines grain, scratches, dust)
export const AnalogFilmShader = {
  uniforms: {
    tDiffuse: { value: null },
    time: { value: 0.0 },
    grainIntensity: { value: 0.1 },
    scratchIntensity: { value: 0.05 },
    dustIntensity: { value: 0.02 },
    vignette: { value: 0.3 },
    scanlines: { value: 0.1 },
    filmBurn: { value: 0.0 },
  },

  vertexShader: `
    varying vec2 vUv;
    
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float time;
    uniform float grainIntensity;
    uniform float scratchIntensity;
    uniform float dustIntensity;
    uniform float vignette;
    uniform float scanlines;
    uniform float filmBurn;
    
    varying vec2 vUv;
    
    float random(vec2 co) {
      return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
    }
    
    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      float a = random(i);
      float b = random(i + vec2(1.0, 0.0));
      float c = random(i + vec2(0.0, 1.0));
      float d = random(i + vec2(1.0, 1.0));
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
    }
    
    void main() {
      vec4 color = texture2D(tDiffuse, vUv);
      
      // Film grain
      float grain = noise(vUv * 200.0 + time * 5.0) * 2.0 - 1.0;
      color.rgb += grain * grainIntensity;
      
      // Vertical scratches
      float scratchX = floor(random(vec2(time * 0.1, 0.0)) * 100.0) / 100.0;
      if (abs(vUv.x - scratchX) < 0.001) {
        float scratchIntensityVar = random(vec2(scratchX, time)) * scratchIntensity;
        color.rgb += scratchIntensityVar;
      }
      
      // Dust particles
      float dust = step(0.998, noise(vUv * 500.0 + time * 2.0)) * dustIntensity;
      color.rgb -= dust;
      
      // Vignette
      vec2 uv = vUv - 0.5;
      float vignetteEffect = 1.0 - smoothstep(0.3, 0.9, length(uv)) * vignette;
      color.rgb *= vignetteEffect;
      
      // Scanlines
      float scanline = sin(vUv.y * 800.0) * 0.5 + 0.5;
      color.rgb -= scanline * scanlines * 0.1;
      
      // Film burn (random bright spots)
      float burn = step(0.999, noise(vUv * 100.0 + time)) * filmBurn;
      color.rgb += burn;
      
      // Color shift (old film look)
      color.r = pow(color.r, 1.1);
      color.g = pow(color.g, 1.05);
      color.b = pow(color.b, 0.9);
      
      gl_FragColor = color;
    }
  `
};

// CRT Monitor Effect
export const CRTShader = {
  uniforms: {
    tDiffuse: { value: null },
    time: { value: 0.0 },
    curvature: { value: 2.0 },
    scanlineIntensity: { value: 0.3 },
    scanlineCount: { value: 800.0 },
    vignetteIntensity: { value: 0.4 },
    chromaticAberration: { value: 0.002 },
  },

  vertexShader: `
    varying vec2 vUv;
    
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float time;
    uniform float curvature;
    uniform float scanlineIntensity;
    uniform float scanlineCount;
    uniform float vignetteIntensity;
    uniform float chromaticAberration;
    
    varying vec2 vUv;
    
    // CRT curvature
    vec2 curveUV(vec2 uv) {
      uv = uv * 2.0 - 1.0;
      vec2 offset = abs(uv.yx) / curvature;
      uv = uv + uv * offset * offset;
      uv = uv * 0.5 + 0.5;
      return uv;
    }
    
    void main() {
      vec2 uv = curveUV(vUv);
      
      // Out of bounds check
      if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
        return;
      }
      
      // Chromatic aberration
      float r = texture2D(tDiffuse, uv + vec2(chromaticAberration, 0.0)).r;
      float g = texture2D(tDiffuse, uv).g;
      float b = texture2D(tDiffuse, uv - vec2(chromaticAberration, 0.0)).b;
      
      vec3 color = vec3(r, g, b);
      
      // Scanlines
      float scanline = sin(uv.y * scanlineCount + time * 2.0) * 0.5 + 0.5;
      color *= 1.0 - scanline * scanlineIntensity;
      
      // Vignette
      vec2 vignetteUV = vUv - 0.5;
      float vignette = 1.0 - smoothstep(0.3, 0.8, length(vignetteUV)) * vignetteIntensity;
      color *= vignette;
      
      // Flicker
      float flicker = 0.95 + 0.05 * sin(time * 50.0);
      color *= flicker;
      
      gl_FragColor = vec4(color, 1.0);
    }
  `
};
