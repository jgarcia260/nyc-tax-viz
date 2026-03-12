import { readFileSync } from "fs";
import { join } from "path";
import { BudgetViz } from "@/components/BudgetViz";

function loadData() {
  const dollarPath = join(process.cwd(), "data", "dollar-breakdown.json");
  const expensePath = join(process.cwd(), "data", "expense-budget.json");

  const dollarBreakdown = JSON.parse(readFileSync(dollarPath, "utf-8"));
  const expenseBudget = JSON.parse(readFileSync(expensePath, "utf-8"));

  return { dollarBreakdown, expenseBudget };
}

export default function Home() {
  const { dollarBreakdown, expenseBudget } = loadData();

  // Get available fiscal years
  const years = Object.keys(expenseBudget).sort().reverse();

  return (
    <main className="min-h-screen p-6 md:p-12 max-w-7xl mx-auto">
      <header className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          NYC Tax Dollar Visualizer
        </h1>
        <p className="mt-3 text-lg text-zinc-400">
          See how New York City spends its budget — every dollar, every agency.
        </p>
      </header>

      <BudgetViz
        dollarBreakdown={dollarBreakdown}
        expenseBudget={expenseBudget}
        years={years}
      />

      <footer className="mt-16 pt-8 border-t border-zinc-800 text-sm text-zinc-500">
        <p>
          Data from{" "}
          <a
            href="https://data.cityofnewyork.us"
            className="text-blue-400 hover:text-blue-300"
            target="_blank"
            rel="noopener noreferrer"
          >
            NYC Open Data
          </a>{" "}
          — updated annually with each adopted budget.
        </p>
      </footer>
    </main>
  );
}
