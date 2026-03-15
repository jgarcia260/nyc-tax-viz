import * as THREE from 'three';

// Brightness threshold pass
export const BrightnessShader = {
  uniforms: {
    tDiffuse: { value: null },
    threshold: { value: 0.8 },
    smoothWidth: { value: 0.1 },
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
    uniform float threshold;
    uniform float smoothWidth;
    
    varying vec2 vUv;
    
    void main() {
      vec4 texel = texture2D(tDiffuse, vUv);
      
      // Luminance
      float luminance = dot(texel.rgb, vec3(0.2126, 0.7152, 0.0722));
      
      // Smooth threshold
      float response = smoothstep(threshold - smoothWidth, threshold + smoothWidth, luminance);
      
      gl_FragColor = texel * response;
    }
  `
};

// Gaussian blur pass (separable)
export const GaussianBlurShader = {
  uniforms: {
    tDiffuse: { value: null },
    resolution: { value: new THREE.Vector2(1024, 1024) },
    direction: { value: new THREE.Vector2(1, 0) }, // (1,0) for horizontal, (0,1) for vertical
    radius: { value: 1.0 },
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
    uniform vec2 resolution;
    uniform vec2 direction;
    uniform float radius;
    
    varying vec2 vUv;
    
    void main() {
      vec2 invSize = 1.0 / resolution;
      vec2 step = direction * invSize * radius;
      
      // 9-tap Gaussian blur
      vec4 sum = vec4(0.0);
      
      sum += texture2D(tDiffuse, vUv - step * 4.0) * 0.051;
      sum += texture2D(tDiffuse, vUv - step * 3.0) * 0.0918;
      sum += texture2D(tDiffuse, vUv - step * 2.0) * 0.12245;
      sum += texture2D(tDiffuse, vUv - step * 1.0) * 0.1531;
      sum += texture2D(tDiffuse, vUv) * 0.1633;
      sum += texture2D(tDiffuse, vUv + step * 1.0) * 0.1531;
      sum += texture2D(tDiffuse, vUv + step * 2.0) * 0.12245;
      sum += texture2D(tDiffuse, vUv + step * 3.0) * 0.0918;
      sum += texture2D(tDiffuse, vUv + step * 4.0) * 0.051;
      
      gl_FragColor = sum;
    }
  `
};

// Bloom composite (additive blending)
export const BloomCompositeShader = {
  uniforms: {
    tDiffuse: { value: null },
    tBloom: { value: null },
    bloomStrength: { value: 1.0 },
    bloomRadius: { value: 0.5 },
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
    uniform sampler2D tBloom;
    uniform float bloomStrength;
    uniform float bloomRadius;
    
    varying vec2 vUv;
    
    void main() {
      vec4 original = texture2D(tDiffuse, vUv);
      vec4 bloom = texture2D(tBloom, vUv);
      
      // Additive blending
      vec3 finalColor = original.rgb + bloom.rgb * bloomStrength;
      
      gl_FragColor = vec4(finalColor, original.a);
    }
  `
};

// Kawase blur (more efficient multi-pass blur)
export const KawaseBlurShader = {
  uniforms: {
    tDiffuse: { value: null },
    resolution: { value: new THREE.Vector2(1024, 1024) },
    offset: { value: 1.0 },
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
    uniform vec2 resolution;
    uniform float offset;
    
    varying vec2 vUv;
    
    void main() {
      vec2 invSize = offset / resolution;
      
      vec4 sum = vec4(0.0);
      
      // 4-tap pattern
      sum += texture2D(tDiffuse, vUv + vec2(-invSize.x, -invSize.y));
      sum += texture2D(tDiffuse, vUv + vec2(invSize.x, -invSize.y));
      sum += texture2D(tDiffuse, vUv + vec2(-invSize.x, invSize.y));
      sum += texture2D(tDiffuse, vUv + vec2(invSize.x, invSize.y));
      
      gl_FragColor = sum * 0.25;
    }
  `
};

// Dual Kawase blur (down-sample and up-sample for better quality/performance)
export const DualKawaseDownShader = {
  uniforms: {
    tDiffuse: { value: null },
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
    uniform vec2 resolution;
    
    varying vec2 vUv;
    
    void main() {
      vec2 invSize = 1.0 / resolution;
      vec2 halfPixel = invSize * 0.5;
      
      vec4 sum = texture2D(tDiffuse, vUv) * 4.0;
      sum += texture2D(tDiffuse, vUv - halfPixel);
      sum += texture2D(tDiffuse, vUv + vec2(halfPixel.x, -halfPixel.y));
      sum += texture2D(tDiffuse, vUv + vec2(-halfPixel.x, halfPixel.y));
      sum += texture2D(tDiffuse, vUv + halfPixel);
      
      gl_FragColor = sum / 8.0;
    }
  `
};

export const DualKawaseUpShader = {
  uniforms: {
    tDiffuse: { value: null },
    resolution: { value: new THREE.Vector2(512, 512) },
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
    uniform vec2 resolution;
    
    varying vec2 vUv;
    
    void main() {
      vec2 invSize = 1.0 / resolution;
      vec2 halfPixel = invSize * 0.5;
      
      vec4 sum = vec4(0.0);
      
      // 8-tap tent filter
      sum += texture2D(tDiffuse, vUv + vec2(-halfPixel.x * 2.0, 0.0));
      sum += texture2D(tDiffuse, vUv + vec2(-halfPixel.x, halfPixel.y)) * 2.0;
      sum += texture2D(tDiffuse, vUv + vec2(0.0, halfPixel.y * 2.0));
      sum += texture2D(tDiffuse, vUv + vec2(halfPixel.x, halfPixel.y)) * 2.0;
      sum += texture2D(tDiffuse, vUv + vec2(halfPixel.x * 2.0, 0.0));
      sum += texture2D(tDiffuse, vUv + vec2(halfPixel.x, -halfPixel.y)) * 2.0;
      sum += texture2D(tDiffuse, vUv + vec2(0.0, -halfPixel.y * 2.0));
      sum += texture2D(tDiffuse, vUv + vec2(-halfPixel.x, -halfPixel.y)) * 2.0;
      
      gl_FragColor = sum / 12.0;
    }
  `
};
