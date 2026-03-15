const fs = require('fs');

const geojson = JSON.parse(fs.readFileSync('public/borough-boundaries.geojson', 'utf8'));

let minLon = Infinity, maxLon = -Infinity;
let minLat = Infinity, maxLat = -Infinity;

geojson.features.forEach(feature => {
  const coords = feature.geometry.coordinates;
  
  function processCoords(coordArray, depth = 0) {
    if (depth === 3) {
      // We're at a point [lon, lat]
      const [lon, lat] = coordArray;
      minLon = Math.min(minLon, lon);
      maxLon = Math.max(maxLon, lon);
      minLat = Math.min(minLat, lat);
      maxLat = Math.max(maxLat, lat);
    } else {
      coordArray.forEach(item => processCoords(item, depth + 1));
    }
  }
  
  processCoords(coords);
});

console.log('Bounding Box:');
console.log(`  Longitude: ${minLon} to ${maxLon} (range: ${maxLon - minLon})`);
console.log(`  Latitude:  ${minLat} to ${maxLat} (range: ${maxLat - minLat})`);
console.log(`  Center:    [${(minLon + maxLon) / 2}, ${(minLat + maxLat) / 2}]`);

// Also show each borough's bounds
geojson.features.forEach(feature => {
  const name = feature.properties.BoroName || feature.properties.boro_name;
  let bMinLon = Infinity, bMaxLon = -Infinity;
  let bMinLat = Infinity, bMaxLat = -Infinity;
  
  const coords = feature.geometry.coordinates;
  
  function processCoords(coordArray, depth = 0) {
    if (depth === 3) {
      const [lon, lat] = coordArray;
      bMinLon = Math.min(bMinLon, lon);
      bMaxLon = Math.max(bMaxLon, lon);
      bMinLat = Math.min(bMinLat, lat);
      bMaxLat = Math.max(bMaxLat, lat);
    } else {
      coordArray.forEach(item => processCoords(item, depth + 1));
    }
  }
  
  processCoords(coords);
  
  console.log(`\n${name}:`);
  console.log(`  Lon: ${bMinLon.toFixed(4)} to ${bMaxLon.toFixed(4)}`);
  console.log(`  Lat: ${bMinLat.toFixed(4)} to ${bMaxLat.toFixed(4)}`);
  console.log(`  Center: [${((bMinLon + bMaxLon) / 2).toFixed(4)}, ${((bMinLat + bMaxLat) / 2).toFixed(4)}]`);
});
