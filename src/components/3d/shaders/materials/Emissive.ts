import * as THREE from 'three';

export const EmissiveShader = {
  uniforms: {
    time: { value: 0 },
    color: { value: new THREE.Color(0xffffff) },
    emissiveMap: { value: null },
    emissiveIntensity: { value: 1.0 },
    pulseSpeed: { value: 1.0 },
    pulseAmount: { value: 0.2 },
    glowRadius: { value: 0.5 },
    glowIntensity: { value: 1.0 },
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
    uniform sampler2D emissiveMap;
    uniform float emissiveIntensity;
    uniform float pulseSpeed;
    uniform float pulseAmount;
    uniform float glowRadius;
    uniform float glowIntensity;
    
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    
    void main() {
      // Base emissive color
      vec3 emissive = color;
      
      // Emissive map
      if (emissiveMap != null) {
        vec4 emissiveTexel = texture2D(emissiveMap, vUv);
        emissive *= emissiveTexel.rgb;
      }
      
      // Pulsing effect
      float pulse = sin(time * pulseSpeed) * 0.5 + 0.5;
      float pulseFactor = 1.0 + pulse * pulseAmount;
      
      // Edge glow (Fresnel-like)
      vec3 viewDir = normalize(vViewPosition);
      float edgeGlow = pow(1.0 - abs(dot(vNormal, viewDir)), glowRadius * 4.0);
      
      // Combine
      emissive *= pulseFactor * emissiveIntensity;
      emissive += emissive * edgeGlow * glowIntensity;
      
      gl_FragColor = vec4(emissive, 1.0);
    }
  `
};

// Neon light shader
export const NeonShader = {
  uniforms: {
    time: { value: 0 },
    color: { value: new THREE.Color(0xff00ff) },
    intensity: { value: 2.0 },
    flickerSpeed: { value: 10.0 },
    flickerAmount: { value: 0.1 },
    tubeRadius: { value: 0.05 },
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
    uniform float intensity;
    uniform float flickerSpeed;
    uniform float flickerAmount;
    uniform float tubeRadius;
    
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    
    float hash(float n) {
      return fract(sin(n) * 43758.5453);
    }
    
    void main() {
      vec3 viewDir = normalize(vViewPosition);
      
      // Flickering effect (like old neon tubes)
      float flicker = hash(floor(time * flickerSpeed)) * flickerAmount + (1.0 - flickerAmount);
      
      // Tube glow (cylindrical)
      float tubeDist = length(vNormal.xy);
      float tubeGlow = smoothstep(tubeRadius, 0.0, tubeDist);
      
      // Edge glow
      float edgeGlow = pow(1.0 - abs(dot(vNormal, viewDir)), 2.0);
      
      // Combine
      vec3 neonColor = color * intensity * flicker;
      neonColor *= (tubeGlow + edgeGlow * 0.5);
      
      gl_FragColor = vec4(neonColor, 1.0);
    }
  `
};

// Animated billboard/sign shader
export const AnimatedSignShader = {
  uniforms: {
    time: { value: 0 },
    signTexture: { value: null },
    emissiveColor: { value: new THREE.Color(0xffffff) },
    brightness: { value: 1.5 },
    animationType: { value: 0 }, // 0=static, 1=scrolling, 2=blinking, 3=sequential
    scrollSpeed: { value: 1.0 },
    blinkSpeed: { value: 2.0 },
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
    uniform sampler2D signTexture;
    uniform vec3 emissiveColor;
    uniform float brightness;
    uniform int animationType;
    uniform float scrollSpeed;
    uniform float blinkSpeed;
    
    varying vec2 vUv;
    
    void main() {
      vec2 uv = vUv;
      
      // Animated UV based on type
      if (animationType == 1) {
        // Scrolling
        uv.x = fract(uv.x + time * scrollSpeed * 0.1);
      } else if (animationType == 2) {
        // Blinking
        float blink = step(0.5, fract(time * blinkSpeed * 0.5));
        if (blink < 0.5) discard;
      } else if (animationType == 3) {
        // Sequential reveal
        float reveal = fract(time * scrollSpeed * 0.1);
        if (uv.x > reveal) discard;
      }
      
      vec4 texel = texture2D(signTexture, uv);
      
      vec3 finalColor = texel.rgb * emissiveColor * brightness;
      
      gl_FragColor = vec4(finalColor, texel.a);
    }
  `
};

// Volumetric light cone (for spotlights)
export const VolumetricLightConeShader = {
  uniforms: {
    time: { value: 0 },
    lightColor: { value: new THREE.Color(0xffffff) },
    intensity: { value: 1.0 },
    coneAngle: { value: 0.5 },
    coneLength: { value: 10.0 },
    dustIntensity: { value: 0.3 },
  },

  vertexShader: `
    varying vec3 vPosition;
    varying vec3 vNormal;
    
    void main() {
      vPosition = position;
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: `
    uniform float time;
    uniform vec3 lightColor;
    uniform float intensity;
    uniform float coneAngle;
    uniform float coneLength;
    uniform float dustIntensity;
    
    varying vec3 vPosition;
    varying vec3 vNormal;
    
    // 3D noise for dust particles
    float hash(vec3 p) {
      return fract(sin(dot(p, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
    }
    
    float noise3D(vec3 p) {
      vec3 i = floor(p);
      vec3 f = fract(p);
      
      f = f * f * (3.0 - 2.0 * f);
      
      return mix(
        mix(mix(hash(i), hash(i + vec3(1.0, 0.0, 0.0)), f.x),
            mix(hash(i + vec3(0.0, 1.0, 0.0)), hash(i + vec3(1.0, 1.0, 0.0)), f.x), f.y),
        mix(mix(hash(i + vec3(0.0, 0.0, 1.0)), hash(i + vec3(1.0, 0.0, 1.0)), f.x),
            mix(hash(i + vec3(0.0, 1.0, 1.0)), hash(i + vec3(1.0, 1.0, 1.0)), f.x), f.y),
        f.z
      );
    }
    
    void main() {
      // Distance from cone center axis
      float distFromCenter = length(vPosition.xy);
      float distAlongAxis = vPosition.z;
      
      // Cone attenuation
      float expectedRadius = abs(distAlongAxis) * tan(coneAngle);
      float coneFalloff = 1.0 - smoothstep(0.0, expectedRadius, distFromCenter);
      
      // Length attenuation
      float lengthFalloff = 1.0 - smoothstep(0.0, coneLength, abs(distAlongAxis));
      
      // Dust particles
      vec3 dustCoord = vPosition * 0.5 + vec3(0.0, 0.0, time * 0.5);
      float dust = noise3D(dustCoord);
      dust = dust * dust * dust; // Make it sparser
      
      // Combine
      float brightness = coneFalloff * lengthFalloff * intensity;
      brightness += dust * dustIntensity * coneFalloff;
      
      vec3 finalColor = lightColor * brightness;
      
      gl_FragColor = vec4(finalColor, brightness * 0.5);
    }
  `
};

// Laser beam shader
export const LaserBeamShader = {
  uniforms: {
    time: { value: 0 },
    color: { value: new THREE.Color(0xff0000) },
    intensity: { value: 2.0 },
    beamWidth: { value: 0.02 },
    pulseSpeed: { value: 5.0 },
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
    uniform vec3 color;
    uniform float intensity;
    uniform float beamWidth;
    uniform float pulseSpeed;
    
    varying vec2 vUv;
    varying vec3 vPosition;
    
    void main() {
      // Distance from center line
      float dist = abs(vUv.y - 0.5);
      
      // Beam core
      float beam = smoothstep(beamWidth, 0.0, dist);
      
      // Pulse along length
      float pulse = sin(vUv.x * 20.0 - time * pulseSpeed) * 0.5 + 0.5;
      
      // Glow
      float glow = smoothstep(beamWidth * 3.0, 0.0, dist) * 0.3;
      
      vec3 finalColor = color * intensity * (beam + glow) * (0.7 + pulse * 0.3);
      
      gl_FragColor = vec4(finalColor, beam + glow);
    }
  `
};
