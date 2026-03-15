import * as THREE from 'three';

export const HolographicUIShader = {
  uniforms: {
    time: { value: 0 },
    color: { value: new THREE.Color(0x00ffff) },
    opacity: { value: 0.8 },
    scanlineSpeed: { value: 2.0 },
    scanlineWidth: { value: 0.1 },
    glitchIntensity: { value: 0.05 },
    fresnelPower: { value: 2.0 },
    rimColor: { value: new THREE.Color(0x00ff88) },
    gridScale: { value: 20.0 },
    pulseSpeed: { value: 1.0 },
  },

  vertexShader: `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    
    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;
      
      gl_Position = projectionMatrix * mvPosition;
    }
  `,

  fragmentShader: `
    uniform float time;
    uniform vec3 color;
    uniform float opacity;
    uniform float scanlineSpeed;
    uniform float scanlineWidth;
    uniform float glitchIntensity;
    uniform float fresnelPower;
    uniform vec3 rimColor;
    uniform float gridScale;
    uniform float pulseSpeed;
    
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    
    // Hash function for pseudo-random numbers
    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
    }
    
    // Scanline effect
    float scanline(vec2 uv, float time) {
      float line = fract(uv.y + time * scanlineSpeed);
      return smoothstep(scanlineWidth, 0.0, abs(line - 0.5));
    }
    
    // Grid pattern
    float grid(vec2 uv, float scale) {
      vec2 grid = abs(fract(uv * scale - 0.5) - 0.5) / fwidth(uv * scale);
      float line = min(grid.x, grid.y);
      return 1.0 - min(line, 1.0);
    }
    
    // Digital glitch effect
    float glitch(vec2 uv, float time) {
      float glitchLine = floor(uv.y * 20.0 + time * 10.0);
      float glitchNoise = hash(vec2(glitchLine, floor(time * 5.0)));
      return step(0.95, glitchNoise);
    }
    
    void main() {
      // Fresnel rim light
      vec3 viewDir = normalize(vViewPosition);
      float fresnel = pow(1.0 - abs(dot(vNormal, viewDir)), fresnelPower);
      
      // Scanlines
      float scan = scanline(vUv, time);
      
      // Grid overlay
      float gridPattern = grid(vUv, gridScale) * 0.3;
      
      // Digital glitch
      float glitchEffect = glitch(vUv, time) * glitchIntensity;
      
      // Pulsing effect
      float pulse = sin(time * pulseSpeed) * 0.5 + 0.5;
      
      // Combine effects
      vec3 finalColor = color;
      finalColor += rimColor * fresnel * 0.5;
      finalColor += vec3(scan * 0.4);
      finalColor += vec3(gridPattern);
      finalColor *= (1.0 + pulse * 0.2);
      
      // Add glitch displacement
      finalColor += vec3(glitchEffect);
      
      // Holographic shimmer
      float shimmer = sin(vUv.x * 50.0 + time * 3.0) * 0.1 + 0.9;
      finalColor *= shimmer;
      
      float finalOpacity = opacity * (0.5 + fresnel * 0.5);
      
      gl_FragColor = vec4(finalColor, finalOpacity);
    }
  `
};

// Holographic text shader
export const HolographicTextShader = {
  uniforms: {
    time: { value: 0 },
    color: { value: new THREE.Color(0x00ffff) },
    opacity: { value: 1.0 },
    glowIntensity: { value: 1.5 },
    flickerSpeed: { value: 10.0 },
  },

  vertexShader: `
    varying vec2 vUv;
    
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: `
    uniform sampler2D map;
    uniform float time;
    uniform vec3 color;
    uniform float opacity;
    uniform float glowIntensity;
    uniform float flickerSpeed;
    
    varying vec2 vUv;
    
    float hash(float n) {
      return fract(sin(n) * 43758.5453);
    }
    
    void main() {
      vec4 texel = texture2D(map, vUv);
      
      // Flickering effect
      float flicker = hash(floor(time * flickerSpeed)) * 0.1 + 0.9;
      
      // Glow effect
      float glow = texel.a * glowIntensity;
      
      vec3 finalColor = color * (texel.rgb + glow);
      finalColor *= flicker;
      
      gl_FragColor = vec4(finalColor, texel.a * opacity);
    }
  `
};

// Holographic data visualization particles
export const HolographicParticleShader = {
  vertexShader: `
    uniform float time;
    uniform float size;
    
    attribute float alpha;
    attribute vec3 customColor;
    
    varying vec3 vColor;
    varying float vAlpha;
    
    void main() {
      vColor = customColor;
      vAlpha = alpha;
      
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      
      // Size attenuation
      float dist = length(mvPosition.xyz);
      gl_PointSize = size * (300.0 / dist);
      
      gl_Position = projectionMatrix * mvPosition;
    }
  `,

  fragmentShader: `
    uniform float time;
    
    varying vec3 vColor;
    varying float vAlpha;
    
    void main() {
      // Circular point
      vec2 center = gl_PointCoord - vec2(0.5);
      float dist = length(center);
      
      if (dist > 0.5) discard;
      
      // Soft edge
      float alpha = 1.0 - smoothstep(0.3, 0.5, dist);
      
      // Pulsing core
      float pulse = sin(time * 3.0) * 0.5 + 0.5;
      float core = 1.0 - smoothstep(0.0, 0.2, dist);
      
      vec3 finalColor = vColor * (1.0 + core * pulse * 0.5);
      
      gl_FragColor = vec4(finalColor, alpha * vAlpha);
    }
  `
};
