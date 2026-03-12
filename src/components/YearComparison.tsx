"use client";

import { useState, useMemo } from "react";

interface Agency {
  name: string;
  number: string;
  amount: number;
}

interface YearData {
  agencies: Agency[];
  total: number;
}

interface YearComparisonProps {
  expenseBudget: Record<string, YearData>;
  years: string[];
}

function formatDollars(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatPercent(value: number): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

export function YearComparison({ expenseBudget, years }: YearComparisonProps) {
  const [yearA, setYearA] = useState(years[1] || years[0]); // Previous year
  const [yearB, setYearB] = useState(years[0]); // Current year

  const comparison = useMemo(() => {
    const dataA = expenseBudget[yearA];
    const dataB = expenseBudget[yearB];

    if (!dataA || !dataB) return [];

    // Create agency lookup for year A
    const agenciesA = new Map(
      dataA.agencies.map((a) => [a.number, a])
    );

    // Calculate changes for each agency in year B
    const changes = dataB.agencies
      .map((agencyB) => {
        const agencyA = agenciesA.get(agencyB.number);
        if (!agencyA || agencyA.amount === 0) {
          return {
            name: agencyB.name,
            number: agencyB.number,
            amountA: agencyA?.amount || 0,
            amountB: agencyB.amount,
            change: agencyB.amount,
            percentChange: agencyA ? Infinity : 100,
          };
        }

        const change = agencyB.amount - agencyA.amount;
        const percentChange = (change / agencyA.amount) * 100;

        return {
          name: agencyB.name,
          number: agencyB.number,
          amountA: agencyA.amount,
          amountB: agencyB.amount,
          change,
          percentChange,
        };
      })
      .filter((c) => c.amountB > 0); // Only show agencies with current budget

    return changes.sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
  }, [expenseBudget, yearA, yearB]);

  const totalChangePercent = useMemo(() => {
    const totalA = expenseBudget[yearA]?.agencies.reduce((sum, a) => sum + a.amount, 0) || 0;
    const totalB = expenseBudget[yearB]?.agencies.reduce((sum, a) => sum + a.amount, 0) || 0;
    if (totalA === 0) return 0;
    return ((totalB - totalA) / totalA) * 100;
  }, [expenseBudget, yearA, yearB]);

  const topIncreases = comparison.filter((c) => c.change > 0).slice(0, 5);
  const topDecreases = comparison.filter((c) => c.change < 0).slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">Year-over-Year Comparison</h2>
        <p className="text-zinc-400 mb-6">
          Compare spending between fiscal years to see where the budget grew or shrank.
        </p>

        {/* Year selectors */}
        <div className="flex gap-4 items-center flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-zinc-400">From:</label>
            <select
              value={yearA}
              onChange={(e) => setYearA(e.target.value)}
              className="bg-zinc-800 text-white rounded-lg px-4 py-2 text-sm font-medium border border-zinc-700 focus:border-indigo-500 focus:outline-none"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  FY{year}
                </option>
              ))}
            </select>
          </div>

          <span className="text-zinc-600 text-lg">→</span>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-zinc-400">To:</label>
            <select
              value={yearB}
              onChange={(e) => setYearB(e.target.value)}
              className="bg-zinc-800 text-white rounded-lg px-4 py-2 text-sm font-medium border border-zinc-700 focus:border-indigo-500 focus:outline-none"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  FY{year}
                </option>
              ))}
            </select>
          </div>

          <div className="ml-auto">
            <div className="rounded-xl bg-zinc-900/50 border border-zinc-800 px-6 py-3">
              <div className="text-xs text-zinc-400 uppercase tracking-wider mb-1">
                Total Budget Change
              </div>
              <div
                className={`text-2xl font-bold ${
                  totalChangePercent > 0 ? "text-emerald-400" : totalChangePercent < 0 ? "text-red-400" : "text-zinc-400"
                }`}
              >
                {formatPercent(totalChangePercent)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Highlights */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Top increases */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="text-emerald-400">↑</span>
            Biggest Increases
          </h3>
          <div className="space-y-3">
            {topIncreases.map((item) => (
              <div key={item.number} className="space-y-1">
                <div className="flex justify-between items-start gap-2">
                  <span className="text-sm text-zinc-200 leading-tight">
                    {item.name}
                  </span>
                  <span className="text-sm font-bold text-emerald-400 whitespace-nowrap">
                    {formatPercent(item.percentChange)}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-zinc-500">
                  <span>{formatDollars(item.amountA)}</span>
                  <span>→</span>
                  <span>{formatDollars(item.amountB)}</span>
                </div>
              </div>
            ))}
            {topIncreases.length === 0 && (
              <p className="text-sm text-zinc-500 italic">No increases</p>
            )}
          </div>
        </div>

        {/* Top decreases */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="text-red-400">↓</span>
            Biggest Decreases
          </h3>
          <div className="space-y-3">
            {topDecreases.map((item) => (
              <div key={item.number} className="space-y-1">
                <div className="flex justify-between items-start gap-2">
                  <span className="text-sm text-zinc-200 leading-tight">
                    {item.name}
                  </span>
                  <span className="text-sm font-bold text-red-400 whitespace-nowrap">
                    {formatPercent(item.percentChange)}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-zinc-500">
                  <span>{formatDollars(item.amountA)}</span>
                  <span>→</span>
                  <span>{formatDollars(item.amountB)}</span>
                </div>
              </div>
            ))}
            {topDecreases.length === 0 && (
              <p className="text-sm text-zinc-500 italic">No decreases</p>
            )}
          </div>
        </div>
      </div>

      {/* Full comparison table */}
      <div className="rounded-xl border border-zinc-800 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/50">
              <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase">
                Agency
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-zinc-400 uppercase">
                FY{yearA}
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-zinc-400 uppercase">
                FY{yearB}
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-zinc-400 uppercase">
                Change
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-zinc-400 uppercase">
                % Change
              </th>
            </tr>
          </thead>
          <tbody>
            {comparison.map((item) => {
              const isIncrease = item.change > 0;
              const isDecrease = item.change < 0;
              return (
                <tr
                  key={item.number}
                  className="border-b border-zinc-800/50 hover:bg-zinc-900/30 transition-colors"
                >
                  <td className="px-4 py-2.5 text-sm text-zinc-200">
                    {item.name}
                  </td>
                  <td className="px-4 py-2.5 text-sm text-right text-zinc-400 font-mono">
                    {formatDollars(item.amountA)}
                  </td>
                  <td className="px-4 py-2.5 text-sm text-right text-zinc-300 font-mono">
                    {formatDollars(item.amountB)}
                  </td>
                  <td
                    className={`px-4 py-2.5 text-sm text-right font-mono ${
                      isIncrease ? "text-emerald-400" : isDecrease ? "text-red-400" : "text-zinc-400"
                    }`}
                  >
                    {formatDollars(item.change)}
                  </td>
                  <td
                    className={`px-4 py-2.5 text-sm text-right font-mono font-medium ${
                      isIncrease ? "text-emerald-400" : isDecrease ? "text-red-400" : "text-zinc-400"
                    }`}
                  >
                    {formatPercent(item.percentChange)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
