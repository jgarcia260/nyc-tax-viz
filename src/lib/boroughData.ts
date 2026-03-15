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
  coordinates: number[][][];
  properties?: any;
}

export function parseBoroughGeoJSON(geojson: any): BoroughData[] {
  if (!geojson || !geojson.features) {
    return [];
  }

  return geojson.features.map((feature: BoroughFeature) => {
    // Extract borough name from properties (try both formats)
    const name = feature.properties?.BoroName || feature.properties?.boro_name || 'Unknown';
    
    // Get coordinates - handle both MultiPolygon and Polygon types
    let coordinates: number[][][] = [];
    
    if (feature.geometry.type === 'MultiPolygon') {
      // MultiPolygon: take the first polygon (usually the main landmass)
      coordinates = feature.geometry.coordinates[0];
    } else if (feature.geometry.type === 'Polygon') {
      coordinates = feature.geometry.coordinates as any;
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
    color: '#FF6B6B',
    population: 1694251,
    area: 22.83,
    description: 'The economic and cultural heart of NYC'
  },
  'Brooklyn': {
    color: '#4ECDC4',
    population: 2736074,
    area: 69.50,
    description: 'The most populous borough'
  },
  'Queens': {
    color: '#FFE66D',
    population: 2405464,
    area: 108.70,
    description: 'The largest and most diverse borough'
  },
  'Bronx': {
    color: '#95E1D3',
    population: 1472654,
    area: 42.47,
    description: 'The birthplace of hip-hop'
  },
  'Staten Island': {
    color: '#C7CEEA',
    population: 495747,
    area: 57.50,
    description: 'The greenest borough'
  }
};
