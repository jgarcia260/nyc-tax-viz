import * as THREE from 'three';

// Data Point Particles (for scatter plots, 3D data visualization)
export const DataParticleShader = {
  vertexShader: `
    uniform float time;
    uniform float particleSize;
    uniform float sizeAttenuation;
    
    attribute float size;
    attribute vec3 customColor;
    attribute float alpha;
    attribute float dataValue; // For animations based on data
    
    varying vec3 vColor;
    varying float vAlpha;
    varying float vValue;
    
    void main() {
      vColor = customColor;
      vAlpha = alpha;
      vValue = dataValue;
      
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      
      float finalSize = size * particleSize;
      
      if (sizeAttenuation > 0.0) {
        // Perspective size
        gl_PointSize = finalSize * (300.0 / -mvPosition.z);
      } else {
        // Fixed size
        gl_PointSize = finalSize;
      }
      
      gl_Position = projectionMatrix * mvPosition;
    }
  `,

  fragmentShader: `
    uniform float time;
    uniform int shape; // 0=Circle, 1=Square, 2=Diamond, 3=Triangle
    uniform bool glow;
    uniform float glowIntensity;
    
    varying vec3 vColor;
    varying float vAlpha;
    varying float vValue;
    
    void main() {
      vec2 center = gl_PointCoord - vec2(0.5);
      float dist = length(center);
      
      float alpha = 1.0;
      
      // Shape
      if (shape == 0) {
        // Circle
        if (dist > 0.5) discard;
        alpha = 1.0 - smoothstep(0.3, 0.5, dist);
      } else if (shape == 1) {
        // Square
        if (abs(center.x) > 0.5 || abs(center.y) > 0.5) discard;
        float edgeDist = max(abs(center.x), abs(center.y));
        alpha = 1.0 - smoothstep(0.3, 0.5, edgeDist);
      } else if (shape == 2) {
        // Diamond
        float diamondDist = abs(center.x) + abs(center.y);
        if (diamondDist > 0.7) discard;
        alpha = 1.0 - smoothstep(0.4, 0.7, diamondDist);
      } else if (shape == 3) {
        // Triangle (pointing up)
        float triDist = center.y > 0.0 ? 
          max(abs(center.x) * 1.732 - center.y, -center.y - 0.5) :
          -center.y - 0.5;
        if (triDist > 0.0) discard;
        alpha = 1.0 - smoothstep(-0.3, 0.0, triDist);
      }
      
      vec3 finalColor = vColor;
      
      // Glow effect
      if (glow) {
        float glowFactor = exp(-dist * dist * 5.0) * glowIntensity;
        finalColor += glowFactor;
      }
      
      gl_FragColor = vec4(finalColor, alpha * vAlpha);
    }
  `
};

// Animated Tax Flow Particles (money flowing between regions)
export const TaxFlowParticleShader = {
  vertexShader: `
    uniform float time;
    uniform float particleSize;
    
    attribute vec3 destination;
    attribute float travelTime;
    attribute float startTime;
    attribute vec3 particleColor;
    attribute float particleOpacity;
    
    varying vec3 vColor;
    varying float vAlpha;
    varying float vProgress;
    
    // Cubic bezier curve
    vec3 bezier(vec3 p0, vec3 p1, vec3 p2, vec3 p3, float t) {
      float u = 1.0 - t;
      float tt = t * t;
      float uu = u * u;
      float uuu = uu * u;
      float ttt = tt * t;
      
      vec3 p = uuu * p0;
      p += 3.0 * uu * t * p1;
      p += 3.0 * u * tt * p2;
      p += ttt * p3;
      
      return p;
    }
    
    void main() {
      // Calculate progress (0 to 1)
      float elapsed = time - startTime;
      float progress = clamp(elapsed / travelTime, 0.0, 1.0);
      vProgress = progress;
      
      // Define curve control points
      vec3 p0 = position; // Start
      vec3 p3 = destination; // End
      
      // Mid-points for arc
      vec3 midpoint = (p0 + p3) * 0.5;
      float height = length(p3 - p0) * 0.3;
      vec3 p1 = p0 + vec3(0.0, height, 0.0);
      vec3 p2 = p3 + vec3(0.0, height, 0.0);
      
      // Interpolate position along curve
      vec3 currentPos = bezier(p0, p1, p2, p3, progress);
      
      // Fade in/out
      vAlpha = particleOpacity;
      if (progress < 0.1) {
        vAlpha *= progress / 0.1;
      } else if (progress > 0.9) {
        vAlpha *= (1.0 - progress) / 0.1;
      }
      
      vColor = particleColor;
      
      vec4 mvPosition = modelViewMatrix * vec4(currentPos, 1.0);
      gl_PointSize = particleSize * (300.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
    }
  `,

  fragmentShader: `
    uniform float time;
    uniform bool trail;
    
    varying vec3 vColor;
    varying float vAlpha;
    varying float vProgress;
    
    void main() {
      vec2 center = gl_PointCoord - vec2(0.5);
      float dist = length(center);
      
      if (dist > 0.5) discard;
      
      // Soft edge
      float alpha = 1.0 - smoothstep(0.2, 0.5, dist);
      
      // Comet tail effect
      if (trail) {
        float tailFactor = 1.0 - vProgress * 0.5;
        alpha *= tailFactor;
      }
      
      // Core glow
      float glow = exp(-dist * dist * 8.0);
      vec3 finalColor = vColor * (1.0 + glow * 0.5);
      
      gl_FragColor = vec4(finalColor, alpha * vAlpha);
    }
  `
};

