import * as THREE from 'three';

export const MetallicBuildingShader = {
  uniforms: {
    tCube: { value: null },
    tNormal: { value: null },
    tRoughness: { value: null },
    color: { value: new THREE.Color(0x888888) },
    metalness: { value: 0.9 },
    roughness: { value: 0.3 },
    time: { value: 0 },
    weathering: { value: 0.2 },
    reflectionStrength: { value: 1.0 },
    emissiveColor: { value: new THREE.Color(0x000000) },
    emissiveIntensity: { value: 0.0 },
  },

  vertexShader: `
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec3 vWorldPosition;
    varying vec2 vUv;
    varying vec3 vTangent;
    varying vec3 vBitangent;
    
    attribute vec3 tangent;
    
    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vTangent = normalize(normalMatrix * tangent);
      vBitangent = cross(vNormal, vTangent);
      
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;
      
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;
      
      gl_Position = projectionMatrix * mvPosition;
    }
  `,

  fragmentShader: `
    uniform samplerCube tCube;
    uniform sampler2D tNormal;
    uniform sampler2D tRoughness;
    uniform vec3 color;
    uniform float metalness;
    uniform float roughness;
    uniform float time;
    uniform float weathering;
    uniform float reflectionStrength;
    uniform vec3 emissiveColor;
    uniform float emissiveIntensity;
    
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec3 vWorldPosition;
    varying vec2 vUv;
    varying vec3 vTangent;
    varying vec3 vBitangent;
    
    const float PI = 3.14159265359;
    
    // Fresnel-Schlick
    vec3 fresnelSchlick(float cosTheta, vec3 F0) {
      return F0 + (1.0 - F0) * pow(1.0 - cosTheta, 5.0);
    }
    
    // GGX Distribution
    float distributionGGX(vec3 N, vec3 H, float roughness) {
      float a = roughness * roughness;
      float a2 = a * a;
      float NdotH = max(dot(N, H), 0.0);
      float NdotH2 = NdotH * NdotH;
      
      float nom = a2;
      float denom = (NdotH2 * (a2 - 1.0) + 1.0);
      denom = PI * denom * denom;
      
      return nom / denom;
    }
    
    // Smith's Geometry Shadowing
    float geometrySchlickGGX(float NdotV, float roughness) {
      float r = (roughness + 1.0);
      float k = (r * r) / 8.0;
      
      float nom = NdotV;
      float denom = NdotV * (1.0 - k) + k;
      
      return nom / denom;
    }
    
    float geometrySmith(vec3 N, vec3 V, vec3 L, float roughness) {
      float NdotV = max(dot(N, V), 0.0);
      float NdotL = max(dot(N, L), 0.0);
      float ggx2 = geometrySchlickGGX(NdotV, roughness);
      float ggx1 = geometrySchlickGGX(NdotL, roughness);
      
      return ggx1 * ggx2;
    }
    
    // Hash for weathering
    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
    }
    
    void main() {
      // Normal mapping
      vec3 normal = vNormal;
      if (tNormal != null) {
        vec3 normalMap = texture2D(tNormal, vUv).xyz * 2.0 - 1.0;
        mat3 TBN = mat3(vTangent, vBitangent, vNormal);
        normal = normalize(TBN * normalMap);
      }
      
      vec3 viewDir = normalize(vViewPosition);
      
      // Dynamic roughness
      float surfaceRoughness = roughness;
      if (tRoughness != null) {
        surfaceRoughness *= texture2D(tRoughness, vUv).r;
      }
      
      // Weathering effect
      float weatherPattern = hash(vUv * 100.0);
      surfaceRoughness += weatherPattern * weathering * 0.3;
      surfaceRoughness = clamp(surfaceRoughness, 0.0, 1.0);
      
      // Reflection
      vec3 reflectDir = reflect(-viewDir, normal);
      
      // Roughness affects reflection blur (approximate with LOD)
      float lod = surfaceRoughness * 8.0;
      vec3 reflection = textureCube(tCube, reflectDir).rgb;
      
      // Metallic F0
      vec3 F0 = vec3(0.04);
      F0 = mix(F0, color, metalness);
      
      // Fresnel
      vec3 F = fresnelSchlick(max(dot(normal, viewDir), 0.0), F0);
      
      // Simple directional light for demonstration
      vec3 lightDir = normalize(vec3(1.0, 1.0, 0.5));
      vec3 H = normalize(viewDir + lightDir);
      
      // Cook-Torrance BRDF
      float NDF = distributionGGX(normal, H, surfaceRoughness);
      float G = geometrySmith(normal, viewDir, lightDir, surfaceRoughness);
      
      vec3 numerator = NDF * G * F;
      float denominator = 4.0 * max(dot(normal, viewDir), 0.0) * max(dot(normal, lightDir), 0.0) + 0.001;
      vec3 specular = numerator / denominator;
      
      // Energy conservation
      vec3 kS = F;
      vec3 kD = vec3(1.0) - kS;
      kD *= 1.0 - metalness;
      
      // Diffuse
      float NdotL = max(dot(normal, lightDir), 0.0);
      vec3 diffuse = kD * color / PI;
      
      // Ambient (from environment)
      vec3 ambient = reflection * reflectionStrength * (1.0 - surfaceRoughness * 0.5);
      
      // Combine
      vec3 Lo = (diffuse + specular) * vec3(1.0) * NdotL;
      vec3 finalColor = ambient * color + Lo;
      
      // Add emissive (for lit windows, etc.)
      finalColor += emissiveColor * emissiveIntensity;
      
      // Weathering darkening
      finalColor *= (1.0 - weatherPattern * weathering * 0.2);
      
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
};

// Simplified metallic for LOD
export const MetallicBuildingLODShader = {
  uniforms: {
    tCube: { value: null },
    color: { value: new THREE.Color(0x888888) },
    metalness: { value: 0.9 },
    roughness: { value: 0.3 },
  },

  vertexShader: `
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,

  fragmentShader: `
    uniform samplerCube tCube;
    uniform vec3 color;
    uniform float metalness;
    uniform float roughness;
    
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    
    void main() {
      vec3 viewDir = normalize(vViewPosition);
      vec3 reflectDir = reflect(-viewDir, vNormal);
      
      // Simple reflection
      vec3 reflection = textureCube(tCube, reflectDir).rgb;
      
      // Simple Fresnel
      float fresnel = pow(1.0 - abs(dot(vNormal, viewDir)), 5.0);
      fresnel = mix(0.04, 1.0, fresnel);
      
      // Mix color with reflection based on metalness
      vec3 finalColor = mix(color, reflection, metalness * fresnel);
      
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
};

// Animated windows for buildings
export const BuildingWindowsShader = {
  uniforms: {
    time: { value: 0 },
    windowColor: { value: new THREE.Color(0xffff88) },
    windowPattern: { value: null }, // Texture defining window layout
    lightFlicker: { value: 0.1 },
    occupancyPattern: { value: 0.7 }, // Percentage of lit windows
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
    uniform vec3 windowColor;
    uniform sampler2D windowPattern;
    uniform float lightFlicker;
    uniform float occupancyPattern;
    
    varying vec2 vUv;
    
    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
    }
    
    void main() {
      // Window grid
      vec2 windowCoord = fract(vUv * vec2(10.0, 30.0)); // 10 wide, 30 tall
      vec2 windowId = floor(vUv * vec2(10.0, 30.0));
      
      // Window frame (dark borders)
      vec2 frame = smoothstep(0.0, 0.05, windowCoord) * smoothstep(1.0, 0.95, windowCoord);
      float isWindow = frame.x * frame.y;
      
      // Random occupancy per window
      float occupancy = hash(windowId);
      float isLit = step(1.0 - occupancyPattern, occupancy);
      
      // Flickering
      float flicker = hash(windowId + floor(time * 5.0)) * lightFlicker + (1.0 - lightFlicker);
      
      // Pulsing (some windows)
      float pulse = sin(time * 2.0 + hash(windowId) * 6.28) * 0.5 + 0.5;
      float isPulsing = step(0.98, hash(windowId + vec2(123.45, 678.90)));
      float brightness = mix(1.0, pulse, isPulsing);
      
      // Final window color
      vec3 emissive = windowColor * isWindow * isLit * flicker * brightness;
      
      gl_FragColor = vec4(emissive, 1.0);
    }
  `
};
