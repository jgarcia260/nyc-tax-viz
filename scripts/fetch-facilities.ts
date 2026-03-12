/**
 * Fetches NYC facilities data grouped by borough + domain for map visualization.
 * Source: NYC Facilities Database (ji82-xba5)
 */

import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const DATA_DIR = join(__dirname, "..", "data");

interface FacilityRow {
  facname: string;
  facdomain: string;
  facgroup: string;
  boro: string;
  latitude: string;
  longitude: string;
  opname: string;
}

async function fetchFacilities() {
  console.log("Fetching NYC facilities by borough...");

  // Get count per borough and domain
  const res = await fetch(
    `https://data.cityofnewyork.us/resource/ji82-xba5.json?$select=boro,facdomain,count(*) as count&$group=boro,facdomain&$order=count DESC&$limit=200`
  );
  const rows: { boro: string; facdomain: string; count: string }[] = await res.json();

  // Also get sample facilities with coordinates for map markers
  const facilitiesRes = await fetch(
    `https://data.cityofnewyork.us/resource/ji82-xba5.json?$select=facname,facdomain,facgroup,boro,latitude,longitude&$where=latitude IS NOT NULL&$limit=2000&$order=facdomain`
  );
  const facilities: FacilityRow[] = await facilitiesRes.json();

  // Group by borough
  const byBorough: Record<string, {
    domains: { name: string; count: number }[];
    totalFacilities: number;
    facilities: { name: string; domain: string; lat: number; lng: number }[];
  }> = {};

  for (const row of rows) {
    if (!row.boro || row.boro === "0") continue;
    if (!byBorough[row.boro]) {
      byBorough[row.boro] = { domains: [], totalFacilities: 0, facilities: [] };
    }
    const count = parseInt(row.count);
    byBorough[row.boro].domains.push({ name: row.facdomain, count });
    byBorough[row.boro].totalFacilities += count;
  }

  // Add sample facilities (limit per borough for perf)
  for (const fac of facilities) {
    if (!fac.boro || !byBorough[fac.boro]) continue;
    if (byBorough[fac.boro].facilities.length >= 200) continue;
    byBorough[fac.boro].facilities.push({
      name: fac.facname,
      domain: fac.facdomain,
      lat: parseFloat(fac.latitude),
      lng: parseFloat(fac.longitude),
    });
  }

  return byBorough;
}

async function main() {
  mkdirSync(DATA_DIR, { recursive: true });
  const data = await fetchFacilities();
  writeFileSync(join(DATA_DIR, "facilities-by-borough.json"), JSON.stringify(data, null, 2));
  console.log(`✅ Saved facilities data (${Object.keys(data).length} boroughs)`);
}

main().catch(console.error);
