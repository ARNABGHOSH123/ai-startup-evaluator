// IndustryTabEnhanced.tsx
import React from "react";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Legend,
  BarChart,
  Bar,
  Cell,
  LabelList,
  PieChart,
  Pie,
  Sector,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";

/* --------------------------- Types & Data --------------------------- */
type MarketPoint = {
  year: number;
  "Agentic AI": number;
  "Data Analytics": number;
};

const marketGrowthData: MarketPoint[] = [
  { year: 2024, "Agentic AI": 132.6, "Data Analytics": 2600 },
  { year: 2025, "Agentic AI": 300, "Data Analytics": 5100 },
  { year: 2026, "Agentic AI": 600, "Data Analytics": 8900 },
  { year: 2027, "Agentic AI": 950, "Data Analytics": 13500 },
  { year: 2028, "Agentic AI": 1400, "Data Analytics": 19000 },
  { year: 2029, "Agentic AI": 1750, "Data Analytics": 24000 },
  { year: 2030, "Agentic AI": 1730.5, "Data Analytics": 27000 },
];

const adoptionFunding = [
  { name: "Adoption", value: 80 },
  { name: "Investment Surge", value: 39.9 },
];

const fundingDistribution = [
  { name: "AI Startups Investment (2024)", value: 780.5 },
  { name: "Remaining Market", value: 219.5 },
];

const staticData = [
  {
    label: "Agentic AI Market",
    value: "USD 132.6M → 1.73B",
    sub: "2024 → 2030",
    accent: "text-indigo-700",
  },
  {
    label: "Data Analytics Market",
    value: "USD 2.6B → 27B",
    sub: "2024 → 2033",
    accent: "text-green-600",
  },
  {
    label: "AI Investment Surge",
    value: "+39.9%",
    sub: "YoY (2024)",
    accent: "text-rose-500",
  },
  {
    label: "AI Adoption",
    value: "80%",
    sub: "Indian orgs",
    accent: "text-blue-600",
  },
];

/* --------------------------- Helpers --------------------------- */
const formatMillion = (v: number) => {
  // if v >= 1000 treat as thousands of millions (i.e., billions)
  if (Math.abs(v) >= 1000) {
    return `$${(v / 1000).toLocaleString(undefined, {
      maximumFractionDigits: 2,
    })}B`;
  }
  return `$${Number(v).toLocaleString(undefined, {
    maximumFractionDigits: 2,
  })}M`;
};

const formatNumberShort = (v: number) =>
  v >= 1000 ? `${(v / 1000).toFixed(1)}B` : `${v}M`;

/* --------------------------- Component --------------------------- */
export default function IndustryTabEnhanced() {
  return (
    <TabsContent
      value="industry"
      className="overflow-y-auto max-h-[80vh] mt-3 space-y-3"
    >
      <div className="space-y-6">
        {/* ---------------- KPI Summary ---------------- */}
        <Card className="p-4 bg-gray-50 border border-gray-200">
          <div className="font-semibold pb-2">Industry Snapshot - 2024</div>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {staticData.map((kpi, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-xl p-3 shadow-sm flex flex-col justify-center"
              >
                <p className="text-xs text-gray-500">{kpi.label}</p>
                <p className={`text-lg font-semibold ${kpi.accent} mt-1`}>
                  {kpi.value}
                </p>
                <p className="text-xs text-gray-400 mt-1">{kpi.sub}</p>
              </motion.div>
            ))}
          </CardContent>
        

        {/* ---------------- Charts Grid ---------------- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Market Growth (Line) */}
          <Card className="p-3 border border-gray-200 shadow-sm">
            <CardHeader className="pb-1">
              <CardTitle className="text-sm font-semibold">
                Market Growth Projection (USD Millions)
              </CardTitle>
            </CardHeader>
            <CardContent className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={marketGrowthData}>
                  <defs>
                    <linearGradient id="gradAI" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                      <stop
                        offset="95%"
                        stopColor="#6366f1"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                    <linearGradient id="gradData" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
                      <stop
                        offset="95%"
                        stopColor="#22c55e"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" stroke="#eef2ff" />
                  <XAxis
                    dataKey="year"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(v) => String(v)}
                  />
                  <YAxis
                    tickFormatter={(v) => (v >= 1000 ? `${v / 1000}K` : `${v}`)}
                  />
                  <RechartsTooltip<number, string>
                    formatter={(value) => formatMillion(Number(value))}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="Agentic AI"
                    stroke="url(#gradAI)"
                    strokeWidth={3}
                    dot={{ r: 3 }}
                    activeDot={{ r: 6 }}
                    isAnimationActive
                  />
                  <Line
                    type="monotone"
                    dataKey="Data Analytics"
                    stroke="url(#gradData)"
                    strokeWidth={3}
                    dot={{ r: 3 }}
                    activeDot={{ r: 6 }}
                    isAnimationActive
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* CAGR Bar Chart */}
          <Card className="p-3 border border-gray-200 shadow-sm">
            <CardHeader className="pb-1">
              <CardTitle className="text-sm font-semibold">
                Market CAGR Comparison
              </CardTitle>
            </CardHeader>
            <CardContent className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  barCategoryGap="20%"
                  data={[
                    { name: "Agentic AI", CAGR: 53.9 },
                    { name: "Data Analytics", CAGR: 27.46 },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip<number, string>
                    formatter={(value) => `${value}%`}
                  />
                  <Legend />
                  <Bar dataKey="CAGR">
                    <Cell key="c1" fill="#6366f1" />
                    <Cell key="c2" fill="#22c55e" />
                    <LabelList
                      dataKey="CAGR"
                      position="top"
                      formatter={(v: number) => `${v}%`}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Adoption Pie */}
          <Card className="p-3 border border-gray-200 shadow-sm">
            <CardHeader className="pb-1">
              <CardTitle className="text-sm font-semibold">Adoption & Investment Momentum</CardTitle>
            </CardHeader>
            <CardContent className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={adoptionFunding}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={40}
                    outerRadius={80}
                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                  >
                    <Cell key="a1" fill="#6366f1" />
                    <Cell key="a2" fill="#22c55e" />
                  </Pie>
                  <RechartsTooltip<number, string>
                    formatter={(value) => `${value}`}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Funding Distribution Pie */}
          <Card className="p-3 border border-gray-200 shadow-sm">
            <CardHeader className="pb-1">
              <CardTitle className="text-sm font-semibold">
                Funding Breakdown (2024)
              </CardTitle>
            </CardHeader>
            <CardContent className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={fundingDistribution}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={40}
                    outerRadius={80}
                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                  >
                    <Cell key="f1" fill="#22c55e" />
                    <Cell key="f2" fill="#6366f1" />
                  </Pie>
                  <RechartsTooltip<number, string>
                    formatter={(value) => formatNumberShort(Number(value))}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
        </Card>
      </div>
    </TabsContent>
  );
}
