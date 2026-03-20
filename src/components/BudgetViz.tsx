"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

interface Agency {
  name: string;
  number: string;
  amount: number;
}

interface YearData {
  agencies: Agency[];
  total: number;
}

interface DollarEntry {
  description: string;
  cents: number;
}

interface DollarYear {
  comesFrom: DollarEntry[];
  goesTo: DollarEntry[];
}

interface BudgetVizProps {
  dollarBreakdown: Record<string, DollarYear>;
  expenseBudget: Record<string, YearData>;
  years: string[];
}

const COLORS = [
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#a855f7", // purple
  "#ec4899", // pink
  "#f43f5e", // rose
  "#ef4444", // red
  "#f97316", // orange
  "#f59e0b", // amber
  "#eab308", // yellow
  "#84cc16", // lime
  "#22c55e", // green
  "#14b8a6", // teal
  "#06b6d4", // cyan
  "#3b82f6", // blue
  "#6366f1", // indigo again
];

function formatDollars(amount: number): string {
  if (amount >= 1e9) return `$${(amount / 1e9).toFixed(1)}B`;
  if (amount >= 1e6) return `$${(amount / 1e6).toFixed(0)}M`;
  if (amount >= 1e3) return `$${(amount / 1e3).toFixed(0)}K`;
  return `$${amount.toFixed(0)}`;
}

