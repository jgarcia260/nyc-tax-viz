import * as THREE from 'three';

// Screen Space Reflections
export const SSRShader = {
  uniforms: {
    tDiffuse: { value: null },
    tDepth: { value: null },
    tNormal: { value: null },
    cameraNear: { value: 0.1 },
    cameraFar: { value: 100 },
    cameraProjectionMatrix: { value: new THREE.Matrix4() },
    cameraInverseProjectionMatrix: { value: new THREE.Matrix4() },
    resolution: { value: new THREE.Vector2(1024, 1024) },
    maxDistance: { value: 5.0 },
    thickness: { value: 0.1 },
    stride: { value: 1 },
    maxSteps: { value: 20 },
    binarySearchSteps: { value: 5 },
    fadeEdge: { value: 0.1 },
    intensity: { value: 1.0 },
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
    uniform sampler2D tNormal;
    uniform float cameraNear;
    uniform float cameraFar;
    uniform mat4 cameraProjectionMatrix;
    uniform mat4 cameraInverseProjectionMatrix;
    uniform vec2 resolution;
    uniform float maxDistance;
    uniform float thickness;
    uniform int stride;
    uniform int maxSteps;
    uniform int binarySearchSteps;
    uniform float fadeEdge;
    uniform float intensity;
    
    varying vec2 vUv;
    
    // Reconstruct view-space position from depth
    vec3 getViewPosition(vec2 uv, float depth) {
      vec4 clipSpacePosition = vec4(uv * 2.0 - 1.0, depth * 2.0 - 1.0, 1.0);
      vec4 viewSpacePosition = cameraInverseProjectionMatrix * clipSpacePosition;
      return viewSpacePosition.xyz / viewSpacePosition.w;
    }
    
    // Project view-space position to screen space
    vec3 projectToScreenSpace(vec3 viewPos) {
      vec4 clipPos = cameraProjectionMatrix * vec4(viewPos, 1.0);
      clipPos.xyz /= clipPos.w;
      clipPos.xyz = clipPos.xyz * 0.5 + 0.5;
      return clipPos.xyz;
    }
    
    // Ray march in screen space
    bool rayMarch(vec3 rayOrigin, vec3 rayDir, out vec2 hitUV, out float hitDepth) {
      vec3 rayPos = rayOrigin;
      vec3 rayStep = rayDir * (1.0 / float(maxSteps));
      
      for (int i = 0; i < 100; i++) {
        if (i >= maxSteps) break;
        
        rayPos += rayStep * float(stride);
        
        vec3 screenPos = projectToScreenSpace(rayPos);
        
        // Check if out of screen
        if (screenPos.x < 0.0 || screenPos.x > 1.0 || 
            screenPos.y < 0.0 || screenPos.y > 1.0) {
          return false;
        }
        
        float sampledDepth = texture2D(tDepth, screenPos.xy).r;
        float sampledViewZ = getViewPosition(screenPos.xy, sampledDepth).z;
        
        float rayDepth = rayPos.z;
        
        // Check for intersection
        if (rayDepth < sampledViewZ && rayDepth > sampledViewZ - thickness) {
          // Binary search for precise hit
          vec3 searchStart = rayPos - rayStep * float(stride);
          vec3 searchEnd = rayPos;
          
          for (int j = 0; j < 10; j++) {
            if (j >= binarySearchSteps) break;
            
            vec3 searchMid = (searchStart + searchEnd) * 0.5;
            vec3 searchScreenPos = projectToScreenSpace(searchMid);
            float searchSampledDepth = texture2D(tDepth, searchScreenPos.xy).r;
            float searchSampledViewZ = getViewPosition(searchScreenPos.xy, searchSampledDepth).z;
            
            if (searchMid.z < searchSampledViewZ) {
              searchEnd = searchMid;
            } else {
              searchStart = searchMid;
            }
          }
          
          vec3 finalHit = (searchStart + searchEnd) * 0.5;
          vec3 finalScreenPos = projectToScreenSpace(finalHit);
          
          hitUV = finalScreenPos.xy;
          hitDepth = finalScreenPos.z;
          return true;
        }
      }
      
      return false;
    }
    
    void main() {
      float depth = texture2D(tDepth, vUv).r;
      
      // Skip background
      if (depth >= 0.9999) {
        gl_FragColor = texture2D(tDiffuse, vUv);
        return;
      }
      
      vec3 normal = normalize(texture2D(tNormal, vUv).xyz * 2.0 - 1.0);
      vec3 viewPos = getViewPosition(vUv, depth);
      
      // Calculate reflection direction
      vec3 viewDir = normalize(viewPos);
      vec3 reflectDir = reflect(viewDir, normal);
      
      // Ray march
      vec2 hitUV;
      float hitDepth;
      bool hit = rayMarch(viewPos, reflectDir * maxDistance, hitUV, hitDepth);
      
      vec4 sceneColor = texture2D(tDiffuse, vUv);
      
      if (!hit) {
        gl_FragColor = sceneColor;
        return;
      }
      
      // Sample reflection color
      vec4 reflectionColor = texture2D(tDiffuse, hitUV);
      
      // Fade at screen edges
      vec2 edgeFade = smoothstep(0.0, fadeEdge, hitUV) * 
                      smoothstep(1.0, 1.0 - fadeEdge, hitUV);
      float edgeFactor = edgeFade.x * edgeFade.y;
      
      // Fade by distance
      float distanceFade = 1.0 - smoothstep(0.0, maxDistance, length(reflectDir));
      
      // Fresnel effect
      float fresnel = pow(1.0 - max(dot(-viewDir, normal), 0.0), 5.0);
      
      float finalIntensity = intensity * edgeFactor * distanceFade * fresnel;
      
      gl_FragColor = vec4(mix(sceneColor.rgb, reflectionColor.rgb, finalIntensity), sceneColor.a);
    }
  `
};

// SSR Blur (temporal filtering)
export const SSRBlurShader = {
  uniforms: {
    tDiffuse: { value: null },
    tDepth: { value: null },
    resolution: { value: new THREE.Vector2(1024, 1024) },
    blurRadius: { value: 2.0 },
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
    uniform vec2 resolution;
    uniform float blurRadius;
    
    varying vec2 vUv;
    
    void main() {
      vec2 invSize = 1.0 / resolution;
      float centerDepth = texture2D(tDepth, vUv).r;
      
      vec4 sum = vec4(0.0);
      float totalWeight = 0.0;
      
      // 5x5 blur
      for (float x = -2.0; x <= 2.0; x++) {
        for (float y = -2.0; y <= 2.0; y++) {
          vec2 offset = vec2(x, y) * invSize * blurRadius;
          vec2 sampleUV = vUv + offset;
          
          float sampleDepth = texture2D(tDepth, sampleUV).r;
          float depthDiff = abs(centerDepth - sampleDepth);
          
          // Depth-aware weight
          float weight = exp(-depthDiff * 100.0);
          
          sum += texture2D(tDiffuse, sampleUV) * weight;
          totalWeight += weight;
        }
      }
      
      gl_FragColor = sum / totalWeight;
    }
  `
};
