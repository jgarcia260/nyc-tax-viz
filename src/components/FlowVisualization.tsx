"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PolicyData {
  billionaireTax: any;
  corporateTax: any;
  improvements: any;
  boroughBreakdown: any;
}

interface SankeyNode {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  value: number;
  detail?: string;
}

interface SankeyLink {
  source: string;
  target: string;
  value: number;
  color: string;
  sourceY: number;
  targetY: number;
  thickness: number;
}

interface Particle {
  id: number;
  linkIndex: number;
  progress: number;
  speed: number;
  size: number;
}

const COLORS = {
  billionaire: { primary: "#a855f7" },
  corporate: { primary: "#3b82f6" },
  revenue: { primary: "#10b981" },
  improvements: [
    "#f59e0b",
    "#06b6d4",
    "#8b5cf6",
    "#ef4444",
    "#22c55e",
  ],
};

function formatBillions(value: number) {
  return `$${(value / 1e9).toFixed(1)}B`;
}

function generateLinkPath(
  sx: number, sy: number, sWidth: number,
  tx: number, ty: number,
  thickness: number
): string {
  const x0 = sx + sWidth;
  const x1 = tx;
  const midX = (x0 + x1) / 2;
  const topY0 = sy - thickness / 2;
  const topY1 = ty - thickness / 2;
  const botY0 = sy + thickness / 2;
  const botY1 = ty + thickness / 2;

  return [
    `M ${x0},${topY0}`,
    `C ${midX},${topY0} ${midX},${topY1} ${x1},${topY1}`,
    `L ${x1},${botY1}`,
    `C ${midX},${botY1} ${midX},${botY0} ${x0},${botY0}`,
    `Z`,
  ].join(" ");
}

function getPointOnLink(
  sx: number, sy: number, sWidth: number,
  tx: number, ty: number,
  t: number
): { x: number; y: number } {
  const x0 = sx + sWidth;
  const x1 = tx;
  const midX = (x0 + x1) / 2;
  const u = 1 - t;
  const x = u * u * u * x0 + 3 * u * u * t * midX + 3 * u * t * t * midX + t * t * t * x1;
  const y = u * u * u * sy + 3 * u * u * t * sy + 3 * u * t * t * ty + t * t * t * ty;
  return { x, y };
}

function AnimatedParticles({
  links,
  nodes,
}: {
  links: SankeyLink[];
  nodes: SankeyNode[];
}) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const frameRef = useRef<number>(0);
  const particleIdRef = useRef(0);

  const nodeMap = useMemo(() => {
    const map: Record<string, SankeyNode> = {};
    for (const n of nodes) map[n.id] = n;
    return map;
  }, [nodes]);

  useEffect(() => {
    let lastTime = 0;
    const spawnInterval = 350;
    let lastSpawn = 0;

    function animate(time: number) {
      const delta = lastTime ? (time - lastTime) / 1000 : 0.016;
      lastTime = time;

      if (time - lastSpawn > spawnInterval) {
        lastSpawn = time;
        const newParticles: Particle[] = links.map((link, i) => ({
          id: particleIdRef.current++,
          linkIndex: i,
          progress: 0,
          speed: 0.25 + Math.random() * 0.2,
          size: Math.max(1.5, Math.min(4, link.thickness * 0.25)),
        }));
        setParticles((prev) => [...prev.slice(-100), ...newParticles]);
      }

      setParticles((prev) =>
        prev
          .map((p) => ({ ...p, progress: p.progress + p.speed * delta }))
          .filter((p) => p.progress < 1)
      );

      frameRef.current = requestAnimationFrame(animate);
    }

    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [links]);

  return (
    <g>
      {particles.map((p) => {
        const link = links[p.linkIndex];
        if (!link) return null;
        const sourceNode = nodeMap[link.source];
        const targetNode = nodeMap[link.target];
        if (!sourceNode || !targetNode) return null;

        const point = getPointOnLink(
          sourceNode.x, link.sourceY, sourceNode.width,
          targetNode.x, link.targetY,
          p.progress
        );

        return (
          <circle
            key={p.id}
            cx={point.x}
            cy={point.y}
            r={p.size}
            fill="white"
            opacity={0.55 - p.progress * 0.35}
          />
        );
      })}
    </g>
  );
}

