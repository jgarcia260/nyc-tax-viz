import * as THREE from 'three';

export const GlassShader = {
  uniforms: {
    tCube: { value: null },
    tDiffuse: { value: null },
    tDepth: { value: null },
    time: { value: 0 },
    color: { value: new THREE.Color(0x88ccff) },
    thickness: { value: 0.5 },
    ior: { value: 1.5 }, // Index of refraction
    reflectivity: { value: 0.5 },
    chromaticAberration: { value: 0.01 },
    roughness: { value: 0.1 },
    metalness: { value: 0.0 },
    opacity: { value: 0.9 },
  },

  vertexShader: `
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec3 vWorldPosition;
    varying vec2 vUv;
    
    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;
      
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;
      
      gl_Position = projectionMatrix * mvPosition;
    }
  `,

  fragmentShader: `
    uniform samplerCube tCube;
    uniform sampler2D tDiffuse;
    uniform float time;
    uniform vec3 color;
    uniform float thickness;
    uniform float ior;
    uniform float reflectivity;
    uniform float chromaticAberration;
    uniform float roughness;
    uniform float opacity;
    
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec3 vWorldPosition;
    varying vec2 vUv;
    
    // Schlick's approximation for Fresnel
    float fresnel(vec3 viewDir, vec3 normal, float ior) {
      float f0 = pow((1.0 - ior) / (1.0 + ior), 2.0);
      float cosTheta = abs(dot(viewDir, normal));
      return f0 + (1.0 - f0) * pow(1.0 - cosTheta, 5.0);
    }
    
    // Environment map with roughness
    vec3 envMapSample(vec3 direction, float roughness) {
      float lod = roughness * 8.0; // Assuming 8 mip levels
      return textureCube(tCube, direction).rgb;
    }
    
    void main() {
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(vViewPosition);
      
      // Reflection
      vec3 reflectDir = reflect(-viewDir, normal);
      vec3 reflection = envMapSample(reflectDir, roughness);
      
      // Refraction with chromatic aberration
      float eta = 1.0 / ior;
      vec3 refractDir = refract(-viewDir, normal, eta);
      
      // Chromatic aberration (RGB separation)
      vec3 refractDirR = refract(-viewDir, normal, eta * (1.0 - chromaticAberration));
      vec3 refractDirG = refractDir;
      vec3 refractDirB = refract(-viewDir, normal, eta * (1.0 + chromaticAberration));
      
      float refractionR = envMapSample(refractDirR, roughness).r;
      float refractionG = envMapSample(refractDirG, roughness).g;
      float refractionB = envMapSample(refractDirB, roughness).b;
      vec3 refraction = vec3(refractionR, refractionG, refractionB);
      
      // Fresnel effect
      float fresnelFactor = fresnel(viewDir, normal, ior);
      
      // Mix reflection and refraction based on Fresnel
      vec3 finalColor = mix(refraction, reflection, fresnelFactor * reflectivity);
      
      // Add glass tint
      finalColor *= color;
      
      // Subsurface scattering approximation
      float subsurface = pow(1.0 - abs(dot(viewDir, normal)), 3.0);
      finalColor += color * subsurface * thickness * 0.3;
      
      // Edge glow
      float edgeGlow = pow(1.0 - abs(dot(viewDir, normal)), 4.0);
      finalColor += vec3(edgeGlow * 0.2);
      
      gl_FragColor = vec4(finalColor, opacity);
    }
  `
};

// Frosted glass shader
export const FrostedGlassShader = {
  uniforms: {
    tDiffuse: { value: null },
    blurAmount: { value: 5.0 },
    frostIntensity: { value: 0.5 },
    color: { value: new THREE.Color(0xffffff) },
    opacity: { value: 0.8 },
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
    uniform sampler2D tDiffuse;
    uniform float blurAmount;
    uniform float frostIntensity;
    uniform vec3 color;
    uniform float opacity;
    
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    
    // Hash for noise
    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
    }
    
    // Frost noise pattern
    float frostNoise(vec2 uv) {
      vec2 i = floor(uv);
      vec2 f = fract(uv);
      
      float a = hash(i);
      float b = hash(i + vec2(1.0, 0.0));
      float c = hash(i + vec2(0.0, 1.0));
      float d = hash(i + vec2(1.0, 1.0));
      
      vec2 u = f * f * (3.0 - 2.0 * f);
      
      return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
    }
    
    void main() {
      // Blur by sampling multiple times
      vec3 blurred = vec3(0.0);
      float total = 0.0;
      
      float pixelSize = blurAmount / 512.0;
      
      for(float x = -2.0; x <= 2.0; x += 1.0) {
        for(float y = -2.0; y <= 2.0; y += 1.0) {
          vec2 offset = vec2(x, y) * pixelSize;
          float weight = exp(-(x*x + y*y) / 8.0);
          blurred += texture2D(tDiffuse, vUv + offset).rgb * weight;
          total += weight;
        }
      }
      
      blurred /= total;
      
      // Add frost pattern
      float frost = frostNoise(vUv * 50.0) * frostIntensity;
      
      // Fresnel edge
      vec3 viewDir = normalize(vViewPosition);
      float fresnel = pow(1.0 - abs(dot(vNormal, viewDir)), 2.0);
      
      // Combine
      vec3 finalColor = mix(blurred, color, frost);
      finalColor += vec3(fresnel * 0.2);
      
      gl_FragColor = vec4(finalColor, opacity);
    }
  `
};

// Stained glass shader
export const StainedGlassShader = {
  uniforms: {
    tDiffuse: { value: null },
    colorMap: { value: null },
    time: { value: 0 },
    lightIntensity: { value: 1.0 },
    glowStrength: { value: 0.5 },
  },

  vertexShader: `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    
    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform sampler2D colorMap;
    uniform float time;
    uniform float lightIntensity;
    uniform float glowStrength;
    
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    
    void main() {
      // Base color from color map
      vec4 glassColor = texture2D(colorMap, vUv);
      
      // Light transmission
      vec3 lightDir = normalize(vec3(1.0, 1.0, 0.5));
      float transmission = max(dot(vNormal, lightDir), 0.0);
      
      // Caustic-like effect
      float caustic = sin(vUv.x * 20.0 + time) * sin(vUv.y * 20.0 + time * 0.7);
      caustic = caustic * 0.5 + 0.5;
      
      // Combine
      vec3 finalColor = glassColor.rgb * lightIntensity;
      finalColor += finalColor * transmission * glowStrength;
      finalColor += vec3(caustic * 0.1);
      
      gl_FragColor = vec4(finalColor, glassColor.a);
    }
  `
};
