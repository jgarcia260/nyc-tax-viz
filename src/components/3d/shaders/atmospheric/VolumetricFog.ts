import * as THREE from 'three';

export const VolumetricFogShader = {
  uniforms: {
    tDiffuse: { value: null },
    tDepth: { value: null },
    cameraNear: { value: 0.1 },
    cameraFar: { value: 1000 },
    fogColor: { value: new THREE.Color(0x1a1a3e) },
    fogDensity: { value: 0.015 },
    fogHeightFalloff: { value: 0.5 },
    time: { value: 0 },
    sunPosition: { value: new THREE.Vector3(100, 200, 100) },
    sunColor: { value: new THREE.Color(0xffd700) },
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
    uniform vec3 fogColor;
    uniform float fogDensity;
    uniform float fogHeightFalloff;
    uniform float time;
    uniform vec3 sunPosition;
    uniform vec3 sunColor;
    
    varying vec2 vUv;
    
    // Depth reading function
    float readDepth(sampler2D depthSampler, vec2 coord) {
      float fragCoordZ = texture2D(depthSampler, coord).x;
      float viewZ = perspectiveDepthToViewZ(fragCoordZ, cameraNear, cameraFar);
      return viewZToOrthographicDepth(viewZ, cameraNear, cameraFar);
    }
    
    // 3D noise function for volumetric effect
    float noise3D(vec3 p) {
      return fract(sin(dot(p, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
    }
    
    float fbm(vec3 p) {
      float value = 0.0;
      float amplitude = 0.5;
      float frequency = 1.0;
      
      for(int i = 0; i < 4; i++) {
        value += amplitude * noise3D(p * frequency);
        frequency *= 2.0;
        amplitude *= 0.5;
      }
      
      return value;
    }
    
    void main() {
      vec4 baseColor = texture2D(tDiffuse, vUv);
      float depth = readDepth(tDepth, vUv);
      
      // Calculate world position approximation
      vec3 worldPos = vec3(vUv * 100.0, depth * 100.0);
      
      // Animated volumetric noise
      vec3 noiseCoord = worldPos * 0.1 + vec3(time * 0.05);
      float fogNoise = fbm(noiseCoord);
      
      // Height-based fog falloff
      float heightFactor = exp(-worldPos.z * fogHeightFalloff);
      
      // Distance-based fog
      float fogFactor = 1.0 - exp(-depth * fogDensity * (0.5 + fogNoise * 0.5));
      fogFactor *= heightFactor;
      
      // Sun scattering (god rays approximation)
      vec3 viewDir = normalize(vec3(vUv - 0.5, depth));
      vec3 sunDir = normalize(sunPosition);
      float sunScatter = pow(max(dot(viewDir, sunDir), 0.0), 8.0);
      vec3 scatterColor = sunColor * sunScatter * 0.3;
      
      // Final fog color with scattering
      vec3 finalFogColor = fogColor + scatterColor;
      
      // Mix base color with fog
      vec3 finalColor = mix(baseColor.rgb, finalFogColor, fogFactor);
      
      gl_FragColor = vec4(finalColor, baseColor.a);
    }
  `
};
