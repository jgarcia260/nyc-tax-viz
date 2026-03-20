import { readFileSync } from "fs";
import { join } from "path";
import { BoroughImpactMap } from "@/components/BoroughImpactMap";

function loadPolicyData() {
  const policyPath = join(process.cwd(), "data", "tax-policies.json");
  return JSON.parse(readFileSync(policyPath, "utf-8"));
}

export default function BoroughImpactPage() {
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
          Borough Impact Map
        </h1>
        <p className="mt-3 text-lg text-zinc-200">
          See how tax revenue flows through each NYC borough and funds local improvements
        </p>
      </header>

      <BoroughImpactMap data={policyData} />
    </main>
  );
}
