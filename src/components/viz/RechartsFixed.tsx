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

export function RechartsFixed({ data }: { data: any }) {
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
    <div className="space-y-6">
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

      {/* Revenue projections chart - FIXED */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
        <h2 className="text-xl font-semibold mb-6">Revenue Projections (5 Years)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis dataKey="year" stroke="#a1a1aa" />
            <YAxis tickFormatter={formatBillions} stroke="#a1a1aa" />
            <Tooltip
              formatter={(value: any) => formatBillions(Number(value) || 0)}
              contentStyle={{ backgroundColor: "#18181b", border: "1px solid #3f3f46" }}
            />
            <Legend />
            {(selectedPolicy === "billionaire" || selectedPolicy === "both") && (
              <Line
                type="monotone"
                dataKey="billionaire"
                stroke="#8b5cf6"
                strokeWidth={3}
                name="Billionaire Tax"
              />
            )}
            {(selectedPolicy === "corporate" || selectedPolicy === "both") && (
              <Line
                type="monotone"
                dataKey="corporate"
                stroke="#3b82f6"
                strokeWidth={3}
                name="Corporate Tax"
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Improvement costs chart - FIXED */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
        <h2 className="text-xl font-semibold mb-6">Improvement Costs (5 Years)</h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={improvementData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis dataKey="name" stroke="#a1a1aa" />
            <YAxis tickFormatter={formatBillions} stroke="#a1a1aa" />
            <Tooltip
              formatter={(value: any) => formatBillions(Number(value) || 0)}
              contentStyle={{ backgroundColor: "#18181b", border: "1px solid #3f3f46" }}
            />
            <Bar dataKey="cost" fill="#6366f1" name="Cost (5 years)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="text-sm text-zinc-500 space-y-1">
        <p>💡 Recharts is React-native, declarative, and composable</p>
        <p>✓ Easy to use with React</p>
        <p>✓ SVG-based (scalable, sharp)</p>
      </div>
    </div>
  );
}
