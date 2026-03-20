"use client";

import { useState } from "react";
import { TaxSlider } from "@/components/TaxSlider";
import { TaxSliderPremium } from "@/components/TaxSliderPremium";
import Link from "next/link";
import taxPoliciesData from "../../../data/tax-policies.json";

export default function TaxSliderPage() {
  const [isPremium, setIsPremium] = useState(true);

  return (
    <main className="min-h-screen p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        {/* Back button + Premium toggle */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-zinc-100 hover:text-indigo-300 transition-colors"
          >
            ← Back to home
          </Link>
          
          <div className="flex items-center gap-3">
            <span className="text-sm text-zinc-200">
              {isPremium ? "✨ Premium" : "Basic"}
            </span>
            <button
              onClick={() => setIsPremium(!isPremium)}
              className={`
                relative inline-flex h-6 w-11 items-center rounded-full
                transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-zinc-900
                ${isPremium ? "bg-gradient-to-r from-purple-600 to-blue-600" : "bg-zinc-700"}
              `}
            >
              <span
                className={`
                  inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                  ${isPremium ? "translate-x-6" : "translate-x-1"}
                `}
              />
            </button>
          </div>
        </div>

        {/* Tax Slider Component */}
        {isPremium ? (
          <TaxSliderPremium data={taxPoliciesData} />
        ) : (
          <TaxSlider data={taxPoliciesData} />
        )}

        {/* Additional Context */}
        <div className="mt-12 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h3 className="text-xl font-semibold mb-4">About This Tool</h3>
          <div className="space-y-3 text-zinc-300 text-sm">
            <p>
              This interactive slider helps you explore different tax policy approaches for NYC
              and understand their potential impact on city improvements.
            </p>
            <p>
              <strong>Billionaire Tax:</strong> Targets ultra-wealthy individuals (income $1M+).
              Quick to implement but higher migration risk. Generates $1.8-2.5B over 5 years.
            </p>
            <p>
              <strong>Corporate Tax:</strong> Broader business tax reform including loophole closure.
              More stable revenue but complex implementation. Generates $2.5-3.8B over 5 years.
            </p>
            <p>
              <strong>Hybrid Approach:</strong> Balanced combination of both strategies.
              Spreads risk while maximizing revenue potential. Generates $3-4B over 5 years.
            </p>
          </div>
        </div>

        {/* Related Visualizations */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Explore More</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <Link
              href="/policy-comparison"
              className="rounded-xl border border-indigo-500/30 bg-indigo-950/20 p-4 hover:border-indigo-500 hover:bg-indigo-950/30 transition-all"
            >
              <div className="text-2xl mb-2">📊</div>
              <h4 className="font-semibold mb-1">Policy Comparison</h4>
              <p className="text-sm text-zinc-200">
                Detailed side-by-side analysis
              </p>
            </Link>
            <Link
              href="/borough-impact"
              className="rounded-xl border border-purple-500/30 bg-purple-950/20 p-4 hover:border-purple-500 hover:bg-purple-950/30 transition-all"
            >
              <div className="text-2xl mb-2">🗺️</div>
              <h4 className="font-semibold mb-1">Borough Impact</h4>
              <p className="text-sm text-zinc-200">
                Geographic distribution by area
              </p>
            </Link>
            <Link
              href="/flow-visualization"
              className="rounded-xl border border-blue-500/30 bg-blue-950/20 p-4 hover:border-blue-500 hover:bg-blue-950/30 transition-all"
            >
              <div className="text-2xl mb-2">💰</div>
              <h4 className="font-semibold mb-1">Revenue Flow</h4>
              <p className="text-sm text-zinc-200">
                Follow the money to improvements
              </p>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
