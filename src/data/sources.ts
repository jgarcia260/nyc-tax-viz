/**
 * Data Sources & Citations
 * 
 * All data sources used in NYC Tax Visualizer
 * Compiled from research reports in ~/code/research-reports/
 */

export interface DataSource {
  id: string;
  title: string;
  url: string;
  organization: string;
  category: 'tax-policy' | 'budget' | 'transportation' | 'housing' | 'education' | 'data' | 'advocacy';
  description?: string;
}

export const dataSources: DataSource[] = [
  // Tax Policy Sources
  {
    id: 'cityandstate-mamdani',
    title: "Mamdani's Tax Plans",
    url: 'https://www.cityandstateny.com/policy/2025/09/what-are-mamdanis-plans-tax-rich/408352/',
    organization: 'City & State NY',
    category: 'tax-policy',
    description: 'Analysis of progressive tax proposals targeting high earners'
  },
  {
    id: 'forbes-millionaire-tax',
    title: 'Will Mamdani\'s Proposed Millionaire Tax Save or Sink New York City?',
    url: 'https://www.forbes.com/sites/kellyphillipserb/2025/11/06/will-mamdanis-proposed-millionaire-tax-save-or-sink-new-york-city/',
    organization: 'Forbes',
    category: 'tax-policy',
    description: 'Economic impact analysis of millionaire tax proposal'
  },
  {
    id: 'thecity-tax-increases',
    title: 'Would Tax Increases Drive Rich New Yorkers Away?',
    url: 'https://www.thecity.nyc/2026/02/18/tax-increase-wealthy-new-yorkers-leave-millionaires/',
    organization: 'The City',
    category: 'tax-policy',
    description: 'Investigation of wealthy migration patterns'
  },
  {
    id: 'nyfocus-legislature',
    title: 'State Legislature Backs Tax Hikes',
    url: 'https://nysfocus.com/2026/03/10/senate-assembly-mamdani-tax-hikes',
    organization: 'New York Focus',
    category: 'tax-policy',
    description: 'Legislative support for progressive tax reforms'
  },
  {
    id: 'nyfocus-corporate',
    title: 'Mamdani Corporate Tax Albany Asks',
    url: 'https://nysfocus.com/2026/03/06/mamdani-corporate-tax-albany',
    organization: 'New York Focus',
    category: 'tax-policy',
    description: 'Corporate tax reform proposals'
  },
  {
    id: 'nyc-business-tax',
    title: 'Business Corporation Tax',
    url: 'https://www.nyc.gov/site/finance/business/business-corporation-tax.page',
    organization: 'NYC Department of Finance',
    category: 'tax-policy',
    description: 'Official NYC business tax information'
  },
  {
    id: 'rsm-corporate-tax',
    title: 'NY Finalizes Broad Changes to Corporate Tax Rules',
    url: 'https://rsmus.com/insights/tax-alerts/2024/ny-finalizes-broad-changes-corporate-tax-rules.html',
    organization: 'RSM',
    category: 'tax-policy',
    description: 'Professional analysis of corporate tax reforms'
  },
  {
    id: 'nys-corporate-franchise',
    title: 'Corporate Franchise Tax Expenditures',
    url: 'https://www.tax.ny.gov/data/stats/ter/fiscal-year26/corporate-franchise-tax.htm',
    organization: 'NYS Department of Taxation',
    category: 'tax-policy',
    description: 'Official state tax revenue data'
  },
  {
    id: 'nber-billionaire-tax',
    title: 'How Much Tax Do Billionaires Pay?',
    url: 'https://www.nber.org/papers/w34170',
    organization: 'National Bureau of Economic Research',
    category: 'tax-policy',
    description: 'Academic research on billionaire effective tax rates'
  },
  {
    id: 'berkeley-ultrarich',
    title: 'The Ultra-Rich Are Different: Their Tax Rates Are Lower',
    url: 'https://news.berkeley.edu/2025/09/04/the-ultra-rich-are-different-from-you-and-me-their-tax-rates-are-lower/',
    organization: 'UC Berkeley',
    category: 'tax-policy',
    description: 'Research on ultra-wealthy tax rates'
  },

  // NYC Data & Budget Sources
  {
    id: 'nyc-opendata',
    title: 'NYC Open Data Portal',
    url: 'https://opendata.cityofnewyork.us/',
    organization: 'NYC Open Data',
    category: 'data',
    description: 'Official NYC government datasets including budget, tax revenue, and facilities'
  },
  {
    id: 'nyc-omb',
    title: 'NYC Office of Management & Budget',
    url: 'https://www.nyc.gov/site/omb/index.page',
    organization: 'NYC OMB',
    category: 'budget',
    description: 'Official city budget documents and financial plans'
  },
  {
    id: 'nyc-comptroller',
    title: 'NYC Comptroller Reports',
    url: 'https://comptroller.nyc.gov/',
    organization: 'NYC Comptroller',
    category: 'budget',
    description: 'Independent fiscal analysis and audits'
  },

  // Visualization & Geographic Data
  {
    id: 'mapbox-3d',
    title: 'Mapbox 3D Buildings',
    url: 'https://docs.mapbox.com/mapbox-gl-js/example/3d-buildings/',
    organization: 'Mapbox',
    category: 'data',
    description: 'NYC building footprints and 3D extrusion data'
  },
  {
    id: 'nyc-dcp-3d',
    title: 'NYC Planning 3D Resources',
    url: 'https://www.nyc.gov/content/planning/pages/resources?search=3d',
    organization: 'NYC Department of City Planning',
    category: 'data',
    description: 'High-quality 3D building models and urban planning data'
  },
  {
    id: 'arcgis-queens',
    title: 'Queens 3D Buildings Dataset',
    url: 'https://www.arcgis.com/home/item.html?id=7303cbdea440425783296b1b35e6df36',
    organization: 'ArcGIS',
    category: 'data',
    description: '3D building data with attributes (height, age, use)'
  },

  // Housing
  {
    id: 'nyc-hpd',
    title: 'Housing Preservation & Development',
    url: 'https://www.nyc.gov/site/hpd/index.page',
    organization: 'NYC HPD',
    category: 'housing',
    description: 'Affordable housing programs and strategic plans'
  },

  // Transportation
  {
    id: 'nyc-dot',
    title: 'NYC Department of Transportation',
    url: 'https://www.nyc.gov/html/dot/html/home/home.shtml',
    organization: 'NYC DOT',
    category: 'transportation',
    description: 'Transit infrastructure and street safety data'
  },
  {
    id: 'mta',
    title: 'MTA Customer Surveys & Data',
    url: 'https://new.mta.info/',
    organization: 'Metropolitan Transportation Authority',
    category: 'transportation',
    description: 'Public transit rider surveys and service data'
  },

  // Education
  {
    id: 'nyc-schools',
    title: 'NYC Department of Education',
    url: 'https://www.schools.nyc.gov/',
    organization: 'NYC DOE',
    category: 'education',
    description: 'Public school system data and strategic plans'
  },

  // Advocacy & Research Organizations
  {
    id: 'cbc',
    title: 'Citizens Budget Commission',
    url: 'https://cbcny.org/',
    organization: 'Citizens Budget Commission',
    category: 'advocacy',
    description: 'Independent fiscal policy analysis'
  },
  {
    id: 'transitcenter',
    title: 'TransitCenter',
    url: 'https://transitcenter.org/',
    organization: 'TransitCenter',
    category: 'advocacy',
    description: 'Transit advocacy and research'
  },
  {
    id: 'rpa',
    title: 'Regional Plan Association',
    url: 'https://rpa.org/',
    organization: 'Regional Plan Association',
    category: 'advocacy',
    description: 'Long-term urban planning and climate research'
  },
];

/**
 * Get sources by category
 */
export function getSourcesByCategory(category: DataSource['category']): DataSource[] {
  return dataSources.filter(source => source.category === category);
}

/**
 * Get source by ID
 */
export function getSourceById(id: string): DataSource | undefined {
  return dataSources.find(source => source.id === id);
}

/**
 * Get all source categories
 */
export function getCategories(): DataSource['category'][] {
  return Array.from(new Set(dataSources.map(s => s.category)));
}

/**
 * Format category name for display
 */
export function formatCategory(category: DataSource['category']): string {
  const names: Record<DataSource['category'], string> = {
    'tax-policy': 'Tax Policy',
    'budget': 'Budget & Finance',
    'transportation': 'Transportation',
    'housing': 'Housing',
    'education': 'Education',
    'data': 'Open Data',
    'advocacy': 'Research & Advocacy'
  };
  return names[category];
}
