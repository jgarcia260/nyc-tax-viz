"use client";

import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface PolicyData {
  billionaireTax: any;
  corporateTax: any;
  improvements: any;
  boroughBreakdown: any;
}

const BOROUGH_COLORS = {
  Manhattan: "#6366f1",
  Brooklyn: "#8b5cf6",
  Queens: "#ec4899",
  Bronx: "#f59e0b",
  StatenIsland: "#14b8a6",
};

export function BoroughImpactMap({ data }: { data: PolicyData }) {
  const [selectedBorough, setSelectedBorough] = useState<string | null>("Manhattan");
  const [selectedPolicy, setSelectedPolicy] = useState<"billionaire" | "corporate">("billionaire");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { boroughBreakdown, improvements, billionaireTax, corporateTax } = data;

  // Calculate borough revenue data
  const boroughData = Object.entries(boroughBreakdown).map(([name, info]: [string, any]) => {
    const share = selectedPolicy === "billionaire" 
      ? info.billionaireTaxShare 
      : info.corporateTaxShare;
    
    const totalRevenue = selectedPolicy === "billionaire"
      ? billionaireTax.revenueProjections.year5
      : corporateTax.revenueProjections.year5;

    return {
      name,
      revenue: totalRevenue * share,
      population: info.population,
      share,
    };
  });

  const selectedBoroughInfo = selectedBorough ? boroughBreakdown[selectedBorough] : null;

  const formatBillions = (value: number) => `$${(value / 1e9).toFixed(2)}B`;
  const formatPopulation = (value: number) => new Intl.NumberFormat().format(value);

  return (
    <div className="space-y-8">
      {/* Policy selector */}
      <div className="flex gap-3">
        <button
          onClick={() => setSelectedPolicy("billionaire")}
          className={`px-6 py-3 rounded-xl font-medium transition-all ${
            selectedPolicy === "billionaire"
              ? "bg-purple-600 text-white shadow-lg shadow-purple-500/30"
              : "bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
          }`}
        >
          Billionaire Tax
        </button>
        <button
          onClick={() => setSelectedPolicy("corporate")}
          className={`px-6 py-3 rounded-xl font-medium transition-all ${
            selectedPolicy === "corporate"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
              : "bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
          }`}
        >
          Corporate Tax
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Borough selector + chart */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h2 className="text-xl font-semibold mb-6">Revenue by Borough</h2>
          
          <div className="w-full" style={{ height: 300 }}>
            {isMounted && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={boroughData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry: any) => `${entry.name}: ${(entry.share * 100).toFixed(1)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="revenue"
                    onClick={(entry: any) => setSelectedBorough(entry.name)}
                  >
                    {boroughData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={BOROUGH_COLORS[entry.name as keyof typeof BOROUGH_COLORS]}
                        opacity={selectedBorough === entry.name ? 1 : 0.6}
                        style={{ cursor: "pointer" }}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#18181b",
                      border: "1px solid #3f3f46",
                      borderRadius: "0.5rem",
                    }}
                    formatter={(value: any) => formatBillions(value as number)}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="mt-6 space-y-2">
            {boroughData
              .sort((a, b) => b.revenue - a.revenue)
              .map((borough) => (
                <button
                  key={borough.name}
                  onClick={() => setSelectedBorough(borough.name)}
                  className={`w-full text-left rounded-xl p-4 transition-all ${
                    selectedBorough === borough.name
                      ? "bg-zinc-800 border-2"
                      : "bg-zinc-900/50 border-2 border-transparent hover:bg-zinc-800/50"
                  }`}
                  style={{
                    borderColor:
                      selectedBorough === borough.name
                        ? BOROUGH_COLORS[borough.name as keyof typeof BOROUGH_COLORS]
                        : "transparent",
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-zinc-100">{borough.name}</p>
                      <p className="text-sm text-zinc-200">
                        Pop: {formatPopulation(borough.population)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-zinc-200">
                        {formatBillions(borough.revenue)}
                      </p>
                      <p className="text-sm text-zinc-500">
                        {(borough.share * 100).toFixed(1)}% of revenue
                      </p>
                    </div>
                  </div>
                </button>
              ))}
          </div>
        </div>

        {/* Selected borough details */}
        <div className="space-y-6">
          {selectedBoroughInfo && (
            <>
              <div
                className="rounded-2xl border-2 p-6"
                style={{
                  borderColor:
                    BOROUGH_COLORS[selectedBorough as keyof typeof BOROUGH_COLORS],
                  backgroundColor: `${BOROUGH_COLORS[selectedBorough as keyof typeof BOROUGH_COLORS]}15`,
                }}
              >
                <h2 className="text-2xl font-bold mb-4">{selectedBorough}</h2>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-zinc-900/50 rounded-xl p-4">
                    <p className="text-xs text-zinc-500 uppercase">Population</p>
                    <p className="text-xl font-bold text-zinc-200">
                      {formatPopulation(selectedBoroughInfo.population)}
                    </p>
                  </div>
                  <div className="bg-zinc-900/50 rounded-xl p-4">
                    <p className="text-xs text-zinc-500 uppercase">Tax Potential</p>
                    <p className="text-xl font-bold text-zinc-200">
                      {formatBillions(selectedBoroughInfo.taxRevenuePotential)}
                    </p>
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-sm font-semibold text-zinc-200 mb-3 uppercase">
                    Revenue Share by Policy
                  </p>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-zinc-300">Billionaire Tax</span>
                        <span className="font-mono text-purple-400">
                          {(selectedBoroughInfo.billionaireTaxShare * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-zinc-800">
                        <div
                          className="h-2 rounded-full bg-purple-500 transition-all"
                          style={{ width: `${selectedBoroughInfo.billionaireTaxShare * 100}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-zinc-300">Corporate Tax</span>
                        <span className="font-mono text-blue-400">
                          {(selectedBoroughInfo.corporateTaxShare * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-zinc-800">
                        <div
                          className="h-2 rounded-full bg-blue-500 transition-all"
                          style={{ width: `${selectedBoroughInfo.corporateTaxShare * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-zinc-200 mb-3 uppercase">
                    Top Priorities for {selectedBorough}
                  </p>
                  <div className="space-y-3">
                    {selectedBoroughInfo.topPriorities.map((key: string, index: number) => {
                      const improvement = improvements[key];
                      return (
                        <div
                          key={key}
                          className="rounded-xl bg-zinc-900/70 p-4 border border-zinc-700/50"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-lg font-bold text-zinc-500">
                                  #{index + 1}
                                </span>
                                <h3 className="font-semibold text-zinc-100">
                                  {improvement.name}
                                </h3>
                              </div>
                              <p className="text-xs text-zinc-200 mt-1">
                                {improvement.description}
                              </p>
                              <p className="text-xs text-emerald-400 mt-2">
                                ✓ {improvement.impact}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-zinc-200">
                                ${(improvement.cost5Year / 1e9).toFixed(1)}B
                              </p>
                              <p className="text-xs text-zinc-500">
                                {improvement.publicSupport} support
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Impact summary */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
                <h3 className="text-lg font-semibold mb-4">What This Means for {selectedBorough}</h3>
                <div className="space-y-3 text-sm text-zinc-300">
                  <p>
                    Under the <span className="font-semibold text-purple-400">
                      {selectedPolicy === "billionaire" ? "Billionaire Tax" : "Corporate Tax Reform"}
                    </span> policy, {selectedBorough} would receive approximately{" "}
                    <span className="font-bold text-zinc-100">
                      {formatBillions(
                        boroughData.find((b) => b.name === selectedBorough)?.revenue || 0
                      )}
                    </span>{" "}
                    in funding over 5 years.
                  </p>
                  <p>
                    This revenue would primarily fund the borough's top priorities:
                    {selectedBoroughInfo.topPriorities.slice(0, 2).map((key: string, i: number) => (
                      <span key={key}>
                        {i === 0 ? " " : " and "}
                        <span className="font-semibold text-zinc-100">
                          {improvements[key].name}
                        </span>
                      </span>
                    ))}
                    .
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
