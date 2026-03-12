/**
 * Fetches NYC budget data from the NYC Open Data SODA API.
 * Saves normalized JSON to data/ for static import.
 *
 * Data sources:
 * - "Where the Dollar Comes From and Goes To" (qhm5-h46t)
 * - "Expense Budget" (mwzb-yiwb) — detailed by agency
 */

import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const SODA_BASE = "https://data.cityofnewyork.us/resource";
const DATA_DIR = join(__dirname, "..", "data");

interface DollarRow {
  pub_dt: string;
  fisc_yr: string;
  cm_go_ind: "Comes From" | "Goes To";
  dscrpt: string;
  amt: string;
}

interface ExpenseRow {
  fiscal_year: string;
  agency_name: string;
  agency_number: string;
  adopted_budget_amount: string;
  personal_service_other_than_personal_service_indicator: string;
  object_class_name?: string;
}

async function fetchDollarBreakdown() {
  console.log("Fetching 'Where the Dollar Comes From and Goes To'...");

  const res = await fetch(
    `${SODA_BASE}/qhm5-h46t.json?$limit=500&$order=fisc_yr DESC`
  );
  const rows: DollarRow[] = await res.json();

  // Group by fiscal year
  const byYear: Record<
    string,
    { comesFrom: { description: string; cents: number }[]; goesTo: { description: string; cents: number }[] }
  > = {};

  for (const row of rows) {
    if (!byYear[row.fisc_yr]) {
      byYear[row.fisc_yr] = { comesFrom: [], goesTo: [] };
    }
    const entry = {
      description: row.dscrpt,
      cents: Math.round(parseFloat(row.amt) * 100),
    };
    if (row.cm_go_ind === "Comes From") {
      byYear[row.fisc_yr].comesFrom.push(entry);
    } else {
      byYear[row.fisc_yr].goesTo.push(entry);
    }
  }

  return byYear;
}

async function fetchExpenseBudget() {
  console.log("Fetching Expense Budget by agency...");

  // Get adopted budget amounts grouped by agency for recent fiscal years
  const res = await fetch(
    `${SODA_BASE}/mwzb-yiwb.json?$select=fiscal_year,agency_name,agency_number,sum(adopted_budget_amount) as total_adopted&$group=fiscal_year,agency_name,agency_number&$order=fiscal_year DESC,total_adopted DESC&$limit=500`
  );
  const rows: { fiscal_year: string; agency_name: string; agency_number: string; total_adopted: string }[] =
    await res.json();

  // Group by fiscal year
  const byYear: Record<
    string,
    { agencies: { name: string; number: string; amount: number }[]; total: number }
  > = {};

  for (const row of rows) {
    if (!byYear[row.fiscal_year]) {
      byYear[row.fiscal_year] = { agencies: [], total: 0 };
    }
    const amount = parseFloat(row.total_adopted) || 0;
    byYear[row.fiscal_year].agencies.push({
      name: row.agency_name,
      number: row.agency_number,
      amount,
    });
    byYear[row.fiscal_year].total += amount;
  }

  // Sort agencies by amount descending within each year
  for (const year of Object.values(byYear)) {
    year.agencies.sort((a, b) => b.amount - a.amount);
  }

  return byYear;
}

async function main() {
  mkdirSync(DATA_DIR, { recursive: true });

  const [dollarBreakdown, expenseBudget] = await Promise.all([
    fetchDollarBreakdown(),
    fetchExpenseBudget(),
  ]);

  writeFileSync(
    join(DATA_DIR, "dollar-breakdown.json"),
    JSON.stringify(dollarBreakdown, null, 2)
  );
  console.log(`✅ Saved dollar breakdown (${Object.keys(dollarBreakdown).length} fiscal years)`);

  writeFileSync(
    join(DATA_DIR, "expense-budget.json"),
    JSON.stringify(expenseBudget, null, 2)
  );
  console.log(`✅ Saved expense budget (${Object.keys(expenseBudget).length} fiscal years)`);
}

main().catch(console.error);
