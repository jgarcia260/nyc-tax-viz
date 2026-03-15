import * as THREE from 'three';

// Tax Bracket Gradient Shader
export const TaxBracketGradientShader = {
  uniforms: {
    value: { value: 0.0 }, // Tax amount or percentage (0-1)
    colorStops: { value: [
      new THREE.Color(0x00ff00), // Low tax (green)
      new THREE.Color(0xffff00), // Medium-low (yellow)
      new THREE.Color(0xff8800), // Medium (orange)
      new THREE.Color(0xff0000), // High (red)
      new THREE.Color(0x8800ff), // Very high (purple)
    ]},
    stopPositions: { value: [0.0, 0.25, 0.5, 0.75, 1.0] },
    opacity: { value: 0.8 },
  },

  vertexShader: `
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;
    
    void main() {
      vUv = uv;
      vPosition = position;
      vNormal = normalize(normalMatrix * normal);
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: `
    uniform float value;
    uniform vec3 colorStops[5];
    uniform float stopPositions[5];
    uniform float opacity;
    
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;
    
    vec3 getGradientColor(float t) {
      // Find surrounding color stops
      for (int i = 0; i < 4; i++) {
        if (t >= stopPositions[i] && t <= stopPositions[i + 1]) {
          float range = stopPositions[i + 1] - stopPositions[i];
          float localT = (t - stopPositions[i]) / range;
          return mix(colorStops[i], colorStops[i + 1], localT);
        }
      }
      return colorStops[4];
    }
    
    void main() {
      vec3 color = getGradientColor(value);
      
      // Add rim lighting for depth
      vec3 viewDir = normalize(cameraPosition - vPosition);
      float rim = 1.0 - max(dot(viewDir, vNormal), 0.0);
      rim = pow(rim, 3.0);
      color += rim * 0.2;
      
      gl_FragColor = vec4(color, opacity);
    }
  `
};

// Multi-Dimensional Gradient (for 2D data like income vs tax)
export const MultiDimensionalGradientShader = {
  uniforms: {
    valueX: { value: 0.0 }, // e.g., income level
    valueY: { value: 0.0 }, // e.g., tax burden
    cornerColors: { value: [
      new THREE.Color(0x00ff00), // Bottom-left
      new THREE.Color(0xffff00), // Bottom-right
      new THREE.Color(0xff8800), // Top-left
      new THREE.Color(0xff0000), // Top-right
    ]},
    opacity: { value: 1.0 },
  },

  vertexShader: `
    varying vec2 vUv;
    
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: `
    uniform float valueX;
    uniform float valueY;
    uniform vec3 cornerColors[4];
    uniform float opacity;
    
    varying vec2 vUv;
    
    void main() {
      // Bilinear interpolation
      vec3 bottom = mix(cornerColors[0], cornerColors[1], valueX);
      vec3 top = mix(cornerColors[2], cornerColors[3], valueX);
      vec3 color = mix(bottom, top, valueY);
      
      gl_FragColor = vec4(color, opacity);
    }
  `
};

// Choropleth Map Shader (for geographic data)
export const ChoroplethShader = {
  uniforms: {
    dataValue: { value: 0.0 },
    minValue: { value: 0.0 },
    maxValue: { value: 1.0 },
    colorScheme: { value: 0 }, // 0=Sequential, 1=Diverging, 2=Categorical
    highlightBorders: { value: true },
    borderColor: { value: new THREE.Color(0xffffff) },
    borderWidth: { value: 0.02 },
  },

  vertexShader: `
    varying vec2 vUv;
    varying vec3 vPosition;
    
    void main() {
      vUv = uv;
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: `
    uniform float dataValue;
    uniform float minValue;
    uniform float maxValue;
    uniform int colorScheme;
    uniform bool highlightBorders;
    uniform vec3 borderColor;
    uniform float borderWidth;
    
    varying vec2 vUv;
    varying vec3 vPosition;
    
    // Sequential color scheme (light to dark)
    vec3 sequentialColor(float t) {
      vec3 start = vec3(0.95, 0.95, 1.0);
      vec3 end = vec3(0.0, 0.2, 0.8);
      return mix(start, end, t);
    }
    
    // Diverging color scheme (blue-white-red)
    vec3 divergingColor(float t) {
      if (t < 0.5) {
        return mix(vec3(0.0, 0.2, 0.8), vec3(1.0, 1.0, 1.0), t * 2.0);
      } else {
        return mix(vec3(1.0, 1.0, 1.0), vec3(0.8, 0.0, 0.0), (t - 0.5) * 2.0);
      }
    }
    
    // Categorical color scheme (distinct colors)
    vec3 categoricalColor(float t) {
      int category = int(floor(t * 10.0));
      
      if (category == 0) return vec3(0.89, 0.10, 0.11);
      if (category == 1) return vec3(1.00, 0.50, 0.00);
      if (category == 2) return vec3(1.00, 1.00, 0.20);
      if (category == 3) return vec3(0.20, 0.63, 0.17);
      if (category == 4) return vec3(0.00, 0.45, 0.70);
      if (category == 5) return vec3(0.34, 0.20, 0.58);
      if (category == 6) return vec3(0.94, 0.89, 0.26);
      if (category == 7) return vec3(0.84, 0.38, 0.00);
      if (category == 8) return vec3(0.50, 0.50, 0.50);
      return vec3(0.70, 0.70, 0.70);
    }
    
    void main() {
      // Normalize data value
      float t = clamp((dataValue - minValue) / (maxValue - minValue), 0.0, 1.0);
      
      vec3 color;
      if (colorScheme == 0) {
        color = sequentialColor(t);
      } else if (colorScheme == 1) {
        color = divergingColor(t);
      } else {
        color = categoricalColor(t);
      }
      
      // Border highlighting
      if (highlightBorders) {
        float border = min(
          min(vUv.x, 1.0 - vUv.x),
          min(vUv.y, 1.0 - vUv.y)
        );
        
        if (border < borderWidth) {
          float borderMix = smoothstep(0.0, borderWidth, border);
          color = mix(borderColor, color, borderMix);
        }
      }
      
      gl_FragColor = vec4(color, 1.0);
    }
  `
};

// Radial Gradient (for circular data visualization)
export const RadialGradientShader = {
  uniforms: {
    center: { value: new THREE.Vector2(0.5, 0.5) },
    innerColor: { value: new THREE.Color(0xffffff) },
    outerColor: { value: new THREE.Color(0x000000) },
    radius: { value: 0.5 },
    smoothness: { value: 0.1 },
    opacity: { value: 1.0 },
  },

  vertexShader: `
    varying vec2 vUv;
    
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: `
    uniform vec2 center;
    uniform vec3 innerColor;
    uniform vec3 outerColor;
    uniform float radius;
    uniform float smoothness;
    uniform float opacity;
    
    varying vec2 vUv;
    
    void main() {
      float dist = distance(vUv, center);
      float t = smoothstep(radius - smoothness, radius + smoothness, dist);
      
      vec3 color = mix(innerColor, outerColor, t);
      
      gl_FragColor = vec4(color, opacity);
    }
  `
};
