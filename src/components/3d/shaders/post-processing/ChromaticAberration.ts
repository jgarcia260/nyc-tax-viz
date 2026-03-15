import * as THREE from 'three';

// Chromatic Aberration (lens distortion effect)
export const ChromaticAberrationShader = {
  uniforms: {
    tDiffuse: { value: null },
    strength: { value: 0.5 },
    radialDistortion: { value: 1.0 },
    center: { value: new THREE.Vector2(0.5, 0.5) },
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
    uniform float strength;
    uniform float radialDistortion;
    uniform vec2 center;
    
    varying vec2 vUv;
    
    void main() {
      vec2 offset = vUv - center;
      float distance = length(offset);
      
      // Radial distortion
      float distortion = distance * distance * radialDistortion;
      
      // Sample RGB channels at different offsets
      vec2 redOffset = vUv + offset * strength * distortion * 0.01;
      vec2 greenOffset = vUv;
      vec2 blueOffset = vUv - offset * strength * distortion * 0.01;
      
      float r = texture2D(tDiffuse, redOffset).r;
      float g = texture2D(tDiffuse, greenOffset).g;
      float b = texture2D(tDiffuse, blueOffset).b;
      float a = texture2D(tDiffuse, vUv).a;
      
      gl_FragColor = vec4(r, g, b, a);
    }
  `
};

// Directional Chromatic Aberration
export const DirectionalAberrationShader = {
  uniforms: {
    tDiffuse: { value: null },
    direction: { value: new THREE.Vector2(1.0, 0.0) },
    strength: { value: 0.003 },
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
    uniform vec2 direction;
    uniform float strength;
    
    varying vec2 vUv;
    
    void main() {
      vec2 offset = direction * strength;
      
      float r = texture2D(tDiffuse, vUv - offset).r;
      float g = texture2D(tDiffuse, vUv).g;
      float b = texture2D(tDiffuse, vUv + offset).b;
      float a = texture2D(tDiffuse, vUv).a;
      
      gl_FragColor = vec4(r, g, b, a);
    }
  `
};

// Prismatic Chromatic Aberration (rainbow effect)
export const PrismaticAberrationShader = {
  uniforms: {
    tDiffuse: { value: null },
    strength: { value: 0.5 },
    samples: { value: 8 },
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
    uniform float strength;
    uniform int samples;
    
    varying vec2 vUv;
    
    void main() {
      vec2 offset = vUv - 0.5;
      
      vec3 color = vec3(0.0);
      
      for (int i = 0; i < 16; i++) {
        if (i >= samples) break;
        
        float t = float(i) / float(samples - 1);
        
        // Rainbow spectrum
        float wavelength = mix(0.4, 0.7, t); // 400nm to 700nm
        vec3 wavelengthColor;
        
        if (wavelength < 0.44) {
          wavelengthColor = vec3(0.5 + 0.5 * (wavelength - 0.4) / 0.04, 0.0, 1.0);
        } else if (wavelength < 0.49) {
          wavelengthColor = vec3(0.0, (wavelength - 0.44) / 0.05, 1.0);
        } else if (wavelength < 0.51) {
          wavelengthColor = vec3(0.0, 1.0, 1.0 - (wavelength - 0.49) / 0.02);
        } else if (wavelength < 0.58) {
          wavelengthColor = vec3((wavelength - 0.51) / 0.07, 1.0, 0.0);
        } else if (wavelength < 0.645) {
          wavelengthColor = vec3(1.0, 1.0 - (wavelength - 0.58) / 0.065, 0.0);
        } else {
          wavelengthColor = vec3(1.0, 0.0, 0.0);
        }
        
        // Dispersion offset
        vec2 dispersion = offset * strength * (t - 0.5) * 0.02;
        vec3 sample = texture2D(tDiffuse, vUv + dispersion).rgb;
        
        color += sample * wavelengthColor;
      }
      
      color /= float(samples);
      
      gl_FragColor = vec4(color, 1.0);
    }
  `
};
