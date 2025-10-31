// IndustryTabEnhanced.tsx (ResponsiveContainer Safe Dynamic Version)
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
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";

/* --------------------------- Types --------------------------- */
type KPI = {
  label: string;
  value: string;
  sub: string;
  accent: string;
};

type ChartSection =
  | {
      id: string;
      title: string;
      type: "line";
      data: any[];
      lines: { key: string; color: string; label: string }[];
    }
  | {
      id: string;
      title: string;
      type: "bar";
      data: any[];
      bars: { key: string; colors: string[] };
    }
  | {
      id: string;
      title: string;
      type: "pie";
      data: any[];
      colors: string[];
    };

/* --------------------------- Data --------------------------- */
const industryData = {
  kpis: [
    { label: "Agentic AI Market", value: "USD 132.6M → 1.73B", sub: "2024 → 2030", accent: "text-indigo-700" },
    { label: "Data Analytics Market", value: "USD 2.6B → 27B", sub: "2024 → 2033", accent: "text-green-600" },
    { label: "AI Investment Surge", value: "+39.9%", sub: "YoY (2024)", accent: "text-rose-500" },
    { label: "AI Adoption", value: "80%", sub: "Indian orgs", accent: "text-blue-600" },
  ] as KPI[],

  charts: [
    {
      id: "marketGrowth",
      title: "Market Growth Projection (USD Millions)",
      type: "line",
      data: [
        { year: 2024, "Agentic AI": 132.6, "Data Analytics": 2600 },
        { year: 2025, "Agentic AI": 300, "Data Analytics": 5100 },
        { year: 2026, "Agentic AI": 600, "Data Analytics": 8900 },
        { year: 2027, "Agentic AI": 950, "Data Analytics": 13500 },
        { year: 2028, "Agentic AI": 1400, "Data Analytics": 19000 },
        { year: 2029, "Agentic AI": 1750, "Data Analytics": 24000 },
        { year: 2030, "Agentic AI": 1730.5, "Data Analytics": 27000 },
      ],
      lines: [
        { key: "Agentic AI", color: "#6366f1", label: "Agentic AI" },
        { key: "Data Analytics", color: "#22c55e", label: "Data Analytics" },
      ],
    },
    {
      id: "cagrComparison",
      title: "Market CAGR Comparison",
      type: "bar",
      data: [
        { name: "Agentic AI", CAGR: 53.9 },
        { name: "Data Analytics", CAGR: 27.46 },
      ],
      bars: { key: "CAGR", colors: ["#6366f1", "#22c55e"] },
    },
    {
      id: "adoptionMomentum",
      title: "Adoption & Investment Momentum",
      type: "pie",
      data: [
        { name: "Adoption", value: 80 },
        { name: "Investment Surge", value: 39.9 },
      ],
      colors: ["#6366f1", "#22c55e"],
    },
    {
      id: "fundingDistribution",
      title: "Funding Breakdown (2024)",
      type: "pie",
      data: [
        { name: "AI Startups Investment (2024)", value: 780.5 },
        { name: "Remaining Market", value: 219.5 },
      ],
      colors: ["#22c55e", "#6366f1"],
    },
  ] as ChartSection[],
};

/* --------------------------- Helpers --------------------------- */
const formatMillion = (v: number) => {
  if (Math.abs(v) >= 1000)
    return `$${(v / 1000).toLocaleString(undefined, { maximumFractionDigits: 2 })}B`;
  return `$${Number(v).toLocaleString(undefined, { maximumFractionDigits: 2 })}M`;
};

const formatNumberShort = (v: number) => (v >= 1000 ? `${(v / 1000).toFixed(1)}B` : `${v}M`);

/* --------------------------- Component --------------------------- */
export default function IndustryTabEnhanced() {
  return (
    <TabsContent value="industry" className="overflow-y-auto max-h-[80vh] mt-3 space-y-3">
      <div className="space-y-6">
        {/* KPI Cards */}
        <Card className="p-4 bg-gray-50 border border-gray-200">
          <div className="font-semibold pb-2">Industry Snapshot - 2024</div>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {industryData.kpis.map((kpi, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.03 }}
                className="bg-white rounded-xl p-3 shadow-sm flex flex-col justify-center"
              >
                <p className="text-xs text-gray-500">{kpi.label}</p>
                <p className={`text-lg font-semibold ${kpi.accent} mt-1`}>{kpi.value}</p>
                <p className="text-xs text-gray-400 mt-1">{kpi.sub}</p>
              </motion.div>
            ))}
          </CardContent>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
            {industryData.charts.map((chart) => {
              let ChartElement: React.ReactElement;

              if (chart.type === "line") {
                ChartElement = (
                  <LineChart data={chart.data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eef2ff" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <RechartsTooltip formatter={(v: any) => formatMillion(Number(v))} />
                    <Legend />
                    {chart.lines.map((line, idx) => (
                      <Line
                        key={idx}
                        type="monotone"
                        dataKey={line.key}
                        stroke={line.color}
                        strokeWidth={3}
                        dot={{ r: 3 }}
                        activeDot={{ r: 6 }}
                      />
                    ))}
                  </LineChart>
                );
              } else if (chart.type === "bar") {
                ChartElement = (
                  <BarChart data={chart.data} barCategoryGap="20%">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <RechartsTooltip formatter={(v: any) => `${v}%`} />
                    <Legend />
                    <Bar dataKey={chart.bars.key}>
                      {chart.data.map((_, i) => (
                        <Cell key={i} fill={chart.bars.colors[i]} />
                      ))}
                      <LabelList dataKey={chart.bars.key} position="top" formatter={(v: number) => `${v}%`} />
                    </Bar>
                  </BarChart>
                );
              } else {
                // pie
                ChartElement = (
                  <PieChart>
                    <Pie
                      data={chart.data}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={40}
                      outerRadius={80}
                      label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                    >
                      {chart.colors.map((color, idx) => (
                        <Cell key={idx} fill={color} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(v: any) => formatNumberShort(Number(v))} />
                  </PieChart>
                );
              }

              return (
                <Card key={chart.id} className="p-3 border border-gray-200 shadow-sm">
                  <CardHeader className="pb-1">
                    <CardTitle className="text-sm font-semibold">{chart.title}</CardTitle>
                  </CardHeader>

                  <CardContent className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      {ChartElement}
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </Card>
      </div>
    </TabsContent>
  );
}