function formatFullDollars(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

type SortField = "name" | "amount" | "percentage";
type SortDirection = "asc" | "desc";

export function BudgetViz({ dollarBreakdown, expenseBudget, years }: BudgetVizProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [selectedYear, setSelectedYear] = useState(
    searchParams.get("year") || years[0]
  );
  const [hoveredAgency, setHoveredAgency] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [sortField, setSortField] = useState<SortField>(
    (searchParams.get("sort") as SortField) || "amount"
  );
  const [sortDirection, setSortDirection] = useState<SortDirection>(
    (searchParams.get("dir") as SortDirection) || "desc"
  );

  // Sync URL with state
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedYear !== years[0]) params.set("year", selectedYear);
    if (searchQuery) params.set("search", searchQuery);
    if (sortField !== "amount") params.set("sort", sortField);
    if (sortDirection !== "desc") params.set("dir", sortDirection);

    const queryString = params.toString();
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
    
    router.replace(newUrl, { scroll: false });
  }, [selectedYear, searchQuery, sortField, sortDirection, years, pathname, router]);

  const yearData = expenseBudget[selectedYear];
  const dollarData = dollarBreakdown[selectedYear];

  // Filter, search, and sort agencies
  const agencies = useMemo(() => {
    if (!yearData) return [];
    
    let filtered = yearData.agencies.filter((a) => a.amount > 0);

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((a) => a.name.toLowerCase().includes(query));
    }

    // Apply sort
    filtered.sort((a, b) => {
      let compareValue = 0;
      
      if (sortField === "name") {
        compareValue = a.name.localeCompare(b.name);
      } else if (sortField === "amount") {
        compareValue = a.amount - b.amount;
      } else if (sortField === "percentage") {
        const totalBudget = yearData.agencies.reduce((sum, agency) => sum + agency.amount, 0);
        const pctA = (a.amount / totalBudget) * 100;
        const pctB = (b.amount / totalBudget) * 100;
        compareValue = pctA - pctB;
      }
      
      return sortDirection === "asc" ? compareValue : -compareValue;
    });

    return filtered;
  }, [yearData, searchQuery, sortField, sortDirection]);

  const totalBudget = useMemo(() => {
    return agencies.reduce((sum, a) => sum + a.amount, 0);
  }, [agencies]);

  if (!yearData) {
    return <p className="text-zinc-200">No data for FY{selectedYear}</p>;
  }

  return (
    <div className="space-y-10">
      {/* Year selector */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm font-medium text-zinc-200">Fiscal Year</span>
        <div className="flex gap-1">
          {years.map((year) => (
            <button
              key={year}
              onClick={() => setSelectedYear(year)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                selectedYear === year
                  ? "bg-indigo-600 text-white"
                  : "bg-zinc-800 text-zinc-200 hover:bg-zinc-700 hover:text-zinc-200"
              }`}
            >
              FY{year}
            </button>
          ))}
        </div>
      </div>

      {/* Search bar */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search agencies..."
          className="w-full md:w-96 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
          >
            ✕
          </button>
        )}
      </div>

      {/* Total budget headline */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8">
        <p className="text-sm font-medium text-zinc-200 uppercase tracking-wider">
          Total Adopted Budget — FY{selectedYear}
        </p>
        <p className="mt-2 text-5xl font-bold tracking-tight text-white">
          {formatFullDollars(totalBudget)}
        </p>
        <p className="mt-1 text-sm text-zinc-500">
          across {agencies.length} agencies
        </p>
      </div>

      {/* Dollar comes from / goes to */}
      {dollarData && (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
            <h2 className="text-lg font-semibold mb-4">Where It Comes From</h2>
            <div className="space-y-3">
              {dollarData.comesFrom
                .sort((a, b) => b.cents - a.cents)
                .map((entry) => (
                  <div key={entry.description} className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-zinc-300">{entry.description}</span>
                        <span className="text-sm font-medium text-zinc-200">
                          {entry.cents}¢
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-zinc-800">
                        <div
                          className="h-2 rounded-full bg-emerald-500 transition-all"
                          style={{ width: `${entry.cents}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
            <h2 className="text-lg font-semibold mb-4">Where It Goes</h2>
            <div className="space-y-3">
              {dollarData.goesTo
                .sort((a, b) => b.cents - a.cents)
                .map((entry) => (
                  <div key={entry.description} className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-zinc-300">{entry.description}</span>
                        <span className="text-sm font-medium text-zinc-200">
                          {entry.cents}¢
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-zinc-800">
                        <div
                          className="h-2 rounded-full bg-blue-500 transition-all"
                          style={{ width: `${entry.cents}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Treemap-style agency breakdown */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Budget by Agency</h2>

        {/* Visual treemap */}
        <div className="rounded-2xl border border-zinc-800 overflow-hidden">
          <div className="flex flex-wrap">
            {agencies.slice(0, 15).map((agency, i) => {
              const pct = (agency.amount / totalBudget) * 100;
              const isHovered = hoveredAgency === agency.name;
              return (
                <div
                  key={agency.number}
                  className="relative cursor-pointer transition-all duration-200 border border-zinc-800/50"
                  style={{
                    width: `${Math.max(pct, 5)}%`,
                    minWidth: "60px",
                    height: pct > 10 ? "160px" : pct > 5 ? "120px" : "80px",
                    backgroundColor: isHovered
                      ? COLORS[i % COLORS.length]
                      : `${COLORS[i % COLORS.length]}33`,
                  }}
                  onMouseEnter={() => setHoveredAgency(agency.name)}
                  onMouseLeave={() => setHoveredAgency(null)}
                >
                  <div className="absolute inset-0 p-2 flex flex-col justify-between overflow-hidden">
                    <span
                      className={`text-xs font-medium leading-tight ${
                        isHovered ? "text-white" : "text-zinc-200"
                      }`}
                    >
                      {agency.name.length > 30
                        ? agency.name.slice(0, 28) + "…"
                        : agency.name}
                    </span>
                    <div>
                      <span className="text-sm font-bold text-white">
                        {formatDollars(agency.amount)}
                      </span>
                      <span className="ml-1 text-xs text-zinc-200">
                        {pct.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Full table */}
        <div className="mt-6 rounded-xl border border-zinc-800 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/50">
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => {
                      if (sortField === "name") {
                        setSortDirection(sortDirection === "asc" ? "desc" : "asc");
                      } else {
                        setSortField("name");
                        setSortDirection("asc");
                      }
                    }}
                    className="text-xs font-medium text-zinc-200 uppercase hover:text-zinc-200 transition-colors flex items-center gap-1"
                  >
                    Agency
                    {sortField === "name" && (
                      <span className="text-indigo-400">{sortDirection === "asc" ? "↑" : "↓"}</span>
                    )}
                  </button>
                </th>
                <th className="px-4 py-3 text-right">
                  <button
                    onClick={() => {
                      if (sortField === "amount") {
                        setSortDirection(sortDirection === "asc" ? "desc" : "asc");
                      } else {
                        setSortField("amount");
                        setSortDirection("desc");
                      }
                    }}
                    className="text-xs font-medium text-zinc-200 uppercase hover:text-zinc-200 transition-colors flex items-center gap-1 ml-auto"
                  >
                    Amount
                    {sortField === "amount" && (
                      <span className="text-indigo-400">{sortDirection === "asc" ? "↑" : "↓"}</span>
                    )}
                  </button>
                </th>
                <th className="px-4 py-3 text-right">
                  <button
                    onClick={() => {
                      if (sortField === "percentage") {
                        setSortDirection(sortDirection === "asc" ? "desc" : "asc");
                      } else {
                        setSortField("percentage");
                        setSortDirection("desc");
                      }
                    }}
                    className="text-xs font-medium text-zinc-200 uppercase hover:text-zinc-200 transition-colors flex items-center gap-1 ml-auto"
                  >
                    % of Budget
                    {sortField === "percentage" && (
                      <span className="text-indigo-400">{sortDirection === "asc" ? "↑" : "↓"}</span>
                    )}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-200 uppercase w-1/3">Share</th>
              </tr>
            </thead>
            <tbody>
              {agencies.map((agency, i) => {
                const pct = (agency.amount / totalBudget) * 100;
                return (
                  <tr
                    key={agency.number}
                    className="border-b border-zinc-800/50 hover:bg-zinc-900/30 transition-colors"
                    onMouseEnter={() => setHoveredAgency(agency.name)}
                    onMouseLeave={() => setHoveredAgency(null)}
                  >
                    <td className="px-4 py-2.5 text-sm text-zinc-200">{agency.name}</td>
                    <td className="px-4 py-2.5 text-sm text-right text-zinc-300 font-mono">
                      {formatDollars(agency.amount)}
                    </td>
                    <td className="px-4 py-2.5 text-sm text-right text-zinc-200 font-mono">
                      {pct.toFixed(1)}%
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="h-2 rounded-full bg-zinc-800">
                        <div
                          className="h-2 rounded-full transition-all"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: COLORS[i % COLORS.length],
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
