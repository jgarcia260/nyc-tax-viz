"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { sankey, sankeyLinkHorizontal, SankeyGraph, SankeyNode, SankeyLink } from "d3-sankey";

interface FlowData {
  nodes: { name: string }[];
  links: { source: number; target: number; value: number }[];
}

export function D3SankeyFlow({ data }: { data: any }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const { billionaireTax, improvements } = data;
    
    // Build Sankey data
    const nodes = [
      { name: "Billionaire Tax" },
      { name: "Revenue Pool" },
      ...Object.values(improvements).map((imp: any) => ({ name: imp.name }))
    ];

    const totalRevenue = billionaireTax.revenueProjections.year5;
    const totalNeeds = Object.values(improvements).reduce((sum: number, imp: any) => sum + imp.cost5Year, 0);
    
    const links = [
      { source: 0, target: 1, value: totalRevenue / 1e9 }, // Tax → Pool
      ...Object.values(improvements).map((imp: any, i: number) => ({
        source: 1,
        target: i + 2,
        value: (totalRevenue / totalNeeds) * (imp.cost5Year / 1e9)
      }))
    ];

    const flowData: FlowData = { nodes, links };

    // D3 Sankey setup
    const width = 800;
    const height = 600;
    const margin = { top: 10, right: 10, bottom: 10, left: 10 };

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const g = svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const sankeyGenerator = sankey<SankeyGraph<{}, {}>, {}, {}>()
      .nodeWidth(15)
      .nodePadding(20)
      .extent([
        [0, 0],
        [width - margin.left - margin.right, height - margin.top - margin.bottom]
      ]);

    const graph = sankeyGenerator(flowData as any);

    // Links
    g.append("g")
      .selectAll("path")
      .data(graph.links)
      .join("path")
      .attr("d", sankeyLinkHorizontal())
      .attr("stroke", (d: any) => d.source.index === 0 ? "#8b5cf6" : "#6366f1")
      .attr("stroke-width", (d: any) => Math.max(1, d.width || 0))
      .attr("fill", "none")
      .attr("opacity", 0.5)
      .append("title")
      .text((d: any) => `${d.source.name} → ${d.target.name}\n$${d.value.toFixed(1)}B`);

    // Nodes
    g.append("g")
      .selectAll("rect")
      .data(graph.nodes)
      .join("rect")
      .attr("x", (d: any) => d.x0)
      .attr("y", (d: any) => d.y0)
      .attr("height", (d: any) => d.y1 - d.y0)
      .attr("width", (d: any) => d.x1 - d.x0)
      .attr("fill", (d: any) => (d.index === 0 ? "#8b5cf6" : d.index === 1 ? "#10b981" : "#6366f1"))
      .attr("stroke", "#1f2937")
      .append("title")
      .text((d: any) => `${d.name}`);

    // Labels
    g.append("g")
      .selectAll("text")
      .data(graph.nodes)
      .join("text")
      .attr("x", (d: any) => (d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6))
      .attr("y", (d: any) => (d.y0 + d.y1) / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", (d: any) => (d.x0 < width / 2 ? "start" : "end"))
      .attr("fill", "#e4e4e7")
      .attr("font-size", "12px")
      .text((d: any) => d.name);
  }, [data]);

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
      <h2 className="text-xl font-semibold mb-4">D3 Sankey Flow Diagram</h2>
      <p className="text-sm text-zinc-400 mb-6">
        Visual flow from tax policy → revenue pool → improvements
      </p>
      <div className="overflow-x-auto">
        <svg ref={svgRef} className="mx-auto" />
      </div>
      <div className="mt-4 text-xs text-zinc-500">
        <p>💡 Hover over flows to see dollar amounts</p>
        <p>Width of flows = proportion of revenue allocated</p>
      </div>
    </div>
  );
}
