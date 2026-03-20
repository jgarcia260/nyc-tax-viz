'use client';

import { useState } from 'react';
import { dataSources, getCategories, formatCategory, getSourcesByCategory } from '@/data/sources';

/**
 * Comprehensive data sources footer
 * Shows all sources grouped by category with expand/collapse
 */
export function DataSourcesFooter() {
  const [expanded, setExpanded] = useState(false);
  const categories = getCategories();

  return (
    <div className="mt-16 border-t border-zinc-800 pt-8">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 rounded-lg border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="text-2xl">📚</div>
          <div className="text-left">
            <h3 className="text-lg font-semibold">Data Sources & Citations</h3>
            <p className="text-sm text-zinc-200">
              {dataSources.length} sources from government agencies, research institutions, and advocacy organizations
            </p>
          </div>
        </div>
        <svg 
          className={`w-5 h-5 text-zinc-200 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="mt-6 space-y-8">
          {categories.map(category => {
            const sources = getSourcesByCategory(category);
            return (
              <div key={category}>
                <h4 className="text-sm font-semibold text-zinc-200 uppercase mb-3">
                  {formatCategory(category)} ({sources.length})
                </h4>
                <div className="grid md:grid-cols-2 gap-3">
                  {sources.map(source => (
                    <div 
                      key={source.id}
                      className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 hover:bg-zinc-900 transition-colors"
                    >
                      <div className="text-xs font-semibold text-zinc-500 uppercase mb-1">
                        {source.organization}
                      </div>
                      <a 
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-blue-400 hover:text-blue-300 hover:underline flex items-start gap-1"
                      >
                        <span className="flex-1">{source.title}</span>
                        <svg className="w-3 h-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                      {source.description && (
                        <p className="text-xs text-zinc-200 mt-2">
                          {source.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          <div className="rounded-lg border border-emerald-900/50 bg-emerald-950/20 p-4">
            <div className="flex items-start gap-3">
              <div className="text-xl">✓</div>
              <div>
                <h4 className="text-sm font-semibold text-emerald-400 mb-1">
                  Transparency Commitment
                </h4>
                <p className="text-xs text-zinc-200">
                  All data, research, and visualizations in this app are sourced from public records, 
                  government agencies, and peer-reviewed research. We believe in transparent, 
                  evidence-based policy discussion. If you find any data inaccuracies, please 
                  report them on our <a href="https://github.com/jgarcia260/nyc-tax-viz" className="text-blue-400 hover:underline" target="_blank" rel="noopener">GitHub repository</a>.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Compact sources section (for pages where full footer is too much)
 */
export function CompactDataSources({ sourceIds }: { sourceIds: string[] }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
      <h4 className="text-sm font-semibold text-zinc-200 mb-3 flex items-center gap-2">
        <span>📊</span>
        Data Sources Used
      </h4>
      <div className="space-y-2">
        {sourceIds.map(id => {
          const source = dataSources.find(s => s.id === id);
          if (!source) return null;
          return (
            <div key={source.id} className="text-xs">
              <a 
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 hover:underline"
              >
                {source.title}
              </a>
              <span className="text-zinc-500 ml-2">• {source.organization}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
