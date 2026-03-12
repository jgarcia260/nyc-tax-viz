/**
 * Add estimated spending to borough data based on facility counts.
 * This is a proxy estimate - more facilities ≈ more capital spending.
 */

import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const DATA_DIR = join(__dirname, "..", "data");

// Domain-based cost multipliers (estimated)
const DOMAIN_WEIGHTS: Record<string, number> = {
  "HEALTH AND HUMAN SERVICES": 2.5, // Hospitals, clinics - high cost
  "CORE INFRASTRUCTURE AND TRANSPORTATION": 3.0, // Bridges, roads - highest cost
  "EDUCATION, CHILD WELFARE, AND YOUTH": 2.0, // Schools - high cost
  "PUBLIC SAFETY, EMERGENCY SERVICES, AND ADMINISTRATION OF JUSTICE": 1.8, // Precincts, fire stations
  "PARKS, GARDENS, AND HISTORICAL SITES": 1.0, // Parks - lower cost
  "LIBRARIES AND CULTURAL PROGRAMS": 1.2, // Libraries - moderate cost
};

interface Domain {
  name: string;
  count: number;
}

interface BoroughData {
  totalFacilities: number;
  domains: Domain[];
  facilities: any[];
}

function main() {
  // Load facilities data
  const facilitiesPath = join(DATA_DIR, "facilities-by-borough.json");
  const facilities: Record<string, BoroughData> = JSON.parse(
    readFileSync(facilitiesPath, "utf-8")
  );

  // Load expense budget to get total spending baseline
  const expensePath = join(DATA_DIR, "expense-budget.json");
  const expenseBudget: Record<string, { total: number }> = JSON.parse(
    readFileSync(expensePath, "utf-8")
  );

  // Use FY2024 total as baseline (most recent with complete data)
  const totalBudget = expenseBudget["2024"]?.total || 309_138_689_352;

  // Rough estimate: ~15-20% of budget is capital spending
  const estimatedCapitalBudget = totalBudget * 0.18; // $55B estimate

  // Calculate weighted facility counts per borough
  const boroughWeights: Record<string, number> = {};
  let totalWeight = 0;

  for (const [borough, data] of Object.entries(facilities)) {
    let weight = 0;
    for (const domain of data.domains) {
      const multiplier = DOMAIN_WEIGHTS[domain.name] || 1.0;
      weight += domain.count * multiplier;
    }
    boroughWeights[borough] = weight;
    totalWeight += weight;
  }

  // Distribute capital budget proportionally
  const boroughEstimates: Record<
    string,
    {
      estimatedAnnualSpending: number;
      estimatedPerFacility: number;
      facilityCount: number;
      topDomains: { name: string; count: number }[];
    }
  > = {};

  for (const [borough, data] of Object.entries(facilities)) {
    const boroughShare = boroughWeights[borough] / totalWeight;
    const estimatedSpending = estimatedCapitalBudget * boroughShare;
    const perFacility = estimatedSpending / data.totalFacilities;

    boroughEstimates[borough] = {
      estimatedAnnualSpending: Math.round(estimatedSpending),
      estimatedPerFacility: Math.round(perFacility),
      facilityCount: data.totalFacilities,
      topDomains: data.domains.slice(0, 3),
    };
  }

  // Merge estimates into facilities data
  const updatedFacilities: Record<string, any> = {};
  for (const [borough, data] of Object.entries(facilities)) {
    updatedFacilities[borough] = {
      ...data,
      spending: boroughEstimates[borough],
    };
  }

  // Save updated data
  writeFileSync(facilitiesPath, JSON.stringify(updatedFacilities, null, 2));

  console.log("✅ Added borough spending estimates:");
  console.log("");
  for (const [borough, est] of Object.entries(boroughEstimates)) {
    const billions = est.estimatedAnnualSpending / 1e9;
    console.log(
      `${borough.padEnd(15)} $${billions.toFixed(2)}B  (${est.facilityCount.toLocaleString()} facilities)`
    );
  }
  console.log("");
  console.log(`Total estimated capital: $${(estimatedCapitalBudget / 1e9).toFixed(1)}B`);
  console.log("Note: Estimates based on facility counts × domain weights");
}

main();
