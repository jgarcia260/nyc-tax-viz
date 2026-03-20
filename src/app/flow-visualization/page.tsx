import { readFileSync } from "fs";
import { join } from "path";
import { FlowVisualization } from "@/components/FlowVisualization";

function loadPolicyData() {
  const policyPath = join(process.cwd(), "data", "tax-policies.json");
  return JSON.parse(readFileSync(policyPath, "utf-8"));
}

export default function FlowVisualizationPage() {
  const policyData = loadPolicyData();

  return (
    <main className="min-h-screen p-6 md:p-12 max-w-7xl mx-auto">
      <header className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <a
            href="/"
            className="text-zinc-200 hover:text-zinc-200 transition-colors"
          >
            ← Back to Overview
          </a>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          Tax Revenue Flow
        </h1>
        <p className="mt-3 text-lg text-zinc-200">
          Follow the money: From tax policy to revenue to real improvements
        </p>
      </header>

      <FlowVisualization data={policyData} />
    </main>
  );
}
