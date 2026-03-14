# NYC Tax Visualizer

**Three interactive approaches to visualize NYC tax policy revenue and how it funds improvements**

Built with Next.js, React, Recharts, and real research data from NYC Open Data, City & State NY, and community surveys.

---

## 🎯 Project Overview

NYC faces critical revenue decisions: pursue a **billionaire tax** (targeting ultra-wealthy individuals) or **corporate tax reform** (business tax restructuring)? Both generate $2.5-3.8B over 5 years, but with different trade-offs.

This project provides **three distinct visualization approaches** to help explore the data and understand what each policy could fund.

---

## 🚀 Live Demos

### Approach 1: Policy Comparison Dashboard
**URL:** `/policy-comparison`

**Best for:** Comparing revenue projections and trade-offs side-by-side

**Features:**
- Toggle between billionaire tax vs. corporate tax
- Revenue projection charts (5-year timeline)
- Pros/cons analysis for each policy
- Funding capacity breakdown
- See what improvements each policy can afford

**Use case:** Policy makers and analysts comparing revenue strategies

---

### Approach 2: Borough Impact Map
**URL:** `/borough-impact`

**Best for:** Understanding local impact by neighborhood

**Features:**
- Interactive borough selector (Manhattan, Brooklyn, Queens, Bronx, Staten Island)
- Revenue distribution pie chart
- Local priority improvements per borough
- Population-based revenue analysis
- Policy comparison by geographic area

**Use case:** Community leaders and residents seeing local impact

---

### Approach 3: Tax Revenue Flow
**URL:** `/flow-visualization`

**Best for:** Following the full funding pipeline from tax to improvements

**Features:**
- Visual flow diagram (tax policy → revenue → improvements)
- Step-by-step breakdown
- Funding gap analysis (revenue vs. total needs)
- Priority-based allocation visualization
- Coverage percentage for each improvement category

**Use case:** Public education and transparency advocates

---

## 📊 Data Sources

All visualizations are powered by comprehensive research including:

- **NYC Open Data** - Budget data, facilities, demographics
- **City & State NY** - Tax policy analysis (Mamdani proposals)
- **NYC Comptroller** - Financial reports and audits
- **Community Board Needs Statements** - Local priorities
- **MTA & NYC DOT** - Transit planning data
- **Public Opinion Surveys** - Resident priorities

Research completed: **March 2026**

---

## 🏗️ Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **Charts:** Recharts
- **Maps:** Maplibre GL
- **Package Manager:** pnpm

---

## 🧑‍💻 Local Development

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Open http://localhost:3000
```

### Build for production

```bash
pnpm build
pnpm start
```

---

## 📦 Project Structure

```
nyc-tax-viz/
├── data/
│   ├── tax-policies.json          # Tax policy comparison data
│   ├── dollar-breakdown.json      # Budget breakdown
│   └── expense-budget.json        # Agency budgets
├── src/
│   ├── app/
│   │   ├── page.tsx              # Landing page (comparison)
│   │   ├── policy-comparison/    # Approach 1
│   │   ├── borough-impact/       # Approach 2
│   │   └── flow-visualization/   # Approach 3
│   └── components/
│       ├── PolicyDashboard.tsx
│       ├── BoroughImpactMap.tsx
│       └── FlowVisualization.tsx
└── scripts/
    └── fetch-budget-data.ts      # Data fetching script
```

---

## 🌐 Deployment

### Option 1: Vercel (Recommended)

**Via GitHub Integration:**

1. Go to [vercel.com](https://vercel.com)
2. Import repository: `jgarcia260/nyc-tax-viz`
3. Configure:
   - Framework Preset: Next.js
   - Build Command: `pnpm build`
   - Output Directory: `.next`
4. Deploy

**Via CLI:**

```bash
npx vercel --prod
```

### Option 2: Manual Deploy

```bash
# Build
pnpm build

# Deploy .next folder to any static host
```

---

## 📝 Visualization Comparison

| Approach | Best For | Interaction | Data Focus |
|----------|----------|-------------|------------|
| **Policy Comparison** | Revenue projections & trade-offs | Toggle policies, explore charts | Revenue trends, pros/cons |
| **Borough Impact** | Local neighborhood impact | Click boroughs, see priorities | Geographic distribution |
| **Revenue Flow** | Full funding pipeline | Hover nodes, see allocations | End-to-end flow |

---

## 🎨 Design Principles

1. **Data-driven** - All visualizations use real research data
2. **Interactive** - Users can explore and compare options
3. **Accessible** - Clear labels, color-coded categories
4. **Responsive** - Works on desktop, tablet, and mobile
5. **Fast** - Static generation for instant load times

---

## 📈 Revenue Projections (from research)

### Billionaire Tax (Mamdani Proposal)
- **Year 1:** $2.5B
- **Year 3:** $2.1B (migration drag)
- **Year 5:** $1.8B
- **Flight Risk:** High (5-8% outmigration)
- **Implementation:** 6-12 months

### Corporate Tax Reform
- **Year 1:** $2.5B
- **Year 3:** $3.2B
- **Year 5:** $3.8B
- **Flight Risk:** Moderate
- **Implementation:** 12-24 months

---

## 🏙️ Improvement Categories

Revenue can fund these top NYC priorities:

1. **Affordable Housing** ($5B over 5 years) - 30,000+ new units
2. **Public Transit** ($3B) - 50% more accessible stations
3. **Education** ($10B) - Smaller classes, modern buildings
4. **Public Safety** ($2B) - Community-based approach
5. **Green Infrastructure** ($5B) - Climate resilience

**Total improvement needs:** ~$25B over 5 years  
**Single policy coverage:** 10-15% of total needs

---

## 🤝 Contributing

This is a research visualization project. To contribute:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

Suggestions welcome for:
- Additional visualization approaches
- Updated data sources
- Improved interactivity
- Accessibility enhancements

---

## 📄 License

MIT License - See LICENSE file for details

---

## 🙏 Acknowledgments

- NYC Open Data Portal
- City & State NY journalism
- Community Board organizations
- NYC Comptroller's office
- Regional Plan Association
- Citizens Budget Commission

---

## 📧 Contact

Questions or feedback? Open an issue on GitHub.

**Built by:** Jorge Garcia  
**GitHub:** [@jgarcia260](https://github.com/jgarcia260)  
**Project:** Research-driven NYC tax policy visualization

---

**Last Updated:** March 2026
