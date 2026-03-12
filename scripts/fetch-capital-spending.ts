/**
 * Fetches NYC Capital Budget spending by borough.
 * Data source: Capital Projects Detail (ej8h-3i5w) from NYC Open Data
 */

import { writeFileSync } from "fs";
import { join } from "path";

const SODA_BASE = "https://data.cityofnewyork.us/resource";
const DATA_DIR = join(__dirname, "..", "data");

interface CapitalProject {
  managing_agency_acronym: string;
  managing_agency: string;
  project_id: string;
  project_description: string;
  fy_2025_city_cost: string;
  fy_2025_non_city_cost: string;
  borough_1?: string;
  borough_2?: string;
  borough_3?: string;
}

async function fetchCapitalSpending() {
  console.log("Fetching Capital Projects Budget...");

  // Fetch FY2025 capital projects with borough info
  const res = await fetch(
    `${SODA_BASE}/ej8h-3i5w.json?$limit=10000&$where=fy_2025_city_cost IS NOT NULL`
  );

  const projects: CapitalProject[] = await res.json();

  console.log(`Fetched ${projects.length} capital projects`);

  // Aggregate by borough
  const byBorough: Record<
    string,
    { agencies: Map<string, number>; total: number; projectCount: number }
  > = {
    MANHATTAN: { agencies: new Map(), total: 0, projectCount: 0 },
    BRONX: { agencies: new Map(), total: 0, projectCount: 0 },
    BROOKLYN: { agencies: new Map(), total: 0, projectCount: 0 },
    QUEENS: { agencies: new Map(), total: 0, projectCount: 0 },
    "STATEN ISLAND": { agencies: new Map(), total: 0, projectCount: 0 },
    CITYWIDE: { agencies: new Map(), total: 0, projectCount: 0 },
  };

  for (const proj of projects) {
    const cityCost = parseFloat(proj.fy_2025_city_cost || "0");
    const nonCityCost = parseFloat(proj.fy_2025_non_city_cost || "0");
    const totalCost = cityCost + nonCityCost;

    if (totalCost === 0) continue;

    const boroughs = [proj.borough_1, proj.borough_2, proj.borough_3]
      .filter(Boolean)
      .map((b) => b!.toUpperCase().trim());

    // If no boroughs specified, count as CITYWIDE
    const targetBoroughs = boroughs.length > 0 ? boroughs : ["CITYWIDE"];

    for (const borough of targetBoroughs) {
      if (!byBorough[borough]) {
        byBorough[borough] = { agencies: new Map(), total: 0, projectCount: 0 };
      }

      const data = byBorough[borough];
      data.total += totalCost;
      data.projectCount++;

      const agency = proj.managing_agency || proj.managing_agency_acronym || "Unknown";
      const currentAgencyTotal = data.agencies.get(agency) || 0;
      data.agencies.set(agency, currentAgencyTotal + totalCost);
    }
  }

  // Convert to output format
  const output: Record<
    string,
    { total: number; projectCount: number; topAgencies: { name: string; amount: number }[] }
  > = {};

  for (const [borough, data] of Object.entries(byBorough)) {
    const topAgencies = Array.from(data.agencies.entries())
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10);

    output[borough] = {
      total: data.total,
      projectCount: data.projectCount,
      topAgencies,
    };
  }

  writeFileSync(
    join(DATA_DIR, "capital-spending-by-borough.json"),
    JSON.stringify(output, null, 2)
  );

  console.log("✅ Saved capital spending by borough");
  console.log(
    `Boroughs: ${Object.keys(output)
      .map((b) => `${b} ($${(output[b].total / 1e6).toFixed(1)}M)`)
      .join(", ")}`
  );
}

fetchCapitalSpending().catch(console.error);
