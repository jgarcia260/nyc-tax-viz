const fs = require('fs');

// Load and parse borough data
const geojson = JSON.parse(fs.readFileSync('public/borough-boundaries.geojson', 'utf8'));

console.log('=== Borough Data Test ===\n');

if (!geojson || !geojson.features) {
  console.error('❌ Invalid GeoJSON!');
  process.exit(1);
}

console.log(`✓ Loaded ${geojson.features.length} features\n`);

let allValid = true;

geojson.features.forEach((feature, idx) => {
  const name = feature.properties?.BoroName || 'Unknown';
  const type = feature.geometry?.type;
  
  console.log(`${idx + 1}. ${name}`);
  console.log(`   Type: ${type}`);
  
  if (type === 'MultiPolygon') {
    const polygons = feature.geometry.coordinates;
    console.log(`   Polygons: ${polygons.length}`);
    
    if (polygons.length === 0) {
      console.error(`   ❌ No polygons!`);
      allValid = false;
    } else {
      let totalRings = 0;
      let totalPoints = 0;
      
      polygons.forEach((polygon, polyIdx) => {
        if (!polygon || polygon.length === 0) {
          console.error(`   ❌ Empty polygon at index ${polyIdx}`);
          allValid = false;
          return;
        }
        
        totalRings += polygon.length;
        
        polygon.forEach((ring, ringIdx) => {
          if (!ring || ring.length === 0) {
            console.error(`   ❌ Empty ring at polygon ${polyIdx}, ring ${ringIdx}`);
            allValid = false;
            return;
          }
          
          totalPoints += ring.length;
          
          // Check first point format
          const firstPoint = ring[0];
          if (!firstPoint || firstPoint.length < 2) {
            console.error(`   ❌ Invalid first point in polygon ${polyIdx}, ring ${ringIdx}:`, firstPoint);
            allValid = false;
          }
        });
      });
      
      console.log(`   Total Rings: ${totalRings}`);
      console.log(`   Total Points: ${totalPoints}`);
      
      if (totalPoints > 0) {
        const firstPoint = polygons[0][0][0];
        const x = (firstPoint[0] + 74.0) * 100;
        const y = (firstPoint[1] - 40.7) * 100;
        console.log(`   First Point: [${firstPoint[0].toFixed(4)}, ${firstPoint[1].toFixed(4)}] -> [${x.toFixed(2)}, ${y.toFixed(2)}]`);
        console.log(`   ✓ Valid data structure`);
      }
    }
  } else {
    console.error(`   ❌ Unexpected geometry type: ${type}`);
    allValid = false;
  }
  
  console.log('');
});

if (allValid) {
  console.log('✅ All borough data is valid!');
  process.exit(0);
} else {
  console.log('❌ Some borough data is invalid!');
  process.exit(1);
}
