import { readFileSync } from "fs";
import { join } from "path";
import { RechartsFixed } from "@/components/viz/RechartsFixed";

function loadPolicyData() {
  const policyPath = join(process.cwd(), "data", "tax-policies.json");
  return JSON.parse(readFileSync(policyPath, "utf-8"));
}

export default function RechartsPage() {
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
          Recharts Visualization
        </h1>
        <p className="mt-3 text-lg text-zinc-400">
          React-native charting library for declarative, composable visualizations
        </p>
      </header>

      <div className="mb-6 rounded-xl border border-indigo-500/30 bg-indigo-950/20 p-4">
        <h3 className="font-semibold text-indigo-300 mb-2">📊 Visualization Technique: Recharts</h3>
        <p className="text-sm text-zinc-300">
          Recharts is built specifically for React. It uses a declarative, component-based API that feels
          natural to React developers. SVG-based rendering provides sharp, scalable visuals.
        </p>
      </div>

      <RechartsFixed data={policyData} />

      <div className="mt-8 grid md:grid-cols-3 gap-4 text-sm">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <h4 className="font-semibold text-zinc-200 mb-2">✓ Pros</h4>
          <ul className="space-y-1 text-zinc-400">
            <li>• React-native (feels natural)</li>
            <li>• Declarative API</li>
            <li>• Composable components</li>
            <li>• Good documentation</li>
          </ul>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <h4 className="font-semibold text-zinc-200 mb-2">⚠️ Cons</h4>
          <ul className="space-y-1 text-zinc-400">
            <li>• Limited chart types</li>
            <li>• Less flexible than D3</li>
            <li>• SSR can be tricky</li>
          </ul>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <h4 className="font-semibold text-zinc-200 mb-2">💡 Best For</h4>
          <ul className="space-y-1 text-zinc-400">
            <li>• React projects</li>
            <li>• Standard charts</li>
            <li>• Quick implementation</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
