/**
 * Reusable PBR (Physically Based Rendering) shader utilities
 * These functions are commonly used across multiple material shaders
 */

export const PBR_UTILS = `
  const float PI = 3.14159265359;
  
  // Fresnel-Schlick approximation
  // Returns reflectance at different angles
  vec3 fresnelSchlick(float cosTheta, vec3 F0) {
    return F0 + (1.0 - F0) * pow(1.0 - cosTheta, 5.0);
  }
  
  // GGX/Trowbridge-Reitz normal distribution function
  // Determines microfacet distribution for specular highlights
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
  
  // Schlick-GGX geometry shadowing function
  float geometrySchlickGGX(float NdotV, float roughness) {
    float r = (roughness + 1.0);
    float k = (r * r) / 8.0;
    
    float nom = NdotV;
    float denom = NdotV * (1.0 - k) + k;
    
    return nom / denom;
  }
  
  // Smith's method for geometry shadowing
  // Combines viewing and lighting geometry
  float geometrySmith(vec3 N, vec3 V, vec3 L, float roughness) {
    float NdotV = max(dot(N, V), 0.0);
    float NdotL = max(dot(N, L), 0.0);
    float ggx2 = geometrySchlickGGX(NdotV, roughness);
    float ggx1 = geometrySchlickGGX(NdotL, roughness);
    
    return ggx1 * ggx2;
  }
  
  // Cook-Torrance BRDF (Bidirectional Reflectance Distribution Function)
  // Core of PBR lighting calculation
  vec3 cookTorranceBRDF(vec3 N, vec3 V, vec3 L, vec3 albedo, float metallic, float roughness) {
    vec3 H = normalize(V + L);
    
    // Calculate F0 (base reflectance)
    vec3 F0 = vec3(0.04);
    F0 = mix(F0, albedo, metallic);
    
    // Cook-Torrance components
    float NDF = distributionGGX(N, H, roughness);
    float G = geometrySmith(N, V, L, roughness);
    vec3 F = fresnelSchlick(max(dot(H, V), 0.0), F0);
    
    // Specular term
    vec3 numerator = NDF * G * F;
    float denominator = 4.0 * max(dot(N, V), 0.0) * max(dot(N, L), 0.0) + 0.001;
    vec3 specular = numerator / denominator;
    
    // Energy conservation
    vec3 kS = F;
    vec3 kD = vec3(1.0) - kS;
    kD *= 1.0 - metallic;
    
    // Lambertian diffuse
    float NdotL = max(dot(N, L), 0.0);
    vec3 diffuse = kD * albedo / PI;
    
    return (diffuse + specular) * NdotL;
  }
`;

export default PBR_UTILS;
