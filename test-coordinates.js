const fs = require('fs');

const geojson = JSON.parse(fs.readFileSync('public/borough-boundaries.geojson', 'utf8'));

const NYC_CENTER_LON = -73.978;
const NYC_CENTER_LAT = 40.706;
const SCALE = 400;

console.log('Borough Transformed Centroids (should be well separated):');
console.log('='.repeat(60));

geojson.features.forEach(feature => {
  const name = feature.properties.BoroName || feature.properties.boro_name;
  const coords = feature.geometry.coordinates;
  
  // Collect all points
  let points = [];
  
  function collectPoints(coordArray, depth = 0) {
    if (depth === 3) {
      points.push(coordArray);
    } else {
      coordArray.forEach(item => collectPoints(item, depth + 1));
    }
  }
  
  collectPoints(coords);
  
  // Calculate centroid
  const sumLon = points.reduce((sum, p) => sum + p[0], 0);
  const sumLat = points.reduce((sum, p) => sum + p[1], 0);
  const centroidLon = sumLon / points.length;
  const centroidLat = sumLat / points.length;
  
  // Transform to 3D coordinates
  const x = (centroidLon - NYC_CENTER_LON) * SCALE;
  const y = (centroidLat - NYC_CENTER_LAT) * SCALE;
  
  console.log(`${name.padEnd(15)} | Lat/Lon: [${centroidLon.toFixed(3)}, ${centroidLat.toFixed(3)}] -> 3D: [${x.toFixed(1)}, ${y.toFixed(1)}]`);
});

console.log('\nExpected positions (relative to NYC center):');
console.log('- Staten Island: Southwest (negative x, negative y)');
console.log('- Brooklyn: South-Central (small negative x, small negative y)');
console.log('- Manhattan: Center (near 0, small positive y)');
console.log('- Queens: East (positive x, small negative y)');
console.log('- Bronx: Northeast (positive x, positive y)');