// Bar Chart Particles (for 3D bar chart visualization)
export const BarChartParticleShader = {
  vertexShader: `
    uniform float time;
    uniform float maxHeight;
    uniform float animationProgress;
    
    attribute float targetHeight;
    attribute vec3 barColor;
    attribute float barWidth;
    
    varying vec3 vColor;
    varying float vHeight;
    varying vec2 vBarCoord;
    
    void main() {
      vColor = barColor;
      
      // Animate height
      float currentHeight = targetHeight * animationProgress;
      vHeight = currentHeight / maxHeight;
      
      // Position particle within bar
      vec3 barPosition = position;
      barPosition.y = currentHeight * position.y;
      
      vBarCoord = uv;
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(barPosition, 1.0);
    }
  `,

  fragmentShader: `
    varying vec3 vColor;
    varying float vHeight;
    varying vec2 vBarCoord;
    
    void main() {
      // Gradient from bottom to top
      vec3 bottomColor = vColor * 0.6;
      vec3 topColor = vColor * 1.2;
      vec3 color = mix(bottomColor, topColor, vHeight);
      
      // Edge highlighting
      float edge = min(
        min(vBarCoord.x, 1.0 - vBarCoord.x),
        min(vBarCoord.y, 1.0 - vBarCoord.y)
      );
      
      if (edge < 0.02) {
        color *= 1.3;
      }
      
      gl_FragColor = vec4(color, 1.0);
    }
  `
};

// Network Graph Particles (nodes and connections)
export const NetworkNodeShader = {
  vertexShader: `
    uniform float time;
    uniform float nodeSize;
    
    attribute float importance; // 0-1, affects size
    attribute vec3 nodeColor;
    attribute float pulse; // Pulsing animation
    
    varying vec3 vColor;
    varying float vImportance;
    varying float vPulse;
    
    void main() {
      vColor = nodeColor;
      vImportance = importance;
      vPulse = pulse;
      
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      
      // Size based on importance
      float size = nodeSize * (0.5 + importance * 1.5);
      
      // Pulse animation
      if (pulse > 0.0) {
        float pulseAmount = sin(time * 3.0) * 0.5 + 0.5;
        size *= (1.0 + pulseAmount * 0.3);
      }
      
      gl_PointSize = size * (300.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
    }
  `,

  fragmentShader: `
    uniform float time;
    
    varying vec3 vColor;
    varying float vImportance;
    varying float vPulse;
    
    void main() {
      vec2 center = gl_PointCoord - vec2(0.5);
      float dist = length(center);
      
      if (dist > 0.5) discard;
      
      // Layered circle (ring effect for important nodes)
      float alpha;
      if (vImportance > 0.7) {
        // Ring
        float ring = abs(dist - 0.35);
        alpha = 1.0 - smoothstep(0.0, 0.15, ring);
        
        // Core
        float core = 1.0 - smoothstep(0.0, 0.2, dist);
        alpha = max(alpha, core);
      } else {
        // Solid circle
        alpha = 1.0 - smoothstep(0.3, 0.5, dist);
      }
      
      // Glow
      float glow = exp(-dist * dist * 5.0) * vImportance;
      vec3 finalColor = vColor * (1.0 + glow);
      
      gl_FragColor = vec4(finalColor, alpha);
    }
  `
};
