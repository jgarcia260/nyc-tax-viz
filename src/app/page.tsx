import Link from "next/link";
import { DataSourcesFooter } from "@/components/ui/DataSourcesFooter";
import { Citation } from "@/components/ui/Citation";

export default function Home() {
  const visualizations = [
    {
      title: "Interactive Tax Slider",
      href: "/tax-slider",
      description: "Adjust tax policy in real-time and see what can be funded",
      features: [
        "Real-time revenue calculations",
        "Billionaire / Hybrid / Corporate slider",
        "Funding coverage for each priority",
        "Mobile-friendly controls"
      ],
      color: "emerald",
      icon: "🎚️",
    },
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
      title: "3D Borough Map",
      href: "/borough-map-premium",
      description: "Interactive 3D visualization of NYC boroughs with SimCity-style aesthetics and advanced effects",
      features: [
        "360° camera controls (rotate, pan, zoom)",
        "Clickable 3D borough geometries with tax data",
        "Bloom, DOF, SSAO post-processing",
        "GSAP cinematic animations",
        "Mobile-responsive touch controls"
      ],
      color: "cyan",
      icon: "🏙️",
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
    <main className="min-h-screen px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-16 sm:mb-20 lg:mb-24 text-center animate-fade-in">
          <p className="text-xs sm:text-sm font-bold tracking-[0.25em] uppercase text-blue-400 mb-3 sm:mb-4">
            Interactive Data Visualization
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-4 sm:mb-6 text-white leading-[1.1]">
            NYC Tax Visualizer
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-zinc-300 max-w-3xl mx-auto leading-relaxed px-4">
            Explore how NYC&apos;s $107 billion budget works — and what new tax policies could fund.
            Interactive visualizations powered by real research data.
          </p>
        </header>

        {/* Context */}
        <section className="mb-16 sm:mb-20 lg:mb-24 max-w-4xl mx-auto px-4">
          <div className="group rounded-2xl border border-zinc-800/90 bg-zinc-900/90 backdrop-blur-sm p-7 sm:p-9 lg:p-10 shadow-2xl transition-all duration-300 hover:border-zinc-700 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] hover:bg-zinc-900 focus-within:border-zinc-600 focus-within:ring-2 focus-within:ring-zinc-600/50 will-change-transform">
            <h2 className="text-2xl sm:text-3xl font-extrabold mb-5 sm:mb-6 text-white">The Question</h2>
            <div className="space-y-4 sm:space-y-5 text-base sm:text-lg text-zinc-300 leading-relaxed">
              <p>
                NYC faces critical revenue decisions: should the city pursue a{" "}
                <span className="font-bold text-purple-300">billionaire tax</span> targeting
                ultra-wealthy individuals, or{" "}
                <span className="font-bold text-blue-300">corporate tax reform</span> focused
                on business restructuring?
              </p>
              <p>
                Each approach generates $2.5-3.8B over 5 years, but with different trade-offs in
                implementation, political feasibility, and economic impact. These visualizations
                help you explore the data and see what each policy could fund.
              </p>
            </div>
          </div>
        </section>

        {/* Visualization APPROACHES */}
        <section className="mb-16 sm:mb-20 lg:mb-24">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-3 sm:mb-4 text-white">
              Visualization Approaches
            </h2>
            <p className="text-base sm:text-lg text-zinc-300 max-w-2xl mx-auto leading-relaxed px-4">
              Interactive ways to explore NYC tax policy data — from policy comparison and geographic impact to 3D borough maps and real-time revenue calculations.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {visualizations.map((viz) => (
              <Link
                key={viz.href}
                href={viz.href}
                className={`group relative rounded-2xl border-2 p-6 sm:p-7 transition-all duration-300 ease-out hover:scale-[1.02] hover:-translate-y-1 shadow-xl hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black will-change-transform ${
                  viz.color === "emerald"
                    ? "border-emerald-500/50 hover:border-emerald-400/90 hover:shadow-emerald-500/30 focus:ring-emerald-500/50 bg-gradient-to-br from-zinc-900/95 to-zinc-900/80 backdrop-blur-sm hover:from-zinc-900 hover:to-zinc-900/90"
                    : viz.color === "indigo"
                    ? "border-indigo-500/50 hover:border-indigo-400/90 hover:shadow-indigo-500/30 focus:ring-indigo-500/50 bg-gradient-to-br from-zinc-900/95 to-zinc-900/80 backdrop-blur-sm hover:from-zinc-900 hover:to-zinc-900/90"
                    : viz.color === "purple"
                    ? "border-purple-500/50 hover:border-purple-400/90 hover:shadow-purple-500/30 focus:ring-purple-500/50 bg-gradient-to-br from-zinc-900/95 to-zinc-900/80 backdrop-blur-sm hover:from-zinc-900 hover:to-zinc-900/90"
                    : viz.color === "cyan"
                    ? "border-cyan-500/50 hover:border-cyan-400/90 hover:shadow-cyan-500/30 focus:ring-cyan-500/50 bg-gradient-to-br from-zinc-900/95 to-zinc-900/80 backdrop-blur-sm hover:from-zinc-900 hover:to-zinc-900/90"
                    : "border-blue-500/50 hover:border-blue-400/90 hover:shadow-blue-500/30 focus:ring-blue-500/50 bg-gradient-to-br from-zinc-900/95 to-zinc-900/80 backdrop-blur-sm hover:from-zinc-900 hover:to-zinc-900/90"
                }`}
              >
                <div className="mb-4 sm:mb-5 text-4xl sm:text-5xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">{viz.icon}</div>
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-2 sm:mb-3 text-white transition-colors duration-200">
                  {viz.title}
                </h3>
                <p className="text-sm sm:text-base text-zinc-300 mb-4 sm:mb-5 leading-relaxed">
                  {viz.description}
                </p>
                <ul className="space-y-2 sm:space-y-2.5 mb-5 sm:mb-6">
                  {viz.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 sm:gap-2.5 text-xs sm:text-sm text-zinc-300">
                      <span className="text-emerald-400 mt-0.5 font-bold flex-shrink-0 transition-transform duration-200 group-hover:scale-110">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex items-center gap-2 text-sm font-bold text-zinc-400 group-hover:text-white transition-colors duration-200 mt-auto">
                  Explore this view
                  <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">→</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Comparison table */}
        <section className="mb-16 sm:mb-20 lg:mb-24">
          <div className="text-center mb-10 sm:mb-12 lg:mb-14">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-3 sm:mb-4 text-white">
              Core Narrative Approaches
            </h2>
            <p className="text-base sm:text-lg text-zinc-300 max-w-2xl mx-auto leading-relaxed px-4">
              The three foundational ways we tell the tax policy story — each optimized for different use cases.
            </p>
          </div>
          
          {/* Desktop Table */}
          <div className="hidden md:block rounded-2xl border border-zinc-800/90 bg-zinc-900/80 overflow-hidden shadow-2xl backdrop-blur-sm">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-zinc-700/90 bg-zinc-900">
                  <th className="px-5 lg:px-6 py-4 lg:py-5 text-left text-xs lg:text-sm font-extrabold text-zinc-200 uppercase tracking-wider">
                    Approach
                  </th>
                  <th className="px-5 lg:px-6 py-4 lg:py-5 text-left text-xs lg:text-sm font-extrabold text-zinc-200 uppercase tracking-wider">
                    Best For
                  </th>
                  <th className="px-5 lg:px-6 py-4 lg:py-5 text-left text-xs lg:text-sm font-extrabold text-zinc-200 uppercase tracking-wider">
                    Interaction
                  </th>
                  <th className="px-5 lg:px-6 py-4 lg:py-5 text-left text-xs lg:text-sm font-extrabold text-zinc-200 uppercase tracking-wider">
                    Data Focus
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-zinc-800/60 hover:bg-zinc-800/50 transition-all duration-200">
                  <td className="px-5 lg:px-6 py-4 lg:py-5">
                    <div className="font-bold text-base text-indigo-300">Policy Comparison</div>
                  </td>
                  <td className="px-5 lg:px-6 py-4 lg:py-5 text-sm text-zinc-300">
                    Comparing revenue projections and trade-offs
                  </td>
                  <td className="px-5 lg:px-6 py-4 lg:py-5 text-sm text-zinc-300">
                    Toggle between policies, explore charts
                  </td>
                  <td className="px-5 lg:px-6 py-4 lg:py-5 text-sm text-zinc-300">
                    Revenue trends, pros/cons
                  </td>
                </tr>
                <tr className="border-b border-zinc-800/60 hover:bg-zinc-800/50 transition-all duration-200">
                  <td className="px-5 lg:px-6 py-4 lg:py-5">
                    <div className="font-bold text-base text-purple-300">Borough Impact</div>
                  </td>
                  <td className="px-5 lg:px-6 py-4 lg:py-5 text-sm text-zinc-300">
                    Understanding local impact by neighborhood
                  </td>
                  <td className="px-5 lg:px-6 py-4 lg:py-5 text-sm text-zinc-300">
                    Click boroughs, see local priorities
                  </td>
                  <td className="px-5 lg:px-6 py-4 lg:py-5 text-sm text-zinc-300">
                    Geographic distribution
                  </td>
                </tr>
                <tr className="hover:bg-zinc-800/50 transition-all duration-200">
                  <td className="px-5 lg:px-6 py-4 lg:py-5">
                    <div className="font-bold text-base text-blue-300">Revenue Flow</div>
                  </td>
                  <td className="px-5 lg:px-6 py-4 lg:py-5 text-sm text-zinc-300">
                    Following the full funding pipeline
                  </td>
                  <td className="px-5 lg:px-6 py-4 lg:py-5 text-sm text-zinc-300">
                    Hover nodes, see allocations
                  </td>
                  <td className="px-5 lg:px-6 py-4 lg:py-5 text-sm text-zinc-300">
                    End-to-end flow
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            <div className="rounded-xl border border-zinc-800/90 bg-zinc-900/80 p-5 shadow-xl backdrop-blur-sm">
              <h3 className="font-bold text-lg text-indigo-300 mb-3">Policy Comparison</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-semibold text-zinc-200">Best For:</span>
                  <p className="text-zinc-300 mt-1">Comparing revenue projections and trade-offs</p>
                </div>
                <div>
                  <span className="font-semibold text-zinc-200">Interaction:</span>
                  <p className="text-zinc-300 mt-1">Toggle between policies, explore charts</p>
                </div>
                <div>
                  <span className="font-semibold text-zinc-200">Data Focus:</span>
                  <p className="text-zinc-300 mt-1">Revenue trends, pros/cons</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-zinc-800/90 bg-zinc-900/80 p-5 shadow-xl backdrop-blur-sm">
              <h3 className="font-bold text-lg text-purple-300 mb-3">Borough Impact</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-semibold text-zinc-200">Best For:</span>
                  <p className="text-zinc-300 mt-1">Understanding local impact by neighborhood</p>
                </div>
                <div>
                  <span className="font-semibold text-zinc-200">Interaction:</span>
                  <p className="text-zinc-300 mt-1">Click boroughs, see local priorities</p>
                </div>
                <div>
                  <span className="font-semibold text-zinc-200">Data Focus:</span>
                  <p className="text-zinc-300 mt-1">Geographic distribution</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-zinc-800/90 bg-zinc-900/80 p-5 shadow-xl backdrop-blur-sm">
              <h3 className="font-bold text-lg text-blue-300 mb-3">Revenue Flow</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-semibold text-zinc-200">Best For:</span>
                  <p className="text-zinc-300 mt-1">Following the full funding pipeline</p>
                </div>
                <div>
                  <span className="font-semibold text-zinc-200">Interaction:</span>
                  <p className="text-zinc-300 mt-1">Hover nodes, see allocations</p>
                </div>
                <div>
                  <span className="font-semibold text-zinc-200">Data Focus:</span>
                  <p className="text-zinc-300 mt-1">End-to-end flow</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Research data source */}
        <section className="mb-16 sm:mb-20 max-w-4xl mx-auto px-4">
          <div className="rounded-2xl border border-zinc-800/90 bg-zinc-900/80 p-6 sm:p-8 lg:p-9 shadow-2xl backdrop-blur-sm">
            <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-5 flex items-center gap-2 text-white">
              📚 Research Sources
              <Citation sourceIds={['nyc-opendata', 'nyc-comptroller', 'cityandstate-mamdani']} variant="icon" />
            </h3>
            <p className="text-sm sm:text-base text-zinc-300 mb-6 sm:mb-7 leading-relaxed">
              All visualizations are powered by comprehensive research from official government sources, 
              academic institutions, and independent research organizations. Hover over the 
              <Citation sourceIds={['nyc-opendata']} variant="icon" /> icons throughout the app to see specific citations.
            </p>
            <ul className="grid sm:grid-cols-2 gap-y-3 sm:gap-y-3.5 gap-x-6 text-sm sm:text-base text-zinc-300">
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-400 mt-1 font-bold">•</span>
                <span>
                  NYC Open Data <Citation sourceIds={['nyc-opendata']} variant="superscript" />
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-400 mt-1 font-bold">•</span>
                <span>
                  City & State NY <Citation sourceIds={['cityandstate-mamdani']} variant="superscript" />
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-400 mt-1 font-bold">•</span>
                <span>
                  NYC Comptroller <Citation sourceIds={['nyc-comptroller']} variant="superscript" />
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-400 mt-1 font-bold">•</span>
                <span>
                  MTA & DOT <Citation sourceIds={['mta', 'nyc-dot']} variant="superscript" />
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-400 mt-1 font-bold">•</span>
                <span>
                  Academic Research <Citation sourceIds={['nber-billionaire-tax', 'berkeley-ultrarich']} variant="superscript" />
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-400 mt-1 font-bold">•</span>
                <span>
                  Independent Analysis <Citation sourceIds={['cbc', 'rpa']} variant="superscript" />
                </span>
              </li>
            </ul>
          </div>
        </section>

        {/* Data Sources Footer */}
        <DataSourcesFooter />

        {/* Footer */}
        <footer className="mt-16 sm:mt-20 pt-8 border-t border-zinc-800/60 text-center">
          <div className="space-y-3 sm:space-y-4">
            <p className="text-sm text-zinc-400 px-4">
              Built with Next.js, React Three Fiber, and D3.js • Research completed March 2026
            </p>
            <p className="text-sm px-4">
              <a 
                href="https://github.com/jgarcia260/nyc-tax-viz" 
                className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium transition-colors duration-200 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-400/50 rounded px-2 py-1" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
                View on GitHub
              </a>
            </p>
          </div>
        </footer>
      </div>
    </main>
  );
}
