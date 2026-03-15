import * as THREE from 'three';

export const WaterShader = {
  uniforms: {
    time: { value: 0 },
    tCube: { value: null },
    tNormal: { value: null },
    waterColor: { value: new THREE.Color(0x001e3f) },
    sunDirection: { value: new THREE.Vector3(0.5, 1.0, 0.3) },
    sunColor: { value: new THREE.Color(0xffffff) },
    waveScale: { value: 1.0 },
    waveSpeed: { value: 0.5 },
    waveHeight: { value: 0.5 },
    reflectivity: { value: 0.6 },
    transparency: { value: 0.7 },
    fresnelPower: { value: 3.0 },
    foamAmount: { value: 0.1 },
  },

  vertexShader: `
    uniform float time;
    uniform float waveScale;
    uniform float waveSpeed;
    uniform float waveHeight;
    
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec3 vWorldPosition;
    varying vec2 vUv;
    varying float vElevation;
    
    // Wave generation functions
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
    
    float snoise(vec2 v) {
      const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy));
      vec2 x0 = v -   i + dot(i, C.xx);
      vec2 i1;
      i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod289(i);
      vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
      m = m*m;
      m = m*m;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
      vec3 g;
      g.x  = a0.x  * x0.x  + h.x  * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }
    
    float getWave(vec2 pos, float time) {
      float wave = 0.0;
      
      // Multiple wave frequencies
      wave += snoise(pos * 0.5 + time * 0.3) * 1.0;
      wave += snoise(pos * 1.0 - time * 0.2) * 0.5;
      wave += snoise(pos * 2.0 + time * 0.5) * 0.25;
      wave += snoise(pos * 4.0 - time * 0.4) * 0.125;
      
      return wave;
    }
    
    void main() {
      vUv = uv;
      
      vec3 pos = position;
      vec2 wavePos = pos.xz * waveScale;
      
      // Calculate wave elevation
      float elevation = getWave(wavePos, time * waveSpeed) * waveHeight;
      pos.y += elevation;
      vElevation = elevation;
      
      // Calculate normal from wave derivatives
      float eps = 0.1;
      float dx = (getWave(wavePos + vec2(eps, 0.0), time * waveSpeed) - 
                  getWave(wavePos - vec2(eps, 0.0), time * waveSpeed)) / (2.0 * eps);
      float dz = (getWave(wavePos + vec2(0.0, eps), time * waveSpeed) - 
                  getWave(wavePos - vec2(0.0, eps), time * waveSpeed)) / (2.0 * eps);
      
      vec3 calculatedNormal = normalize(vec3(-dx * waveHeight, 1.0, -dz * waveHeight));
      vNormal = normalize(normalMatrix * calculatedNormal);
      
      vec4 worldPosition = modelMatrix * vec4(pos, 1.0);
      vWorldPosition = worldPosition.xyz;
      
      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      vViewPosition = -mvPosition.xyz;
      
      gl_Position = projectionMatrix * mvPosition;
    }
  `,

  fragmentShader: `
    uniform samplerCube tCube;
    uniform sampler2D tNormal;
    uniform float time;
    uniform vec3 waterColor;
    uniform vec3 sunDirection;
    uniform vec3 sunColor;
    uniform float reflectivity;
    uniform float transparency;
    uniform float fresnelPower;
    uniform float foamAmount;
    
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec3 vWorldPosition;
    varying vec2 vUv;
    varying float vElevation;
    
    const float PI = 3.14159265359;
    
    // Fresnel
    float fresnel(vec3 viewDir, vec3 normal, float power) {
      return pow(1.0 - abs(dot(viewDir, normal)), power);
    }
    
    void main() {
      vec3 normal = vNormal;
      
      // Additional normal detail from texture
      if (tNormal != null) {
        vec2 normalUV = vUv * 10.0 + time * 0.05;
        vec3 normalMap1 = texture2D(tNormal, normalUV).xyz * 2.0 - 1.0;
        vec3 normalMap2 = texture2D(tNormal, normalUV * 0.5 - time * 0.03).xyz * 2.0 - 1.0;
        vec3 detailNormal = normalize(normalMap1 + normalMap2);
        normal = normalize(normal + detailNormal * 0.3);
      }
      
      vec3 viewDir = normalize(vViewPosition);
      
      // Reflection
      vec3 reflectDir = reflect(-viewDir, normal);
      vec3 reflection = textureCube(tCube, reflectDir).rgb;
      
      // Refraction (approximate)
      vec3 refractDir = refract(-viewDir, normal, 0.75); // Water IOR ~1.33
      vec3 refraction = textureCube(tCube, refractDir).rgb;
      
      // Subsurface color
      vec3 subsurface = waterColor * (1.0 - transparency);
      
      // Fresnel effect
      float fresnelFactor = fresnel(viewDir, normal, fresnelPower);
      
      // Mix refraction with subsurface color
      vec3 underWater = mix(subsurface, refraction, transparency);
      
      // Mix reflection and underwater based on Fresnel
      vec3 finalColor = mix(underWater, reflection, fresnelFactor * reflectivity);
      
      // Sun specular
      vec3 halfDir = normalize(viewDir + normalize(sunDirection));
      float specular = pow(max(dot(normal, halfDir), 0.0), 128.0);
      finalColor += sunColor * specular;
      
      // Foam on wave peaks
      float foamMask = smoothstep(0.3, 0.5, vElevation) * foamAmount;
      finalColor = mix(finalColor, vec3(1.0), foamMask);
      
      // Caustics approximation (simplified)
      float caustic = sin(vWorldPosition.x * 10.0 + time) * sin(vWorldPosition.z * 10.0 + time * 1.3);
      caustic = caustic * 0.5 + 0.5;
      finalColor += vec3(caustic * 0.05);
      
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
};

// Simplified water for mobile/LOD
export const WaterSimpleShader = {
  uniforms: {
    time: { value: 0 },
    waterColor: { value: new THREE.Color(0x001e3f) },
    reflectionStrength: { value: 0.5 },
  },

  vertexShader: `
    uniform float time;
    
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec2 vUv;
    
    void main() {
      vUv = uv;
      
      vec3 pos = position;
      
      // Simple sine wave
      pos.y += sin(pos.x * 2.0 + time) * 0.1 + sin(pos.z * 2.0 + time * 0.7) * 0.1;
      
      vNormal = normalize(normalMatrix * normal);
      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      vViewPosition = -mvPosition.xyz;
      
      gl_Position = projectionMatrix * mvPosition;
    }
  `,

  fragmentShader: `
    uniform vec3 waterColor;
    uniform float reflectionStrength;
    
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec2 vUv;
    
    void main() {
      vec3 viewDir = normalize(vViewPosition);
      
      // Simple Fresnel
      float fresnel = pow(1.0 - abs(dot(vNormal, viewDir)), 3.0);
      
      // Mix water color with brightness based on Fresnel
      vec3 finalColor = waterColor * (1.0 + fresnel * reflectionStrength);
      
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
};

// Caustics shader (for surfaces underwater or near water)
export const CausticsShader = {
  uniforms: {
    time: { value: 0 },
    intensity: { value: 0.5 },
    scale: { value: 1.0 },
    speed: { value: 0.3 },
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
    uniform float intensity;
    uniform float scale;
    uniform float speed;
    
    varying vec2 vUv;
    varying vec3 vPosition;
    
    // Caustics pattern
    float causticPattern(vec2 uv, float time) {
      vec2 p = uv * scale;
      
      float c1 = sin(p.x * 10.0 + time * speed) * sin(p.y * 10.0 + time * speed * 0.7);
      float c2 = sin((p.x + p.y) * 7.0 + time * speed * 1.3) * sin((p.x - p.y) * 7.0 + time * speed * 0.9);
      
      return (c1 + c2) * 0.5 + 0.5;
    }
    
    void main() {
      float caustics = causticPattern(vUv, time);
      caustics = pow(caustics, 3.0) * intensity;
      
      gl_FragColor = vec4(vec3(caustics), 1.0);
    }
  `
};
