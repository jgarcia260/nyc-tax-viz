"use client";

import { useState } from "react";

interface PolicyData {
  billionaireTax: any;
  corporateTax: any;
  improvements: any;
  boroughBreakdown: any;
}

export function FlowVisualization({ data }: { data: PolicyData }) {
  const [selectedPolicy, setSelectedPolicy] = useState<"billionaire" | "corporate">("billionaire");
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const { billionaireTax, corporateTax, improvements } = data;

  const policy = selectedPolicy === "billionaire" ? billionaireTax : corporateTax;
  const totalRevenue = policy.revenueProjections.year5;

  // Calculate how much each improvement gets (proportional to cost)
  const totalImprovementCost = Object.values(improvements).reduce(
    (sum: number, imp: any) => sum + imp.cost5Year,
    0
  );

  const improvementAllocations = Object.entries(improvements).map(([key, imp]: [string, any]) => ({
    key,
    name: imp.name,
    allocation: (imp.cost5Year / totalImprovementCost) * totalRevenue,
    cost: imp.cost5Year,
    impact: imp.impact,
    priority: imp.priority,
  }));

  const formatBillions = (value: number) => `$${(value / 1e9).toFixed(1)}B`;

  return (
    <div className="space-y-8">
      {/* Policy selector */}
      <div className="flex gap-3">
        <button
          onClick={() => setSelectedPolicy("billionaire")}
          className={`px-6 py-3 rounded-xl font-medium transition-all ${
            selectedPolicy === "billionaire"
              ? "bg-purple-600 text-white shadow-lg shadow-purple-500/30"
              : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
          }`}
        >
          Billionaire Tax
        </button>
        <button
          onClick={() => setSelectedPolicy("corporate")}
          className={`px-6 py-3 rounded-xl font-medium transition-all ${
            selectedPolicy === "corporate"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
              : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
          }`}
        >
          Corporate Tax
        </button>
      </div>

      {/* Flow visualization */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Stage 1: Tax Source */}
          <div className="mb-12">
            <p className="text-sm text-zinc-500 uppercase mb-4 text-center">
              Step 1: Tax Policy
            </p>
            <div
              className={`max-w-md mx-auto rounded-2xl p-6 ${
                selectedPolicy === "billionaire"
                  ? "bg-purple-950/30 border-2 border-purple-500/50"
                  : "bg-blue-950/30 border-2 border-blue-500/50"
              }`}
              onMouseEnter={() => setHoveredNode("policy")}
              onMouseLeave={() => setHoveredNode(null)}
            >
              <h3 className="text-2xl font-bold mb-2 text-center">
                {policy.name}
              </h3>
              <p className="text-sm text-zinc-400 text-center mb-4">
                {policy.description}
              </p>
              <div className="text-center">
                <p className="text-sm text-zinc-500">5-Year Revenue</p>
                <p className="text-4xl font-bold text-white">
                  {formatBillions(totalRevenue)}
                </p>
              </div>
            </div>
          </div>

          {/* Arrow down */}
          <div className="flex justify-center mb-12">
            <svg width="2" height="60" className="opacity-50">
              <line
                x1="1"
                y1="0"
                x2="1"
                y2="60"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="4,4"
              />
              <polygon points="0,60 1,52 2,60" fill="currentColor" />
            </svg>
          </div>

          {/* Stage 2: Revenue Pool */}
          <div className="mb-12">
            <p className="text-sm text-zinc-500 uppercase mb-4 text-center">
              Step 2: Revenue Collected
            </p>
            <div
              className="max-w-md mx-auto rounded-2xl bg-zinc-800/50 border-2 border-zinc-700 p-6"
              onMouseEnter={() => setHoveredNode("revenue")}
              onMouseLeave={() => setHoveredNode(null)}
            >
              <h3 className="text-xl font-bold mb-2 text-center text-emerald-400">
                NYC Revenue Pool
              </h3>
              <div className="text-center">
                <p className="text-5xl font-bold text-white">
                  {formatBillions(totalRevenue)}
                </p>
                <p className="text-sm text-zinc-500 mt-2">
                  Available for improvements over 5 years
                </p>
              </div>
            </div>
          </div>

          {/* Arrows to improvements */}
          <div className="flex justify-center mb-8">
            <div className="flex gap-4">
              {improvementAllocations.slice(0, 5).map((_, i) => (
                <svg key={i} width="2" height="60" className="opacity-30">
                  <line
                    x1="1"
                    y1="0"
                    x2="1"
                    y2="60"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeDasharray="4,4"
                  />
                  <polygon points="0,60 1,52 2,60" fill="currentColor" />
                </svg>
              ))}
            </div>
          </div>

          {/* Stage 3: Improvements */}
          <div>
            <p className="text-sm text-zinc-500 uppercase mb-4 text-center">
              Step 3: Funded Improvements
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {improvementAllocations
                .sort((a, b) => a.priority - b.priority)
                .map((imp, index) => {
                  const percentage = (imp.allocation / totalRevenue) * 100;
                  const isHovered = hoveredNode === imp.key;
                  
                  return (
                    <div
                      key={imp.key}
                      className={`rounded-xl p-5 transition-all cursor-pointer ${
                        isHovered
                          ? "bg-indigo-900/50 border-2 border-indigo-500 scale-105"
                          : "bg-zinc-800/50 border-2 border-zinc-700 hover:border-zinc-600"
                      }`}
                      onMouseEnter={() => setHoveredNode(imp.key)}
                      onMouseLeave={() => setHoveredNode(null)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-2xl font-bold text-zinc-600">
                          #{imp.priority}
                        </span>
                        <span className="text-xs bg-zinc-900/50 px-2 py-1 rounded">
                          {percentage.toFixed(1)}%
                        </span>
                      </div>
                      
                      <h4 className="font-bold text-lg mb-2 text-zinc-100">
                        {imp.name}
                      </h4>
                      
                      <div className="mb-3">
                        <p className="text-sm text-zinc-500">Funding</p>
                        <p className="text-2xl font-bold text-emerald-400">
                          {formatBillions(imp.allocation)}
                        </p>
                      </div>

                      <div className="h-2 rounded-full bg-zinc-900/50 mb-3">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all"
                          style={{ width: `${Math.min(percentage * 5, 100)}%` }}
                        />
                      </div>

                      <p className="text-xs text-zinc-400 mb-2">
                        ✓ {imp.impact}
                      </p>

                      <div className="text-xs text-zinc-500">
                        Total need: {formatBillions(imp.cost)}
                      </div>

                      {imp.allocation < imp.cost && (
                        <div className="mt-2 text-xs text-amber-500">
                          ⚠ Partially funded ({((imp.allocation / imp.cost) * 100).toFixed(0)}%)
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Summary */}
          <div className="mt-12 rounded-xl border border-zinc-800 bg-zinc-900/30 p-6">
            <h3 className="text-lg font-semibold mb-4">Funding Analysis</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-zinc-500">Total Revenue</p>
                <p className="text-xl font-bold text-white">
                  {formatBillions(totalRevenue)}
                </p>
              </div>
              <div>
                <p className="text-zinc-500">Total Improvement Needs</p>
                <p className="text-xl font-bold text-white">
                  {formatBillions(totalImprovementCost)}
                </p>
              </div>
              <div>
                <p className="text-zinc-500">Coverage</p>
                <p className="text-xl font-bold text-emerald-400">
                  {((totalRevenue / totalImprovementCost) * 100).toFixed(0)}%
                </p>
              </div>
            </div>
            
            {totalRevenue < totalImprovementCost && (
              <div className="mt-4 text-sm text-amber-400">
                ⚠ This policy covers {((totalRevenue / totalImprovementCost) * 100).toFixed(0)}% 
                of identified improvement needs. Additional revenue sources or prioritization required.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
