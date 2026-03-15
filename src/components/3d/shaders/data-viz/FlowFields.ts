import * as THREE from 'three';

// Flow Field Shader (visualizing money/tax flow)
export const FlowFieldShader = {
  uniforms: {
    time: { value: 0.0 },
    flowSpeed: { value: 1.0 },
    flowDensity: { value: 10.0 },
    flowColor: { value: new THREE.Color(0x00ffff) },
    opacity: { value: 0.8 },
    noiseScale: { value: 1.0 },
    noiseStrength: { value: 1.0 },
    directionBias: { value: new THREE.Vector2(1.0, 0.0) }, // Overall flow direction
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
    uniform float time;
    uniform float flowSpeed;
    uniform float flowDensity;
    uniform vec3 flowColor;
    uniform float opacity;
    uniform float noiseScale;
    uniform float noiseStrength;
    uniform vec2 directionBias;
    
    varying vec2 vUv;
    varying vec3 vPosition;
    
    // 2D Perlin noise
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }
    
    float snoise(vec2 v) {
      const vec4 C = vec4(0.211324865405187,
                          0.366025403784439,
                         -0.577350269189626,
                          0.024390243902439);
      vec2 i = floor(v + dot(v, C.yy));
      vec2 x0 = v - i + dot(i, C.xx);
      vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod289(i);
      vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
        + i.x + vec3(0.0, i1.x, 1.0));
      vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
      m = m * m;
      m = m * m;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
      vec3 g;
      g.x = a0.x * x0.x + h.x * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }
    
    // Curl noise (divergence-free flow field)
    vec2 curlNoise(vec2 p) {
      const float e = 0.1;
      float n1 = snoise(p + vec2(e, 0.0));
      float n2 = snoise(p - vec2(e, 0.0));
      float n3 = snoise(p + vec2(0.0, e));
      float n4 = snoise(p - vec2(0.0, e));
      
      float dx = (n1 - n2) / (2.0 * e);
      float dy = (n3 - n4) / (2.0 * e);
      
      return vec2(dy, -dx); // Perpendicular to gradient
    }
    
    void main() {
      vec2 p = vUv * flowDensity;
      
      // Animated flow field
      vec2 flow = curlNoise(p + time * flowSpeed * 0.1) * noiseStrength;
      flow += directionBias;
      
      // Streamlines (animated stripes)
      float offset = time * flowSpeed;
      float streamline = fract(dot(vUv, normalize(flow)) * 10.0 + offset);
      
      // Make stripes
      float stripe = smoothstep(0.3, 0.5, streamline) - smoothstep(0.5, 0.7, streamline);
      
      // Vary intensity based on flow speed
      float flowMagnitude = length(flow);
      float intensity = stripe * flowMagnitude;
      
      vec3 color = flowColor * intensity;
      
      gl_FragColor = vec4(color, intensity * opacity);
    }
  `
};

// Particle Flow Shader (individual particles following flow field)
export const ParticleFlowShader = {
  vertexShader: `
    uniform float time;
    uniform float particleSize;
    uniform sampler2D flowField; // Texture encoding flow directions
    
    attribute vec3 velocity;
    attribute float lifespan;
    attribute float age;
    
    varying vec3 vColor;
    varying float vAlpha;
    
    void main() {
      // Particle lifecycle
      float t = age / lifespan;
      
      // Fade in/out
      float alpha = 1.0 - abs(t * 2.0 - 1.0);
      vAlpha = alpha;
      
      // Color based on velocity
      float speed = length(velocity);
      vColor = mix(vec3(0.0, 0.5, 1.0), vec3(1.0, 0.5, 0.0), speed);
      
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      gl_PointSize = particleSize * (300.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
    }
  `,

  fragmentShader: `
    varying vec3 vColor;
    varying float vAlpha;
    
    void main() {
      // Circular particle
      vec2 center = gl_PointCoord - vec2(0.5);
      float dist = length(center);
      
      if (dist > 0.5) discard;
      
      // Soft edge
      float alpha = 1.0 - smoothstep(0.3, 0.5, dist);
      
      gl_FragColor = vec4(vColor, alpha * vAlpha);
    }
  `
};

// Directional Flow Arrows Shader
export const FlowArrowsShader = {
  uniforms: {
    time: { value: 0.0 },
    arrowDensity: { value: 5.0 },
    flowDirection: { value: new THREE.Vector2(1.0, 0.0) },
    flowSpeed: { value: 1.0 },
    arrowColor: { value: new THREE.Color(0xffffff) },
    backgroundColor: { value: new THREE.Color(0x000000) },
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
    uniform float time;
    uniform float arrowDensity;
    uniform vec2 flowDirection;
    uniform float flowSpeed;
    uniform vec3 arrowColor;
    uniform vec3 backgroundColor;
    uniform float opacity;
    
    varying vec2 vUv;
    
    // SDF for arrow shape
    float arrowSDF(vec2 p, vec2 dir) {
      // Normalize direction
      dir = normalize(dir);
      
      // Rotate point to align with direction
      float angle = atan(dir.y, dir.x);
      float c = cos(-angle);
      float s = sin(-angle);
      p = vec2(p.x * c - p.y * s, p.x * s + p.y * c);
      
      // Arrow shaft
      float shaft = abs(p.y) - 0.05;
      shaft = max(shaft, -p.x);
      shaft = max(shaft, p.x - 0.4);
      
      // Arrow head
      vec2 head = p - vec2(0.4, 0.0);
      float headAngle = 0.5;
      float headDist = abs(atan(head.y, head.x)) - headAngle;
      float headLength = length(head) - 0.2;
      float arrowHead = max(headDist, headLength);
      arrowHead = max(arrowHead, -head.x);
      
      return min(shaft, arrowHead);
    }
    
    void main() {
      // Create grid of arrows
      vec2 gridUV = fract(vUv * arrowDensity);
      gridUV = gridUV * 2.0 - 1.0;
      
      // Animated offset
      float offset = time * flowSpeed;
      vec2 animatedUV = gridUV - flowDirection * fract(offset) * 0.5;
      
      // Draw arrow
      float arrow = arrowSDF(animatedUV, flowDirection);
      float arrowMask = smoothstep(0.02, 0.0, arrow);
      
      vec3 color = mix(backgroundColor, arrowColor, arrowMask);
      
      gl_FragColor = vec4(color, opacity);
    }
  `
};

