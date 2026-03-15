export interface BoroughFeature {
  type: string;
  properties: {
    BoroName?: string;
    boro_name?: string;
    BoroCode?: number;
    boro_code?: string;
    Shape_Area?: number;
    shape_area?: number;
    Shape_Leng?: number;
    shape_leng?: number;
  };
  geometry: {
    type: string;
    coordinates: number[][][][];
  };
}

export interface BoroughData {
  name: string;
  coordinates: number[][][][]; // Array of polygons, each polygon is array of rings
  properties?: any;
}

export function parseBoroughGeoJSON(geojson: any): BoroughData[] {
  if (!geojson || !geojson.features) {
    console.error('[parseBoroughGeoJSON] Invalid GeoJSON:', geojson);
    return [];
  }

  console.log(`[parseBoroughGeoJSON] Parsing ${geojson.features.length} features`);

  return geojson.features.map((feature: BoroughFeature) => {
    // Extract borough name from properties (try both formats)
    const name = feature.properties?.BoroName || feature.properties?.boro_name || 'Unknown';
    
    console.log(`[parseBoroughGeoJSON] Processing borough: ${name}, type: ${feature.geometry?.type}`);
    
    // Get coordinates - handle both MultiPolygon and Polygon types
    let coordinates: number[][][][] = [];
    
    if (feature.geometry.type === 'MultiPolygon') {
      // MultiPolygon: array of polygons, each polygon is an array of rings
      coordinates = feature.geometry.coordinates;
      console.log(`[parseBoroughGeoJSON] ${name} has ${coordinates.length} polygon(s)`);
    } else if (feature.geometry.type === 'Polygon') {
      // Polygon: single polygon, wrap in array to match MultiPolygon structure
      coordinates = [feature.geometry.coordinates as any];
      console.log(`[parseBoroughGeoJSON] ${name} is a Polygon with ${coordinates[0].length} ring(s)`);
    }

    if (coordinates.length === 0) {
      console.error(`[parseBoroughGeoJSON] No coordinates for ${name}!`);
    }

    return {
      name,
      coordinates,
      properties: feature.properties
    };
  });
}

// Borough metadata
export const BOROUGH_INFO: Record<string, {
  color: string;
  population: number;
  area: number;
  description: string;
}> = {
  'Manhattan': {
    color: '#E63946',
    population: 1694251,
    area: 22.83,
    description: 'The economic and cultural heart of NYC'
  },
  'Brooklyn': {
    color: '#2A9D8F',
    population: 2736074,
    area: 69.50,
    description: 'The most populous borough'
  },
  'Queens': {
    color: '#E9C46A',
    population: 2405464,
    area: 108.70,
    description: 'The largest and most diverse borough'
  },
  'Bronx': {
    color: '#6A4C93',
    population: 1472654,
    area: 42.47,
    description: 'The birthplace of hip-hop'
  },
  'Staten Island': {
    color: '#F77F00',
    population: 495747,
    area: 57.50,
    description: 'The greenest borough'
  }
};