export function FlowVisualization({ data }: { data: PolicyData }) {
  const [selectedPolicy, setSelectedPolicy] = useState<"billionaire" | "corporate">("billionaire");
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [hoveredLink, setHoveredLink] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 900, height: 520 });

  useEffect(() => {
    function measure() {
      if (containerRef.current) {
        const w = containerRef.current.clientWidth;
        setDimensions({ width: Math.max(w, 600), height: Math.max(480, w * 0.5) });
      }
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const { billionaireTax, corporateTax, improvements } = data;
  const policy = selectedPolicy === "billionaire" ? billionaireTax : corporateTax;
  const totalRevenue = policy.revenueProjections.year5;
  const policyColor = selectedPolicy === "billionaire" ? COLORS.billionaire : COLORS.corporate;

  const totalImprovementCost = Object.values(improvements).reduce(
    (sum: number, imp: any) => sum + imp.cost5Year, 0
  );

  const improvementEntries = Object.entries(improvements)
    .map(([key, imp]: [string, any]) => ({
      key,
      name: imp.name,
      allocation: (imp.cost5Year / totalImprovementCost) * totalRevenue,
      cost: imp.cost5Year,
      impact: imp.impact,
      priority: imp.priority,
      publicSupport: imp.publicSupport,
    }))
    .sort((a, b) => a.priority - b.priority);

  const { width, height } = dimensions;
  const padding = { top: 30, right: 20, bottom: 20, left: 20 };
  const nodeWidth = Math.min(140, width * 0.14);
  const colSpacing = (width - padding.left - padding.right - nodeWidth * 3) / 2;

  const col0X = padding.left;
  const col1X = padding.left + nodeWidth + colSpacing;
  const col2X = padding.left + (nodeWidth + colSpacing) * 2;
  const usableHeight = height - padding.top - padding.bottom;

  const sourceNode: SankeyNode = {
    id: "policy",
    label: policy.name,
    x: col0X,
    y: padding.top + usableHeight * 0.25,
    width: nodeWidth,
    height: Math.max(60, usableHeight * 0.4),
    color: policyColor.primary,
    value: totalRevenue,
    detail: `5-Year: ${formatBillions(totalRevenue)}`,
  };

  const revenueNode: SankeyNode = {
    id: "revenue",
    label: "NYC Revenue",
    x: col1X,
    y: padding.top + usableHeight * 0.1,
    width: nodeWidth,
    height: Math.max(60, usableHeight * 0.7),
    color: COLORS.revenue.primary,
    value: totalRevenue,
    detail: formatBillions(totalRevenue),
  };

  const impNodeGap = 8;
  const totalImpHeight = usableHeight - impNodeGap * (improvementEntries.length - 1);
  const impNodes: SankeyNode[] = [];
  let impYCursor = padding.top;

  for (let i = 0; i < improvementEntries.length; i++) {
    const imp = improvementEntries[i];
    const proportion = imp.allocation / totalRevenue;
    const nodeHeight = Math.max(44, totalImpHeight * proportion);
    impNodes.push({
      id: imp.key,
      label: imp.name,
      x: col2X,
      y: impYCursor,
      width: nodeWidth,
      height: nodeHeight,
      color: COLORS.improvements[i % COLORS.improvements.length],
      value: imp.allocation,
      detail: `${formatBillions(imp.allocation)} (${((imp.allocation / imp.cost) * 100).toFixed(0)}% funded)`,
    });
    impYCursor += nodeHeight + impNodeGap;
  }

  const allNodes = [sourceNode, revenueNode, ...impNodes];

  const link0: SankeyLink = {
    source: "policy",
    target: "revenue",
    value: totalRevenue,
    color: policyColor.primary,
    sourceY: sourceNode.y + sourceNode.height / 2,
    targetY: revenueNode.y + revenueNode.height / 2,
    thickness: Math.max(14, revenueNode.height * 0.65),
  };

  const revenueLinks: SankeyLink[] = [];
  let revSourceCursor = revenueNode.y + 10;
  for (let i = 0; i < impNodes.length; i++) {
    const proportion = improvementEntries[i].allocation / totalRevenue;
    const thickness = Math.max(4, (revenueNode.height - 20) * proportion);
    revenueLinks.push({
      source: "revenue",
      target: impNodes[i].id,
      value: improvementEntries[i].allocation,
      color: impNodes[i].color,
      sourceY: revSourceCursor + thickness / 2,
      targetY: impNodes[i].y + impNodes[i].height / 2,
      thickness,
    });
    revSourceCursor += thickness + 2;
  }

  const allLinks = [link0, ...revenueLinks];

  const getTooltip = useCallback(() => {
    if (hoveredNode) {
      const node = allNodes.find((n) => n.id === hoveredNode);
      if (!node) return null;
      const imp = improvementEntries.find((e) => e.key === hoveredNode);
      return (
        <div className="bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 shadow-xl max-w-xs">
          <p className="font-bold text-white text-sm">{node.label}</p>
          {node.detail && <p className="text-zinc-300 text-xs mt-1">{node.detail}</p>}
          {imp && (
            <>
              <p className="text-zinc-400 text-xs mt-1">Impact: {imp.impact}</p>
              <p className="text-zinc-400 text-xs">Public support: {imp.publicSupport}</p>
              <p className="text-zinc-400 text-xs">Total need: {formatBillions(imp.cost)}</p>
            </>
          )}
        </div>
      );
    }
    if (hoveredLink !== null) {
      const link = allLinks[hoveredLink];
      if (!link) return null;
      const srcNode = allNodes.find((n) => n.id === link.source);
      const tgtNode = allNodes.find((n) => n.id === link.target);
      return (
        <div className="bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 shadow-xl">
          <p className="text-xs text-zinc-400">
            {srcNode?.label} → {tgtNode?.label}
          </p>
          <p className="font-bold text-white text-sm">{formatBillions(link.value)}</p>
        </div>
      );
    }
    return null;
  }, [hoveredNode, hoveredLink, allNodes, allLinks, improvementEntries]);

  return (
    <div className="space-y-8">
      {/* Policy selector */}
      <div className="flex gap-3">
        <button
          onClick={() => setSelectedPolicy("billionaire")}
          className={`px-6 py-3 rounded-xl font-medium transition-all ${
            selectedPolicy === "billionaire"
              ? "bg-purple-600 text-white shadow-lg shadow-purple-500/30"
              : "bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
          }`}
        >
          Billionaire Tax
        </button>
        <button
          onClick={() => setSelectedPolicy("corporate")}
          className={`px-6 py-3 rounded-xl font-medium transition-all ${
            selectedPolicy === "corporate"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
              : "bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
          }`}
        >
          Corporate Tax
        </button>
      </div>

      {/* Sankey Diagram */}
      <div
        ref={containerRef}
        className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 md:p-6 overflow-hidden relative"
      >
        <div className="flex justify-between mb-2 px-2">
          <span className="text-xs uppercase tracking-wider text-zinc-500 font-semibold" style={{ width: nodeWidth }}>
            Tax Policy
          </span>
          <span className="text-xs uppercase tracking-wider text-zinc-500 font-semibold" style={{ width: nodeWidth }}>
            Revenue Pool
          </span>
          <span className="text-xs uppercase tracking-wider text-zinc-500 font-semibold" style={{ width: nodeWidth }}>
            Improvements
          </span>
        </div>

        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto"
        >
          <defs>
            {allLinks.map((link, i) => {
              const srcNode = allNodes.find((n) => n.id === link.source);
              const tgtNode = allNodes.find((n) => n.id === link.target);
              return (
                <linearGradient key={i} id={`link-grad-${i}`} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={srcNode?.color || "#666"} stopOpacity={0.5} />
                  <stop offset="100%" stopColor={tgtNode?.color || link.color} stopOpacity={0.5} />
                </linearGradient>
              );
            })}
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <AnimatePresence mode="wait">
            <motion.g
              key={selectedPolicy}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              {allLinks.map((link, i) => {
                const srcNode = allNodes.find((n) => n.id === link.source)!;
                const tgtNode = allNodes.find((n) => n.id === link.target)!;
                const path = generateLinkPath(
                  srcNode.x, link.sourceY, srcNode.width,
                  tgtNode.x, link.targetY,
                  link.thickness
                );
                const isHovered = hoveredLink === i;

                return (
                  <motion.path
                    key={`${link.source}-${link.target}`}
                    d={path}
                    fill={`url(#link-grad-${i})`}
                    opacity={isHovered ? 0.8 : hoveredLink !== null ? 0.15 : 0.4}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isHovered ? 0.8 : hoveredLink !== null ? 0.15 : 0.4 }}
                    transition={{ duration: 0.6, delay: i * 0.04 }}
                    onMouseEnter={() => setHoveredLink(i)}
                    onMouseLeave={() => setHoveredLink(null)}
                    className="cursor-pointer"
                    filter={isHovered ? "url(#glow)" : undefined}
                  />
                );
              })}

              <AnimatedParticles links={allLinks} nodes={allNodes} />
            </motion.g>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.g
              key={`nodes-${selectedPolicy}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              {allNodes.map((node, i) => {
                const isHovered = hoveredNode === node.id;
                const imp = improvementEntries.find((e) => e.key === node.id);
                const fundedPct = imp ? ((imp.allocation / imp.cost) * 100).toFixed(0) : null;

                return (
                  <motion.g
                    key={node.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: i * 0.06 }}
                    onMouseEnter={() => setHoveredNode(node.id)}
                    onMouseLeave={() => setHoveredNode(null)}
                    className="cursor-pointer"
                  >
                    <rect
                      x={node.x}
                      y={node.y}
                      width={node.width}
                      height={node.height}
                      rx={8}
                      fill={isHovered ? node.color : `${node.color}33`}
                      stroke={node.color}
                      strokeWidth={isHovered ? 2.5 : 1.5}
                      opacity={isHovered ? 1 : 0.9}
                    />

                    {fundedPct && (
                      <rect
                        x={node.x}
                        y={node.y + node.height - 4}
                        width={node.width * Math.min(Number(fundedPct) / 100, 1)}
                        height={4}
                        rx={2}
                        fill={node.color}
                        opacity={0.7}
                      />
                    )}

                    <text
                      x={node.x + node.width / 2}
                      y={node.y + (node.height < 60 ? node.height / 2 - 2 : node.height / 2 - 10)}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="white"
                      fontSize={node.height < 50 ? 10 : 12}
                      fontWeight="600"
                    >
                      {node.label}
                    </text>

                    <text
                      x={node.x + node.width / 2}
                      y={node.y + (node.height < 60 ? node.height / 2 + 10 : node.height / 2 + 6)}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill={node.color}
                      fontSize={node.height < 50 ? 9 : 11}
                      fontWeight="700"
                    >
                      {formatBillions(node.value)}
                    </text>

                    {fundedPct && node.height >= 55 && (
                      <text
                        x={node.x + node.width / 2}
                        y={node.y + node.height / 2 + 20}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="#a1a1aa"
                        fontSize={9}
                      >
                        {fundedPct}% funded
                      </text>
                    )}
                  </motion.g>
                );
              })}
            </motion.g>
          </AnimatePresence>
        </svg>

        {(hoveredNode || hoveredLink !== null) && (
          <div className="absolute top-4 right-4 z-10 pointer-events-none">
            {getTooltip()}
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6">
        <h3 className="text-lg font-semibold mb-4 text-white">Funding Analysis</h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-zinc-400">Total Revenue</p>
            <p className="text-xl font-bold text-white">{formatBillions(totalRevenue)}</p>
          </div>
          <div>
            <p className="text-zinc-400">Total Improvement Needs</p>
            <p className="text-xl font-bold text-white">{formatBillions(totalImprovementCost)}</p>
          </div>
          <div>
            <p className="text-zinc-400">Coverage</p>
            <p className="text-xl font-bold text-emerald-400">
              {((totalRevenue / totalImprovementCost) * 100).toFixed(0)}%
            </p>
          </div>
        </div>

        {totalRevenue < totalImprovementCost && (
          <div className="mt-4 text-sm text-amber-400">
            This policy covers {((totalRevenue / totalImprovementCost) * 100).toFixed(0)}% of identified
            improvement needs. Additional revenue sources or prioritization required.
          </div>
        )}

        <div className="mt-6 space-y-2">
          {improvementEntries.map((imp, i) => {
            const pct = (imp.allocation / imp.cost) * 100;
            return (
              <div key={imp.key} className="flex items-center gap-3 text-xs">
                <div
                  className="w-3 h-3 rounded-sm shrink-0"
                  style={{ backgroundColor: COLORS.improvements[i % COLORS.improvements.length] }}
                />
                <span className="text-zinc-300 w-36 shrink-0">{imp.name}</span>
                <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.min(pct, 100)}%`,
                      backgroundColor: COLORS.improvements[i % COLORS.improvements.length],
                    }}
                  />
                </div>
                <span className="text-zinc-400 w-20 text-right">
                  {formatBillions(imp.allocation)} ({pct.toFixed(0)}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
