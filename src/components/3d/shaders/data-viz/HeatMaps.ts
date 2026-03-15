import * as THREE from 'three';

// Heat Map Shader (for geographic/spatial data)
export const HeatMapShader = {
  uniforms: {
    intensity: { value: 0.0 }, // 0-1
    minTemp: { value: 0.0 },
    maxTemp: { value: 1.0 },
    colorScheme: { value: 0 }, // 0=Fire, 1=Thermal, 2=Rainbow
    opacity: { value: 1.0 },
    time: { value: 0.0 },
    animated: { value: false },
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
    uniform float intensity;
    uniform float minTemp;
    uniform float maxTemp;
    uniform int colorScheme;
    uniform float opacity;
    uniform float time;
    uniform bool animated;
    
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;
    
    // Fire color scheme (black -> red -> orange -> yellow -> white)
    vec3 fireColor(float t) {
      vec3 color;
      
      if (t < 0.25) {
        // Black to red
        color = mix(vec3(0.0, 0.0, 0.0), vec3(0.8, 0.0, 0.0), t * 4.0);
      } else if (t < 0.5) {
        // Red to orange
        color = mix(vec3(0.8, 0.0, 0.0), vec3(1.0, 0.4, 0.0), (t - 0.25) * 4.0);
      } else if (t < 0.75) {
        // Orange to yellow
        color = mix(vec3(1.0, 0.4, 0.0), vec3(1.0, 1.0, 0.0), (t - 0.5) * 4.0);
      } else {
        // Yellow to white
        color = mix(vec3(1.0, 1.0, 0.0), vec3(1.0, 1.0, 1.0), (t - 0.75) * 4.0);
      }
      
      return color;
    }
    
    // Thermal color scheme (blue -> cyan -> green -> yellow -> red)
    vec3 thermalColor(float t) {
      vec3 color;
      
      if (t < 0.2) {
        // Blue to cyan
        color = mix(vec3(0.0, 0.0, 0.5), vec3(0.0, 0.5, 1.0), t * 5.0);
      } else if (t < 0.4) {
        // Cyan to green
        color = mix(vec3(0.0, 0.5, 1.0), vec3(0.0, 1.0, 0.0), (t - 0.2) * 5.0);
      } else if (t < 0.6) {
        // Green to yellow
        color = mix(vec3(0.0, 1.0, 0.0), vec3(1.0, 1.0, 0.0), (t - 0.4) * 5.0);
      } else if (t < 0.8) {
        // Yellow to orange
        color = mix(vec3(1.0, 1.0, 0.0), vec3(1.0, 0.5, 0.0), (t - 0.6) * 5.0);
      } else {
        // Orange to red
        color = mix(vec3(1.0, 0.5, 0.0), vec3(1.0, 0.0, 0.0), (t - 0.8) * 5.0);
      }
      
      return color;
    }
    
    // Rainbow color scheme
    vec3 rainbowColor(float t) {
      float h = t * 6.0;
      float c = 1.0;
      float x = 1.0 - abs(mod(h, 2.0) - 1.0);
      
      vec3 color;
      
      if (h < 1.0) color = vec3(c, x, 0.0);
      else if (h < 2.0) color = vec3(x, c, 0.0);
      else if (h < 3.0) color = vec3(0.0, c, x);
      else if (h < 4.0) color = vec3(0.0, x, c);
      else if (h < 5.0) color = vec3(x, 0.0, c);
      else color = vec3(c, 0.0, x);
      
      return color;
    }
    
    void main() {
      // Normalize intensity
      float t = clamp((intensity - minTemp) / (maxTemp - minTemp), 0.0, 1.0);
      
      // Animation (pulsing effect)
      if (animated) {
        float pulse = sin(time * 2.0) * 0.5 + 0.5;
        t = mix(t * 0.8, t, pulse);
      }
      
      vec3 color;
      if (colorScheme == 0) {
        color = fireColor(t);
      } else if (colorScheme == 1) {
        color = thermalColor(t);
      } else {
        color = rainbowColor(t);
      }
      
      // Add glow for hot areas
      if (t > 0.7) {
        float glow = (t - 0.7) / 0.3;
        color += vec3(1.0) * glow * 0.3;
      }
      
      gl_FragColor = vec4(color, opacity);
    }
  `
};

// Isoline/Contour Heat Map (shows discrete temperature bands)
export const IsolineHeatMapShader = {
  uniforms: {
    intensity: { value: 0.0 },
    levels: { value: 10 },
    lineWidth: { value: 0.02 },
    lineColor: { value: new THREE.Color(0x000000) },
    fillColors: { value: true },
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
    uniform float intensity;
    uniform int levels;
    uniform float lineWidth;
    uniform vec3 lineColor;
    uniform bool fillColors;
    
    varying vec2 vUv;
    varying vec3 vPosition;
    
    vec3 thermalColor(float t) {
      if (t < 0.2) return mix(vec3(0.0, 0.0, 0.5), vec3(0.0, 0.5, 1.0), t * 5.0);
      if (t < 0.4) return mix(vec3(0.0, 0.5, 1.0), vec3(0.0, 1.0, 0.0), (t - 0.2) * 5.0);
      if (t < 0.6) return mix(vec3(0.0, 1.0, 0.0), vec3(1.0, 1.0, 0.0), (t - 0.4) * 5.0);
      if (t < 0.8) return mix(vec3(1.0, 1.0, 0.0), vec3(1.0, 0.5, 0.0), (t - 0.6) * 5.0);
      return mix(vec3(1.0, 0.5, 0.0), vec3(1.0, 0.0, 0.0), (t - 0.8) * 5.0);
    }
    
    void main() {
      float t = clamp(intensity, 0.0, 1.0);
      
      // Discretize into levels
      float level = floor(t * float(levels)) / float(levels);
      float nextLevel = (floor(t * float(levels)) + 1.0) / float(levels);
      
      // Check if near a contour line
      float distToLine = abs(t - level);
      bool isLine = distToLine < lineWidth;
      
      vec3 color;
      if (isLine) {
        color = lineColor;
      } else if (fillColors) {
        color = thermalColor(level);
      } else {
        color = vec3(1.0);
      }
      
      gl_FragColor = vec4(color, 1.0);
    }
  `
};

// Voronoi Heat Map (cellular pattern based on data points)
export const VoronoiHeatMapShader = {
  uniforms: {
    dataPoints: { value: [] }, // Array of vec3 (x, y, intensity)
    numPoints: { value: 0 },
    smoothing: { value: 0.1 },
    showCells: { value: true },
    cellBorderWidth: { value: 0.01 },
  },

  vertexShader: `
    varying vec2 vUv;
    
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: `
    #define MAX_POINTS 50
    
    uniform vec3 dataPoints[MAX_POINTS];
    uniform int numPoints;
    uniform float smoothing;
    uniform bool showCells;
    uniform float cellBorderWidth;
    
    varying vec2 vUv;
    
    vec3 thermalColor(float t) {
      if (t < 0.2) return mix(vec3(0.0, 0.0, 0.5), vec3(0.0, 0.5, 1.0), t * 5.0);
      if (t < 0.4) return mix(vec3(0.0, 0.5, 1.0), vec3(0.0, 1.0, 0.0), (t - 0.2) * 5.0);
      if (t < 0.6) return mix(vec3(0.0, 1.0, 0.0), vec3(1.0, 1.0, 0.0), (t - 0.4) * 5.0);
      if (t < 0.8) return mix(vec3(1.0, 1.0, 0.0), vec3(1.0, 0.5, 0.0), (t - 0.6) * 5.0);
      return mix(vec3(1.0, 0.5, 0.0), vec3(1.0, 0.0, 0.0), (t - 0.8) * 5.0);
    }
    
    void main() {
      float minDist1 = 999999.0;
      float minDist2 = 999999.0;
      float intensity = 0.0;
      
      // Find two nearest points (for Voronoi edge detection)
      for (int i = 0; i < MAX_POINTS; i++) {
        if (i >= numPoints) break;
        
        vec2 point = dataPoints[i].xy;
        float dist = distance(vUv, point);
        
        if (dist < minDist1) {
          minDist2 = minDist1;
          minDist1 = dist;
          intensity = dataPoints[i].z;
        } else if (dist < minDist2) {
          minDist2 = dist;
        }
      }
      
      vec3 color = thermalColor(intensity);
      
      // Voronoi cell borders
      if (showCells) {
        float edge = minDist2 - minDist1;
        if (edge < cellBorderWidth) {
          color = mix(vec3(0.0), color, edge / cellBorderWidth);
        }
      }
      
      gl_FragColor = vec4(color, 1.0);
    }
  `
};
