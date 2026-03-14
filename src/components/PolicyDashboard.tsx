"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

interface PolicyData {
  billionaireTax: any;
  corporateTax: any;
  improvements: any;
}

export function PolicyDashboard({ data }: { data: PolicyData }) {
  const [selectedPolicy, setSelectedPolicy] = useState<"billionaire" | "corporate" | "both">("both");

  const { billionaireTax, corporateTax, improvements } = data;

  // Revenue projection data for chart
  const revenueData = [
    {
      year: "Year 1",
      billionaire: billionaireTax.revenueProjections.year1 / 1e9,
      corporate: corporateTax.revenueProjections.year1 / 1e9,
    },
    {
      year: "Year 3",
      billionaire: billionaireTax.revenueProjections.year3 / 1e9,
      corporate: corporateTax.revenueProjections.year3 / 1e9,
    },
    {
      year: "Year 5",
      billionaire: billionaireTax.revenueProjections.year5 / 1e9,
      corporate: corporateTax.revenueProjections.year5 / 1e9,
    },
  ];

  // Improvement costs data
  const improvementData = Object.entries(improvements).map(([key, value]: [string, any]) => ({
    name: value.name,
    cost: value.cost5Year / 1e9,
    support: parseInt(value.publicSupport),
  }));

  const formatBillions = (value: number) => `$${value.toFixed(1)}B`;

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
        <button
          onClick={() => setSelectedPolicy("both")}
          className={`px-6 py-3 rounded-xl font-medium transition-all ${
            selectedPolicy === "both"
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
              : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
          }`}
        >
          Compare Both
        </button>
      </div>

      {/* Side-by-side comparison */}
      <div className="grid md:grid-cols-2 gap-6">
        {(selectedPolicy === "billionaire" || selectedPolicy === "both") && (
          <div className="rounded-2xl border border-purple-500/30 bg-purple-950/20 p-6">
            <h2 className="text-2xl font-bold mb-2 text-purple-300">
              {billionaireTax.name}
            </h2>
            <p className="text-zinc-400 mb-6">{billionaireTax.description}</p>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-zinc-900/50 rounded-xl p-4">
                  <p className="text-xs text-zinc-500 uppercase">Year 1 Revenue</p>
                  <p className="text-2xl font-bold text-purple-300">
                    ${(billionaireTax.revenueProjections.year1 / 1e9).toFixed(1)}B
                  </p>
                </div>
                <div className="bg-zinc-900/50 rounded-xl p-4">
                  <p className="text-xs text-zinc-500 uppercase">Implementation</p>
                  <p className="text-2xl font-bold text-purple-300">
                    {billionaireTax.implementation}
                  </p>
                </div>
                <div className="bg-zinc-900/50 rounded-xl p-4">
                  <p className="text-xs text-zinc-500 uppercase">Flight Risk</p>
                  <p className="text-2xl font-bold text-red-400">
                    {billionaireTax.flightRisk}
                  </p>
                </div>
                <div className="bg-zinc-900/50 rounded-xl p-4">
                  <p className="text-xs text-zinc-500 uppercase">Tax Base</p>
                  <p className="text-xl font-bold text-purple-300">
                    {(billionaireTax.affectedTaxpayers / 1000).toFixed(0)}K people
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-emerald-400 mb-2">✓ Pros</p>
                <ul className="space-y-1 text-sm text-zinc-300">
                  {billionaireTax.pros.map((pro: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-emerald-500 mt-0.5">•</span>
                      {pro}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-sm font-semibold text-red-400 mb-2">✗ Cons</p>
                <ul className="space-y-1 text-sm text-zinc-300">
                  {billionaireTax.cons.map((con: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-red-500 mt-0.5">•</span>
                      {con}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {(selectedPolicy === "corporate" || selectedPolicy === "both") && (
          <div className="rounded-2xl border border-blue-500/30 bg-blue-950/20 p-6">
            <h2 className="text-2xl font-bold mb-2 text-blue-300">
              {corporateTax.name}
            </h2>
            <p className="text-zinc-400 mb-6">{corporateTax.description}</p>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-zinc-900/50 rounded-xl p-4">
                  <p className="text-xs text-zinc-500 uppercase">Year 1 Revenue</p>
                  <p className="text-2xl font-bold text-blue-300">
                    ${(corporateTax.revenueProjections.year1 / 1e9).toFixed(1)}B
                  </p>
                </div>
                <div className="bg-zinc-900/50 rounded-xl p-4">
                  <p className="text-xs text-zinc-500 uppercase">Implementation</p>
                  <p className="text-2xl font-bold text-blue-300">
                    {corporateTax.implementation}
                  </p>
                </div>
                <div className="bg-zinc-900/50 rounded-xl p-4">
                  <p className="text-xs text-zinc-500 uppercase">Flight Risk</p>
                  <p className="text-2xl font-bold text-yellow-400">
                    {corporateTax.flightRisk}
                  </p>
                </div>
                <div className="bg-zinc-900/50 rounded-xl p-4">
                  <p className="text-xs text-zinc-500 uppercase">Tax Base</p>
                  <p className="text-xl font-bold text-blue-300">
                    {(corporateTax.affectedTaxpayers / 1000).toFixed(0)}K businesses
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-emerald-400 mb-2">✓ Pros</p>
                <ul className="space-y-1 text-sm text-zinc-300">
                  {corporateTax.pros.map((pro: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-emerald-500 mt-0.5">•</span>
                      {pro}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-sm font-semibold text-red-400 mb-2">✗ Cons</p>
                <ul className="space-y-1 text-sm text-zinc-300">
                  {corporateTax.cons.map((con: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-red-500 mt-0.5">•</span>
                      {con}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Revenue projection chart */}
      {selectedPolicy === "both" && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h2 className="text-xl font-semibold mb-6">Revenue Projections (5 Years)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="year" stroke="#71717a" />
              <YAxis stroke="#71717a" tickFormatter={formatBillions} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#18181b",
                  border: "1px solid #3f3f46",
                  borderRadius: "0.5rem",
                }}
                formatter={(value: any) => formatBillions(value as number)}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="billionaire"
                name="Billionaire Tax"
                stroke="#a855f7"
                strokeWidth={3}
                dot={{ fill: "#a855f7", r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="corporate"
                name="Corporate Tax"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: "#3b82f6", r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* What can be funded */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
        <h2 className="text-xl font-semibold mb-6">
          What This Revenue Can Fund (5 Years)
        </h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={improvementData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis type="number" stroke="#71717a" tickFormatter={formatBillions} />
            <YAxis dataKey="name" type="category" stroke="#71717a" width={150} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#18181b",
                border: "1px solid #3f3f46",
                borderRadius: "0.5rem",
              }}
              formatter={(value: any) => formatBillions(value as number)}
            />
            <Legend />
            <Bar dataKey="cost" name="Cost (5 years)" fill="#6366f1" />
          </BarChart>
        </ResponsiveContainer>

        <div className="mt-6 grid gap-3">
          {Object.entries(improvements).map(([key, imp]: [string, any]) => (
            <div
              key={key}
              className="rounded-xl bg-zinc-800/50 p-4 border border-zinc-700/50"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-zinc-100">{imp.name}</h3>
                  <p className="text-sm text-zinc-400 mt-1">{imp.description}</p>
                  <p className="text-sm text-emerald-400 mt-2">
                    ✓ {imp.impact}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-zinc-500">Cost</p>
                  <p className="text-xl font-bold text-zinc-200">
                    ${(imp.cost5Year / 1e9).toFixed(1)}B
                  </p>
                  <p className="text-xs text-zinc-500 mt-1">
                    {imp.publicSupport} support
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
