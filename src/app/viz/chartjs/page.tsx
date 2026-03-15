import { readFileSync } from "fs";
import { join } from "path";
import { ChartJsComparison } from "@/components/viz/ChartJsComparison";

function loadPolicyData() {
  const policyPath = join(process.cwd(), "data", "tax-policies.json");
  return JSON.parse(readFileSync(policyPath, "utf-8"));
}

export default function ChartJsPage() {
  const policyData = loadPolicyData();

  return (
    <main className="min-h-screen p-6 md:p-12 max-w-7xl mx-auto">
      <header className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <a
            href="/"
            className="text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            ← Back to Overview
          </a>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          Chart.js Visualization
        </h1>
        <p className="mt-3 text-lg text-zinc-400">
          Simple, clean charts for policy comparison and improvement costs
        </p>
      </header>

      <div className="mb-6 rounded-xl border border-blue-500/30 bg-blue-950/20 p-4">
        <h3 className="font-semibold text-blue-300 mb-2">📊 Visualization Technique: Chart.js</h3>
        <p className="text-sm text-zinc-300">
          Chart.js is a simple, flexible charting library. Great for standard chart types (line, bar, pie).
          Canvas-based rendering provides smooth animations and good performance.
        </p>
      </div>

      <ChartJsComparison data={policyData} />

      <div className="mt-8 grid md:grid-cols-3 gap-4 text-sm">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <h4 className="font-semibold text-zinc-200 mb-2">✓ Pros</h4>
          <ul className="space-y-1 text-zinc-400">
            <li>• Very easy to use</li>
            <li>• Fast setup</li>
            <li>• Good documentation</li>
            <li>• Built-in responsiveness</li>
          </ul>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <h4 className="font-semibold text-zinc-200 mb-2">⚠️ Cons</h4>
          <ul className="space-y-1 text-zinc-400">
            <li>• Limited to standard charts</li>
            <li>• Less customization</li>
            <li>• Canvas (not SVG)</li>
          </ul>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <h4 className="font-semibold text-zinc-200 mb-2">💡 Best For</h4>
          <ul className="space-y-1 text-zinc-400">
            <li>• Quick dashboards</li>
            <li>• Standard chart types</li>
            <li>• Simple data viz</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
