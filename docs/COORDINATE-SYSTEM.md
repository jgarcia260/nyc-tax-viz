# NYC Tax Viz 3D Coordinate System Reference

## Y-Axis Levels

This document defines the canonical Y-axis coordinate system for the NYC Tax Viz 3D scene.

### Primary Y-Axis Levels

1. **Ground Level (Base Plane)**: `y = -0.5`
   - This is the dark base plane mesh that represents the ground
   - Defined in `BoroughMap3DUnified.tsx` Scene component
   - PlaneGeometry positioned at `[0, -0.5, 0]`

2. **Land Surface (Top of Borough Mesh)**: `y = 1.5` to `y = 2`
   - Borough land meshes are extruded upward from ground level
   - Extrusion depth: 2 units (bevel adds ~0.3-0.5 units)
   - Top surface is approximately at `y = 1.5` to `y = 2`
   - **This is the level where buildings and landmarks should sit**

3. **Building Base Level**: `y = 2`
   - Buildings are positioned at `y = 2 + buildingHeight/2`
   - Defined in `BoroughBuildings` component
   - Building heights vary by borough and centrality

### Coordinate Projection

- **Center Point**: `{ lng: -73.978, lat: 40.706 }` (NYC center)
- **Scale Factor**: `400` (lat/lng degrees → 3D units)
- **X-axis**: `(lng - NYC_CENTER_LNG) * 400`
- **Z-axis**: `-(lat - NYC_CENTER_LAT) * 400` (note: negated for proper orientation)

### Borough Reference Points (Approximate Centers)

#### Manhattan
- Center: `{ lat: 40.758, lng: -73.985 }`
- 3D Position: `{ x: -2.8, z: -20.8 }`
- Land Level: `y = 2`

#### Brooklyn
- Center: `{ lat: 40.650, lng: -73.950 }`
- 3D Position: `{ x: 11.2, z: 22.4 }`
- Land Level: `y = 2`

#### Queens
- Center: `{ lat: 40.728, lng: -73.794 }`
- 3D Position: `{ x: 73.6, z: -8.8 }`
- Land Level: `y = 2`

#### Bronx
- Center: `{ lat: 40.843, lng: -73.865 }`
- 3D Position: `{ x: 45.2, z: -54.8 }`
- Land Level: `y = 2`

#### Staten Island
- Center: `{ lat: 40.579, lng: -74.150 }`
- 3D Position: `{ x: -68.8, z: 50.8 }`
- Land Level: `y = 2`

## Landmark Positioning Rules

**All landmarks should be positioned at land surface level:**

```typescript
// Correct landmark Y-position
const LAND_SURFACE_Y = 2;
position={[x, LAND_SURFACE_Y, -y]}

// Then add height/floating offset within the landmark component
// NOT at the group level
```

### Known Landmarks

1. **Empire State Building**
   - Lat/Lng: `40.7484, -73.9857`
   - 3D Position: `{ x: -3.08, z: -16.96 }`
   - Base Y: `2` (land surface)
   - Display Height: `8` (visual representation)

2. **Unisphere**
   - Lat/Lng: `40.7478, -73.8458`
   - 3D Position: `{ x: 52.84, z: -16.72 }`
   - Base Y: `2` (land surface)
   - Display Height: `4` (visual representation)

3. **Statue of Liberty**
   - Lat/Lng: `40.6892, -74.0445`
   - 3D Position: `{ x: -26.6, z: 6.72 }`
   - Base Y: `2` (land surface)
   - Display Height: `5` (visual representation)

## Usage Guidelines

### Adding New Landmarks

```typescript
const { x, y } = projectCoordinate(landmark.lat, landmark.lng);
const LAND_SURFACE_Y = 2;

<group position={[x, LAND_SURFACE_Y, -y]}>
  {/* Landmark geometry - build upward from here */}
</group>
```

### Adding New Buildings

```typescript
// Buildings use the same base level
const Y_BASE = 2;
dummy.position.set(building.x, Y_BASE + building.height / 2, -building.y);
```

### Floating/Animated Elements

For elements that float above the surface (like landmark animations):

```typescript
// Base position at land surface
<group position={[x, LAND_SURFACE_Y, -y]}>
  {/* Inner group for floating animation */}
  <group position={[0, floatingOffset, 0]}>
    {/* Landmark geometry */}
  </group>
</group>
```

## Common Pitfalls

❌ **Don't:** Add landmark height to the base Y position
```typescript
// WRONG
position={[x, landmark.height + 1.5, -y]}
```

✅ **Do:** Position at land surface, build geometry upward
```typescript
// CORRECT
position={[x, 2, -y]}
```

## Future Extensions

When adding new elements to the scene:
1. Check this document for Y-axis levels
2. Position elements at `y = 2` (land surface) by default
3. Build geometry upward from that base
4. Document any new coordinate conventions here

---

**Last Updated**: 2026-03-16
**Maintained by**: Verne (AI Flow Task 9c3e03e0-fa06-408e-91a0-86e2ec645a4f)
