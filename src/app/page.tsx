import Link from "next/link";

export default function Home() {
  const visualizations = [
    {
      title: "Policy Comparison Dashboard",
      href: "/policy-comparison",
      description: "Side-by-side comparison of billionaire tax vs. corporate tax reform",
      features: [
        "Revenue projections over 5 years",
        "Pros & cons analysis",
        "Funding capacity charts",
        "Interactive policy selector"
      ],
      color: "indigo",
      icon: "📊",
    },
    {
      title: "Borough Impact Map",
      href: "/borough-impact",
      description: "See how tax revenue flows through each NYC borough",
      features: [
        "Interactive borough selector",
        "Revenue distribution by area",
        "Local priority improvements",
        "Population-based analysis"
      ],
      color: "purple",
      icon: "🗺️",
    },
    {
      title: "Tax Revenue Flow",
      href: "/flow-visualization",
      description: "Follow the money from tax policy to real improvements",
      features: [
        "Visual flow diagram",
        "Step-by-step breakdown",
        "Funding gap analysis",
        "Priority-based allocation"
      ],
      color: "blue",
      icon: "💰",
    },
  ];

  return (
    <main className="min-h-screen p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-16 text-center">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-4">
            NYC Tax Visualizer
          </h1>
          <p className="text-xl text-zinc-400 max-w-3xl mx-auto">
            Explore different ways to visualize how NYC tax dollars can fund improvements.
            Three interactive approaches, powered by real research data.
          </p>
        </header>

        {/* Context */}
        <div className="mb-16 max-w-4xl mx-auto">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8">
            <h2 className="text-2xl font-semibold mb-4">The Question</h2>
            <p className="text-zinc-300 mb-4">
              NYC faces critical revenue decisions: should the city pursue a{" "}
              <span className="font-semibold text-purple-400">billionaire tax</span> targeting
              ultra-wealthy individuals, or{" "}
              <span className="font-semibold text-blue-400">corporate tax reform</span> focused
              on business restructuring?
            </p>
            <p className="text-zinc-300">
              Each approach generates $2.5-3.8B over 5 years, but with different trade-offs in
              implementation, political feasibility, and economic impact. These visualizations
              help you explore the data and see what each policy could fund.
            </p>
          </div>
        </div>

        {/* Visualization options */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">
            Choose a Visualization Approach
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visualizations.map((viz) => (
              <Link
                key={viz.href}
                href={viz.href}
                className={`group rounded-2xl border-2 p-6 transition-all hover:scale-105 ${
                  viz.color === "indigo"
                    ? "border-indigo-500/30 hover:border-indigo-500 hover:shadow-xl hover:shadow-indigo-500/20"
                    : viz.color === "purple"
                    ? "border-purple-500/30 hover:border-purple-500 hover:shadow-xl hover:shadow-purple-500/20"
                    : "border-blue-500/30 hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/20"
                } bg-zinc-900/50 hover:bg-zinc-900`}
              >
                <div className="mb-4 text-4xl">{viz.icon}</div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-white transition-colors">
                  {viz.title}
                </h3>
                <p className="text-sm text-zinc-400 mb-4">{viz.description}</p>
                <ul className="space-y-2 mb-6">
                  {viz.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-zinc-500">
                      <span className="text-emerald-500 mt-0.5">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <div className="flex items-center gap-2 text-sm font-medium group-hover:text-white transition-colors">
                  Explore this view
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Comparison table */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">
            Visualization Comparison
          </h2>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-400 uppercase">
                    Approach
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-400 uppercase">
                    Best For
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-400 uppercase">
                    Interaction
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-400 uppercase">
                    Data Focus
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-indigo-400">Policy Comparison</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-300">
                    Comparing revenue projections and trade-offs
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-400">
                    Toggle between policies, explore charts
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-400">
                    Revenue trends, pros/cons
                  </td>
                </tr>
                <tr className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-purple-400">Borough Impact</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-300">
                    Understanding local impact by neighborhood
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-400">
                    Click boroughs, see local priorities
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-400">
                    Geographic distribution
                  </td>
                </tr>
                <tr className="hover:bg-zinc-800/30">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-blue-400">Revenue Flow</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-300">
                    Following the full funding pipeline
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-400">
                    Hover nodes, see allocations
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-400">
                    End-to-end flow
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Research data source */}
        <div className="max-w-4xl mx-auto">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            <h3 className="text-lg font-semibold mb-3">📚 Research Sources</h3>
            <p className="text-sm text-zinc-400 mb-4">
              All visualizations are powered by comprehensive research including:
            </p>
            <ul className="grid md:grid-cols-2 gap-3 text-sm text-zinc-400">
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">•</span>
                NYC Open Data (budget & facilities)
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">•</span>
                City & State NY policy analysis
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">•</span>
                Community Board priorities
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">•</span>
                NYC Comptroller reports
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">•</span>
                MTA & DOT planning data
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">•</span>
                Public opinion surveys
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-zinc-800 text-center text-sm text-zinc-500">
          <p>
            Built with Next.js, React, and Recharts • Research completed March 2026
          </p>
        </footer>
      </div>
    </main>
  );
}
