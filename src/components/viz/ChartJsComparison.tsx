"use client";

import { useEffect, useRef } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

export function ChartJsComparison({ data }: { data: any }) {
  const revenueChartRef = useRef<HTMLCanvasElement>(null);
  const improvementsChartRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!revenueChartRef.current || !improvementsChartRef.current) return;

    const { billionaireTax, corporateTax, improvements } = data;

    // Revenue comparison chart
    const revenueCtx = revenueChartRef.current.getContext("2d");
    if (revenueCtx) {
      new ChartJS(revenueCtx, {
        type: "line",
        data: {
          labels: ["Year 1", "Year 3", "Year 5"],
          datasets: [
            {
              label: "Billionaire Tax",
              data: [
                billionaireTax.revenueProjections.year1 / 1e9,
                billionaireTax.revenueProjections.year3 / 1e9,
                billionaireTax.revenueProjections.year5 / 1e9,
              ],
              borderColor: "#8b5cf6",
              backgroundColor: "rgba(139, 92, 246, 0.1)",
              tension: 0.4,
              fill: true,
            },
            {
              label: "Corporate Tax",
              data: [
                corporateTax.revenueProjections.year1 / 1e9,
                corporateTax.revenueProjections.year3 / 1e9,
                corporateTax.revenueProjections.year5 / 1e9,
              ],
              borderColor: "#3b82f6",
              backgroundColor: "rgba(59, 130, 246, 0.1)",
              tension: 0.4,
              fill: true,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              labels: { color: "#a1a1aa" },
            },
            title: {
              display: true,
              text: "Revenue Projections (5 Years)",
              color: "#e4e4e7",
              font: { size: 16 },
            },
            tooltip: {
              callbacks: {
                label: (context) => `${context.dataset.label}: $${(context.parsed.y ?? 0).toFixed(1)}B`,
              },
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                color: "#a1a1aa",
                callback: (value) => `$${value}B`,
              },
              grid: { color: "#27272a" },
            },
            x: {
              ticks: { color: "#a1a1aa" },
              grid: { color: "#27272a" },
            },
          },
        },
      });
    }

    // Improvements funding chart
    const improvementsCtx = improvementsChartRef.current.getContext("2d");
    if (improvementsCtx) {
      const improvementData = Object.values(improvements).map((imp: any) => ({
        name: imp.name,
        cost: imp.cost5Year / 1e9,
        support: parseInt(imp.publicSupport),
      }));

      new ChartJS(improvementsCtx, {
        type: "bar",
        data: {
          labels: improvementData.map((d) => d.name),
          datasets: [
            {
              label: "Cost (5 years)",
              data: improvementData.map((d) => d.cost),
              backgroundColor: [
                "rgba(139, 92, 246, 0.8)",
                "rgba(99, 102, 241, 0.8)",
                "rgba(59, 130, 246, 0.8)",
                "rgba(14, 165, 233, 0.8)",
                "rgba(6, 182, 212, 0.8)",
              ],
              borderColor: [
                "#8b5cf6",
                "#6366f1",
                "#3b82f6",
                "#0ea5e9",
                "#06b6d4",
              ],
              borderWidth: 2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            title: {
              display: true,
              text: "Improvement Costs (5 Years)",
              color: "#e4e4e7",
              font: { size: 16 },
            },
            tooltip: {
              callbacks: {
                label: (context) => `Cost: $${(context.parsed.y ?? 0).toFixed(1)}B`,
                afterLabel: (context) =>
                  `Public Support: ${improvementData[context.dataIndex].support}%`,
              },
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                color: "#a1a1aa",
                callback: (value) => `$${value}B`,
              },
              grid: { color: "#27272a" },
            },
            x: {
              ticks: { color: "#a1a1aa" },
              grid: { color: "#27272a" },
            },
          },
        },
      });
    }
  }, [data]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
        <div style={{ height: "300px" }}>
          <canvas ref={revenueChartRef} />
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
        <div style={{ height: "400px" }}>
          <canvas ref={improvementsChartRef} />
        </div>
      </div>

      <div className="text-sm text-zinc-500 space-y-1">
        <p>💡 Chart.js provides simpler, cleaner visualizations</p>
        <p>✓ Canvas-based rendering (fast performance)</p>
        <p>✓ Built-in animations and interactions</p>
      </div>
    </div>
  );
}
