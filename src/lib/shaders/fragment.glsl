// Basic Fragment Shader
// For 3D visualizations

uniform float uTime;
uniform vec3 uColor;
uniform float uOpacity;

varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;

void main() {
  // Lighting
  vec3 lightDirection = normalize(vec3(1.0, 1.0, 1.0));
  float lightIntensity = max(dot(vNormal, lightDirection), 0.0);
  
  // Color with lighting
  vec3 finalColor = uColor * (0.5 + 0.5 * lightIntensity);
  
  gl_FragColor = vec4(finalColor, uOpacity);
}
