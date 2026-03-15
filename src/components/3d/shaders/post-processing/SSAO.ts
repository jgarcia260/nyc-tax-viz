import * as THREE from 'three';

// Screen Space Ambient Occlusion (SSAO)
export const SSAOShader = {
  uniforms: {
    tDiffuse: { value: null },
    tDepth: { value: null },
    tNormal: { value: null },
    cameraNear: { value: 0.1 },
    cameraFar: { value: 100 },
    cameraProjectionMatrix: { value: new THREE.Matrix4() },
    cameraInverseProjectionMatrix: { value: new THREE.Matrix4() },
    radius: { value: 0.5 },
    bias: { value: 0.025 },
    intensity: { value: 1.0 },
    samples: { value: 16 },
    noiseScale: { value: new THREE.Vector2(4, 4) },
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
    uniform float radius;
    uniform float bias;
    uniform float intensity;
    uniform int samples;
    uniform vec2 noiseScale;
    
    varying vec2 vUv;
    
    // Sample kernel (hemisphere around normal)
    const vec3 sampleKernel[16] = vec3[](
      vec3(0.04977, -0.04471, 0.04996),
      vec3(0.01457, 0.01653, 0.00224),
      vec3(-0.04065, -0.01937, 0.03193),
      vec3(0.01378, -0.09158, 0.04092),
      vec3(0.05599, 0.05979, 0.05766),
      vec3(0.09227, 0.04428, 0.01545),
      vec3(-0.00204, -0.0544, 0.06674),
      vec3(-0.00033, -0.00019, 0.00037),
      vec3(0.05004, -0.04665, 0.02538),
      vec3(0.03813, 0.0314, 0.03287),
      vec3(-0.03188, 0.02046, 0.02251),
      vec3(0.0557, -0.03697, 0.05449),
      vec3(0.05737, -0.02254, 0.07554),
      vec3(-0.01609, -0.00377, 0.05547),
      vec3(-0.02503, -0.02984, 0.02441),
      vec3(0.03451, 0.0025, 0.0397)
    );
    
    // Noise pattern for rotation
    vec3 getNoise(vec2 coord) {
      vec2 noiseCoord = coord * noiseScale;
      float noise = fract(sin(dot(noiseCoord, vec2(12.9898, 78.233))) * 43758.5453);
      float angle = noise * 6.2832; // 2*PI
      return vec3(cos(angle), sin(angle), 0.0);
    }
    
    // Linearize depth
    float linearizeDepth(float depth) {
      float z = depth * 2.0 - 1.0;
      return (2.0 * cameraNear * cameraFar) / (cameraFar + cameraNear - z * (cameraFar - cameraNear));
    }
    
    // Reconstruct view-space position from depth
    vec3 getViewPosition(vec2 uv, float depth) {
      vec4 clipSpacePosition = vec4(uv * 2.0 - 1.0, depth * 2.0 - 1.0, 1.0);
      vec4 viewSpacePosition = cameraInverseProjectionMatrix * clipSpacePosition;
      return viewSpacePosition.xyz / viewSpacePosition.w;
    }
    
    void main() {
      float depth = texture2D(tDepth, vUv).r;
      
      // Skip background
      if (depth >= 0.9999) {
        gl_FragColor = vec4(1.0);
        return;
      }
      
      vec3 normal = texture2D(tNormal, vUv).xyz * 2.0 - 1.0;
      vec3 viewPos = getViewPosition(vUv, depth);
      
      // Create TBN matrix for hemisphere orientation
      vec3 randomVec = getNoise(vUv);
      vec3 tangent = normalize(randomVec - normal * dot(randomVec, normal));
      vec3 bitangent = cross(normal, tangent);
      mat3 TBN = mat3(tangent, bitangent, normal);
      
      // Sample occlusion
      float occlusion = 0.0;
      
      for (int i = 0; i < 16; i++) {
        if (i >= samples) break;
        
        // Get sample position
        vec3 samplePos = TBN * sampleKernel[i];
        samplePos = viewPos + samplePos * radius;
        
        // Project sample to screen space
        vec4 offset = cameraProjectionMatrix * vec4(samplePos, 1.0);
        offset.xyz /= offset.w;
        offset.xyz = offset.xyz * 0.5 + 0.5;
        
        // Get sample depth
        float sampleDepth = texture2D(tDepth, offset.xy).r;
        float sampleViewZ = getViewPosition(offset.xy, sampleDepth).z;
        
        // Range check & accumulate
        float rangeCheck = smoothstep(0.0, 1.0, radius / abs(viewPos.z - sampleViewZ));
        occlusion += (sampleViewZ >= samplePos.z + bias ? 1.0 : 0.0) * rangeCheck;
      }
      
      occlusion = 1.0 - (occlusion / float(samples));
      occlusion = pow(occlusion, intensity);
      
      gl_FragColor = vec4(vec3(occlusion), 1.0);
    }
  `
};

// SSAO Blur (bilateral filter to preserve edges)
export const SSAOBlurShader = {
  uniforms: {
    tDiffuse: { value: null },
    tDepth: { value: null },
    resolution: { value: new THREE.Vector2(1024, 1024) },
    direction: { value: new THREE.Vector2(1, 0) },
    depthThreshold: { value: 0.01 },
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
    uniform vec2 direction;
    uniform float depthThreshold;
    
    varying vec2 vUv;
    
    void main() {
      vec2 invSize = 1.0 / resolution;
      vec2 step = direction * invSize;
      
      float centerDepth = texture2D(tDepth, vUv).r;
      float centerAO = texture2D(tDiffuse, vUv).r;
      
      float sum = centerAO;
      float totalWeight = 1.0;
      
      // 9-tap blur with depth-aware weighting
      for (int i = -4; i <= 4; i++) {
        if (i == 0) continue;
        
        vec2 offset = vUv + step * float(i);
        float sampleDepth = texture2D(tDepth, offset).r;
        float sampleAO = texture2D(tDiffuse, offset).r;
        
        // Weight by depth similarity
        float depthDiff = abs(centerDepth - sampleDepth);
        float weight = exp(-depthDiff / depthThreshold);
        
        sum += sampleAO * weight;
        totalWeight += weight;
      }
      
      gl_FragColor = vec4(vec3(sum / totalWeight), 1.0);
    }
  `
};

// SSAO Composite (multiply with scene)
export const SSAOCompositeShader = {
  uniforms: {
    tDiffuse: { value: null },
    tAO: { value: null },
    aoIntensity: { value: 1.0 },
    aoClamp: { value: new THREE.Vector2(0.0, 1.0) },
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
    uniform sampler2D tAO;
    uniform float aoIntensity;
    uniform vec2 aoClamp;
    
    varying vec2 vUv;
    
    void main() {
      vec4 color = texture2D(tDiffuse, vUv);
      float ao = texture2D(tAO, vUv).r;
      
      // Clamp and apply intensity
      ao = clamp(ao, aoClamp.x, aoClamp.y);
      ao = mix(1.0, ao, aoIntensity);
      
      gl_FragColor = vec4(color.rgb * ao, color.a);
    }
  `
};
