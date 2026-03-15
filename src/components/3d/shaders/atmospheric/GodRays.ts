import * as THREE from 'three';

export const GodRaysShader = {
  uniforms: {
    tDiffuse: { value: null },
    tDepth: { value: null },
    lightPosition: { value: new THREE.Vector2(0.5, 0.5) },
    exposure: { value: 0.4 },
    decay: { value: 0.96 },
    density: { value: 0.8 },
    weight: { value: 0.6 },
    samples: { value: 100 },
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
    uniform vec2 lightPosition;
    uniform float exposure;
    uniform float decay;
    uniform float density;
    uniform float weight;
    uniform int samples;
    
    varying vec2 vUv;
    
    void main() {
      vec2 texCoord = vUv;
      
      // Calculate vector from pixel to light source
      vec2 deltaTexCoord = texCoord - lightPosition;
      
      // Divide by number of samples and multiply by control factor
      deltaTexCoord *= 1.0 / float(samples) * density;
      
      // Store initial sample
      vec4 color = texture2D(tDiffuse, texCoord);
      
      // Set up illumination decay factor
      float illuminationDecay = 1.0;
      
      // Evaluate summation from Equation 3
      for(int i = 0; i < 100; i++) {
        if(i >= samples) break;
        
        // Step sample location along ray
        texCoord -= deltaTexCoord;
        
        // Retrieve sample at new location
        vec4 sample = texture2D(tDiffuse, texCoord);
        
        // Apply sample attenuation scale/decay factors
        sample *= illuminationDecay * weight;
        
        // Accumulate combined color
        color += sample;
        
        // Update exponential decay factor
        illuminationDecay *= decay;
      }
      
      // Output final color with a further scale control factor
      gl_FragColor = color * exposure;
    }
  `
};

// Generate god rays occlusion mask
export const GodRaysOcclusionShader = {
  uniforms: {
    tDiffuse: { value: null },
    lightPosition: { value: new THREE.Vector3(0, 0, 0) },
    screenPosition: { value: new THREE.Vector2(0.5, 0.5) },
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
    uniform vec2 screenPosition;
    
    varying vec2 vUv;
    
    void main() {
      vec4 texel = texture2D(tDiffuse, vUv);
      
      // Distance from light
      float dist = distance(vUv, screenPosition);
      
      // Create radial gradient for occlusion
      float occlusion = 1.0 - smoothstep(0.0, 0.7, dist);
      
      // Only output bright areas (potential light sources)
      float brightness = dot(texel.rgb, vec3(0.2126, 0.7152, 0.0722));
      float mask = step(0.8, brightness) * occlusion;
      
      gl_FragColor = vec4(vec3(mask), 1.0);
    }
  `
};
