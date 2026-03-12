"use client";

import { useState, useMemo } from "react";

interface Facility {
  name: string;
  domain: string;
  lat: number;
  lng: number;
}

interface BoroughData {
  domains: { name: string; count: number }[];
  totalFacilities: number;
  facilities: Facility[];
}

interface FacilitiesMapProps {
  data: Record<string, BoroughData>;
}

const DOMAIN_COLORS: Record<string, string> = {
  "HEALTH AND HUMAN SERVICES": "#ef4444",
  "EDUCATION, CHILD WELFARE, AND YOUTH": "#3b82f6",
  "CORE INFRASTRUCTURE AND TRANSPORTATION": "#f59e0b",
  "PARKS, GARDENS, AND HISTORICAL SITES": "#22c55e",
  "PUBLIC SAFETY, EMERGENCY SERVICES, AND ADMINISTRATION OF JUSTICE": "#a855f7",
  "LIBRARIES AND CULTURAL PROGRAMS": "#ec4899",
};

const BOROUGH_CENTER: Record<string, [number, number]> = {
  MANHATTAN: [-73.9712, 40.7831],
  BROOKLYN: [-73.9442, 40.6782],
  QUEENS: [-73.7949, 40.7282],
  BRONX: [-73.8648, 40.8448],
  "STATEN ISLAND": [-74.1502, 40.5795],
};

function getDomainColor(domain: string): string {
  return DOMAIN_COLORS[domain] || "#6b7280";
}

export function FacilitiesMap({ data }: FacilitiesMapProps) {
  const [selectedBorough, setSelectedBorough] = useState<string | null>(null);
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [hoveredFacility, setHoveredFacility] = useState<Facility | null>(null);

  const allDomains = useMemo(() => {
    const domains = new Set<string>();
    Object.values(data).forEach((b) =>
      b.domains.forEach((d) => domains.add(d.name))
    );
    return Array.from(domains).sort();
  }, [data]);

  const filteredFacilities = useMemo(() => {
    let facilities: (Facility & { boro: string })[] = [];
    const boroughs = selectedBorough
      ? [selectedBorough]
      : Object.keys(data);

    for (const boro of boroughs) {
      if (!data[boro]) continue;
      for (const f of data[boro].facilities) {
        if (selectedDomain && f.domain !== selectedDomain) continue;
        facilities.push({ ...f, boro });
      }
    }
    return facilities;
  }, [data, selectedBorough, selectedDomain]);

  const boroughStats = useMemo(() => {
    return Object.entries(data)
      .map(([name, d]) => ({ name, ...d }))
      .sort((a, b) => b.totalFacilities - a.totalFacilities);
  }, [data]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">NYC Public Facilities Map</h2>
        <p className="text-sm text-zinc-400">
          {filteredFacilities.length.toLocaleString()} facilities shown
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex gap-1">
          <button
            onClick={() => setSelectedBorough(null)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              !selectedBorough
                ? "bg-indigo-600 text-white"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            }`}
          >
            All Boroughs
          </button>
          {Object.keys(BOROUGH_CENTER).map((boro) => (
            <button
              key={boro}
              onClick={() =>
                setSelectedBorough(selectedBorough === boro ? null : boro)
              }
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                selectedBorough === boro
                  ? "bg-indigo-600 text-white"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              }`}
            >
              {boro}
            </button>
          ))}
        </div>
      </div>

      {/* Domain filter */}
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => setSelectedDomain(null)}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
            !selectedDomain
              ? "bg-zinc-600 text-white"
              : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
          }`}
        >
          All Types
        </button>
        {allDomains.map((domain) => (
          <button
            key={domain}
            onClick={() =>
              setSelectedDomain(selectedDomain === domain ? null : domain)
            }
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors border`}
            style={{
              backgroundColor:
                selectedDomain === domain
                  ? getDomainColor(domain)
                  : "transparent",
              borderColor: getDomainColor(domain),
              color:
                selectedDomain === domain ? "white" : getDomainColor(domain),
            }}
          >
            {domain.length > 30 ? domain.slice(0, 28) + "…" : domain}
          </button>
        ))}
      </div>

      {/* Map visualization - CSS-based scatter plot */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 overflow-hidden relative" style={{ height: "500px" }}>
        <div className="absolute inset-0 overflow-hidden">
          {filteredFacilities.map((f, i) => {
            // Project lat/lng to pixel positions (simple mercator approximation for NYC area)
            const minLat = 40.49;
            const maxLat = 40.92;
            const minLng = -74.27;
            const maxLng = -73.68;

            const x = ((f.lng - minLng) / (maxLng - minLng)) * 100;
            const y = ((maxLat - f.lat) / (maxLat - minLat)) * 100;

            if (x < 0 || x > 100 || y < 0 || y > 100) return null;

            return (
              <div
                key={`${f.lat}-${f.lng}-${i}`}
                className="absolute rounded-full transition-all duration-150 cursor-pointer"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  width: hoveredFacility === f ? "8px" : "4px",
                  height: hoveredFacility === f ? "8px" : "4px",
                  backgroundColor: getDomainColor(f.domain),
                  opacity: 0.7,
                  transform: "translate(-50%, -50%)",
                }}
                onMouseEnter={() => setHoveredFacility(f)}
                onMouseLeave={() => setHoveredFacility(null)}
              />
            );
          })}
        </div>

        {/* Tooltip */}
        {hoveredFacility && (
          <div className="absolute top-4 left-4 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 z-10 max-w-xs">
            <p className="text-sm font-medium text-white">{hoveredFacility.name}</p>
            <p className="text-xs text-zinc-400">{hoveredFacility.domain}</p>
          </div>
        )}

        {/* Legend watermark */}
        <div className="absolute bottom-4 right-4 text-xs text-zinc-600">
          NYC Facilities Database
        </div>
      </div>

      {/* Borough breakdown cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {boroughStats.map((boro) => (
          <div
            key={boro.name}
            className={`rounded-xl border p-4 cursor-pointer transition-colors ${
              selectedBorough === boro.name
                ? "border-indigo-500 bg-indigo-950/30"
                : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700"
            }`}
            onClick={() =>
              setSelectedBorough(
                selectedBorough === boro.name ? null : boro.name
              )
            }
          >
            <h3 className="font-semibold text-white">{boro.name}</h3>
            <p className="text-2xl font-bold text-indigo-400 mt-1">
              {boro.totalFacilities.toLocaleString()}
            </p>
            <p className="text-xs text-zinc-500 mb-3">public facilities</p>
            <div className="space-y-1.5">
              {boro.domains.slice(0, 4).map((d) => (
                <div key={d.name} className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: getDomainColor(d.name) }}
                  />
                  <span className="text-xs text-zinc-400 truncate flex-1">
                    {d.name}
                  </span>
                  <span className="text-xs text-zinc-500 font-mono">
                    {d.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
