"use client";

import { useState, useMemo } from "react";

interface PolicyData {
  billionaireTax: any;
  corporateTax: any;
  improvements: any;
}

export function TaxSlider({ data }: { data: PolicyData }) {
  // 0 = billionaire, 1 = hybrid, 2 = corporate
  const [sliderValue, setSliderValue] = useState(1);

  const { billionaireTax, corporateTax, improvements } = data;

  // Calculate revenue based on slider position
  const currentRevenue = useMemo(() => {
    const billionaire = {
      year1: billionaireTax.revenueProjections.year1,
      year5: billionaireTax.revenueProjections.year5,
    };
    const corporate = {
      year1: corporateTax.revenueProjections.year1,
      year5: corporateTax.revenueProjections.year5,
    };

    if (sliderValue === 0) {
      // Pure billionaire tax
      return {
        year1: billionaire.year1,
        year5: billionaire.year5,
        total5Year: (billionaire.year1 + billionaire.year5) * 2.5, // Rough 5-year estimate
        label: "Billionaire Tax",
        color: "purple",
        description: billionaireTax.description,
        flightRisk: "High",
        implementation: "6-12 months",
      };
    } else if (sliderValue === 1) {
      // Hybrid approach
      const hybridYear1 = (billionaire.year1 * 0.5 + corporate.year1 * 0.5);
      const hybridYear5 = (billionaire.year5 * 0.5 + corporate.year5 * 0.5);
      return {
        year1: hybridYear1,
        year5: hybridYear5,
        total5Year: (hybridYear1 + hybridYear5) * 2.5,
        label: "Hybrid Approach",
        color: "indigo",
        description: "Balanced combination of both tax approaches",
        flightRisk: "Medium",
        implementation: "9-18 months",
      };
    } else {
      // Pure corporate tax
      return {
        year1: corporate.year1,
        year5: corporate.year5,
        total5Year: (corporate.year1 + corporate.year5) * 2.5,
        label: "Corporate Tax",
        color: "blue",
        description: corporateTax.description,
        flightRisk: "Moderate",
        implementation: "12-24 months",
      };
    }
  }, [sliderValue, billionaireTax, corporateTax]);

  // Calculate what can be funded
  const fundableImprovements = useMemo(() => {
    return Object.entries(improvements).map(([key, imp]: [string, any]) => {
      const percentFunded = Math.min(
        100,
        (currentRevenue.total5Year / imp.cost5Year) * 100
      );
      return {
        key,
        ...imp,
        percentFunded,
        funded: percentFunded >= 100,
        partialFunding: currentRevenue.total5Year * (imp.cost5Year / Object.values(improvements).reduce((sum: number, i: any) => sum + i.cost5Year, 0)),
      };
    });
  }, [currentRevenue, improvements]);

  const formatCurrency = (value: number) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(0)}M`;
    return `$${value.toLocaleString()}`;
  };

  const getSliderPosition = () => {
    if (sliderValue === 0) return "Billionaire Tax";
    if (sliderValue === 1) return "Hybrid";
    return "Corporate Tax";
  };

  const getColorClasses = () => {
    if (currentRevenue.color === "purple") {
      return {
        bg: "bg-purple-600",
        border: "border-purple-500",
        text: "text-purple-400",
        glow: "shadow-purple-500/50",
        track: "bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600",
      };
    } else if (currentRevenue.color === "indigo") {
      return {
        bg: "bg-indigo-600",
        border: "border-indigo-500",
        text: "text-indigo-400",
        glow: "shadow-indigo-500/50",
        track: "bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600",
      };
    } else {
      return {
        bg: "bg-blue-600",
        border: "border-blue-500",
        text: "text-blue-400",
        glow: "shadow-blue-500/50",
        track: "bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600",
      };
    }
  };

  const colors = getColorClasses();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <h1 className="text-4xl md:text-5xl font-bold">NYC Tax Policy Explorer</h1>
        <p className="text-zinc-400 max-w-2xl mx-auto">
          Adjust the slider to explore different tax approaches and see what improvements can be funded.
        </p>
      </div>

      {/* Interactive Slider */}
      <div className={`rounded-2xl border-2 ${colors.border} bg-zinc-900/50 p-8 transition-all duration-500 shadow-lg ${colors.glow}`}>
        <div className="space-y-6">
          {/* Slider Label */}
          <div className="text-center">
            <h2 className={`text-3xl font-bold ${colors.text} transition-colors duration-300`}>
              {currentRevenue.label}
            </h2>
            <p className="text-zinc-400 mt-2">{currentRevenue.description}</p>
          </div>

          {/* Slider Control */}
          <div className="space-y-4">
            <div className="relative pt-6 pb-2">
              {/* Slider Track Labels */}
              <div className="flex justify-between text-sm text-zinc-500 mb-2 px-2">
                <span className={sliderValue === 0 ? "text-purple-400 font-semibold" : ""}>
                  Billionaire
                </span>
                <span className={sliderValue === 1 ? "text-indigo-400 font-semibold" : ""}>
                  Hybrid
                </span>
                <span className={sliderValue === 2 ? "text-blue-400 font-semibold" : ""}>
                  Corporate
                </span>
              </div>

              {/* Slider Input */}
              <input
                type="range"
                min="0"
                max="2"
                step="1"
                value={sliderValue}
                onChange={(e) => setSliderValue(parseInt(e.target.value))}
                className="w-full h-3 rounded-lg appearance-none cursor-pointer slider-custom"
                style={{
                  background: `linear-gradient(to right, 
                    rgb(168, 85, 247) 0%, 
                    rgb(168, 85, 247) ${(sliderValue / 2) * 50}%, 
                    rgb(99, 102, 241) ${(sliderValue / 2) * 50}%, 
                    rgb(99, 102, 241) ${50 + (sliderValue / 2) * 50}%, 
                    rgb(59, 130, 246) ${50 + (sliderValue / 2) * 50}%, 
                    rgb(59, 130, 246) 100%)`
                }}
              />

              <style jsx>{`
                .slider-custom::-webkit-slider-thumb {
                  appearance: none;
                  width: 24px;
                  height: 24px;
                  border-radius: 50%;
                  background: white;
                  cursor: pointer;
                  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
                  transition: all 0.2s;
                }
                .slider-custom::-webkit-slider-thumb:hover {
                  transform: scale(1.2);
                  box-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
                }
                .slider-custom::-moz-range-thumb {
                  width: 24px;
                  height: 24px;
                  border-radius: 50%;
                  background: white;
                  cursor: pointer;
                  border: none;
                  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
                  transition: all 0.2s;
                }
                .slider-custom::-moz-range-thumb:hover {
                  transform: scale(1.2);
                  box-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
                }
              `}</style>
            </div>

            {/* Mobile-friendly buttons */}
            <div className="flex gap-2 md:hidden">
              <button
                onClick={() => setSliderValue(0)}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                  sliderValue === 0
                    ? "bg-purple-600 text-white"
                    : "bg-zinc-800 text-zinc-400"
                }`}
              >
                Billionaire
              </button>
              <button
                onClick={() => setSliderValue(1)}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                  sliderValue === 1
                    ? "bg-indigo-600 text-white"
                    : "bg-zinc-800 text-zinc-400"
                }`}
              >
                Hybrid
              </button>
              <button
                onClick={() => setSliderValue(2)}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                  sliderValue === 2
                    ? "bg-blue-600 text-white"
                    : "bg-zinc-800 text-zinc-400"
                }`}
              >
                Corporate
              </button>
            </div>
          </div>

          {/* Revenue Display */}
          <div className="grid md:grid-cols-3 gap-4 mt-6">
            <div className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700">
              <p className="text-xs text-zinc-500 uppercase mb-1">Year 1 Revenue</p>
              <p className={`text-2xl font-bold ${colors.text} transition-all duration-300`}>
                {formatCurrency(currentRevenue.year1)}
              </p>
            </div>
            <div className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700">
              <p className="text-xs text-zinc-500 uppercase mb-1">5-Year Total</p>
              <p className={`text-2xl font-bold ${colors.text} transition-all duration-300`}>
                {formatCurrency(currentRevenue.total5Year)}
              </p>
            </div>
            <div className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700">
              <p className="text-xs text-zinc-500 uppercase mb-1">Flight Risk</p>
              <p className={`text-2xl font-bold transition-all duration-300 ${
                currentRevenue.flightRisk === "High" ? "text-red-400" :
                currentRevenue.flightRisk === "Medium" ? "text-yellow-400" :
                "text-emerald-400"
              }`}>
                {currentRevenue.flightRisk}
              </p>
            </div>
          </div>

          {/* Implementation Timeline */}
          <div className="bg-zinc-800/30 rounded-lg p-4 border border-zinc-700/50">
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-400">Implementation Timeline:</span>
              <span className={`text-sm font-semibold ${colors.text}`}>
                {currentRevenue.implementation}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Funded Improvements */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
        <h2 className="text-2xl font-bold mb-6">What Can Be Funded</h2>
        <div className="space-y-4">
          {fundableImprovements.map((improvement) => (
            <div
              key={improvement.key}
              className={`rounded-xl p-5 border transition-all duration-500 ${
                improvement.funded
                  ? "bg-emerald-950/30 border-emerald-500/50"
                  : "bg-zinc-800/30 border-zinc-700"
              }`}
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold">{improvement.name}</h3>
                    {improvement.funded && (
                      <span className="px-2 py-0.5 bg-emerald-600 text-white text-xs rounded-full font-semibold">
                        ✓ Fully Funded
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-zinc-400">{improvement.description}</p>
                  <p className="text-sm text-emerald-400 mt-2">
                    {improvement.impact}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-zinc-500">Cost (5 years)</p>
                  <p className="text-xl font-bold">
                    {formatCurrency(improvement.cost5Year)}
                  </p>
                  <p className="text-xs text-zinc-500 mt-1">
                    {improvement.publicSupport} support
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-zinc-500">Funding coverage</span>
                  <span className={improvement.funded ? "text-emerald-400 font-semibold" : "text-zinc-400"}>
                    {improvement.percentFunded.toFixed(0)}%
                  </span>
                </div>
                <div className="h-2 bg-zinc-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      improvement.funded ? "bg-emerald-500" : "bg-zinc-500"
                    }`}
                    style={{ width: `${Math.min(100, improvement.percentFunded)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="mt-6 bg-zinc-800/50 rounded-xl p-4 border border-zinc-700">
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-400">
              Total funded:
            </span>
            <span className="text-lg font-bold text-emerald-400">
              {fundableImprovements.filter(i => i.funded).length} of {fundableImprovements.length} priorities
            </span>
          </div>
        </div>
      </div>

      {/* Data Sources */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          📚 Data Sources
          <span className="text-xs text-zinc-500 font-normal">(hover for details)</span>
        </h3>
        <div className="grid md:grid-cols-2 gap-3">
          <div className="group relative">
            <div className="text-sm text-zinc-400 cursor-help border-b border-dotted border-zinc-600 inline-block">
              NYC Open Data
            </div>
            <div className="invisible group-hover:visible absolute bottom-full left-0 mb-2 w-64 p-3 bg-zinc-800 border border-zinc-700 rounded-lg text-xs text-zinc-300 shadow-xl z-10">
              Budget data, facilities, and demographic information from NYC's official open data portal
            </div>
          </div>
          <div className="group relative">
            <div className="text-sm text-zinc-400 cursor-help border-b border-dotted border-zinc-600 inline-block">
              City & State NY
            </div>
            <div className="invisible group-hover:visible absolute bottom-full left-0 mb-2 w-64 p-3 bg-zinc-800 border border-zinc-700 rounded-lg text-xs text-zinc-300 shadow-xl z-10">
              Policy analysis and revenue projections from City & State New York
            </div>
          </div>
          <div className="group relative">
            <div className="text-sm text-zinc-400 cursor-help border-b border-dotted border-zinc-600 inline-block">
              Community Board Surveys
            </div>
            <div className="invisible group-hover:visible absolute bottom-full left-0 mb-2 w-64 p-3 bg-zinc-800 border border-zinc-700 rounded-lg text-xs text-zinc-300 shadow-xl z-10">
              Public priorities from annual Community Board needs statements across all 5 boroughs
            </div>
          </div>
          <div className="group relative">
            <div className="text-sm text-zinc-400 cursor-help border-b border-dotted border-zinc-600 inline-block">
              NYC Comptroller Reports
            </div>
            <div className="invisible group-hover:visible absolute bottom-full left-0 mb-2 w-64 p-3 bg-zinc-800 border border-zinc-700 rounded-lg text-xs text-zinc-300 shadow-xl z-10">
              Budget analysis and infrastructure audits from the NYC Comptroller's office
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
