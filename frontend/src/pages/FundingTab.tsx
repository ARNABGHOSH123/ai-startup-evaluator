import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type PieChartData = {
  id: string;
  type: "pie";
  title: string;
  data: { category: string; value: number }[];
  colors: string[];
};

type LineChartData = {
  id: string;
  type: "line";
  title: string;
  data: { year: string; revenue: number; cost: number }[];
  lines: { key: string; color: string; label: string }[];
};

type BarChartData = {
  id: string;
  type: "bar";
  title: string;
  data: { date: string; amount: number }[];
  barKey: string;
  color: string;
};

type ChartConfig = PieChartData | LineChartData | BarChartData;

const fundingData = {
  summary: [
    { label: "Funding Ask", value: "₹5 Crores (Seed Stage)" },
    {
      label: "Funding History",
      value:
        "Bootstrapped + US$75K (2024 Crowdfunding) + $80.7K (2025 VC Round)",
    },
    {
      label: "Financial Health",
      value: "FY 23-24 Revenue ₹4.16L | Net Profit ₹5,518",
    },
    { label: "Stage", value: "Early Seed | Minimal revenue growth phase" },
  ],

  charts: [
    {
      id: "funds",
      type: "pie",
      title: "Use of Funds",
      data: [
        { category: "Product Development", value: 30 },
        { category: "Sales & Marketing", value: 60 },
        { category: "Operations & Misc", value: 10 },
      ],
      colors: ["#6366f1", "#22c55e", "#f59e0b"],
    },
    {
      id: "projection",
      type: "line",
      title: "Financial Projections",
      data: [
        { year: "2025-26", revenue: 0.5, cost: 0.4 },
        { year: "2026-27", revenue: 1.8, cost: 1.2 },
        { year: "2027-28", revenue: 15, cost: 4 },
        { year: "2028-29", revenue: 90, cost: 30 },
        { year: "2029-30", revenue: 110, cost: 50 },
      ],
      lines: [
        { key: "revenue", color: "#16a34a", label: "Revenue" },
        { key: "cost", color: "#ef4444", label: "Cost" },
      ],
    },
    {
      id: "timeline",
      type: "bar",
      title: "Funding Timeline",
      data: [
        { date: "Mar 2024", amount: 75 },
        { date: "Jan 2025", amount: 80.7 },
      ],
      barKey: "amount",
      color: "#6366f1",
    },
  ] as ChartConfig[],
};

export default function FundingTab() {
  return (
    <TabsContent
      value="funding"
      className="overflow-y-auto max-h-[80vh] mt-3 space-y-3"
    >
      <div className="space-y-6">
        <Card className="p-4 bg-gray-50 border border-gray-200">
          {/* Funding Summary */}
          <CardContent className="text-sm text-gray-700 space-y-1">
            {fundingData.summary.map((item, i) => (
              <p key={i}>
                <strong>{item.label}:</strong> {item.value}
              </p>
            ))}
          </CardContent>

          {/* Dynamic Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
            {fundingData.charts.map((chart) => {
              let ChartElement: React.ReactNode = null;

              // PIE CHART
              if (chart.type === "pie") {
                ChartElement = (
                  <PieChart>
                    <Pie data={chart.data} dataKey="value" outerRadius={70}>
                      {chart.colors?.map((color, idx) => (
                        <Cell key={idx} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                );
              }

              // LINE CHART
              if (chart.type === "line") {
                ChartElement = (
                  <LineChart data={chart.data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {chart.lines?.map((line, idx) => (
                      <Line
                        key={idx}
                        type="monotone"
                        dataKey={line.key}
                        stroke={line.color}
                        strokeWidth={2}
                        name={line.label}
                      />
                    ))}
                  </LineChart>
                );
              }

              // BAR CHART
              if (chart.type === "bar") {
                ChartElement = (
                  <BarChart data={chart.data} barCategoryGap="20%">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => `$${value}K`} />
                    <Legend />
                    <Bar
                      dataKey={chart.barKey}
                      fill={chart.color}
                      name="Funding (K USD)"
                    />
                  </BarChart>
                );
              }

              return (
                <Card
                  key={chart.id}
                  className="p-3 border border-gray-200 shadow-sm"
                >
                  <CardHeader className="pb-1">
                    <CardTitle className="text-sm font-semibold">
                      {chart.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="h-56">
                    {ChartElement && <ResponsiveContainer width="100%" height="100%">
                      {ChartElement}
                    </ResponsiveContainer>}
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
