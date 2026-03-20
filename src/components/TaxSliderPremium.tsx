"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import * as Slider from "@radix-ui/react-slider";
import { motion, AnimatePresence, useSpring, useTransform } from "framer-motion";
import CountUp from "react-countup";
import { LineChart, Line, ResponsiveContainer, AreaChart, Area } from "recharts";

interface PolicyData {
  billionaireTax: any;
  corporateTax: any;
  improvements: any;
}

// Particle effect component
function Particle({ index }: { index: number }) {
  const x = Math.random() * 100;
  const delay = Math.random() * 2;
  const duration = 2 + Math.random() * 2;
  
  return (
    <motion.div
      className="absolute w-1 h-1 rounded-full bg-white/30"
      style={{ left: `${x}%`, top: "50%" }}
      initial={{ y: 0, opacity: 0 }}
      animate={{
        y: [-20, -60],
        opacity: [0, 1, 0],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeOut",
      }}
    />
  );
}

// Glassmorphism card component
function GlassCard({
  children,
  className = "",
  glowColor = "indigo",
}: {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
}) {
  const glowColors = {
    purple: "shadow-purple-500/50",
    indigo: "shadow-indigo-500/50",
    blue: "shadow-blue-500/50",
    emerald: "shadow-emerald-500/50",
  };

  return (
    <motion.div
      className={`
        relative overflow-hidden rounded-2xl
        bg-gradient-to-br from-white/10 to-white/5
        backdrop-blur-xl backdrop-saturate-150
        border border-white/20
        shadow-2xl ${glowColors[glowColor as keyof typeof glowColors] || glowColors.indigo}
        ${className}
      `}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Animated gradient overlay */}
      <motion.div
        className="absolute inset-0 opacity-30"
        style={{
          background: `radial-gradient(circle at 50% 50%, 
            rgba(99, 102, 241, 0.2) 0%, 
            transparent 70%)`,
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      {/* Content */}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

// Animated stat card
function StatCard({
  label,
  value,
  prefix = "",
  suffix = "",
  color = "indigo",
  delay = 0,
}: {
  label: string;
  value: number | string;
  prefix?: string;
  suffix?: string;
  color?: string;
  delay?: number;
}) {
  const colorClasses = {
    purple: "text-purple-400",
    indigo: "text-indigo-400",
    blue: "text-blue-400",
    red: "text-red-400",
    yellow: "text-yellow-400",
    emerald: "text-emerald-400",
  };

  return (
    <motion.div
      className="relative overflow-hidden rounded-xl bg-white/5 backdrop-blur-sm p-4 border border-white/10"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.4, ease: "easeOut" }}
      whileHover={{ scale: 1.05, borderColor: "rgba(255,255,255,0.3)" }}
    >
      <p className="text-xs text-zinc-200 uppercase mb-1 tracking-wide">{label}</p>
      <p className={`text-2xl font-bold ${colorClasses[color as keyof typeof colorClasses]}`}>
        {typeof value === "number" ? (
          <CountUp
            start={0}
            end={value}
            duration={1.5}
            delay={delay}
            prefix={prefix}
            suffix={suffix}
            separator=","
            decimals={suffix.includes("B") || suffix.includes("M") ? 1 : 0}
          />
        ) : (
          value
        )}
      </p>
    </motion.div>
  );
}

// Mini sparkline chart
function MiniChart({ data, color }: { data: number[]; color: string }) {
  const chartData = data.map((value, index) => ({ value, index }));
  
  return (
    <ResponsiveContainer width="100%" height={40}>
      <AreaChart data={chartData}>
        <defs>
          <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.4} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          fill={`url(#gradient-${color})`}
          animationDuration={1500}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function TaxSliderPremium({ data }: { data: PolicyData }) {
  const [sliderValue, setSliderValue] = useState([50]); // 0-100 range
  const prevValueRef = useRef(50);
  
  const { billionaireTax, corporateTax, improvements } = data;

  // Haptic feedback on mobile
  const triggerHaptic = () => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(10); // 10ms vibration
    }
  };

  // Map slider value to policy position
  const policyPosition = useMemo(() => {
    const val = sliderValue[0];
    if (val < 33) return 0; // Billionaire
    if (val < 67) return 1; // Hybrid
    return 2; // Corporate
  }, [sliderValue]);

  // Trigger haptic when crossing policy boundaries
  useEffect(() => {
    const prev = prevValueRef.current;
    const curr = sliderValue[0];
    
    if (
      (prev < 33 && curr >= 33) ||
      (prev >= 33 && prev < 67 && (curr < 33 || curr >= 67)) ||
      (prev >= 67 && curr < 67)
    ) {
      triggerHaptic();
    }
    
    prevValueRef.current = curr;
  }, [sliderValue]);

  // Calculate revenue based on slider position
  const currentRevenue = useMemo(() => {
    const val = sliderValue[0] / 100; // Normalize to 0-1
    
    const billionaire = {
      year1: billionaireTax.revenueProjections.year1,
      year5: billionaireTax.revenueProjections.year5,
    };
    const corporate = {
      year1: corporateTax.revenueProjections.year1,
      year5: corporateTax.revenueProjections.year5,
    };

    // Smooth interpolation between policies
    const year1 = billionaire.year1 + (corporate.year1 - billionaire.year1) * val;
    const year5 = billionaire.year5 + (corporate.year5 - billionaire.year5) * val;
    const total5Year = (year1 + year5) * 2.5;

    // Determine dominant policy
    let label, color, description, flightRisk, implementation;
    if (policyPosition === 0) {
      label = "Billionaire Tax";
      color = "purple";
      description = billionaireTax.description;
      flightRisk = "High";
      implementation = "6-12 months";
    } else if (policyPosition === 1) {
      label = "Hybrid Approach";
      color = "indigo";
      description = "Balanced combination of both tax approaches";
      flightRisk = "Medium";
      implementation = "9-18 months";
    } else {
      label = "Corporate Tax";
      color = "blue";
      description = corporateTax.description;
      flightRisk = "Moderate";
      implementation = "12-24 months";
    }

    // Risk level based on continuous slider
    const riskLevel = 100 - val * 50; // Higher billionaire = higher risk

    return {
      year1,
      year5,
      total5Year,
      label,
      color,
      description,
      flightRisk,
      implementation,
      riskLevel,
      projections: [
        billionaire.year1,
        (billionaire.year1 + corporate.year1) / 2,
        corporate.year1,
        (billionaire.year5 + corporate.year5) / 2,
        corporate.year5,
      ],
    };
  }, [sliderValue, policyPosition, billionaireTax, corporateTax]);

  // Calculate what can be funded
  const fundableImprovements = useMemo(() => {
    return Object.entries(improvements).map(([key, imp]: [string, any]) => {
      const percentFunded = Math.min(
        100,
        (currentRevenue.total5Year / imp.cost5Year) * 100
      );
      return {
        key,
        ...imp,
        percentFunded,
        funded: percentFunded >= 100,
        partialFunding:
          currentRevenue.total5Year *
          (imp.cost5Year /
            Object.values(improvements).reduce(
              (sum: number, i: any) => sum + i.cost5Year,
              0
            )),
      };
    });
  }, [currentRevenue, improvements]);

  const formatCurrency = (value: number) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(0)}M`;
    return `$${value.toLocaleString()}`;
  };

  const getColorClasses = () => {
    const colors = {
      purple: {
        bg: "bg-purple-600",
        border: "border-purple-500",
        text: "text-purple-400",
        glow: "shadow-purple-500/50",
        glowStrong: "shadow-purple-500/80",
      },
      indigo: {
        bg: "bg-indigo-600",
        border: "border-indigo-500",
        text: "text-indigo-400",
        glow: "shadow-indigo-500/50",
        glowStrong: "shadow-indigo-500/80",
      },
      blue: {
        bg: "bg-blue-600",
        border: "border-blue-500",
        text: "text-blue-400",
        glow: "shadow-blue-500/50",
        glowStrong: "shadow-blue-500/80",
      },
    };
    return colors[currentRevenue.color as keyof typeof colors] || colors.indigo;
  };

  const colors = getColorClasses();

  return (
    <div className="space-y-8">
      {/* Header with particle effect */}
      <div className="text-center space-y-3 relative">
        {/* Particle background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 20 }).map((_, i) => (
            <Particle key={i} index={i} />
          ))}
        </div>
        
        <motion.h1
          className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 via-indigo-400 to-blue-400 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          NYC Tax Policy Explorer
        </motion.h1>
        <motion.p
          className="text-zinc-200 max-w-2xl mx-auto text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          Slide to explore tax approaches and see real-time funding impact
        </motion.p>
      </div>

      {/* Main slider card with glassmorphism */}
      <GlassCard glowColor={currentRevenue.color} className="p-8">
        <div className="space-y-6">
          {/* Current policy label */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentRevenue.label}
              className="text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className={`text-4xl font-bold ${colors.text} mb-2`}>
                {currentRevenue.label}
              </h2>
              <p className="text-zinc-300">{currentRevenue.description}</p>
            </motion.div>
          </AnimatePresence>

          {/* Radix UI Slider */}
          <div className="space-y-4 px-2">
            {/* Labels */}
            <div className="flex justify-between text-sm text-zinc-200 mb-4">
              <motion.span
                animate={{
                  color: policyPosition === 0 ? "#a855f7" : "#71717a",
                  fontWeight: policyPosition === 0 ? 600 : 400,
                }}
              >
                Billionaire
              </motion.span>
              <motion.span
                animate={{
                  color: policyPosition === 1 ? "#6366f1" : "#71717a",
                  fontWeight: policyPosition === 1 ? 600 : 400,
                }}
              >
                Hybrid
              </motion.span>
              <motion.span
                animate={{
                  color: policyPosition === 2 ? "#3b82f6" : "#71717a",
                  fontWeight: policyPosition === 2 ? 600 : 400,
                }}
              >
                Corporate
              </motion.span>
            </div>

            {/* Custom Radix Slider */}
            <Slider.Root
              className="relative flex items-center select-none touch-none w-full h-5"
              value={sliderValue}
              onValueChange={setSliderValue}
              max={100}
              step={1}
            >
              <Slider.Track className="bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 relative grow rounded-full h-3 overflow-hidden shadow-lg">
                <Slider.Range className="absolute bg-white/20 h-full" />
                
                {/* Animated glow effect */}
                <motion.div
                  className="absolute inset-0 opacity-50"
                  style={{
                    background: `radial-gradient(circle at ${sliderValue[0]}% 50%, 
                      rgba(255,255,255,0.4) 0%, 
                      transparent 50%)`,
                  }}
                  animate={{
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </Slider.Track>
              
              <Slider.Thumb
                className={`
                  block w-7 h-7 bg-white rounded-full 
                  shadow-2xl ${colors.glowStrong}
                  border-4 border-white/50
                  hover:scale-110 focus:scale-110
                  transition-transform duration-200
                  cursor-grab active:cursor-grabbing
                  focus:outline-none
                `}
                aria-label="Tax policy slider"
              />
            </Slider.Root>

            {/* Percentage indicator */}
            <div className="text-center">
              <span className="text-sm text-zinc-500">
                {sliderValue[0] < 33 ? "Heavy billionaire focus" : 
                 sliderValue[0] < 67 ? "Balanced approach" :
                 "Heavy corporate focus"}
              </span>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid md:grid-cols-4 gap-4 mt-6">
            <StatCard
              label="Year 1 Revenue"
              value={currentRevenue.year1 / 1e9}
              suffix="B"
              prefix="$"
              color={currentRevenue.color}
              delay={0.1}
            />
            <StatCard
              label="5-Year Total"
              value={currentRevenue.total5Year / 1e9}
              suffix="B"
              prefix="$"
              color={currentRevenue.color}
              delay={0.2}
            />
            <StatCard
              label="Flight Risk"
              value={currentRevenue.flightRisk}
              color={
                currentRevenue.flightRisk === "High" ? "red" :
                currentRevenue.flightRisk === "Medium" ? "yellow" :
                "emerald"
              }
              delay={0.3}
            />
            <StatCard
              label="Implementation"
              value={currentRevenue.implementation}
              delay={0.4}
            />
          </div>

          {/* Revenue projection mini chart */}
          <motion.div
            className="mt-6 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <p className="text-sm text-zinc-200 mb-2">5-Year Revenue Projection</p>
            <MiniChart
              data={currentRevenue.projections}
              color={
                currentRevenue.color === "purple" ? "#a855f7" :
                currentRevenue.color === "indigo" ? "#6366f1" :
                "#3b82f6"
              }
            />
          </motion.div>
        </div>
      </GlassCard>

      {/* Funded improvements with glassmorphism */}
      <GlassCard glowColor="emerald" className="p-6">
        <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
          What Can Be Funded
        </h2>
        <div className="space-y-4">
          <AnimatePresence>
            {fundableImprovements.map((improvement, index) => (
              <motion.div
                key={improvement.key}
                className={`
                  rounded-xl p-5 border transition-all duration-500
                  ${improvement.funded
                    ? "bg-emerald-500/10 border-emerald-500/50 backdrop-blur-sm"
                    : "bg-white/5 border-white/10 backdrop-blur-sm"
                  }
                `}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, borderColor: "rgba(255,255,255,0.3)" }}
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold">{improvement.name}</h3>
                      <AnimatePresence>
                        {improvement.funded && (
                          <motion.span
                            className="px-2 py-0.5 bg-emerald-500 text-white text-xs rounded-full font-semibold"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                          >
                            ✓ Fully Funded
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>
                    <p className="text-sm text-zinc-200">{improvement.description}</p>
                    <p className="text-sm text-emerald-400 mt-2">{improvement.impact}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-zinc-500">Cost (5 years)</p>
                    <p className="text-xl font-bold">
                      {formatCurrency(improvement.cost5Year)}
                    </p>
                    <p className="text-xs text-zinc-500 mt-1">
                      {improvement.publicSupport} support
                    </p>
                  </div>
                </div>

                {/* Animated progress bar */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-zinc-500">Funding coverage</span>
                    <span
                      className={
                        improvement.funded
                          ? "text-emerald-400 font-semibold"
                          : "text-zinc-200"
                      }
                    >
                      <CountUp
                        start={0}
                        end={improvement.percentFunded}
                        duration={1.5}
                        suffix="%"
                        decimals={0}
                      />
                    </span>
                  </div>
                  <div className="h-2 bg-zinc-700/50 rounded-full overflow-hidden backdrop-blur-sm">
                    <motion.div
                      className={`h-full ${
                        improvement.funded
                          ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
                          : "bg-gradient-to-r from-zinc-500 to-zinc-400"
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, improvement.percentFunded)}%` }}
                      transition={{ duration: 1, ease: "easeOut", delay: index * 0.1 }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Summary */}
        <motion.div
          className="mt-6 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-300">Total funded:</span>
            <span className="text-lg font-bold text-emerald-400">
              <CountUp
                start={0}
                end={fundableImprovements.filter((i) => i.funded).length}
                duration={1.5}
              />{" "}
              of {fundableImprovements.length} priorities
            </span>
          </div>
        </motion.div>
      </GlassCard>

      {/* Data sources with glassmorphism */}
      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          📚 Data Sources
          <span className="text-xs text-zinc-200 font-normal">(hover for details)</span>
        </h3>
        <div className="grid md:grid-cols-2 gap-3">
          {[
            {
              name: "NYC Open Data",
              description: "Budget data, facilities, and demographic information from NYC's official open data portal",
            },
            {
              name: "City & State NY",
              description: "Policy analysis and revenue projections from City & State New York",
            },
            {
              name: "Community Board Surveys",
              description: "Public priorities from annual Community Board needs statements across all 5 boroughs",
            },
            {
              name: "NYC Comptroller Reports",
              description: "Budget analysis and infrastructure audits from the NYC Comptroller's office",
            },
          ].map((source, index) => (
            <motion.div
              key={source.name}
              className="group relative"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 + index * 0.1 }}
            >
              <div className="text-sm text-zinc-300 cursor-help border-b border-dotted border-zinc-500 inline-block hover:text-white hover:border-white transition-colors">
                {source.name}
              </div>
              <div className="invisible group-hover:visible absolute bottom-full left-0 mb-2 w-64 p-3 bg-zinc-900/95 backdrop-blur-xl border border-white/20 rounded-lg text-xs text-zinc-300 shadow-2xl z-10">
                {source.description}
              </div>
            </motion.div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
