'use client';

import { useState } from 'react';
import { getSourceById, type DataSource } from '@/data/sources';

interface CitationProps {
  sourceIds: string[];
  variant?: 'inline' | 'icon' | 'superscript';
  className?: string;
}

/**
 * Citation component - displays source references with tooltips
 * 
 * Usage:
 * <Citation sourceIds={['nyc-opendata', 'nyc-comptroller']} />
 * <Citation sourceIds={['forbes-millionaire-tax']} variant="superscript" />
 */
export function Citation({ sourceIds, variant = 'icon', className = '' }: CitationProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  
  const sources = sourceIds
    .map(id => getSourceById(id))
    .filter((source): source is DataSource => source !== undefined);

  if (sources.length === 0) return null;

  const renderTrigger = () => {
    switch (variant) {
      case 'inline':
        return (
          <span className={`text-blue-400 hover:text-blue-300 cursor-help underline decoration-dotted ${className}`}>
            [{sources.map(s => s.organization).join(', ')}]
          </span>
        );
      case 'superscript':
        return (
          <sup className={`text-blue-400 hover:text-blue-300 cursor-help text-xs ${className}`}>
            [{sourceIds.length}]
          </sup>
        );
      case 'icon':
      default:
        return (
          <span className={`inline-flex items-center justify-center w-4 h-4 ml-1 text-xs text-blue-400 hover:text-blue-300 cursor-help ${className}`}>
            <svg className="w-full h-full" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </span>
        );
    }
  };

  return (
    <span 
      className="relative inline-block"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {renderTrigger()}
      
      {showTooltip && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-80 p-3 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl">
          <div className="text-xs font-semibold text-zinc-400 mb-2">
            {sources.length === 1 ? 'Source:' : 'Sources:'}
          </div>
          <div className="space-y-2">
            {sources.map((source, i) => (
              <div key={source.id} className="text-xs">
                <a 
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 hover:underline"
                >
                  {source.title}
                </a>
                <div className="text-zinc-500 text-[10px] mt-0.5">
                  {source.organization}
                  {source.description && ` • ${source.description}`}
                </div>
              </div>
            ))}
          </div>
          {/* Tooltip arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
            <div className="border-4 border-transparent border-t-zinc-700"></div>
          </div>
        </div>
      )}
    </span>
  );
}

/**
 * Inline citation badge - shows number of sources
 */
export function CitationBadge({ sourceIds, className = '' }: { sourceIds: string[]; className?: string }) {
  return (
    <Citation 
      sourceIds={sourceIds} 
      variant="superscript"
      className={className}
    />
  );
}

/**
 * Source card - displays full source information
 */
export function SourceCard({ sourceId }: { sourceId: string }) {
  const source = getSourceById(sourceId);
  
  if (!source) return null;

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
      <div className="text-xs font-semibold text-zinc-500 uppercase mb-1">
        {source.organization}
      </div>
      <a 
        href={source.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm font-medium text-blue-400 hover:text-blue-300 hover:underline"
      >
        {source.title}
      </a>
      {source.description && (
        <p className="text-xs text-zinc-400 mt-2">
          {source.description}
        </p>
      )}
    </div>
  );
}