// Streamline Shader (continuous flow lines)
export const StreamlineShader = {
  uniforms: {
    time: { value: 0.0 },
    flowTexture: { value: null }, // RGB texture: RG = direction, B = magnitude
    lineWidth: { value: 0.01 },
    lineColor: { value: new THREE.Color(0x00ffff) },
    lineDensity: { value: 10.0 },
    animationSpeed: { value: 1.0 },
    fadeLength: { value: 0.5 },
  },

  vertexShader: `
    varying vec2 vUv;
    
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: `
    uniform float time;
    uniform sampler2D flowTexture;
    uniform float lineWidth;
    uniform vec3 lineColor;
    uniform float lineDensity;
    uniform float animationSpeed;
    uniform float fadeLength;
    
    varying vec2 vUv;
    
    void main() {
      vec2 uv = vUv;
      
      // Sample flow field
      vec4 flowData = texture2D(flowTexture, uv);
      vec2 flowDir = flowData.rg * 2.0 - 1.0;
      float flowMag = flowData.b;
      
      // Trace streamline
      float accumulator = 0.0;
      vec2 currentPos = uv;
      
      for (int i = 0; i < 20; i++) {
        vec4 data = texture2D(flowTexture, currentPos);
        vec2 dir = data.rg * 2.0 - 1.0;
        float mag = data.b;
        
        // Step along flow
        currentPos += dir * 0.01;
        accumulator += mag;
        
        // Out of bounds
        if (currentPos.x < 0.0 || currentPos.x > 1.0 || 
            currentPos.y < 0.0 || currentPos.y > 1.0) break;
      }
      
      // Animated dashes
      float dashPattern = fract((accumulator - time * animationSpeed) * lineDensity);
      float dash = smoothstep(0.0, 0.1, dashPattern) * smoothstep(fadeLength, fadeLength - 0.1, dashPattern);
      
      // Line intensity based on flow magnitude
      float intensity = dash * flowMag;
      
      gl_FragColor = vec4(lineColor * intensity, intensity);
    }
  `
};
