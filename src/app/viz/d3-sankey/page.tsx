import { readFileSync } from "fs";
import { join } from "path";
import { D3SankeyFlow } from "@/components/viz/D3SankeyFlow";

function loadPolicyData() {
  const policyPath = join(process.cwd(), "data", "tax-policies.json");
  return JSON.parse(readFileSync(policyPath, "utf-8"));
}

export default function D3SankeyPage() {
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
          D3.js Sankey Flow Visualization
        </h1>
        <p className="mt-3 text-lg text-zinc-400">
          Follow the money from tax policy → revenue pool → improvements
        </p>
      </header>

      <div className="mb-6 rounded-xl border border-indigo-500/30 bg-indigo-950/20 p-4">
        <h3 className="font-semibold text-indigo-300 mb-2">📊 Visualization Technique: Sankey Diagram</h3>
        <p className="text-sm text-zinc-300">
          D3.js is the gold standard for custom data visualizations. This Sankey diagram shows proportional flow
          of tax revenue to various improvements. Width of flows = amount of funding.
        </p>
      </div>

      <D3SankeyFlow data={policyData} />

      <div className="mt-8 grid md:grid-cols-3 gap-4 text-sm">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <h4 className="font-semibold text-zinc-200 mb-2">✓ Pros</h4>
          <ul className="space-y-1 text-zinc-400">
            <li>• Highly customizable</li>
            <li>• Beautiful, publication-quality</li>
            <li>• Perfect for flow/process viz</li>
          </ul>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <h4 className="font-semibold text-zinc-200 mb-2">⚠️ Cons</h4>
          <ul className="space-y-1 text-zinc-400">
            <li>• Steeper learning curve</li>
            <li>• More code required</li>
            <li>• Requires D3 expertise</li>
          </ul>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <h4 className="font-semibold text-zinc-200 mb-2">💡 Best For</h4>
          <ul className="space-y-1 text-zinc-400">
            <li>• Complex relationships</li>
            <li>• Flow visualizations</li>
            <li>• Custom interactions</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
