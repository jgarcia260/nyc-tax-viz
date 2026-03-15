import * as THREE from 'three';

export const DepthOfFieldShader = {
  uniforms: {
    tDiffuse: { value: null },
    tDepth: { value: null },
    cameraNear: { value: 0.1 },
    cameraFar: { value: 1000 },
    focalDepth: { value: 10.0 },
    focalLength: { value: 50.0 },
    fstop: { value: 2.8 },
    maxBlur: { value: 1.0 },
    resolution: { value: new THREE.Vector2(1024, 1024) },
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
    uniform sampler2D tDepth;
    uniform float cameraNear;
    uniform float cameraFar;
    uniform float focalDepth;
    uniform float focalLength;
    uniform float fstop;
    uniform float maxBlur;
    uniform vec2 resolution;
    
    varying vec2 vUv;
    
    // Read linear depth
    float readDepth(vec2 coord) {
      float fragCoordZ = texture2D(tDepth, coord).x;
      float viewZ = perspectiveDepthToViewZ(fragCoordZ, cameraNear, cameraFar);
      return viewZToOrthographicDepth(viewZ, cameraNear, cameraFar);
    }
    
    // Calculate circle of confusion
    float getCoC(float depth) {
      float depthDiff = abs(depth - focalDepth);
      float focalPlane = focalLength / (focalDepth * 1000.0);
      float coc = (depthDiff / focalPlane) * (focalLength / fstop);
      return clamp(coc, 0.0, maxBlur);
    }
    
    void main() {
      float depth = readDepth(vUv) * cameraFar;
      float coc = getCoC(depth);
      
      vec2 aspectCorrect = vec2(1.0, resolution.x / resolution.y);
      vec2 pixelSize = 1.0 / resolution;
      
      vec4 color = vec4(0.0);
      float total = 0.0;
      
      // Hexagonal bokeh pattern (7 samples)
      const int samples = 7;
      const float goldenAngle = 2.39996323;
      
      for(int i = 0; i < samples; i++) {
        float angle = float(i) * goldenAngle;
        float radius = sqrt(float(i) / float(samples)) * coc;
        
        vec2 offset = vec2(cos(angle), sin(angle)) * radius * pixelSize * aspectCorrect;
        
        float sampleDepth = readDepth(vUv + offset) * cameraFar;
        float sampleCoC = getCoC(sampleDepth);
        
        // Weight by CoC (focused areas contribute more)
        float weight = 1.0 / (1.0 + sampleCoC);
        
        color += texture2D(tDiffuse, vUv + offset) * weight;
        total += weight;
      }
      
      color /= total;
      
      gl_FragColor = color;
    }
  `
};

// Bokeh DOF (multi-pass)
export const BokehDOFShader = {
  uniforms: {
    tDiffuse: { value: null },
    tDepth: { value: null },
    cameraNear: { value: 0.1 },
    cameraFar: { value: 1000 },
    focus: { value: 10.0 },
    aperture: { value: 0.025 },
    maxBlur: { value: 0.01 },
    resolution: { value: new THREE.Vector2(1024, 1024) },
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
    uniform sampler2D tDepth;
    uniform float cameraNear;
    uniform float cameraFar;
    uniform float focus;
    uniform float aperture;
    uniform float maxBlur;
    uniform vec2 resolution;
    
    varying vec2 vUv;
    
    float readDepth(vec2 coord) {
      float fragCoordZ = texture2D(tDepth, coord).x;
      float viewZ = perspectiveDepthToViewZ(fragCoordZ, cameraNear, cameraFar);
      return viewZToOrthographicDepth(viewZ, cameraNear, cameraFar);
    }
    
    void main() {
      float depth = readDepth(vUv);
      
      float fDepth = focus;
      
      float f = fDepth;
      float d = depth * cameraFar;
      
      float o = f * (d - f) / (d * (f - cameraNear));
      
      float blur = clamp(abs(o) * aperture, 0.0, maxBlur);
      
      vec2 aspectcorrect = vec2(1.0, resolution.x / resolution.y);
      
      vec4 col = vec4(0.0);
      float total = 0.0;
      
      // Disc bokeh pattern
      const int rings = 3;
      const int samplesPerRing = 6;
      
      for(int ring = 1; ring <= rings; ring++) {
        for(int i = 0; i < samplesPerRing; i++) {
          float angle = float(i) * 6.28318530718 / float(samplesPerRing);
          float radius = float(ring) / float(rings);
          
          vec2 offset = vec2(cos(angle), sin(angle)) * radius * blur * aspectcorrect;
          
          col += texture2D(tDiffuse, vUv + offset);
          total += 1.0;
        }
      }
      
      col += texture2D(tDiffuse, vUv);
      total += 1.0;
      
      gl_FragColor = col / total;
    }
  `
};

// Cinematic DOF (more realistic, expensive)
export const CinematicDOFShader = {
  uniforms: {
    tDiffuse: { value: null },
    tDepth: { value: null },
    tNoise: { value: null },
    cameraNear: { value: 0.1 },
    cameraFar: { value: 1000 },
    focusDistance: { value: 10.0 },
    focusRange: { value: 5.0 },
    bokehScale: { value: 4.0 },
    resolution: { value: new THREE.Vector2(1024, 1024) },
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
    uniform sampler2D tDepth;
    uniform sampler2D tNoise;
    uniform float cameraNear;
    uniform float cameraFar;
    uniform float focusDistance;
    uniform float focusRange;
    uniform float bokehScale;
    uniform vec2 resolution;
    
    varying vec2 vUv;
    
    const int SAMPLES = 32;
    const float PI = 3.14159265359;
    
    float readDepth(vec2 coord) {
      float fragCoordZ = texture2D(tDepth, coord).x;
      float viewZ = perspectiveDepthToViewZ(fragCoordZ, cameraNear, cameraFar);
      return viewZToOrthographicDepth(viewZ, cameraNear, cameraFar);
    }
    
    // Hexagonal bokeh shape
    vec2 hexagon(int i, int samples) {
      float angle = float(i) * 2.39996323; // Golden angle
      float radius = sqrt(float(i) / float(samples));
      return vec2(cos(angle), sin(angle)) * radius;
    }
    
    void main() {
      float centerDepth = readDepth(vUv) * cameraFar;
      
      // Calculate blur amount based on distance from focus
      float blur = abs(centerDepth - focusDistance) / focusRange;
      blur = clamp(blur, 0.0, 1.0);
      
      vec2 pixelSize = bokehScale / resolution;
      vec2 noise = texture2D(tNoise, vUv * resolution / 64.0).xy - 0.5;
      
      vec4 color = vec4(0.0);
      float totalWeight = 0.0;
      
      for(int i = 0; i < SAMPLES; i++) {
        vec2 offset = hexagon(i, SAMPLES);
        
        // Add noise for more organic bokeh
        offset = (offset + noise * 0.1) * blur * pixelSize;
        
        vec2 sampleUV = vUv + offset;
        
        // Read sample
        vec4 sampleColor = texture2D(tDiffuse, sampleUV);
        float sampleDepth = readDepth(sampleUV) * cameraFar;
        
        // Calculate sample blur
        float sampleBlur = abs(sampleDepth - focusDistance) / focusRange;
        sampleBlur = clamp(sampleBlur, 0.0, 1.0);
        
        // Weight by blur (prevent focused areas from bleeding into blurred areas)
        float weight = sampleBlur >= blur ? 1.0 : sampleBlur / blur;
        
        color += sampleColor * weight;
        totalWeight += weight;
      }
      
      color /= totalWeight;
      
      gl_FragColor = color;
    }
  `
};
