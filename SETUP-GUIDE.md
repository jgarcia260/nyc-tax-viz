# NYC Tax Visualizer - Setup Guide

Premium visualization tech stack for interactive NYC tax data exploration.

## 🚀 Tech Stack

### Core Framework
- **Next.js 16** - React framework with App Router
- **TypeScript** - Strict type safety
- **Tailwind CSS v4** - Utility-first styling with custom design tokens

### 3D Visualization
- **React Three Fiber** - React renderer for Three.js
- **@react-three/drei** - Useful helpers for R3F
- **@react-three/postprocessing** - Post-processing effects
- **Three.js** - 3D graphics library

### Animation
- **GSAP** - Professional-grade animation
- **Framer Motion** - React animation library
- **React Spring** - Spring-physics animations
- **Lottie React** - After Effects animations

### Data Visualization
- **D3.js** - Data-driven visualizations
- **Visx** - React + D3 components
- **Recharts** - Composable chart library
- **Chart.js** - Simple chart library

### UI Components
- **Radix UI** - Accessible component primitives
  - Dialog, Dropdown Menu, Select, Tooltip, Tabs, Slider

### Maps
- **MapLibre GL** - Vector maps (open-source Mapbox alternative)
- **React Map GL** - React wrapper for map libraries

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/jgarcia260/nyc-tax-viz.git
cd nyc-tax-viz

# Install dependencies (using pnpm)
pnpm install

# Or with npm
npm install

# Or with yarn
yarn install
```

## 🏗️ Project Structure

```
nyc-tax-viz/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── globals.css         # Design system + Tailwind
│   │   └── */                  # Route-based pages
│   ├── components/
│   │   ├── 3d/                 # React Three Fiber components
│   │   ├── ui/                 # Reusable UI components
│   │   ├── viz/                # Data visualization components
│   │   └── animations/         # Animation components
│   ├── lib/
│   │   ├── hooks/              # Custom React hooks
│   │   ├── utils/              # Utility functions
│   │   ├── shaders/            # GLSL shaders for 3D
│   │   └── data/               # Data processing utilities
│   └── public/                 # Static assets
├── scripts/                    # Build and data scripts
└── data/                       # Data files
```

## 🎨 Design System

The project uses a custom design system with Tailwind CSS v4:

### Color Palette
- **Primary** (Deep Blue) - Main brand color
- **Secondary** (Teal/Cyan) - Supporting color
- **Accent** (Gold/Yellow) - Highlights
- **Neutral** - Gray scale for text and backgrounds

### Custom Tokens
All design tokens are defined in `src/app/globals.css`:
- Typography scale
- Spacing scale
- Border radius
- Shadows
- Transitions
- Z-index layers

### Usage Example
```tsx
// Use design tokens via Tailwind classes
<div className="bg-primary text-neutral-50 rounded-lg shadow-md">
  Content
</div>
```

## 🚀 Development

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Fetch NYC budget data
pnpm fetch-data
```

Development server runs at: http://localhost:3000

## ⚡ Performance Optimizations

### Code Splitting
All heavy components (especially 3D) are lazy-loaded:

```tsx
import { lazyLoad } from '@/lib/utils/lazy-load';

const Map3D = lazyLoad(() => import('@/components/3d/Map3D'), {
  ssr: false, // Disable SSR for client-only components
});
```

### Lazy Loading with Intersection Observer
```tsx
import { LazyLoadComponent } from '@/lib/hooks/use-intersection-observer';

<LazyLoadComponent threshold={0.1}>
  <HeavyComponent />
</LazyLoadComponent>
```

### GPU Acceleration
```tsx
import { gpuAccelerate } from '@/lib/utils/performance';

<div style={gpuAccelerate()}>
  Animated content
</div>
```

### Optimal DPR for Canvas
```tsx
import { getOptimalDpr } from '@/lib/utils/performance';

<Canvas dpr={getOptimalDpr()}>
  {/* 3D scene */}
</Canvas>
```

## 🎯 Key Features

### 3D Visualizations
- Interactive 3D NYC borough map
- Real-time data updates
- Custom shaders for effects
- Post-processing (bloom, depth of field)

### Animations
- Smooth transitions with GSAP
- Physics-based animations with React Spring
- Gesture-based interactions
- Cinematic camera movements

### Data Viz
- Interactive charts and graphs
- Sankey diagrams for budget flow
- Real-time tax calculations
- Comparison tools

### Performance
- Code splitting for faster initial load
- Lazy loading of heavy components
- GPU acceleration for animations
- Optimized canvas rendering

## 🌐 Deployment

### Vercel (Recommended)
The project is configured for Vercel deployment:

```bash
# Deploy to production
vercel --prod

# Or use the GitHub integration
# Push to main branch → auto-deploys
```

Configuration in `vercel.json`:
- Static export to `out/` directory
- Optimized build settings

### Manual Deploy
```bash
# Build static export
pnpm build

# The static site is in ./out/
# Deploy ./out/ to any static host
```

## 📝 Environment Variables

Create `.env.local` for local development:

```env
# Add any API keys or config here
NEXT_PUBLIC_MAPBOX_TOKEN=your_token_here
```

## 🧪 Testing

```bash
# Run tests (when added)
pnpm test

# Type checking
pnpm tsc --noEmit
```

## 📚 Documentation

- [Next.js Docs](https://nextjs.org/docs)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [Visx](https://airbnb.io/visx/)
- [Radix UI](https://www.radix-ui.com/)

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

---

**Built with ❤️ for transparent civic data visualization**
