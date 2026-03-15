import * as THREE from 'three';

// Color Grading & Tone Mapping
export const ColorGradingShader = {
  uniforms: {
    tDiffuse: { value: null },
    tLUT: { value: null }, // 3D LUT texture (optional)
    exposure: { value: 1.0 },
    contrast: { value: 1.0 },
    saturation: { value: 1.0 },
    brightness: { value: 0.0 },
    temperature: { value: 0.0 }, // -1 to 1 (blue to orange)
    tint: { value: 0.0 }, // -1 to 1 (green to magenta)
    gamma: { value: 2.2 },
    lift: { value: new THREE.Vector3(1, 1, 1) }, // Shadows
    gamma_: { value: new THREE.Vector3(1, 1, 1) }, // Midtones
    gain: { value: new THREE.Vector3(1, 1, 1) }, // Highlights
    toneMapping: { value: 0 }, // 0=None, 1=Reinhard, 2=Filmic, 3=ACES
    useLUT: { value: false },
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
    uniform sampler3D tLUT;
    uniform float exposure;
    uniform float contrast;
    uniform float saturation;
    uniform float brightness;
    uniform float temperature;
    uniform float tint;
    uniform float gamma;
    uniform vec3 lift;
    uniform vec3 gamma_;
    uniform vec3 gain;
    uniform int toneMapping;
    uniform bool useLUT;
    
    varying vec2 vUv;
    
    // RGB to HSV
    vec3 rgb2hsv(vec3 c) {
      vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
      vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
      vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
      
      float d = q.x - min(q.w, q.y);
      float e = 1.0e-10;
      return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
    }
    
    // HSV to RGB
    vec3 hsv2rgb(vec3 c) {
      vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
      vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
      return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
    }
    
    // Reinhard tone mapping
    vec3 reinhardToneMapping(vec3 color) {
      return color / (color + vec3(1.0));
    }
    
    // Filmic tone mapping (Uncharted 2)
    vec3 filmicToneMapping(vec3 color) {
      color = max(vec3(0.0), color - 0.004);
      color = (color * (6.2 * color + 0.5)) / (color * (6.2 * color + 1.7) + 0.06);
      return color;
    }
    
    // ACES Filmic tone mapping
    vec3 acesToneMapping(vec3 color) {
      const float a = 2.51;
      const float b = 0.03;
      const float c = 2.43;
      const float d = 0.59;
      const float e = 0.14;
      return clamp((color * (a * color + b)) / (color * (c * color + d) + e), 0.0, 1.0);
    }
    
    // White balance
    vec3 whiteBalance(vec3 color, float temp, float tnt) {
      // Temperature: blue (-1) to orange (+1)
      vec3 tempColor = color;
      tempColor.r += temp * 0.1;
      tempColor.b -= temp * 0.1;
      
      // Tint: green (-1) to magenta (+1)
      tempColor.g -= tnt * 0.1;
      
      return tempColor;
    }
    
    // Lift Gamma Gain color grading
    vec3 liftGammaGain(vec3 color, vec3 lft, vec3 gma, vec3 gn) {
      // Lift (shadows)
      color = color * (1.0 - lft) + lft;
      
      // Gamma (midtones)
      color = pow(color, 1.0 / gma);
      
      // Gain (highlights)
      color = color * gn;
      
      return color;
    }
    
    void main() {
      vec4 color = texture2D(tDiffuse, vUv);
      vec3 rgb = color.rgb;
      
      // Exposure
      rgb *= exposure;
      
      // Tone mapping
      if (toneMapping == 1) {
        rgb = reinhardToneMapping(rgb);
      } else if (toneMapping == 2) {
        rgb = filmicToneMapping(rgb);
      } else if (toneMapping == 3) {
        rgb = acesToneMapping(rgb);
      }
      
      // White balance
      rgb = whiteBalance(rgb, temperature, tint);
      
      // Lift Gamma Gain
      rgb = liftGammaGain(rgb, lift, gamma_, gain);
      
      // Brightness
      rgb += brightness;
      
      // Contrast
      rgb = (rgb - 0.5) * contrast + 0.5;
      
      // Saturation
      vec3 hsv = rgb2hsv(rgb);
      hsv.y *= saturation;
      rgb = hsv2rgb(hsv);
      
      // 3D LUT (if provided)
      if (useLUT) {
        // Map RGB to LUT coordinates
        vec3 lutCoord = clamp(rgb, 0.0, 1.0);
        rgb = texture(tLUT, lutCoord).rgb;
      }
      
      // Gamma correction
      rgb = pow(rgb, vec3(1.0 / gamma));
      
      gl_FragColor = vec4(rgb, color.a);
    }
  `
};

// Cinematic Color Grading (film-like look)
export const CinematicGradingShader = {
  uniforms: {
    tDiffuse: { value: null },
    filmGrain: { value: 0.05 },
    vignette: { value: 0.3 },
    bleach: { value: 0.0 }, // Bleach bypass effect
    lut: { value: 1 }, // 0=None, 1=Warm, 2=Cool, 3=Noir
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
    uniform float filmGrain;
    uniform float vignette;
    uniform float bleach;
    uniform int lut;
    
    varying vec2 vUv;
    
    // Random noise
    float random(vec2 co) {
      return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
    }
    
    // Vignette effect
    float getVignette(vec2 uv, float intensity) {
      vec2 center = uv - 0.5;
      float dist = length(center);
      return 1.0 - smoothstep(0.3, 1.0, dist) * intensity;
    }
    
    // Bleach bypass
    vec3 bleachBypass(vec3 color, float amount) {
      vec3 lumCoeff = vec3(0.25, 0.65, 0.1);
      float lum = dot(color, lumCoeff);
      vec3 blend = vec3(lum);
      
      float L = min(1.0, max(0.0, 10.0 * (lum - 0.45)));
      vec3 result = mix(color, blend, L);
      
      return mix(color, result, amount);
    }
    
    // Color LUTs
    vec3 warmLUT(vec3 color) {
      color.r = pow(color.r, 0.9);
      color.g = pow(color.g, 0.95);
      color.b = pow(color.b, 1.1);
      return color * vec3(1.1, 1.0, 0.9);
    }
    
    vec3 coolLUT(vec3 color) {
      color.r = pow(color.r, 1.1);
      color.g = pow(color.g, 1.0);
      color.b = pow(color.b, 0.9);
      return color * vec3(0.9, 1.0, 1.1);
    }
    
    vec3 noirLUT(vec3 color) {
      float gray = dot(color, vec3(0.299, 0.587, 0.114));
      return vec3(gray) * vec3(0.95, 0.9, 0.85);
    }
    
    void main() {
      vec4 color = texture2D(tDiffuse, vUv);
      vec3 rgb = color.rgb;
      
      // Apply LUT
      if (lut == 1) {
        rgb = warmLUT(rgb);
      } else if (lut == 2) {
        rgb = coolLUT(rgb);
      } else if (lut == 3) {
        rgb = noirLUT(rgb);
      }
      
      // Bleach bypass
      if (bleach > 0.0) {
        rgb = bleachBypass(rgb, bleach);
      }
      
      // Film grain
      float grain = random(vUv * 1000.0) * filmGrain;
      rgb += grain;
      
      // Vignette
      float vig = getVignette(vUv, vignette);
      rgb *= vig;
      
      gl_FragColor = vec4(rgb, color.a);
    }
  `
};
